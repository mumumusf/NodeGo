# NodeGo 自动化工具

这是一个支持多账户和代理配置的NodeGo自动化工具，可在VPS上稳定运行。

## 功能特点

- 支持多账户管理
- 支持HTTP和SOCKS代理
- 自动定期ping
- 彩色日志输出
- 账户状态监控
- 优雅的程序退出处理

## 注册账号

1. 使用我的邀请链接注册：[https://app.nodego.ai/r/NODE20F19D1273E7](https://app.nodego.ai/r/NODE20F19D1273E7)
2. 注册步骤：
   - 点击链接进入注册页面
   - 输入您的邮箱地址
   - 设置安全的密码
   - 完成邮箱验证
   - 登录后在个人设置中获取Token

⚠️ 注意事项：
- 建议使用真实邮箱，方便接收重要通知
- 请妥善保管您的Token，不要泄露给他人
- 定期更新Token以确保安全
- 每个IP限制注册数量，建议使用不同IP注册

## VPS环境配置教程

### 1. 安装Node.js环境

首先安装nvm (Node Version Manager)：

```bash
# 安装curl（如果未安装）
## CentOS/RHEL:
yum install curl -y
## Ubuntu/Debian:
apt update && apt install curl -y

# 下载并安装nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash

# 配置环境变量
## 如果使用bash：
source ~/.bashrc
## 如果使用zsh：
source ~/.zshrc

# 安装Node.js 22
nvm install 22

# 设置默认版本
nvm use 22
nvm alias default 22

# 验证安装
node -v   # 预期输出: v22.13.1
nvm current # 预期输出: v22.13.1
npm -v    # 预期输出: 10.9.2
```

### 2. 下载脚本

```bash
# 克隆项目仓库
git clone https://github.com/mumumusf/NodeGo.git
cd NodeGo

# 如果git未安装，先安装git
## CentOS/RHEL:
yum install git -y
## Ubuntu/Debian:
apt install git -y
```

### 3. 安装依赖包

```bash
# 初始化项目
npm init -y

# 安装必要的依赖
npm install chalk axios socks-proxy-agent https-proxy-agent http-proxy-agent
```

## 使用方法

### 1. 启动脚本

```bash
node index.js
```

### 2. 后台运行（推荐）

使用screen保持脚本在后台运行：

```bash
# 安装screen
## CentOS/RHEL:
yum install screen -y
## Ubuntu/Debian:
apt install screen -y

# 创建新的screen会话
screen -S nodego

# 在screen中运行脚本
node index.js

# 分离screen会话（保持脚本运行）
## 按Ctrl+A，然后按D

# 重新连接到screen会话
screen -r nodego

# 查看所有screen会话
screen -ls
```

### 3. 输入账户信息

启动脚本后：
1. 输入NodeGo账户Token
2. 选择是否使用代理
3. 如果使用代理，输入代理地址

支持的代理格式：
- `IP:端口:用户名:密码`
- `用户名:密码@IP:端口`
- `IP:端口`
- `http://IP:端口`
- `socks5://IP:端口`

## 常见问题解决

### 1. 脚本无法启动
- 检查Node.js版本是否正确：`node -v`
- 检查是否安装了所有依赖：`npm install`
- 检查文件权限：`chmod +x index.js`

### 2. 代理连接错误
- 验证代理地址格式是否正确
- 检查代理是否在线可用
- 确保代理支持HTTPS连接

### 3. 频率限制问题
- 脚本已内置自动处理频率限制
- 如遇到频繁限制，建议：
  - 增加账户之间的延迟时间
  - 使用不同的代理
  - 减少同时运行的账户数量

### 4. Token验证失败
- 确认Token是否有效
- 检查Token是否已过期
- 重新从NodeGo网站获取Token

## 安全提示

1. 请使用可靠的VPS服务商
2. 定期更换服务器密码
3. 建议使用代理IP，避免服务器IP被封
4. 重要数据请做好备份

## ⚠️ 免责声明

- 本程序仅供学习交流使用
- 使用本程序产生的任何后果由用户自行承担
- 请遵守相关平台的服务条款

## 📱 联系方式

- Twitter：[@YOYOMYOYOA](https://x.com/YOYOMYOYOA)
- Telegram：[@YOYOZKS](https://t.me/YOYOZKS)

---
由 [@YOYOMYOYOA](https://x.com/YOYOMYOYOA) 用❤️制作