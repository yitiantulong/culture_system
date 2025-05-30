<template>
  <div class="chat-container">
    <!-- 头部文化元素装饰 -->
    <header class="header">
      <h2>🏛️ 文化对话系统</h2>
      <p>与AI一起探索非物质文化遗产的魅力</p>
      
      <!-- 连接状态指示器 -->
      <div class="connection-status">
        <span :class="['status-indicator', backendConnected ? 'connected' : 'disconnected']">
          {{ backendConnected ? '🟢 后端已连接' : '🔴 后端未连接' }}
        </span>
        <button @click="testBackendConnection" class="test-btn" :disabled="testing">
          {{ testing ? '测试中...' : '测试连接' }}
        </button>
      </div>
    </header>

    <!-- 聊天历史区域 -->
    <div class="chat-history" ref="chatHistory">
      <!-- 消息卡片 -->
      <div v-for="(msg, index) in messages" :key="index" :class="['message-card', msg.type]">
        <div class="message-icon">
          <div v-if="msg.type === 'assistant'" class="bot-avatar">🤖</div>
          <div v-else-if="msg.type === 'error'" class="error-avatar">⚠️</div>
          <div v-else class="user-avatar">👤</div>
        </div>
        <div class="message-content">
          <div class="content-text">{{ msg.content }}</div>
          <div class="message-time">{{ msg.timestamp }}</div>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-indicator">
        <div class="spinner"></div>
        <span class="loading-text">文化瑰宝解码中...</span>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="input-area">
      <div class="input-wrapper">
        <textarea
          v-model="inputQuestion"
          @keyup.enter.exact="submitQuestion"
          @keydown.enter.exact.prevent
          placeholder="请输入关于非物质文化遗产的问题，例如：昆曲的四大经典剧目是什么？"
          :disabled="loading || !backendConnected"
          rows="2"
        ></textarea>
        <button 
          @click="submitQuestion" 
          :class="{ 'cultural-button': true, loading: loading }" 
          :disabled="loading || !inputQuestion.trim() || !backendConnected"
        >
          <span>{{ loading ? '传承思考中...' : '发送提问' }}</span>
        </button>
      </div>
      
      <!-- 连接提示 -->
      <div v-if="!backendConnected" class="connection-warning">
        ⚠️ 后端服务未连接，请检查后端服务是否启动在 http://localhost:3001
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, watch } from 'vue'
import ragApiMethods from '@/api/ragApi'

interface Message {
  type: 'user' | 'assistant' | 'error'
  content: string
  timestamp: string
}

const inputQuestion = ref('')
const messages = ref<Message[]>([])
const loading = ref(false)
const chatHistory = ref<HTMLElement>()
const backendConnected = ref(false)
const testing = ref(false)

// 测试后端连接
const testBackendConnection = async () => {
  testing.value = true
  try {
    console.log('🔍 开始连接测试...')
    const results = await ragApiMethods.fullConnectionTest()
    
    if (results.basic && results.rag) {
      backendConnected.value = true
      messages.value.push({
        type: 'assistant',
        content: '✅ 后端连接成功！RAG服务正常，现在可以进行对话了。',
        timestamp: getTimestamp(),
      })
    } else if (results.basic && !results.rag) {
      backendConnected.value = false
      messages.value.push({
        type: 'error',
        content: '⚠️ 后端基础服务连接成功，但RAG服务未就绪。请检查后端日志中的错误信息。\n\n可能原因：\n• DeepSeek API Key未设置\n• Ollama服务未启动\n• 向量存储初始化失败',
        timestamp: getTimestamp(),
      })
    } else {
      backendConnected.value = false
      messages.value.push({
        type: 'error',
        content: '❌ 后端连接失败。请确保后端服务正在运行在 http://localhost:3001\n\n启动命令：\ncd backend\nnpm run dev',
        timestamp: getTimestamp(),
      })
    }
  } catch (error) {
    backendConnected.value = false
    console.error('连接测试失败:', error)
    messages.value.push({
      type: 'error',
      content: '❌ 连接测试过程中出现异常，请检查网络和服务状态。',
      timestamp: getTimestamp(),
    })
  } finally {
    testing.value = false
    scrollToBottom()
  }
}

// 自动滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (chatHistory.value) {
      chatHistory.value.scrollTop = chatHistory.value.scrollHeight
    }
  })
}

// 监听消息数组变化
watch(
  messages,
  () => {
    nextTick(() => {
      scrollToBottom()
    })
  },
  { deep: true },
)

// 获取当前时间
const getTimestamp = () => {
  const now = new Date()
  return now.toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  })
}

// 提交问题
const submitQuestion = async () => {
  if (!inputQuestion.value.trim() || loading.value || !backendConnected.value) return

  const question = inputQuestion.value.trim()
  
  try {
    // 添加用户消息
    messages.value.push({
      type: 'user',
      content: question,
      timestamp: getTimestamp(),
    })

    loading.value = true
    inputQuestion.value = ''
    scrollToBottom()

    // 调用 RAG API
    const response = await ragApiMethods.query(question)

    // 添加助手响应
    messages.value.push({
      type: 'assistant',
      content: response.data.answer,
      timestamp: getTimestamp(),
    })

  } catch (error: any) {
    console.error('RAG API Error:', error)
    
    let errorMessage = '抱歉，文化传承通道暂时受阻。'
    
    if (error.code === 'ECONNABORTED') {
      errorMessage += '请求超时，可能是AI正在深度思考，请稍后重试。'
    } else if (error.code === 'ERR_NETWORK') {
      errorMessage += '无法连接到后端服务，请检查后端是否正常运行。'
      backendConnected.value = false
    } else if (error.response?.status === 500) {
      errorMessage += '后端服务遇到问题，请查看后端日志。'
    } else {
      errorMessage += `错误详情: ${error.message}`
    }
    
    errorMessage += '\n\n💡 建议：您也可以尝试切换到"智能问答"页面使用完整的RAG功能。'
    
    messages.value.push({
      type: 'error',
      content: errorMessage,
      timestamp: getTimestamp(),
    })
  } finally {
    loading.value = false
    scrollToBottom()
  }
}

// 初始化
onMounted(async () => {
  // 添加欢迎消息
  messages.value.push({
    type: 'assistant',
    content: `🏮 欢迎来到非遗文化对话系统！

我可以帮您了解：
• 🎭 传统戏曲：昆曲、京剧、豫剧等
• ✂️ 手工艺术：剪纸、刺绣、陶瓷等  
• 🎵 民间音乐：古琴、二胡、民歌等
• 🎊 节庆习俗：春节、端午、中秋等
• 🥘 传统美食：各地特色小吃等

正在检测后端连接状态...`,
    timestamp: getTimestamp(),
  })
  
  // 自动测试后端连接
  await testBackendConnection()
  scrollToBottom()
})
</script>

<style scoped>
.chat-container {
  width: 100%;
  height: 100vh;
  max-width: 1000px;
  margin: 0 auto;
  padding: 1rem;
  background: transparent;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header {
  text-align: center;
  margin-bottom: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: #f3f1ef;
  backdrop-filter: blur(10px);
}

.header h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  color: #f3f1ef;
}

.header p {
  margin: 0 0 1rem 0;
  opacity: 0.8;
  font-size: 0.9rem;
}

.connection-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 0.5rem;
}

.status-indicator {
  font-size: 0.8rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.status-indicator.connected {
  background: rgba(40, 167, 69, 0.2);
  color: #28a745;
}

.status-indicator.disconnected {
  background: rgba(220, 53, 69, 0.2);
  color: #dc3545;
}

.test-btn {
  font-size: 0.7rem;
  padding: 0.25rem 0.5rem;
  background: rgba(255, 255, 255, 0.2);
  color: #f3f1ef;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.test-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
}

.test-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.chat-history {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  margin-bottom: 1rem;
  scroll-behavior: smooth;
  backdrop-filter: blur(10px);
}

.message-card {
  display: flex;
  gap: 1rem;
  margin: 1.5rem 0;
  position: relative;
}

.message-card.user {
  flex-direction: row-reverse;
  margin-left: 15%;
}

.message-card.assistant {
  margin-right: 15%;
}

.message-card.error {
  margin-right: 15%;
}

.message-icon {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 1.2rem;
}

.bot-avatar {
  background: #8b572a;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-avatar {
  background: #2c5aa0;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-avatar {
  background: #dc3545;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.message-content {
  flex: 1;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  background: rgba(243, 241, 239, 0.95);
  position: relative;
  backdrop-filter: blur(10px);
}

.message-card.assistant .message-content {
  border-left: 4px solid #8b572a;
}

.message-card.user .message-content {
  border-right: 4px solid #2c5aa0;
  background: rgba(44, 90, 160, 0.1);
  color: #f3f1ef;
}

.message-card.error .message-content {
  border-left: 4px solid #dc3545;
  background: rgba(220, 53, 69, 0.1);
  color: #dc3545;
}

.content-text {
  white-space: pre-wrap;
  line-height: 1.6;
  font-size: 15px;
  color: #2c1810;
}

.message-card.user .content-text {
  color: #f3f1ef;
}

.message-card.error .content-text {
  color: #dc3545;
}

.message-time {
  margin-top: 0.5rem;
  font-size: 11px;
  color: #999;
  text-align: right;
}

.input-area {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1rem;
  backdrop-filter: blur(10px);
}

.input-wrapper {
  position: relative;
  display: flex;
  gap: 1rem;
  align-items: flex-end;
}

.connection-warning {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: rgba(220, 53, 69, 0.1);
  color: #dc3545;
  border: 1px solid rgba(220, 53, 69, 0.3);
  border-radius: 6px;
  font-size: 0.8rem;
  text-align: center;
}

textarea {
  flex: 1;
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid #d4c8b5;
  font-size: 14px;
  color: #4a4035;
  padding: 1rem;
  border-radius: 8px;
  resize: none;
  max-height: 120px;
  font-family: inherit;
}

textarea:focus {
  outline: none;
  border-color: #8b572a;
  box-shadow: 0 0 0 2px rgba(139, 87, 42, 0.2);
}

textarea::placeholder {
  color: #999;
}

textarea:disabled {
  background: rgba(255, 255, 255, 0.5);
  color: #999;
}

.cultural-button {
  background: #8b572a;
  color: white;
  border: none;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.cultural-button:hover:not(:disabled) {
  background: #6b4220;
  transform: translateY(-2px);
}

.cultural-button:disabled {
  background: #999;
  cursor: not-allowed;
  transform: none;
}

.loading-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
  color: #8b572a;
  font-style: italic;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #8b572a;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 滚动条样式 */
.chat-history::-webkit-scrollbar {
  width: 6px;
}

.chat-history::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.chat-history::-webkit-scrollbar-thumb {
  background: rgba(139, 87, 42, 0.5);
  border-radius: 3px;
}

.chat-history::-webkit-scrollbar-thumb:hover {
  background: rgba(139, 87, 42, 0.7);
}
</style>
