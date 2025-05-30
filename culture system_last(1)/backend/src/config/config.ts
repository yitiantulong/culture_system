import { config as dotenvConfig } from 'dotenv';

// 加载环境变量
dotenvConfig();

export const config = {
  // 服务器配置
  port: process.env.PORT || 3001,
  
  // Ollama配置
  ollama: {
    baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
    embeddingModel: process.env.OLLAMA_EMBEDDING_MODEL || "mxbai-embed-large",
  },
  
  // DeepSeek配置
  deepseek: {
    model: process.env.DEEPSEEK_MODEL || "deepseek-reasoner",
    temperature: 0,
    apiKey: process.env.DEEPSEEK_API_KEY || "",
  },
  
  // RAG配置
  rag: {
    chunkSize: 1000,
    chunkOverlap: 200,
    maxRetrievedDocs: 4,
  },
  
  // 文件上传配置
  upload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['.json', '.txt'],
  }
}; 