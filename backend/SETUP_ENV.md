# 环境配置说明

## 创建 .env 文件

请在 `backend/` 目录下创建 `.env` 文件，内容如下：

```env
# 服务器配置
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Ollama配置
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_EMBEDDING_MODEL=mxbai-embed-large

# DeepSeek配置
DEEPSEEK_API_KEY=sk-6a5632e683314a94a093b37baf161963
DEEPSEEK_MODEL=deepseek-reasoner
```

## 重要提醒

1. **DeepSeek API Key**: 请确保您的API Key有效且有余额
2. **Ollama服务**: 确保Ollama服务在 localhost:11434 运行
3. **重启服务**: 修改.env后需要重启后端服务

## 验证配置

创建.env文件后，重启后端服务：
```bash
cd backend
npm run dev
```

检查控制台输出，确保没有API Key警告。 