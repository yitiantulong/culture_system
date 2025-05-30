# 文化系统 RAG 后端服务

基于 LangChain、Ollama 和 DeepSeek 的检索增强生成（RAG）系统后端服务。

## 功能特性

- 🤖 **智能问答**: 基于外部知识库的智能问答系统
- 📄 **多格式支持**: 支持 JSON、TXT 文件和网页内容导入
- 🔍 **语义检索**: 使用 Ollama embeddings 进行语义相似度搜索
- 💬 **智能生成**: 集成 DeepSeek 大语言模型生成准确回答
- 📊 **文档管理**: 支持文档上传、分割、存储和管理
- 🌐 **RESTful API**: 完整的 REST API 接口

## 技术栈

- **框架**: Express.js + TypeScript
- **向量存储**: LangChain MemoryVectorStore
- **嵌入模型**: Ollama (mxbai-embed-large)
- **语言模型**: DeepSeek (deepseek-reasoner)
- **文档处理**: LangChain Document Loaders
- **文件上传**: Multer

## 环境要求

- Node.js >= 18
- Ollama 服务 (运行在 localhost:11434)
- DeepSeek API Key

## 安装和配置

### 1. 安装依赖

```bash
cd backend
npm install
```

### 2. 环境配置

复制环境变量示例文件：
```bash
cp env.example .env
```

编辑 `.env` 文件，配置必要的环境变量：
```env
# 服务器配置
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Ollama配置
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_EMBEDDING_MODEL=mxbai-embed-large

# DeepSeek配置
DEEPSEEK_API_KEY=your_deepseek_api_key_here
DEEPSEEK_MODEL=deepseek-reasoner
```

### 3. 启动 Ollama 服务

确保 Ollama 服务正在运行，并下载所需的嵌入模型：

```bash
# 启动 Ollama 服务
ollama serve

# 下载嵌入模型
ollama pull mxbai-embed-large
```

### 4. 启动开发服务器

```bash
npm run dev
```

服务器将在 `http://localhost:3001` 启动。

## API 接口

### 基础接口

#### 健康检查
```http
GET /api/health
```

#### RAG 服务状态
```http
GET /api/rag/health
```

### 文档管理

#### 上传文档
```http
POST /api/rag/upload
Content-Type: multipart/form-data

document: [文件] (支持 .json, .txt)
```

#### 添加文本文档
```http
POST /api/rag/add-text
Content-Type: application/json

{
  "text": "文档内容",
  "metadata": {
    "title": "文档标题",
    "source": "来源"
  }
}
```

#### 添加网页文档
```http
POST /api/rag/add-web
Content-Type: application/json

{
  "url": "https://example.com",
  "selector": "p" // 可选，CSS选择器
}
```

#### 获取文档统计
```http
GET /api/rag/stats
```

#### 清空所有文档
```http
DELETE /api/rag/documents
```

### 智能问答

#### 提问
```http
POST /api/rag/query
Content-Type: application/json

{
  "question": "你的问题"
}
```

响应示例：
```json
{
  "success": true,
  "data": {
    "answer": "基于知识库的回答",
    "question": "你的问题",
    "contextCount": 3,
    "context": [
      {
        "content": "相关文档片段...",
        "metadata": {
          "source": "文档来源"
        }
      }
    ]
  }
}
```

## 项目结构

```
backend/
├── src/
│   ├── config/
│   │   └── config.ts          # 配置文件
│   ├── services/
│   │   ├── vectorStore.ts     # 向量存储服务
│   │   ├── llmService.ts      # LLM 服务
│   │   ├── documentService.ts # 文档处理服务
│   │   └── ragService.ts      # RAG 核心服务
│   ├── routes/
│   │   └── ragRoutes.ts       # API 路由
│   └── index.ts               # 主服务器文件
├── uploads/                   # 文件上传目录
├── package.json
├── tsconfig.json
└── README.md
```

## 开发说明

### 构建项目
```bash
npm run build
```

### 生产环境启动
```bash
npm start
```

### 类型检查
```bash
npx tsc --noEmit
```

## 故障排除

### 常见问题

1. **Ollama 连接失败**
   - 确保 Ollama 服务正在运行
   - 检查 `OLLAMA_BASE_URL` 配置是否正确

2. **DeepSeek API 错误**
   - 验证 `DEEPSEEK_API_KEY` 是否有效
   - 检查网络连接和 API 配额

3. **文件上传失败**
   - 确保 `uploads/` 目录存在且有写权限
   - 检查文件大小是否超过限制（默认 10MB）

4. **内存不足**
   - 向量存储使用内存存储，大量文档可能导致内存不足
   - 考虑使用持久化向量数据库（如 Chroma、Pinecone）

## 许可证

MIT License 