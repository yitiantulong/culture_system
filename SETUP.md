# 文化系统 RAG 项目安装指南

这是一个基于 Vue.js + Express.js 的前后端分离RAG系统，集成了Ollama embeddings和DeepSeek LLM。

## 系统架构

```
文化系统/
├── frontend/          # Vue.js 前端
│   ├── src/
│   │   ├── components/
│   │   │   └── RAGChat.vue    # RAG聊天组件
│   │   ├── api/
│   │   │   └── ragApi.ts      # API调用
│   │   └── router/
│   └── package.json
├── backend/           # Express.js 后端
│   ├── src/
│   │   ├── services/          # 核心服务
│   │   ├── routes/            # API路由
│   │   └── config/            # 配置文件
│   └── package.json
└── README.md
```

## 环境要求

### 必需软件
- **Node.js** >= 18.0.0
- **npm** >= 8.0.0
- **Ollama** (用于embeddings)

### API服务
- **DeepSeek API Key** (用于LLM)

## 安装步骤

### 1. 安装 Ollama

#### Windows
```bash
# 下载并安装 Ollama
# 访问 https://ollama.ai/download 下载安装包
```

#### macOS
```bash
brew install ollama
```

#### Linux
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

### 2. 启动 Ollama 并下载模型

```bash
# 启动 Ollama 服务
ollama serve

# 在新终端中下载嵌入模型
ollama pull mxbai-embed-large
```

### 3. 获取 DeepSeek API Key

1. 访问 [DeepSeek 官网](https://platform.deepseek.com/)
2. 注册账号并获取 API Key
3. 记录您的 API Key，稍后配置时需要

### 4. 安装项目依赖

#### 后端安装
```bash
cd backend
npm install
```

#### 前端安装
```bash
cd ../  # 回到项目根目录
npm install
```

### 5. 配置环境变量

```bash
cd backend
cp env.example .env
```

编辑 `.env` 文件：
```env
# 服务器配置
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Ollama配置
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_EMBEDDING_MODEL=mxbai-embed-large

# DeepSeek配置
DEEPSEEK_API_KEY=your_actual_api_key_here
DEEPSEEK_MODEL=deepseek-reasoner
```

**重要**: 将 `your_actual_api_key_here` 替换为您的实际 DeepSeek API Key。

## 启动项目

### 方法一：分别启动（推荐用于开发）

#### 1. 启动后端服务
```bash
cd backend
npm run dev
```
后端将在 `http://localhost:3001` 启动

#### 2. 启动前端服务
```bash
# 新开一个终端
cd frontend  # 或项目根目录
npm run dev
```
前端将在 `http://localhost:5173` 启动

### 方法二：使用脚本启动

```bash
cd backend
chmod +x scripts/start.sh
./scripts/start.sh
```

## 验证安装

### 1. 检查服务状态

访问以下URL验证服务是否正常：

- 后端健康检查: `http://localhost:3001/api/health`
- RAG服务状态: `http://localhost:3001/api/rag/health`
- 前端页面: `http://localhost:5173`

### 2. 测试RAG功能

1. 打开前端页面 `http://localhost:5173`
2. 点击"智能问答"标签
3. 在文档管理区域添加一些测试文本
4. 在聊天区域提问测试

## 功能说明

### 核心功能
- **智能问答**: 基于上传文档的智能问答
- **文档管理**: 支持JSON、TXT文件上传和文本直接输入
- **语义检索**: 使用Ollama embeddings进行语义搜索
- **上下文展示**: 显示回答的参考文档来源

### API接口
- `POST /api/rag/query` - 提问
- `POST /api/rag/upload` - 上传文档
- `POST /api/rag/add-text` - 添加文本
- `GET /api/rag/stats` - 获取统计信息
- `DELETE /api/rag/documents` - 清空文档

## 故障排除

### 常见问题

1. **Ollama连接失败**
   ```bash
   # 检查Ollama是否运行
   curl http://localhost:11434/api/tags
   
   # 重启Ollama
   ollama serve
   ```

2. **DeepSeek API错误**
   - 检查API Key是否正确
   - 确认账户余额充足
   - 检查网络连接

3. **端口冲突**
   ```bash
   # 修改后端端口
   # 编辑 backend/.env 中的 PORT 值
   
   # 修改前端端口
   # 编辑 vite.config.ts 中的 server.port
   ```

4. **依赖安装失败**
   ```bash
   # 清除缓存重新安装
   rm -rf node_modules package-lock.json
   npm install
   ```

### 日志查看

- 后端日志：终端输出
- 前端日志：浏览器开发者工具 Console
- Ollama日志：Ollama服务终端

## 开发说明

### 项目结构
- `backend/src/services/` - 核心业务逻辑
- `backend/src/routes/` - API路由定义
- `src/components/RAGChat.vue` - 前端聊天界面
- `src/api/ragApi.ts` - 前端API调用

### 扩展功能
- 添加更多文档格式支持
- 集成其他向量数据库
- 添加用户认证
- 实现对话历史保存

## 许可证

MIT License

## 支持

如有问题，请检查：
1. 所有服务是否正常启动
2. 环境变量是否正确配置
3. 网络连接是否正常
4. API Key是否有效 