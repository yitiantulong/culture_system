#!/bin/bash

echo "🚀 启动文化系统 RAG 后端服务..."

# 检查 Node.js 版本
echo "📋 检查 Node.js 版本..."
node --version

# 检查 npm 版本
echo "📋 检查 npm 版本..."
npm --version

# 安装依赖
echo "📦 安装依赖..."
npm install

# 检查环境变量文件
if [ ! -f .env ]; then
    echo "⚠️  未找到 .env 文件，复制示例文件..."
    cp env.example .env
    echo "✅ 已创建 .env 文件，请编辑配置后重新启动"
    exit 1
fi

# 创建上传目录
echo "📁 创建上传目录..."
mkdir -p uploads

# 启动开发服务器
echo "🎯 启动开发服务器..."
npm run dev