// 导入必要的模块
import fs from 'fs';
import axios from 'axios';
import { URL } from 'url';
import { SocksProxyAgent } from 'socks-proxy-agent';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { HttpProxyAgent } from 'http-proxy-agent';
import chalk from 'chalk';
import readline from 'readline';
import displayBanner from './banner.js';

// 创建readline接口
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// 封装readline的promise版本
const question = (query) => new Promise((resolve) => rl.question(query, resolve));

// 定义用户代理列表
const userAgents = [
  'Chrome-Win10', 'Chrome-Mac', 'Firefox-Win',
  'Firefox-Mac', 'Chrome-Linux', 'Safari-iPhone', 'Edge-Win'
];

// 获取随机用户代理
const getRandomUA = () => userAgents[Math.floor(Math.random() * userAgents.length)];

// NodeGoPinger类 - 处理单个账户的所有操作
class NodeGoPinger {
  constructor(token, proxyUrl = null) {
    this.apiBaseUrl = 'https://nodego.ai/api';
    this.bearerToken = token;
    this.agent = proxyUrl ? this.createProxyAgent(proxyUrl) : null;
    this.lastPingTimestamp = 0;
  }

  createProxyAgent(proxyUrl) {
    try {
      // 移除空格
      proxyUrl = proxyUrl.trim();
      let parsedUrl;

      // 检查是否包含协议
      if (!proxyUrl.includes('://')) {
        const parts = proxyUrl.split(':');
        
        // 处理 ip:port:username:password 格式
        if (parts.length === 4) {
          const [ip, port, username, password] = parts;
          proxyUrl = `http://${username}:${password}@${ip}:${port}`;
        }
        // 处理 username:password@ip:port 格式
        else if (proxyUrl.includes('@')) {
          const [auth, address] = proxyUrl.split('@');
          const [username, password] = auth.split(':');
          const [host, port] = address.split(':');
          proxyUrl = `http://${username}:${password}@${host}:${port}`;
        }
        // 处理 ip:port 格式
        else if (parts.length === 2) {
          proxyUrl = `http://${proxyUrl}`;
        }
      }

      try {
        parsedUrl = new URL(proxyUrl);
      } catch (e) {
        throw new Error('代理地址格式错误');
      }

      // 根据协议创建对应的代理agent
      const protocol = parsedUrl.protocol.toLowerCase();
      
      switch (protocol) {
        case 'socks4:':
        case 'socks5:':
        case 'socks4a:':
        case 'socks5h:':
        case 'socks:':
          return new SocksProxyAgent(parsedUrl);
          
        case 'http:':
        case 'https:':
          return {
            httpAgent: new HttpProxyAgent(parsedUrl),
            httpsAgent: new HttpsProxyAgent(parsedUrl)
          };
          
        default:
          throw new Error(`不支持的代理协议: ${protocol}`);
      }
    } catch (error) {
      console.error(chalk.red('代理设置错误:'), error.message);
      return null;
    }
  }

  async makeRequest(method, endpoint, data = null) {
    const config = {
      method,
      url: `${this.apiBaseUrl}${endpoint}`,
      headers: {
        'Authorization': `Bearer ${this.bearerToken}`,
        'Content-Type': 'application/json',
        'Accept': '*/*',
        'User-Agent': getRandomUA()
      },
      ...(data && { data }),
      timeout: 30000
    };

    if (this.agent) {
      if (this.agent.httpAgent) {
        config.httpAgent = this.agent.httpAgent;
        config.httpsAgent = this.agent.httpsAgent;
      } else {
        config.httpAgent = this.agent;
        config.httpsAgent = this.agent;
      }
    }

    try {
      return await axios(config);
    } catch (error) {
      throw error;
    }
  }

  async ping() {
    try {
      const currentTime = Date.now();

      if (currentTime - this.lastPingTimestamp < 3000) {
        await new Promise(resolve => setTimeout(resolve, 3000 - (currentTime - this.lastPingTimestamp)));
      }

      const response = await this.makeRequest('POST', '/user/nodes/ping', { type: 'extension' });

      this.lastPingTimestamp = Date.now();

      console.log(chalk.white(`🕒 [${new Date().toLocaleTimeString()}]`) + chalk.green(' ✓ PING'));
      console.log(chalk.white(`📡 状态: ${response.status}`));
      console.log(chalk.green(`💾 数据: ${JSON.stringify(response.data)}`));

      return response.data;
    } catch (error) {
      // 处理429错误
      if (error.response?.status === 429) {
        const retryAfter = error.response.headers['retry-after'] || 60;
        const waitTime = (parseInt(retryAfter) + Math.floor(Math.random() * 30)) * 1000;
        console.log(chalk.yellow(`⚠️ 检测到请求频率限制，等待 ${Math.floor(waitTime/1000)} 秒后重试...`));
        await new Promise(resolve => setTimeout(resolve, waitTime));
        return this.ping(); // 重试
      }
      
      console.log(chalk.red(`✗ [错误] ${error.message}`));
      throw error;
    }
  }
}

// 多账户管理类
class MultiAccountPinger {
  constructor() {
    this.accounts = [];
    this.isRunning = true;
  }

  async getUserInput() {
    console.log(chalk.cyan('\n请输入账户信息（输入空行结束）：'));
    
    while (true) {
      const token = await question(chalk.yellow('请输入Token (留空结束): '));
      if (!token.trim()) break;

      const useProxy = await question(chalk.yellow('是否使用代理? (y/n): '));
      let proxy = null;
      
      if (useProxy.toLowerCase() === 'y') {
        console.log(chalk.cyan('\n支持的代理格式:'));
        console.log(chalk.white('1. IP:端口:用户名:密码'));
        console.log(chalk.white('   例如: 92.113.82.78:44989:username:password'));
        console.log(chalk.white('2. 用户名:密码@IP:端口'));
        console.log(chalk.white('   例如: username:password@92.113.82.78:44989'));
        console.log(chalk.white('3. IP:端口'));
        console.log(chalk.white('   例如: 92.113.82.78:44989'));
        console.log(chalk.white('4. 带协议格式:'));
        console.log(chalk.white('   http://IP:端口'));
        console.log(chalk.white('   socks5://IP:端口'));
        console.log(chalk.white('   http://用户名:密码@IP:端口'));
        console.log(chalk.white('   socks5://用户名:密码@IP:端口'));
        console.log(chalk.white('\n支持的协议: http, https, socks4, socks5, socks4a, socks5h'));
        proxy = await question(chalk.yellow('\n请输入代理地址: '));
      }

      this.accounts.push({
        token: token.trim(),
        proxy: proxy ? proxy.trim() : null
      });

      console.log(chalk.green('账户添加成功！\n'));
    }

    if (this.accounts.length === 0) {
      console.log(chalk.red('错误：至少需要添加一个账户！'));
      process.exit(1);
    }

    rl.close();
  }

  async processPing(account) {
    const pinger = new NodeGoPinger(account.token, account.proxy);
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      try {
        console.log(chalk.cyan(`\n正在ping账户: ${account.token.slice(0, 10)}... (代理: ${account.proxy || '无'})`));
        await pinger.ping();
        break; // 成功则退出循环
      } catch (error) {
        retryCount++;
        if (retryCount < maxRetries) {
          const delay = Math.floor(Math.random() * 30000) + 30000; // 30-60秒随机延迟
          console.log(chalk.yellow(`第 ${retryCount} 次重试失败，${Math.floor(delay/1000)} 秒后重试...`));
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          console.error(chalk.red(`账户ping失败 (已重试${maxRetries}次): ${error.message}`));
        }
      }
    }
  }

  randomDelay() {
    return Math.floor(Math.random() * 120000) + 240000; // 4-6分钟延迟
  }

  async runPinger() {
    displayBanner();

    // 获取用户输入
    await this.getUserInput();

    process.on('SIGINT', () => {
      console.log(chalk.yellow('\n正在优雅退出...'));
      this.isRunning = false;
      setTimeout(() => process.exit(0), 1000);
    });

    console.log(chalk.yellow('\n⚡ 开始ping循环...'));
    while (this.isRunning) {
      console.log(chalk.white(`\n⏰ Ping循环时间 ${new Date().toLocaleString()}`));

      for (const account of this.accounts) {
        if (!this.isRunning) break;
        await this.processPing(account);
      }

      if (this.isRunning) {
        const delayMs = this.randomDelay();
        console.log(chalk.gray(`\n等待 ${Math.round(delayMs/1000)} 秒后进行下一轮循环...`));
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }
}

// 运行多账户pinger
const multiPinger = new MultiAccountPinger();
multiPinger.runPinger();
