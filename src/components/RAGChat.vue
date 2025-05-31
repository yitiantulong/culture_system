<template>
  <div class="rag-chat">
    <div class="chat-header">
      <h2>智能问答系统</h2>
    </div>

    <div class="chat-container">
      <div class="messages" ref="messagesContainer">
        <div v-for="(message, index) in messages" :key="index" :class="['message', message.type]">
          <div class="message-content">
            <div
              v-if="message.type === 'assistant'"
              class="text assistant-text"
              v-html="renderMarkdown(message.text)"
            ></div>
            <div v-else class="text">{{ message.text }}</div>

            <!-- 流式输出时显示光标 -->
            <span v-if="streamingMessageIndex === index" class="streaming-cursor">|</span>

            <div v-if="message.context && message.context.length > 0" class="context">
              <details>
                <summary>📖 参考文档 ({{ message.context.length }})</summary>
                <div
                  v-for="(ctx, ctxIndex) in message.context"
                  :key="ctxIndex"
                  class="context-item"
                >
                  <div class="context-content" v-html="renderMarkdown(ctx.content)"></div>
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
        <button @click="($refs.fileInput as HTMLInputElement)?.click()" class="upload-button">📁 上传文档</button>

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
import { marked } from 'marked'
import ragApiMethods from '../api/ragApi'

interface Message {
  type: 'user' | 'assistant'
  text: string
  timestamp: Date
  context?: Array<{
    content: string
    metadata: Record<string, unknown>
  }>
}

const messages = ref<Message[]>([])
const currentQuestion = ref('')
const textToAdd = ref('')
const isLoading = ref(false)
const messagesContainer = ref<HTMLElement>()
const streamingMessageIndex = ref(-1) // 用于跟踪正在流式输出的消息索引

const stats = reactive({
  documentCount: 0,
  isInitialized: false,
})

// 添加 Markdown 渲染函数
const renderMarkdown = (text: string): string => {
  try {
    return marked(text, {
      breaks: true, // 启用换行支持
      gfm: true, // 启用 GitHub 风格的 Markdown
      async: false // 确保返回字符串而不是Promise
    }) as string
  } catch (error) {
    console.error('Markdown 渲染错误:', error)
    return text
  }
}

// 模拟流式输出效果
const simulateStreamingOutput = async (messageIndex: number, fullText: string) => {
  const characters = fullText.split('')
  messages.value[messageIndex].text = ''
  streamingMessageIndex.value = messageIndex

  for (let i = 0; i < characters.length; i++) {
    messages.value[messageIndex].text += characters[i]
    await nextTick()
    scrollToBottom(true)

    // 控制打字速度
    await new Promise((resolve) => setTimeout(resolve, 20))
  }

  streamingMessageIndex.value = -1
}

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

  // 添加一个空的助手消息，用于流式填充
  const assistantMessageIndex = messages.value.length
  messages.value.push({
    type: 'assistant',
    text: '',
    timestamp: new Date(),
  })

  try {
    const response = await ragApiMethods.query(question)

    // 设置上下文
    messages.value[assistantMessageIndex].context = response.data.context

    // 开始流式输出
    await simulateStreamingOutput(assistantMessageIndex, response.data.answer)
  } catch (error) {
    console.error('查询失败:', error)

    let errorMessage = '抱歉，查询时发生错误。'

    if (error instanceof Error) {
      if (error.message.includes('Network Error') || error.message.includes('fetch')) {
        errorMessage = '❌ 无法连接到后端服务，请确保后端服务已启动在 http://localhost:3001'
      } else {
        errorMessage = `查询失败: ${error.message}`
      }
    }

    // 流式显示错误消息
    await simulateStreamingOutput(assistantMessageIndex, errorMessage)
  } finally {
    isLoading.value = false
  }
}

// 处理文件上传
const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  // 检查文件格式
  const allowedExtensions = ['.json', '.txt']
  const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))

  if (!allowedExtensions.includes(fileExtension)) {
    alert(`❌ 不支持的文件格式: ${fileExtension}\n\n支持的格式: ${allowedExtensions.join(', ')}`)
    target.value = ''
    return
  }

  try {
    const response = await ragApiMethods.uploadDocument(file)
    alert(`✅ 文档上传成功！添加了 ${response.data.documentCount} 个文档块`)
    await refreshStats()
  } catch (error) {
    console.error('文件上传失败:', error)

    let errorMessage = '❌ 文件上传失败！'

    if (error instanceof Error) {
      if (error.message.includes('Network Error') || error.message.includes('fetch')) {
        errorMessage +=
          '\n\n原因: 无法连接到后端服务\n解决方案: 请确保后端服务已启动在 http://localhost:3001'
      } else if (error.message.includes('413')) {
        errorMessage += '\n\n原因: 文件太大\n解决方案: 请选择10MB以下的文件'
      } else if (error.message.includes('400')) {
        errorMessage += '\n\n原因: 文件格式不正确\n解决方案: 请上传 .json 或 .txt 格式的文件'
      } else {
        errorMessage += `\n\n错误详情: ${error.message}`
      }
    }

    alert(errorMessage)
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

    alert(`✅ 文本添加成功！添加了 ${response.data.documentCount} 个文档块`)
    textToAdd.value = ''
    await refreshStats()
  } catch (error) {
    console.error('文本添加失败:', error)

    let errorMessage = '❌ 文本添加失败！'

    if (error instanceof Error) {
      if (error.message.includes('Network Error') || error.message.includes('fetch')) {
        errorMessage +=
          '\n\n原因: 无法连接到后端服务\n解决方案: 请确保后端服务已启动在 http://localhost:3001'
      } else {
        errorMessage += `\n\n错误详情: ${error.message}`
      }
    }

    alert(errorMessage)
  }
}

// 刷新统计信息
const refreshStats = async () => {
  try {
    const statsResponse = await ragApiMethods.getStats()

    // 检查响应数据是否有效
    if (statsResponse && statsResponse.data) {
      stats.documentCount = statsResponse.data.documentCount || 0
      stats.isInitialized = statsResponse.data.isInitialized || false
    } else {
      console.warn('统计数据响应格式不正确:', statsResponse)
      stats.documentCount = 0
      stats.isInitialized = false
    }
  } catch (error) {
    console.error('获取状态失败:', error)

    // 重置统计信息
    stats.documentCount = 0
    stats.isInitialized = false

    if (
      error instanceof Error &&
      (error.message.includes('Network Error') || error.message.includes('fetch'))
    ) {
      console.log('后端服务未连接，请确保后端服务已启动在 http://localhost:3001')
    }
  }
}

// 清空所有文档
const clearAllDocuments = async () => {
  if (!confirm('确定要清空所有文档吗？此操作不可恢复。')) return

  try {
    await ragApiMethods.clearDocuments()
    alert('✅ 文档已清空')
    await refreshStats()
  } catch (error) {
    console.error('清空文档失败:', error)

    let errorMessage = '❌ 清空文档失败！'

    if (error instanceof Error) {
      if (error.message.includes('Network Error') || error.message.includes('fetch')) {
        errorMessage +=
          '\n\n原因: 无法连接到后端服务\n解决方案: 请确保后端服务已启动在 http://localhost:3001'
      } else {
        errorMessage += `\n\n错误详情: ${error.message}`
      }
    }

    alert(errorMessage)
  }
}

// 滚动到底部
const scrollToBottom = (smooth = false) => {
  nextTick(() => {
    if (messagesContainer.value) {
      if (smooth) {
        messagesContainer.value.scrollTo({
          top: messagesContainer.value.scrollHeight,
          behavior: 'smooth',
        })
      } else {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
      }
    }
  })
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
  const welcomeMessage =
    '您好！我是非遗万象智能问答助手。您可以向我提问关于已加载文档的任何问题，我会基于知识库为您提供准确的回答。'

  const assistantMessageIndex = messages.value.length
  messages.value.push({
    type: 'assistant',
    text: '',
    timestamp: new Date(),
  })

  await simulateStreamingOutput(assistantMessageIndex, welcomeMessage)
})
</script>

<style scoped>
.rag-chat {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
}

/* 添加背景装饰 */
.rag-chat::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(circle at 20% 80%, rgba(87, 4, 4, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(139, 87, 42, 0.08) 0%, transparent 50%);
  pointer-events: none;
  z-index: -1;
}

.chat-header {
  text-align: center;
  margin-bottom: 30px;
  position: relative;
}

.chat-header h2 {
  font-size: 2rem;
  color: #ffffff;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  font-family: '楷体', 'KaiTi', serif;
}

/* 主聊天容器 - 添加渐变边框 */
.chat-container {
  background: rgba(255, 255, 255, 0.98);
  border-radius: 20px;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 500px;
  min-height: 500px;
  flex: 1;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

/* 渐变边框效果 */
.chat-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #570404, #8b572a, #cd853f, #daa520, #8b572a, #570404);
  background-size: 400% 400%;
  animation: gradientShift 8s ease infinite;
  border-radius: 20px;
  z-index: -1;
  padding: 3px;
}

.chat-container::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  right: 3px;
  bottom: 3px;
  background: rgba(255, 255, 255, 0.98);
  border-radius: 17px;
  z-index: 0;
}

@keyframes gradientShift {
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 25px;
  min-height: 200px;
  position: relative;
  z-index: 1;
}

/* 自定义滚动条 */
.messages::-webkit-scrollbar {
  width: 8px;
}

.messages::-webkit-scrollbar-track {
  background: rgba(87, 4, 4, 0.1);
  border-radius: 4px;
}

.messages::-webkit-scrollbar-thumb {
  background: linear-gradient(45deg, #570404, #8b572a);
  border-radius: 4px;
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
}

.messages::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(45deg, #8b572a, #570404);
}

.message {
  margin-bottom: 25px;
  display: flex;
  flex-direction: column;
  animation: messageSlideIn 0.5s ease-out;
}

@keyframes messageSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message.user {
  align-items: flex-end;
}

.message-content {
  max-width: 85%;
  padding: 16px 20px;
  border-radius: 18px;
  position: relative;
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.message-content:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.message.user .message-content {
  background: linear-gradient(135deg, #570404, #6d1f1f);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.1);
}

.message.user .message-content::before {
  content: '';
  position: absolute;
  bottom: -8px;
  right: 20px;
  width: 0;
  height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-top: 8px solid #570404;
}

.message.assistant .message-content {
  background: linear-gradient(135deg, #f8f9ff, #ffffff);
  color: #333;
  border: 2px solid rgba(87, 4, 4, 0.1);
}

.message.assistant .message-content::before {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 20px;
  width: 0;
  height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-top: 8px solid #f8f9ff;
}

.assistant-text {
  line-height: 1.7;
}

.assistant-text :deep(h1),
.assistant-text :deep(h2),
.assistant-text :deep(h3),
.assistant-text :deep(h4),
.assistant-text :deep(h5),
.assistant-text :deep(h6) {
  margin: 18px 0 10px 0;
  font-weight: 600;
  background: linear-gradient(135deg, #570404, #8b572a);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.assistant-text :deep(p) {
  margin: 10px 0;
}

.assistant-text :deep(ul),
.assistant-text :deep(ol) {
  margin: 10px 0;
  padding-left: 22px;
}

.assistant-text :deep(li) {
  margin: 6px 0;
}

.assistant-text :deep(code) {
  background: linear-gradient(135deg, rgba(87, 4, 4, 0.1), rgba(139, 87, 42, 0.1));
  padding: 4px 8px;
  border-radius: 6px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 0.9em;
  border: 1px solid rgba(87, 4, 4, 0.2);
}

.assistant-text :deep(pre) {
  background: linear-gradient(135deg, #f6f8fa, #ffffff);
  border: 2px solid rgba(87, 4, 4, 0.15);
  border-radius: 12px;
  padding: 20px;
  margin: 15px 0;
  overflow-x: auto;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 0.9em;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.assistant-text :deep(pre code) {
  background: none;
  padding: 0;
  border-radius: 0;
  border: none;
}

.assistant-text :deep(blockquote) {
  border-left: 4px solid;
  border-image: linear-gradient(135deg, #570404, #8b572a) 1;
  margin: 15px 0;
  padding: 12px 20px;
  background: linear-gradient(135deg, rgba(87, 4, 4, 0.05), rgba(139, 87, 42, 0.05));
  color: #666;
  border-radius: 0 8px 8px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.assistant-text :deep(strong) {
  font-weight: 600;
  background: linear-gradient(135deg, #570404, #8b572a);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.streaming-cursor {
  animation: blink 1.2s ease-in-out infinite;
  color: #570404;
  font-weight: bold;
  margin-left: 3px;
  text-shadow: 0 0 5px rgba(87, 4, 4, 0.3);
}

@keyframes blink {
  0%,
  50% {
    opacity: 1;
  }
  51%,
  100% {
    opacity: 0;
  }
}

.context {
  margin-top: 12px;
  font-size: 0.9em;
}

.context details {
  background: linear-gradient(135deg, rgba(87, 4, 4, 0.03), rgba(139, 87, 42, 0.03));
  border: 1px solid rgba(87, 4, 4, 0.1);
  border-radius: 8px;
  padding: 8px;
}

.context summary {
  cursor: pointer;
  font-weight: 500;
  color: #570404;
  padding: 4px 0;
  transition: color 0.3s ease;
}

.context summary:hover {
  color: #8b572a;
}

.context-item {
  margin-top: 10px;
  padding: 12px;
  background: linear-gradient(135deg, rgba(87, 4, 4, 0.05), rgba(139, 87, 42, 0.05));
  border-radius: 8px;
  border-left: 3px solid;
  border-image: linear-gradient(135deg, #570404, #8b572a) 1;
}

.context-metadata {
  font-size: 0.8em;
  color: #666;
  margin-top: 6px;
  font-style: italic;
}

.timestamp {
  font-size: 0.8em;
  color: #999;
  margin-top: 6px;
  text-align: center;
  opacity: 0.7;
}

/* 输入区域优化 */
.input-area {
  padding: 25px;
  background: linear-gradient(135deg, #ffffff, #f8f9ff);
  border-top: 2px solid rgba(87, 4, 4, 0.1);
  position: relative;
  z-index: 1;
}

.input-group {
  display: flex;
  gap: 15px;
  align-items: stretch;
}

.question-input {
  flex: 1;
  padding: 15px 20px;
  border: 2px solid transparent;
  background:
    linear-gradient(white, white) padding-box,
    linear-gradient(135deg, #570404, #8b572a) border-box;
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.question-input:focus {
  outline: none;
  background:
    linear-gradient(white, white) padding-box,
    linear-gradient(135deg, #8b572a, #cd853f) border-box;
  box-shadow: 0 6px 20px rgba(87, 4, 4, 0.2);
  transform: translateY(-1px);
}

.send-button {
  padding: 15px 30px;
  background: linear-gradient(135deg, #570404, #8b572a);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(87, 4, 4, 0.3);
  position: relative;
  overflow: hidden;
}

.send-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.send-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #8b572a, #cd853f);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(87, 4, 4, 0.4);
}

.send-button:hover:not(:disabled)::before {
  left: 100%;
}

.send-button:disabled {
  background: linear-gradient(135deg, #999, #bbb);
  cursor: not-allowed;
  transform: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 文档管理区域优化 */
.document-management {
  margin-top: 30px;
  padding: 30px;
  background: rgba(255, 255, 255, 0.98);
  border-radius: 20px;
  position: relative;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.document-management::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #570404, #8b572a, #cd853f, #daa520, #8b572a, #570404);
  background-size: 400% 400%;
  animation: gradientShift 10s ease infinite;
  border-radius: 20px;
  z-index: -1;
  padding: 2px;
}

.document-management::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  right: 2px;
  bottom: 2px;
  background: rgba(255, 255, 255, 0.98);
  border-radius: 18px;
  z-index: 0;
}

.document-management > * {
  position: relative;
  z-index: 1;
}

.document-management h3 {
  margin: 0 0 25px 0;
  background: linear-gradient(135deg, #570404, #8b572a);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 1.3rem;
  font-weight: 600;
  text-align: center;
}

.upload-section {
  display: flex;
  gap: 25px;
  margin-bottom: 25px;
}

.text-input-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.text-input {
  width: 100%;
  padding: 15px 20px;
  border: 2px solid transparent;
  background:
    linear-gradient(white, white) padding-box,
    linear-gradient(135deg, #570404, #8b572a) border-box;
  border-radius: 12px;
  resize: vertical;
  min-height: 120px;
  font-family: inherit;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.text-input:focus {
  outline: none;
  background:
    linear-gradient(white, white) padding-box,
    linear-gradient(135deg, #8b572a, #cd853f) border-box;
  box-shadow: 0 6px 20px rgba(87, 4, 4, 0.15);
}

.upload-button,
.add-text-button,
.refresh-button,
.clear-button {
  padding: 15px 25px;
  background: linear-gradient(135deg, #570404, #8b572a);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  box-shadow: 0 4px 15px rgba(87, 4, 4, 0.2);
  position: relative;
  overflow: hidden;
}

.upload-button::before,
.add-text-button::before,
.refresh-button::before,
.clear-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.upload-button:hover,
.add-text-button:hover,
.refresh-button:hover {
  background: linear-gradient(135deg, #8b572a, #cd853f);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(87, 4, 4, 0.3);
}

.upload-button:hover::before,
.add-text-button:hover::before,
.refresh-button:hover::before,
.clear-button:hover::before {
  left: 100%;
}

.management-buttons {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.clear-button {
  background: linear-gradient(135deg, #dc3545, #c82333);
}

.clear-button:hover {
  background: linear-gradient(135deg, #c82333, #a71e2a);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(220, 53, 69, 0.3);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .rag-chat {
    padding: 15px;
  }

  .upload-section {
    flex-direction: column;
    gap: 15px;
  }

  .management-buttons {
    flex-direction: column;
    align-items: stretch;
  }

  .input-group {
    flex-direction: column;
    gap: 10px;
  }

  .message-content {
    max-width: 95%;
  }
}

/* 加载动画 */
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.loading {
  animation: pulse 1.5s ease-in-out infinite;
}
</style>
