import { ref, nextTick, onMounted, watch } from 'vue';
import { marked } from 'marked';
import { ChatDeepSeek } from '@langchain/deepseek';
import { ChatPromptTemplate } from '@langchain/core/prompts';
const inputQuestion = ref('');
const messages = ref([]);
const loading = ref(false);
const chatHistory = ref();
const showApiKeyWarning = ref(false);
// 检查API Key配置
const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
const isApiKeyConfigured = apiKey && apiKey.trim().length > 0;
// 创建 DeepSeek 实例 (仅在有API Key时)
let llm = null;
if (isApiKeyConfigured) {
    llm = new ChatDeepSeek({
        apiKey: apiKey,
        temperature: 0.7,
        maxRetries: 3,
        timeout: 180000, // 3分钟超时
    });
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

请提供详细、准确且富有文化内涵的回答：`);
// 自动滚动到底部
const scrollToBottom = () => {
    nextTick(() => {
        if (chatHistory.value) {
            chatHistory.value.scrollTop = chatHistory.value.scrollHeight;
        }
    });
};
// 监听消息数组变化
watch(messages, () => {
    nextTick(() => {
        scrollToBottom();
    });
}, { deep: true });
// 获取当前时间
const getTimestamp = () => {
    const now = new Date();
    return now.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
};
// 提交问题函数
const submitQuestion = async () => {
    if (!inputQuestion.value.trim() || loading.value)
        return;
    const question = inputQuestion.value.trim();
    // 检查API Key配置
    if (!isApiKeyConfigured) {
        messages.value.push({
            type: 'error',
            content: '⚠️ DeepSeek API Key 未配置。请在项目根目录创建 .env 文件并添加：VITE_DEEPSEEK_API_KEY=your_api_key_here',
            timestamp: getTimestamp(),
        });
        return;
    }
    if (!llm) {
        messages.value.push({
            type: 'error',
            content: '⚠️ AI服务初始化失败，请检查API Key配置。',
            timestamp: getTimestamp(),
        });
        return;
    }
    try {
        // 添加用户消息
        messages.value.push({
            type: 'user',
            content: question,
            timestamp: getTimestamp(),
        });
        loading.value = true;
        inputQuestion.value = '';
        scrollToBottom();
        // 使用提示模板格式化问题
        const formattedPrompt = await promptTemplate.formatMessages({
            question: question,
        });
        // 调用 DeepSeek API
        const response = await llm.invoke(formattedPrompt);
        // 添加助手响应
        messages.value.push({
            type: 'assistant',
            content: response.content.toString(),
            timestamp: getTimestamp(),
        });
    }
    catch (error) {
        console.error('DeepSeek API 错误:', error);
        let errorMessage = '抱歉，文化传承通道暂时受阻。';
        if (error instanceof Error) {
            if (error.message.includes('timeout')) {
                errorMessage += '请求超时，可能是AI正在深度思考，请稍后重试。';
            }
            else if (error.message.includes('401')) {
                errorMessage += 'API Key 无效，请检查 .env 文件中的 VITE_DEEPSEEK_API_KEY 配置。';
            }
            else if (error.message.includes('429')) {
                errorMessage += 'API 调用频率过高，请稍后重试。';
            }
            else {
                errorMessage += `错误详情: ${error.message}`;
            }
        }
        messages.value.push({
            type: 'error',
            content: errorMessage,
            timestamp: getTimestamp(),
        });
    }
    finally {
        loading.value = false;
        scrollToBottom();
    }
};
// 添加 Markdown 渲染函数
const renderMarkdown = (text) => {
    try {
        return marked(text, {
            breaks: true, // 启用换行支持
            gfm: true, // 启用 GitHub 风格的 Markdown
        });
    }
    catch (error) {
        console.error('Markdown 渲染错误:', error);
        return text;
    }
};
// 初始化
onMounted(() => {
    // 检查API Key配置
    if (!isApiKeyConfigured) {
        showApiKeyWarning.value = true;
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
    });
    scrollToBottom();
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['header']} */ ;
/** @type {__VLS_StyleScopedClasses['header']} */ ;
/** @type {__VLS_StyleScopedClasses['warning-content']} */ ;
/** @type {__VLS_StyleScopedClasses['warning-content']} */ ;
/** @type {__VLS_StyleScopedClasses['warning-content']} */ ;
/** @type {__VLS_StyleScopedClasses['warning-content']} */ ;
/** @type {__VLS_StyleScopedClasses['close-warning']} */ ;
/** @type {__VLS_StyleScopedClasses['message-card']} */ ;
/** @type {__VLS_StyleScopedClasses['message-card']} */ ;
/** @type {__VLS_StyleScopedClasses['message-card']} */ ;
/** @type {__VLS_StyleScopedClasses['bot-avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['error-avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['message-card']} */ ;
/** @type {__VLS_StyleScopedClasses['assistant']} */ ;
/** @type {__VLS_StyleScopedClasses['message-content']} */ ;
/** @type {__VLS_StyleScopedClasses['message-card']} */ ;
/** @type {__VLS_StyleScopedClasses['user']} */ ;
/** @type {__VLS_StyleScopedClasses['message-content']} */ ;
/** @type {__VLS_StyleScopedClasses['message-card']} */ ;
/** @type {__VLS_StyleScopedClasses['error']} */ ;
/** @type {__VLS_StyleScopedClasses['message-content']} */ ;
/** @type {__VLS_StyleScopedClasses['message-card']} */ ;
/** @type {__VLS_StyleScopedClasses['user']} */ ;
/** @type {__VLS_StyleScopedClasses['content-text']} */ ;
/** @type {__VLS_StyleScopedClasses['message-card']} */ ;
/** @type {__VLS_StyleScopedClasses['error']} */ ;
/** @type {__VLS_StyleScopedClasses['content-text']} */ ;
/** @type {__VLS_StyleScopedClasses['cultural-button']} */ ;
/** @type {__VLS_StyleScopedClasses['cultural-button']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-history']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-history']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-history']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-history']} */ ;
/** @type {__VLS_StyleScopedClasses['content-text']} */ ;
/** @type {__VLS_StyleScopedClasses['content-text']} */ ;
/** @type {__VLS_StyleScopedClasses['content-text']} */ ;
/** @type {__VLS_StyleScopedClasses['content-text']} */ ;
/** @type {__VLS_StyleScopedClasses['content-text']} */ ;
/** @type {__VLS_StyleScopedClasses['content-text']} */ ;
/** @type {__VLS_StyleScopedClasses['content-text']} */ ;
/** @type {__VLS_StyleScopedClasses['content-text']} */ ;
/** @type {__VLS_StyleScopedClasses['content-text']} */ ;
/** @type {__VLS_StyleScopedClasses['message-card']} */ ;
/** @type {__VLS_StyleScopedClasses['user']} */ ;
/** @type {__VLS_StyleScopedClasses['content-text']} */ ;
/** @type {__VLS_StyleScopedClasses['message-card']} */ ;
/** @type {__VLS_StyleScopedClasses['error']} */ ;
/** @type {__VLS_StyleScopedClasses['content-text']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "chat-container" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.header, __VLS_intrinsicElements.header)({
    ...{ class: "header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
if (__VLS_ctx.showApiKeyWarning) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "api-key-warning" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "warning-content" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.code, __VLS_intrinsicElements.code)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.pre, __VLS_intrinsicElements.pre)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showApiKeyWarning))
                    return;
                __VLS_ctx.showApiKeyWarning = false;
            } },
        ...{ class: "close-warning" },
    });
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "chat-history" },
    ref: "chatHistory",
});
/** @type {typeof __VLS_ctx.chatHistory} */ ;
for (const [msg, index] of __VLS_getVForSourceType((__VLS_ctx.messages))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (index),
        ...{ class: (['message-card', msg.type]) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "message-icon" },
    });
    if (msg.type === 'assistant') {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "bot-avatar" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
            src: "@/assets/iconchat.png",
            alt: "Bot",
        });
    }
    else if (msg.type === 'error') {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "error-avatar" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
            src: "@/assets/iconchat.png",
            alt: "Error",
        });
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "user-avatar" },
        });
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "message-content" },
    });
    if (msg.type === 'assistant') {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "content-text" },
        });
        __VLS_asFunctionalDirective(__VLS_directives.vHtml)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.renderMarkdown(msg.content)) }, null, null);
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "content-text" },
        });
        (msg.content);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "message-time" },
    });
    (msg.timestamp);
}
if (__VLS_ctx.loading) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "loading-indicator" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "spinner" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "loading-text" },
    });
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "input-area" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "input-wrapper" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.textarea, __VLS_intrinsicElements.textarea)({
    ...{ onKeyup: (__VLS_ctx.submitQuestion) },
    ...{ onKeydown: () => { } },
    value: (__VLS_ctx.inputQuestion),
    placeholder: "请输入关于非物质文化遗产的问题，例如：昆曲的四大经典剧目是什么？",
    disabled: (__VLS_ctx.loading),
    rows: "2",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.submitQuestion) },
    ...{ class: ({ 'cultural-button': true, loading: __VLS_ctx.loading }) },
    disabled: (__VLS_ctx.loading || !__VLS_ctx.inputQuestion.trim()),
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
(__VLS_ctx.loading ? '传承思考中...' : '发送提问');
/** @type {__VLS_StyleScopedClasses['chat-container']} */ ;
/** @type {__VLS_StyleScopedClasses['header']} */ ;
/** @type {__VLS_StyleScopedClasses['api-key-warning']} */ ;
/** @type {__VLS_StyleScopedClasses['warning-content']} */ ;
/** @type {__VLS_StyleScopedClasses['close-warning']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-history']} */ ;
/** @type {__VLS_StyleScopedClasses['message-card']} */ ;
/** @type {__VLS_StyleScopedClasses['message-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['bot-avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['error-avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['user-avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['message-content']} */ ;
/** @type {__VLS_StyleScopedClasses['content-text']} */ ;
/** @type {__VLS_StyleScopedClasses['content-text']} */ ;
/** @type {__VLS_StyleScopedClasses['message-time']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['spinner']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-text']} */ ;
/** @type {__VLS_StyleScopedClasses['input-area']} */ ;
/** @type {__VLS_StyleScopedClasses['input-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['loading']} */ ;
/** @type {__VLS_StyleScopedClasses['cultural-button']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            inputQuestion: inputQuestion,
            messages: messages,
            loading: loading,
            chatHistory: chatHistory,
            showApiKeyWarning: showApiKeyWarning,
            submitQuestion: submitQuestion,
            renderMarkdown: renderMarkdown,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
