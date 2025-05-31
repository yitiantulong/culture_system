<template>
  <div class="chat-container">
    <!-- 头部文化元素装饰 -->
    <header class="header">
      <h2>🏛️ 文化对话系统</h2>
      <p>与非小遗一起探索非物质文化遗产的魅力</p>
    </header>

    <!-- API Key 配置提示 -->
    <div v-if="showApiKeyWarning" class="api-key-warning">
      <div class="warning-content">
        <h3>⚠️ API配置提醒</h3>
        <p>请在项目根目录创建 <code>.env</code> 文件并配置您的DeepSeek API Key：</p>
        <pre>VITE_DEEPSEEK_API_KEY=your_api_key_here</pre>
        <div class="warning-buttons">
          <button @click="testApiKey" class="test-api-button" :disabled="testingApi">
            {{ testingApi ? '测试中...' : '测试API Key' }}
          </button>
          <button @click="showApiKeyWarning = false" class="close-warning">我知道了</button>
        </div>
      </div>
    </div>

    <!-- 聊天历史区域 -->
    <div class="chat-history" ref="chatHistory">
      <!-- 消息卡片 -->
      <div v-for="(msg, index) in messages" :key="index" :class="['message-card', msg.type]">
        <div class="message-icon">
          <div v-if="msg.type === 'assistant'" class="bot-avatar">
            <img src="@/assets/iconchat.png" alt="Bot" />
          </div>
          <div v-else-if="msg.type === 'error'" class="error-avatar">
            <img src="@/assets/iconchat.png" alt="Error" />
          </div>
          <div v-else class="user-avatar">👤</div>
        </div>
        <div class="message-content">
          <div
            class="content-text"
            v-if="msg.type === 'assistant'"
            v-html="renderMarkdown(msg.content)"
          ></div>
          <div class="content-text" v-else>{{ msg.content }}</div>
          <!-- 流式输出时显示打字光标 -->
          <span v-if="streamingMessageIndex === index && loading" class="typing-cursor">|</span>
          <div class="message-time">{{ msg.timestamp }}</div>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-indicator">
        <div class="spinner"></div>
        <span class="loading-text">
          {{ streamingMessageIndex >= 0 ? '非小遗正在思考中...' : '文化瑰宝解码中...' }}
        </span>
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
          :disabled="loading"
          rows="2"
        ></textarea>
        <button
          @click="submitQuestion"
          :class="{ 'cultural-button': true, loading: loading }"
          :disabled="loading || !inputQuestion.trim()"
        >
          <span>{{ loading ? '传承思考中...' : '发送提问' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, watch } from 'vue'
import { marked } from 'marked'
import { ChatDeepSeek } from '@langchain/deepseek'
import { ChatPromptTemplate } from '@langchain/core/prompts'

interface Message {
  type: 'user' | 'assistant' | 'error'
  content: string
  timestamp: string
}

const inputQuestion = ref('')
const messages = ref<Message[]>([])
const loading = ref(false)
const chatHistory = ref<HTMLElement>()
const showApiKeyWarning = ref(false)
const testingApi = ref(false)
const streamingMessageIndex = ref(-1) // 用于跟踪正在流式输出的消息索引

// 检查API Key配置
const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY
const isApiKeyConfigured = apiKey && apiKey.trim().length > 0

// 创建 DeepSeek 实例 (仅在有API Key时)
let llm: ChatDeepSeek | null = null
if (isApiKeyConfigured) {
  llm = new ChatDeepSeek({
    apiKey: apiKey,
    model: 'deepseek-chat', // 使用官方推荐的模型名称
    temperature: 0.7,
    maxRetries: 3,
    timeout: 180000, // 3分钟超时
  })
}

// 创建提示模板
const promptTemplate = ChatPromptTemplate.fromTemplate(`
你是一位专业的中华非物质文化遗产专家和文化传承顾问。请用专业而通俗易懂的语言回答用户关于非遗文化的问题。

回答要求：
1. 突出非遗项目的文化价值和历史意义
2. 如适当，可以提及保护现状、传承方式或相关政策
3. 语言要生动有趣，帮助用户理解文化内涵
4. 如果不确定某个信息，请诚实说明

用户提问: {question}

请提供详细、准确且富有文化内涵的回答：`)

// 自动滚动到底部
const scrollToBottom = (smooth = false) => {
  nextTick(() => {
    if (chatHistory.value) {
      if (smooth) {
        chatHistory.value.scrollTo({
          top: chatHistory.value.scrollHeight,
          behavior: 'smooth',
        })
      } else {
        chatHistory.value.scrollTop = chatHistory.value.scrollHeight
      }
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
    second: '2-digit',
  })
}

// 提交问题函数
const submitQuestion = async () => {
  if (!inputQuestion.value.trim() || loading.value) return

  const question = inputQuestion.value.trim()

  // 检查API Key配置
  if (!isApiKeyConfigured) {
    messages.value.push({
      type: 'error',
      content:
        '⚠️ DeepSeek API Key 未配置。请在项目根目录创建 .env 文件并添加：VITE_DEEPSEEK_API_KEY=your_api_key_here',
      timestamp: getTimestamp(),
    })
    return
  }

  if (!llm) {
    messages.value.push({
      type: 'error',
      content: '⚠️ AI服务初始化失败，请检查API Key配置。',
      timestamp: getTimestamp(),
    })
    return
  }

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

    // 添加一个空的助手消息，用于流式填充
    const assistantMessageIndex = messages.value.length
    messages.value.push({
      type: 'assistant',
      content: '',
      timestamp: getTimestamp(),
    })

    // 设置流式输出状态
    streamingMessageIndex.value = assistantMessageIndex

    // 使用提示模板格式化问题
    const formattedPrompt = await promptTemplate.formatMessages({
      question: question,
    })

    // 使用流式调用 DeepSeek API
    const stream = await llm.stream(formattedPrompt)

    let accumulatedContent = ''

    for await (const chunk of stream) {
      if (chunk.content) {
        accumulatedContent += chunk.content
        // 实时更新消息内容
        messages.value[assistantMessageIndex].content = accumulatedContent
        scrollToBottom(true)
      }
    }
  } catch (error: unknown) {
    console.error('DeepSeek API 错误:', error)

    let errorMessage = '抱歉，文化传承通道暂时受阻。'

    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        errorMessage += '请求超时，可能是AI正在深度思考，请稍后重试。'
      } else if (error.message.includes('401')) {
        errorMessage += 'API Key 无效，请检查 .env 文件中的 VITE_DEEPSEEK_API_KEY 配置。'
      } else if (error.message.includes('429')) {
        errorMessage += 'API 调用频率过高，请稍后重试。'
      } else {
        errorMessage += `错误详情: ${error.message}`
      }
    }

    messages.value.push({
      type: 'error',
      content: errorMessage,
      timestamp: getTimestamp(),
    })
  } finally {
    loading.value = false
    streamingMessageIndex.value = -1 // 清除流式输出状态
    scrollToBottom()
  }
}

// 添加 Markdown 渲染函数
const renderMarkdown = (text: string): string => {
  try {
    return marked(text, {
      breaks: true, // 启用换行支持
      gfm: true, // 启用 GitHub 风格的 Markdown
    })
  } catch (error) {
    console.error('Markdown 渲染错误:', error)
    return text
  }
}

// 测试API Key
const testApiKey = async () => {
  if (!isApiKeyConfigured) {
    messages.value.push({
      type: 'error',
      content: '⚠️ DeepSeek API Key 未配置，无法进行测试。请先配置API Key。',
      timestamp: getTimestamp(),
    })
    return
  }

  if (!llm) {
    messages.value.push({
      type: 'error',
      content: '⚠️ AI服务初始化失败，无法进行测试。请检查API Key配置。',
      timestamp: getTimestamp(),
    })
    return
  }

  try {
    testingApi.value = true
    scrollToBottom()

    // 添加测试消息
    messages.value.push({
      type: 'user',
      content: '测试API Key是否有效',
      timestamp: getTimestamp(),
    })

    // 添加一个空的助手消息，用于流式填充
    const assistantMessageIndex = messages.value.length
    messages.value.push({
      type: 'assistant',
      content: '',
      timestamp: getTimestamp(),
    })

    // 设置流式输出状态
    streamingMessageIndex.value = assistantMessageIndex

    // 使用提示模板格式化问题
    const formattedPrompt = await promptTemplate.formatMessages({
      question: '请简单介绍一下中国的非物质文化遗产，用一句话回答即可',
    })

    // 使用流式调用 DeepSeek API
    const stream = await llm.stream(formattedPrompt)

    let accumulatedContent = ''

    for await (const chunk of stream) {
      if (chunk.content) {
        accumulatedContent += chunk.content
        // 实时更新消息内容
        messages.value[assistantMessageIndex].content = accumulatedContent
        scrollToBottom(true)
      }
    }
  } catch (error: unknown) {
    console.error('DeepSeek API 测试错误:', error)

    let errorMessage = '❌ API Key测试失败！'

    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        errorMessage += ' 请求超时，可能是网络问题，请稍后重试。'
      } else if (error.message.includes('401')) {
        errorMessage += ' API Key 无效，请检查 .env 文件中的 VITE_DEEPSEEK_API_KEY 配置。'
      } else if (error.message.includes('429')) {
        errorMessage += ' API 调用频率过高，请稍后重试。'
      } else {
        errorMessage += ` 错误详情: ${error.message}`
      }
    }

    messages.value.push({
      type: 'error',
      content: errorMessage,
      timestamp: getTimestamp(),
    })
  } finally {
    testingApi.value = false
    streamingMessageIndex.value = -1 // 清除流式输出状态
    scrollToBottom()
  }
}

// 初始化
onMounted(() => {
  // 检查API Key配置
  if (!isApiKeyConfigured) {
    showApiKeyWarning.value = true
  }

  // 添加欢迎消息
  messages.value.push({
    type: 'assistant',
    content: `🏮 欢迎来到非遗文化对话系统！我是非小遗，一个非物质文化遗产的守护者，让我带您遨游非物质文化遗产的宝库吧。

我可以帮您了解：
• 🎭 传统戏曲：昆曲、京剧、豫剧等
• ✂️ 手工艺术：剪纸、刺绣、陶瓷等
• 🎵 民间音乐：古琴、二胡、民歌等
• 🎊 节庆习俗：春节、端午、中秋等
• 🥘 传统美食：各地特色小吃等

${isApiKeyConfigured ? '您可以问我任何关于非物质文化遗产的问题，我会尽力为您解答。' : '⚠️ 请先配置DeepSeek API Key才能开始对话。'}`,
    timestamp: getTimestamp(),
  })

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
  background: transparent;
  border-radius: 12px;
  color: #f3f1ef;
}

.header h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  color: #f3f1ef;
  font-family: '楷体', 'KaiTi', 'STKaiti', serif;
}

.header p {
  margin: 0;
  opacity: 0.8;
  font-size: 0.9rem;
}

/* API Key 配置提示样式 */
.api-key-warning {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.warning-content {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  max-width: 500px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.warning-content h3 {
  margin: 0 0 1rem 0;
  color: #ff6b35;
}

.warning-content p {
  margin: 0.5rem 0;
  color: #333;
}

.warning-content code {
  background: #f5f5f5;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-family: monospace;
}

.warning-content pre {
  background: #f5f5f5;
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
  text-align: left;
  font-family: monospace;
  color: #333;
  overflow-x: auto;
}

.warning-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.test-api-button {
  background: #8b572a;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.test-api-button:hover:not(:disabled) {
  background: #6b4220;
  transform: translateY(-2px);
}

.test-api-button:disabled {
  background: #999;
  cursor: not-allowed;
  transform: none;
}

.close-warning {
  background: #8b572a;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  margin-top: 1rem;
  transition: background 0.3s ease;
}

.close-warning:hover {
  background: #6b4220;
}

.chat-history {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  background: transparent;
  border-radius: 12px;
  margin-bottom: 1rem;
  scroll-behavior: smooth;
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
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
}

.bot-avatar,
.error-avatar {
  background: white;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.bot-avatar img,
.error-avatar img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 4px;
}

.user-avatar {
  background: #2c5aa0;
  color: white;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
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

/* 打字光标动画 */
.typing-cursor {
  display: inline-block;
  color: #8b572a;
  font-weight: bold;
  font-size: 16px;
  animation: blink 1s infinite;
  margin-left: 2px;
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
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
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

/* 添加 Markdown 样式 */
.content-text :deep(p) {
  margin: 0.5em 0;
}

.content-text :deep(ul),
.content-text :deep(ol) {
  margin: 0.5em 0;
  padding-left: 1.5em;
}

.content-text :deep(li) {
  margin: 0.3em 0;
}

.content-text :deep(code) {
  background: rgba(0, 0, 0, 0.1);
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: monospace;
}

.content-text :deep(pre) {
  background: rgba(0, 0, 0, 0.1);
  padding: 1em;
  border-radius: 5px;
  overflow-x: auto;
}

.content-text :deep(blockquote) {
  margin: 0.5em 0;
  padding-left: 1em;
  border-left: 3px solid #8b572a;
  color: #666;
}

.content-text :deep(a) {
  color: #2c5aa0;
  text-decoration: none;
}

.content-text :deep(a:hover) {
  text-decoration: underline;
}

.message-card.user .content-text :deep(a) {
  color: #90caf9;
}

.message-card.error .content-text :deep(a) {
  color: #ef9a9a;
}
</style>
