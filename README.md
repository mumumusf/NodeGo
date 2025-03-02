# 🤖 STORK ORACLE 自动验证机器人

![Node Version](https://img.shields.io/badge/Node.js-22.x-brightgreen)
![License](https://img.shields.io/badge/License-MIT-blue)
![Language](https://img.shields.io/badge/Language-中文-red)

## 📖 项目介绍

这是一个用于 STORK ORACLE 网络的自动验证机器人，支持多账号管理、代理配置和自动验证功能。通过本机器人，您可以轻松参与 STORK ORACLE 的数据验证工作。

### ✨ 主要特点

- 🚀 支持多账号同时运行
- 🔐 每个账号独立配置代理
- 💾 自动保存和管理 Token
- 📊 实时显示验证统计
- 🔄 自动错误重试
- 🌐 支持 HTTP/HTTPS/SOCKS 代理

## 🚀 快速开始

### 1️⃣ 前置要求

- Node.js 22.x
- Linux/Windows 系统
- 稳定的网络连接
- Chrome 浏览器

### 2️⃣ 安装步骤

#### 第一步：安装 Chrome 插件
1. 访问 Chrome 商店安装 [Stork Verify](https://chromewebstore.google.com/detail/stork-verify/knnliglhgkmlblppdejchidfihjnockl) 插件

#### 第二步：注册账号
1. 点击浏览器中的 Stork Verify 插件图标
2. 选择"使用电子邮件注册"
3. 填写注册信息：
   - 📧 电子邮件地址
   - 🔑 密码（建议使用强密码）
   - 🎯 邀请码：`5LUXWB9MN4`
4. 完成邮箱验证

## 💻 部署教程

### 1️⃣ VPS 环境配置

```bash
# 1. 安装 nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash

# 2. 配置环境变量（根据您的 shell 选择）
source ~/.bashrc   # bash 用户
source ~/.zshrc    # zsh 用户

# 3. 安装 Node.js
nvm install 22
nvm use 22
nvm alias default 22

# 4. 验证安装
node -v
npm -v
```

### 2️⃣ 下载并安装项目

```bash
# 1. 克隆项目
git clone https://github.com/mumumusf/STORK.git
cd STORK

# 2. 安装依赖
npm install
```

### 3️⃣ 后台运行配置

```bash
# 安装 screen
apt-get update
apt-get install screen

# 创建新会话
screen -S stork-bot

# 启动机器人
node index.js

# 分离会话：按 Ctrl + A, 然后按 D
# 重新连接：screen -r stork-bot
# 查看所有会话：screen -ls
```

## ⚙️ 配置说明

### 账号配置
运行机器人时，需要输入：
- 📧 邮箱地址
- 🔑 密码
- 🌐 代理地址（可选）

### 代理配置
支持以下格式：
```bash
# 简单格式
ip:port

# 带认证格式
ip:port:username:password

# 完整格式
protocol:ip:port:username:password

# 示例
http://192.168.1.1:8080
socks5://proxy.example.com:1080:user:pass
```

## 📁 文件说明

- 📄 `index.js` - 主程序文件
- 🔐 `tokens_账号邮箱.json` - Token 存储
- 🌐 `proxies_账号邮箱.txt` - 代理配置

## ❗ 常见问题

### Token 刷新/认证错误
- ✔️ 检查账号密码
- ✔️ 验证网络连接
- ✔️ 测试代理可用性

### 代理连接失败
- ✔️ 检查代理格式
- ✔️ 确认代理在线
- ✔️ 验证认证信息

### 程序意外退出
- ✔️ 使用 screen 运行
- ✔️ 检查错误日志
- ✔️ 确保内存充足

## 📌 注意事项

1. 使用高质量代理
2. 定期检查运行状态
3. 安全保管账号信息
4. 每账号独立代理
5. 及时更新程序版本

## 🔒 安全提醒

- ⚠️ 不保存明文密码
- ⚠️ 定期更改密码
- ⚠️ 使用可靠代理
- ⚠️ 及时更新程序

## 🆘 技术支持

遇到问题请提供：
1. 错误截图
2. 环境信息
3. 操作步骤

## ⚠️ 免责声明

- 本程序仅供学习交流
- 用户承担使用风险
- 遵守平台服务条款

## 📱 联系方式

- 🐦 Twitter：[@YOYOMYOYOA](https://x.com/YOYOMYOYOA)
- ✈️ Telegram：[@YOYOZKS](https://t.me/YOYOZKS)

---
由 [@YOYOMYOYOA](https://x.com/YOYOMYOYOA) 用 ❤️ 制作