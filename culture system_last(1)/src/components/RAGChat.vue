<template>
  <div class="rag-chat">
    <div class="chat-header">
      <h2>🤖 智能问答系统</h2>
    </div>

    <div class="chat-container">
      <div class="messages" ref="messagesContainer">
        <div v-for="(message, index) in messages" :key="index" :class="['message', message.type]">
          <div class="message-content">
            <div class="text">{{ message.text }}</div>
            <div v-if="message.context && message.context.length > 0" class="context">
              <details>
                <summary>📖 参考文档 ({{ message.context.length }})</summary>
                <div
                  v-for="(ctx, ctxIndex) in message.context"
                  :key="ctxIndex"
                  class="context-item"
                >
                  <div class="context-content">{{ ctx.content }}</div>
                  <div class="context-metadata">来源: {{ ctx.metadata.source || '未知' }}</div>
                </div>
              </details>
            </div>
          </div>
          <div class="timestamp">{{ formatTime(message.timestamp) }}</div>
        </div>
      </div>

      <div class="input-area">
        <div class="input-group">
          <input
            v-model="currentQuestion"
            @keyup.enter="sendQuestion"
            :disabled="isLoading"
            placeholder="请输入您的问题..."
            class="question-input"
          />
          <button
            @click="sendQuestion"
            :disabled="isLoading || !currentQuestion.trim()"
            class="send-button"
          >
            {{ isLoading ? '🤔 思考中...' : '📤 发送' }}
          </button>
        </div>
      </div>
    </div>

    <div class="document-management">
      <h3>📄 文档管理</h3>

      <div class="upload-section">
        <input
          type="file"
          ref="fileInput"
          @change="handleFileUpload"
          accept=".json,.txt"
          style="display: none"
        />
        <button @click="$refs.fileInput.click()" class="upload-button">📁 上传文档</button>

        <div class="text-input-section">
          <textarea
            v-model="textToAdd"
            placeholder="或者直接输入文本内容..."
            class="text-input"
            rows="3"
          ></textarea>
          <button @click="addTextDocument" :disabled="!textToAdd.trim()" class="add-text-button">
            ➕ 添加文本
          </button>
        </div>
      </div>

      <div class="management-buttons">
        <button @click="refreshStats" class="refresh-button">🔄 刷新状态</button>
        <button @click="clearAllDocuments" class="clear-button">🗑️ 清空文档</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import ragApiMethods, { type RAGQueryResponse } from '../api/ragApi'

interface Message {
  type: 'user' | 'assistant'
  text: string
  timestamp: Date
  context?: Array<{
    content: string
    metadata: Record<string, any>
  }>
}

const messages = ref<Message[]>([])
const currentQuestion = ref('')
const textToAdd = ref('')
const isLoading = ref(false)
const messagesContainer = ref<HTMLElement>()

const stats = reactive({
  documentCount: 0,
  isInitialized: false,
})

// 发送问题
const sendQuestion = async () => {
  if (!currentQuestion.value.trim() || isLoading.value) return

  const question = currentQuestion.value.trim()
  currentQuestion.value = ''

  // 添加用户消息
  messages.value.push({
    type: 'user',
    text: question,
    timestamp: new Date(),
  })

  isLoading.value = true

  try {
    const response = await ragApiMethods.query(question)

    // 添加助手回复
    messages.value.push({
      type: 'assistant',
      text: response.data.answer,
      timestamp: new Date(),
      context: response.data.context,
    })
  } catch (error) {
    console.error('查询失败:', error)
    messages.value.push({
      type: 'assistant',
      text: '抱歉，查询时发生错误，请稍后重试。',
      timestamp: new Date(),
    })
  } finally {
    isLoading.value = false
    await nextTick()
    scrollToBottom()
  }
}

// 处理文件上传
const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  try {
    const response = await ragApiMethods.uploadDocument(file)
    alert(`文档上传成功！添加了 ${response.data.documentCount} 个文档块`)
    await refreshStats()
  } catch (error) {
    console.error('文件上传失败:', error)
    alert('文件上传失败，请检查文件格式和网络连接')
  }

  // 清空文件输入
  target.value = ''
}

// 添加文本文档
const addTextDocument = async () => {
  if (!textToAdd.value.trim()) return

  try {
    const response = await ragApiMethods.addTextDocument(textToAdd.value, {
      title: '用户输入文档',
      timestamp: new Date().toISOString(),
    })

    alert(`文本添加成功！添加了 ${response.data.documentCount} 个文档块`)
    textToAdd.value = ''
    await refreshStats()
  } catch (error) {
    console.error('文本添加失败:', error)
    alert('文本添加失败，请稍后重试')
  }
}

// 刷新统计信息
const refreshStats = async () => {
  try {
    const statsResponse = await ragApiMethods.getStats()
    stats.documentCount = statsResponse.data.documentCount
    stats.isInitialized = statsResponse.data.isInitialized
  } catch (error) {
    console.error('获取状态失败:', error)
  }
}

// 清空所有文档
const clearAllDocuments = async () => {
  if (!confirm('确定要清空所有文档吗？此操作不可恢复。')) return

  try {
    await ragApiMethods.clearDocuments()
    alert('文档已清空')
    await refreshStats()
  } catch (error) {
    console.error('清空文档失败:', error)
    alert('清空文档失败，请稍后重试')
  }
}

// 滚动到底部
const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// 格式化时间
const formatTime = (date: Date) => {
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

// 组件挂载时初始化
onMounted(async () => {
  await refreshStats()

  // 添加欢迎消息
  messages.value.push({
    type: 'assistant',
    text: '您好！我是基于RAG技术的智能问答助手。您可以向我提问关于已加载文档的任何问题，我会基于知识库为您提供准确的回答。',
    timestamp: new Date(),
  })
})
</script>

<style scoped>
.rag-chat {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.chat-header {
  text-align: center;
  margin-bottom: 20px;
}

.chat-header h2 {
  font-size: 1.8rem;
  color: #570404;
  margin: 0;
}

.chat-container {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 500px;
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.message {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
}

.message.user {
  align-items: flex-end;
}

.message-content {
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 12px;
  background: #f0f2f5;
}

.message.user .message-content {
  background: #570404;
  color: white;
}

.message.assistant .message-content {
  background: #f0f2f5;
  color: #333;
}

.context {
  margin-top: 8px;
  font-size: 0.9em;
}

.context-item {
  margin-top: 8px;
  padding: 8px;
  background: rgba(87, 4, 4, 0.05);
  border-radius: 6px;
}

.context-metadata {
  font-size: 0.8em;
  color: #666;
  margin-top: 4px;
}

.timestamp {
  font-size: 0.8em;
  color: #999;
  margin-top: 4px;
}

.input-area {
  padding: 20px;
  background: #fff;
  border-top: 1px solid #eee;
}

.input-group {
  display: flex;
  gap: 10px;
}

.question-input {
  flex: 1;
  padding: 12px;
  border: 2px solid #570404;
  border-radius: 6px;
  font-size: 16px;
}

.question-input:focus {
  outline: none;
  border-color: #8b572a;
}

.send-button {
  padding: 0 24px;
  background: #570404;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.send-button:hover:not(:disabled) {
  background: #8b572a;
}

.send-button:disabled {
  background: #999;
  cursor: not-allowed;
}

.document-management {
  margin-top: 20px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.document-management h3 {
  margin: 0 0 20px 0;
  color: #570404;
}

.upload-section {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.text-input-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.text-input {
  width: 100%;
  padding: 12px;
  border: 2px solid #570404;
  border-radius: 6px;
  resize: vertical;
  min-height: 100px;
}

.upload-button,
.add-text-button,
.refresh-button,
.clear-button {
  padding: 12px 24px;
  background: #570404;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s;
  font-size: 14px;
  white-space: nowrap;
}

.upload-button:hover,
.add-text-button:hover,
.refresh-button:hover,
.clear-button:hover {
  background: #8b572a;
}

.management-buttons {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.clear-button {
  background: #dc3545;
}

.clear-button:hover {
  background: #c82333;
}
</style>
