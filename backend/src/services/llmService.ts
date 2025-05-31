import { ChatDeepSeek } from '@langchain/deepseek'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { Document } from '@langchain/core/documents'
import { config } from '../config/config.js'

export class LLMService {
  private llm: ChatDeepSeek | null = null
  private promptTemplate: ChatPromptTemplate

  constructor() {
    // 检查API Key是否存在
    if (!config.deepseek.apiKey || config.deepseek.apiKey === 'your_deepseek_api_key_here') {
      console.warn('⚠️  DeepSeek API Key 未设置。请在 backend/.env 文件中设置 DEEPSEEK_API_KEY')
    } else {
      try {
        this.llm = new ChatDeepSeek({
          model: config.deepseek.model,
          temperature: config.deepseek.temperature,
          apiKey: config.deepseek.apiKey,
          timeout: 180000, // 增加到180秒（3分钟）超时
          maxRetries: 3, // 增加重试次数到3次
        })
      } catch (error) {
        console.error('DeepSeek LLM 初始化失败:', error)
      }
    }

    // 创建RAG提示模板
    this.promptTemplate = ChatPromptTemplate.fromTemplate(`
你是一位专业的中华非物质文化遗产专家和文化传承顾问。请基于提供的上下文信息，用专业而通俗易懂的语言回答用户关于非遗文化的问题，如果没有上下文请根据你的知识回答。

回答要求：
1. 准确引用上下文中的具体信息
2. 突出非遗项目的文化价值和历史意义
3. 如适当，可以提及保护现状、传承方式或相关政策
4. 语言要生动有趣，帮助用户理解文化内涵
5. 如果上下文信息不足，请诚实说明，但可以提供相关的背景知识

上下文资料:
{context}

用户提问: {question}

请提供详细、准确且富有文化内涵的回答：`)
  }

  async generateAnswer(question: string, context: Document[]): Promise<string> {
    if (!this.llm) {
      return '抱歉，DeepSeek API Key 未设置。请配置 DEEPSEEK_API_KEY 环境变量后重启服务。\n\n配置步骤：\n1. 在 backend 目录创建 .env 文件\n2. 添加：DEEPSEEK_API_KEY=你的API密钥\n3. 重启服务'
    }

    try {
      // 将文档内容合并为上下文字符串
      const contextContent = context.map((doc) => doc.pageContent).join('\n\n')

      // 格式化提示
      const messages = await this.promptTemplate.formatMessages({
        question: question,
        context: contextContent,
      })

      // 调用LLM生成回答，增加超时控制
      const response = (await Promise.race([
        this.llm.invoke(messages),
        new Promise(
          (_, reject) => setTimeout(() => reject(new Error('LLM响应超时')), 180000), // 增加到180秒（3分钟）超时
        ),
      ])) as any

      return typeof response.content === 'string'
        ? response.content
        : JSON.stringify(response.content)
    } catch (error) {
      console.error('LLM生成回答失败:', error)

      // 如果是超时错误，返回基于上下文的简单回答
      if (error instanceof Error && error.message.includes('超时')) {
        const contextContent = context.map((doc) => doc.pageContent.substring(0, 200)).join('\n\n')
        return `基于文档内容，我找到了以下相关信息：\n\n${contextContent}\n\n（注：由于网络问题，无法生成完整的AI回答，以上是相关的文档片段）`
      }

      throw new Error('生成回答时发生错误')
    }
  }

  async testConnection(): Promise<boolean> {
    if (!this.llm) {
      console.log('🔧 LLM未初始化，跳过连接测试')
      return false
    }

    console.log('🔍 开始测试DeepSeek连接...')
    console.log(
      '📋 使用的API Key:',
      config.deepseek.apiKey ? `${config.deepseek.apiKey.substring(0, 8)}...` : '未设置',
    )
    console.log('🔧 使用的模型:', config.deepseek.model)

    try {
      // 使用更简单的测试消息和更短的超时
      const testMessage = (await Promise.race([
        this.llm.invoke([
          ['system', '请简单回复：连接正常'],
          ['human', '测试连接'],
        ]),
        new Promise(
          (_, reject) => setTimeout(() => reject(new Error('测试超时')), 180000), // 增加到180秒（3分钟）超时
        ),
      ])) as any

      console.log('✅ DeepSeek连接测试成功')
      return true
    } catch (error: any) {
      console.error('❌ DeepSeek连接测试失败详情:', {
        message: error.message,
        code: error.code,
        status: error.status,
        response: error.response?.data,
      })

      // 针对不同错误给出具体建议
      if (error.message.includes('超时')) {
        console.log('💡 建议: 网络连接可能较慢，或DeepSeek服务响应异常')
      } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        console.log('💡 建议: API Key可能无效，请检查DEEPSEEK_API_KEY')
      } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
        console.log('💡 建议: 账户可能余额不足或权限不够')
      } else if (error.message.includes('429')) {
        console.log('💡 建议: API调用频率过高，请稍后重试')
      }

      return false
    }
  }

  // 添加网络连接诊断方法
  async diagnoseConnection(): Promise<void> {
    console.log('🔧 开始网络连接诊断...')

    // 测试API连接
    if (this.llm) {
      console.log('🔍 测试简单API调用...')
      try {
        const simpleTest = await Promise.race([
          this.llm.invoke([['human', 'hi']]),
          new Promise(
            (_, reject) => setTimeout(() => reject(new Error('简单测试超时')), 180000), // 增加到180秒（3分钟）超时
          ),
        ])
        console.log('✅ 简单API调用成功')
      } catch (error) {
        console.log('❌ 简单API调用失败:', error)
        console.log('💡 建议检查: ')
        console.log('  1. 网络连接是否稳定')
        console.log('  2. 是否需要代理访问')
        console.log('  3. API密钥是否有效')
        console.log('  4. 账户余额是否充足')
      }
    }
  }
}
