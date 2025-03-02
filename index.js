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

// NodeGoPinger类 - 处理单个账户的所有操作
class NodeGoPinger {
    constructor(token, proxyUrl = null) {
        // 初始化基本配置
        this.apiBaseUrl = 'https://nodego.ai/api';
        this.bearerToken = token;
        this.agent = proxyUrl ? this.createProxyAgent(proxyUrl) : null;
        this.lastPingTimestamp = 0;
        
        // 定义所有可用的任务列表
        this.tasksList = [
            { code: 'T001', name: '验证邮箱' },
            { code: 'T002', name: '加入电报频道' },
            { code: 'T003', name: '加入电报群组' },
            { code: 'T004', name: '助力电报频道' },
            { code: 'T005', name: '关注X账号' },
            { code: 'T006', name: '评价Chrome扩展' },
            { code: 'T007', name: '加入电报小程序' },
            { code: 'T009', name: '加入Discord频道' },
            { code: 'T010', name: '在名字中添加NodeGo.Ai' },
            { code: 'T011', name: '在X上分享推荐链接' },
            { code: 'T012', name: '转发我们的推文' },
            { code: 'T014', name: '评论并标记3位好友' },
            { code: 'T100', name: '邀请1位好友' },
            { code: 'T101', name: '邀请3位好友' },
            { code: 'T102', name: '邀请5位好友' },
            { code: 'T103', name: '邀请10位好友' }
        ];
    }

    // 创建代理代理
    createProxyAgent(proxyUrl) {
        try {
            // 处理不同格式的代理地址
            let parsedUrl;
            
            // 移除空格
            proxyUrl = proxyUrl.trim();
            
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
                else if (proxyUrl.includes(':')) {
                    proxyUrl = `http://${proxyUrl}`;
                }
            }
            
            // 尝试解析URL
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

    // 发送API请求的通用方法
    async makeRequest(method, endpoint, data = null) {
        const config = {
            method,
            url: `${this.apiBaseUrl}${endpoint}`,
            headers: {
                'Authorization': `Bearer ${this.bearerToken}`,
                'Content-Type': 'application/json',
                'Accept': '*/*'
            },
            ...(data && { data }),
            timeout: 30000
        };

        // 如果配置了代理，添加代理设置
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
            if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
                throw new Error(`代理连接失败: ${error.message}`);
            }
            throw error;
        }
    }

    // 获取用户信息
    async getUserInfo() {
        try {
            const response = await this.makeRequest('GET', '/user/me');
            const metadata = response.data.metadata;
            return {
                username: metadata.username,
                email: metadata.email,
                totalPoint: metadata.rewardPoint,
                socialTasks: metadata.socialTask || [],
                nodes: metadata.nodes.map(node => ({
                    id: node.id,
                    totalPoint: node.totalPoint,
                    todayPoint: node.todayPoint,
                    isActive: node.isActive
                }))
            };
        } catch (error) {
            console.error(chalk.red('获取用户信息失败:'), error.message);
            throw error;
        }
    }

    // 生成随机延迟时间
    getRandomDelay(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    // 执行ping操作
    async ping() {
        try {
            const currentTime = Date.now();
            
            // 确保ping操作之间至少间隔30-45秒的随机时间
            const minDelay = 30000;
            const maxDelay = 45000;
            const randomDelay = this.getRandomDelay(minDelay, maxDelay);
            
            if (currentTime - this.lastPingTimestamp < randomDelay) {
                const waitTime = randomDelay - (currentTime - this.lastPingTimestamp);
                console.log(chalk.gray(`等待 ${Math.floor(waitTime/1000)} 秒后进行下一次ping...`));
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }

            const response = await this.makeRequest('POST', '/user/nodes/ping', { type: 'extension' });
            
            this.lastPingTimestamp = Date.now();
            
            return {
                statusCode: response.data.statusCode,
                message: response.data.message,
                metadataId: response.data.metadata.id
            };
        } catch (error) {
            // 如果是429错误，增加等待时间并使用随机延迟
            if (error.response?.status === 429) {
                const retryDelay = this.getRandomDelay(60000, 90000); // 60-90秒随机延迟
                console.log(chalk.yellow(`检测到请求频率限制，等待 ${Math.floor(retryDelay/1000)} 秒后重试...`));
                await new Promise(resolve => setTimeout(resolve, retryDelay));
                return this.ping(); // 重试
            }
            console.error(chalk.red(`Ping操作失败: ${error.message}`));
            throw error;
        }
    }

    // 执行每日签到
    async dailyCheckin() {
        try {
            const response = await this.makeRequest('POST', '/user/checkin');
            return {
                statusCode: response.data.statusCode,
                message: response.data.message,
                userData: response.data.metadata.user
            };
        } catch (error) {
            const statusCode = error.response?.data?.statusCode || error.response?.status || 500;
            const message = error.response?.data?.message || error.message;
            throw {
                statusCode,
                message,
                error: true
            };
        }
    }

    // 领取任务奖励
    async claimTask(taskId) {
        try {
            const response = await this.makeRequest('POST', '/user/task', { taskId });
            return {
                statusCode: response.data.statusCode,
                message: response.data.message,
                userData: response.data.metadata?.user
            };
        } catch (error) {
            const statusCode = error.response?.data?.statusCode || error.response?.status || 500;
            const message = error.response?.data?.message || error.message;
            throw {
                statusCode,
                message,
                error: true
            };
        }
    }

    // 处理所有可用任务
    async processTasks(completedTasks) {
        const results = [];
        
        for (const task of this.tasksList) {
            // 跳过已完成的任务
            if (!completedTasks.includes(task.code)) {
                try {
                    // 任务之间添加1秒延迟
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    const result = await this.claimTask(task.code);
                    results.push({
                        code: task.code,
                        name: task.name,
                        status: '成功',
                        statusCode: result.statusCode,
                        message: result.message
                    });
                    console.log(chalk.green(`✓ 任务 ${task.code} (${task.name}):`));
                    console.log(chalk.green(`  状态: ${result.statusCode}`));
                    console.log(chalk.green(`  消息: ${result.message}`));
                } catch (error) {
                    results.push({
                        code: task.code,
                        name: task.name,
                        status: '失败',
                        statusCode: error.statusCode,
                        message: error.message
                    });
                    const errorColor = error.statusCode >= 500 ? 'red' : 'yellow';
                    console.log(chalk[errorColor](`⨯ 任务 ${task.code} (${task.name}):`));
                    console.log(chalk[errorColor](`  状态: ${error.statusCode}`));
                    console.log(chalk[errorColor](`  消息: ${error.message}`));
                }
            } else {
                results.push({
                    code: task.code,
                    name: task.name,
                    status: '已跳过',
                    statusCode: 200,
                    message: '任务已完成'
                });
                console.log(chalk.white(`⚡ 任务 ${task.code} (${task.name}): 已完成`));
            }
        }
        
        return results;
    }
}

// 多账户管理类
class MultiAccountPinger {
    constructor() {
        this.accounts = [];  // 初始化accounts数组
        this.isRunning = true;
    }

    // 从用户输入获取账户和代理信息
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

    // 处理账户的初始任务
    async processInitialTasks(account) {
        const pinger = new NodeGoPinger(account.token, account.proxy);
        
        try {
            console.log(chalk.white('='.repeat(50)));
            
            // 获取初始用户信息
            const userInfo = await pinger.getUserInfo();
            console.log(chalk.cyan(`账户初始化: ${userInfo.username} (${userInfo.email})`));
            
            // 执行每日签到
            try {
                const checkinResponse = await pinger.dailyCheckin();
                console.log(chalk.green(`每日签到:`));
                console.log(chalk.green(`  状态: ${checkinResponse.statusCode}`));
                console.log(chalk.green(`  消息: ${checkinResponse.message}`));
            } catch (error) {
                console.log(chalk.yellow(`每日签到:`));
                console.log(chalk.yellow(`  状态: ${error.statusCode}`));
                console.log(chalk.yellow(`  消息: ${error.message}`));
            }

            // 处理所有可用任务
            console.log(chalk.white('\n处理初始任务...')); 
            await pinger.processTasks(userInfo.socialTasks || []);

            console.log(chalk.green('\n初始任务完成'));
            console.log(chalk.white('='.repeat(50)));
        } catch (error) {
            console.error(chalk.red(`处理初始任务时出错: ${error.message}`));
            console.log(chalk.white('='.repeat(50)));
        }
    }

    // 执行账户的ping操作
    async processPing(account, accountIndex, totalAccounts) {
        const pinger = new NodeGoPinger(account.token, account.proxy);
        
        try {
            const userInfo = await pinger.getUserInfo();
            console.log(chalk.cyan(`\n执行账户ping [${accountIndex + 1}/${totalAccounts}]: ${userInfo.username}`));
            
            const pingResponse = await pinger.ping();
            console.log(chalk.green(`Ping状态:`));
            console.log(chalk.green(`  状态: ${pingResponse.statusCode}`));
            console.log(chalk.green(`  消息: ${pingResponse.message}`));
            
            // 显示节点状态
            const updatedUserInfo = await pinger.getUserInfo();
            if (updatedUserInfo.nodes.length > 0) {
                console.log(chalk.magenta('节点状态:'));
                updatedUserInfo.nodes.forEach((node, index) => {
                    console.log(`  节点 ${index + 1}: 今日获得 ${node.todayPoint} 点数`);
                });
            }

            // 在账户之间添加随机延迟
            if (accountIndex < totalAccounts - 1) {
                const accountDelay = this.getRandomDelay(10000, 20000); // 10-20秒随机延迟
                console.log(chalk.gray(`\n等待 ${Math.floor(accountDelay/1000)} 秒后处理下一个账户...`));
                await new Promise(resolve => setTimeout(resolve, accountDelay));
            }
        } catch (error) {
            console.error(chalk.red(`账户ping失败: ${error.message}`));
        }
    }

    // 生成随机延迟时间
    getRandomDelay(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // 运行主程序
    async runPinger() {
        displayBanner();
        
        // 获取用户输入
        await this.getUserInput();
        
        // 处理优雅退出
        process.on('SIGINT', () => {
            console.log(chalk.yellow('\n正在优雅退出...')); 
            this.isRunning = false;
            setTimeout(() => process.exit(0), 1000);
        });

        // 初始处理 - 只运行一次
        console.log(chalk.yellow('\n🚀 执行初始设置和任务...'));
        for (let i = 0; i < this.accounts.length; i++) {
            if (!this.isRunning) break;
            await this.processInitialTasks(this.accounts[i]);
            
            // 在账户初始化之间添加随机延迟
            if (i < this.accounts.length - 1) {
                const initDelay = this.getRandomDelay(5000, 10000); // 5-10秒随机延迟
                console.log(chalk.gray(`\n等待 ${Math.floor(initDelay/1000)} 秒后初始化下一个账户...`));
                await new Promise(resolve => setTimeout(resolve, initDelay));
            }
        }

        // 继续定期ping操作
        console.log(chalk.yellow('\n⚡ 开始定期ping循环...'));
        while (this.isRunning) {
            console.log(chalk.white(`\n⏰ Ping循环时间 ${new Date().toLocaleString()}`));
            
            // 处理所有账户
            for (let i = 0; i < this.accounts.length; i++) {
                if (!this.isRunning) break;
                await this.processPing(this.accounts[i], i, this.accounts.length);
            }

            if (this.isRunning) {
                // 使用90-150秒的随机延迟作为循环间隔
                const cycleDelay = this.getRandomDelay(90000, 150000);
                console.log(chalk.gray(`\n等待 ${Math.floor(cycleDelay/1000)} 秒进行下一轮循环...`));
                await new Promise(resolve => setTimeout(resolve, cycleDelay));
            }
        }
    }
}

// 运行多账户pinger
const multiPinger = new MultiAccountPinger();
multiPinger.runPinger();
