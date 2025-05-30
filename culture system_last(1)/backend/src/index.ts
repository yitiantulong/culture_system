import express from 'express'
import cors from 'cors'
import path from 'path'
import fs from 'fs/promises'
import { config } from './config/config.js'
import ragRoutes from './routes/ragRoutes.js'

const app = express()

// 中间件配置
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:8080',
      process.env.FRONTEND_URL || 'http://localhost:5173',
    ],
    credentials: true,
  }),
)

// 增加请求超时处理
app.use((req, res, next) => {
  // 设置请求超时为6分钟
  req.setTimeout(360000)
  res.setTimeout(360000)

  // 记录请求开始时间
  const startTime = Date.now()

  // 拦截响应结束事件来记录处理时间
  const originalSend = res.send
  res.send = function (data) {
    const duration = Date.now() - startTime
    console.log(`📊 ${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`)
    return originalSend.call(this, data)
  }

  next()
})

app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// 创建上传目录
const createUploadDir = async () => {
  try {
    await fs.access('uploads')
  } catch {
    await fs.mkdir('uploads', { recursive: true })
    console.log('创建uploads目录')
  }
}

// 路由配置
app.use('/api/rag', ragRoutes)

// 健康检查端点
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '服务器运行正常',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  })
})

// 错误处理中间件
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('服务器错误:', err)

  res.status(500).json({
    success: false,
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : '内部错误',
  })
})

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: '接口不存在',
  })
})

// 启动服务器
const startServer = async () => {
  try {
    await createUploadDir()

    app.listen(config.port, () => {
      console.log(`🚀 RAG服务器启动成功`)
      console.log(`📍 服务地址: http://localhost:${config.port}`)
      console.log(`🔧 Ollama地址: ${config.ollama.baseUrl}`)
      console.log(`🤖 DeepSeek模型: ${config.deepseek.model}`)
      console.log(`📊 向量模型: ${config.ollama.embeddingModel}`)
      console.log(`🌐 允许的前端地址: localhost:3000, localhost:5173`)
    })
  } catch (error) {
    console.error('服务器启动失败:', error)
    process.exit(1)
  }
}

startServer()
