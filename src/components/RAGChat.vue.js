import { ref, reactive, onMounted, nextTick } from 'vue';
import ragApiMethods from '../api/ragApi';
const messages = ref([]);
const currentQuestion = ref('');
const textToAdd = ref('');
const isLoading = ref(false);
const messagesContainer = ref();
const stats = reactive({
    documentCount: 0,
    isInitialized: false,
});
// 发送问题
const sendQuestion = async () => {
    if (!currentQuestion.value.trim() || isLoading.value)
        return;
    const question = currentQuestion.value.trim();
    currentQuestion.value = '';
    // 添加用户消息
    messages.value.push({
        type: 'user',
        text: question,
        timestamp: new Date(),
    });
    isLoading.value = true;
    try {
        const response = await ragApiMethods.query(question);
        // 添加助手回复
        messages.value.push({
            type: 'assistant',
            text: response.data.answer,
            timestamp: new Date(),
            context: response.data.context,
        });
    }
    catch (error) {
        console.error('查询失败:', error);
        messages.value.push({
            type: 'assistant',
            text: '抱歉，查询时发生错误，请稍后重试。',
            timestamp: new Date(),
        });
    }
    finally {
        isLoading.value = false;
        await nextTick();
        scrollToBottom();
    }
};
// 处理文件上传
const handleFileUpload = async (event) => {
    const target = event.target;
    const file = target.files?.[0];
    if (!file)
        return;
    try {
        const response = await ragApiMethods.uploadDocument(file);
        alert(`文档上传成功！添加了 ${response.data.documentCount} 个文档块`);
        await refreshStats();
    }
    catch (error) {
        console.error('文件上传失败:', error);
        alert('文件上传失败，请检查文件格式和网络连接');
    }
    // 清空文件输入
    target.value = '';
};
// 添加文本文档
const addTextDocument = async () => {
    if (!textToAdd.value.trim())
        return;
    try {
        const response = await ragApiMethods.addTextDocument(textToAdd.value, {
            title: '用户输入文档',
            timestamp: new Date().toISOString(),
        });
        alert(`文本添加成功！添加了 ${response.data.documentCount} 个文档块`);
        textToAdd.value = '';
        await refreshStats();
    }
    catch (error) {
        console.error('文本添加失败:', error);
        alert('文本添加失败，请稍后重试');
    }
};
// 刷新统计信息
const refreshStats = async () => {
    try {
        const statsResponse = await ragApiMethods.getStats();
        stats.documentCount = statsResponse.data.documentCount;
        stats.isInitialized = statsResponse.data.isInitialized;
    }
    catch (error) {
        console.error('获取状态失败:', error);
    }
};
// 清空所有文档
const clearAllDocuments = async () => {
    if (!confirm('确定要清空所有文档吗？此操作不可恢复。'))
        return;
    try {
        await ragApiMethods.clearDocuments();
        alert('文档已清空');
        await refreshStats();
    }
    catch (error) {
        console.error('清空文档失败:', error);
        alert('清空文档失败，请稍后重试');
    }
};
// 滚动到底部
const scrollToBottom = () => {
    if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
};
// 格式化时间
const formatTime = (date) => {
    return date.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
    });
};
// 组件挂载时初始化
onMounted(async () => {
    await refreshStats();
    // 添加欢迎消息
    messages.value.push({
        type: 'assistant',
        text: '您好！我是非遗万象智能问答助手。您可以向我提问关于已加载文档的任何问题，我会基于知识库为您提供准确的回答。',
        timestamp: new Date(),
    });
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['chat-header']} */ ;
/** @type {__VLS_StyleScopedClasses['message']} */ ;
/** @type {__VLS_StyleScopedClasses['message']} */ ;
/** @type {__VLS_StyleScopedClasses['user']} */ ;
/** @type {__VLS_StyleScopedClasses['message-content']} */ ;
/** @type {__VLS_StyleScopedClasses['message']} */ ;
/** @type {__VLS_StyleScopedClasses['message-content']} */ ;
/** @type {__VLS_StyleScopedClasses['question-input']} */ ;
/** @type {__VLS_StyleScopedClasses['send-button']} */ ;
/** @type {__VLS_StyleScopedClasses['send-button']} */ ;
/** @type {__VLS_StyleScopedClasses['document-management']} */ ;
/** @type {__VLS_StyleScopedClasses['upload-button']} */ ;
/** @type {__VLS_StyleScopedClasses['add-text-button']} */ ;
/** @type {__VLS_StyleScopedClasses['refresh-button']} */ ;
/** @type {__VLS_StyleScopedClasses['clear-button']} */ ;
/** @type {__VLS_StyleScopedClasses['clear-button']} */ ;
/** @type {__VLS_StyleScopedClasses['clear-button']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "rag-chat" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "chat-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "chat-container" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "messages" },
    ref: "messagesContainer",
});
/** @type {typeof __VLS_ctx.messagesContainer} */ ;
for (const [message, index] of __VLS_getVForSourceType((__VLS_ctx.messages))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (index),
        ...{ class: (['message', message.type]) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "message-content" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "text" },
    });
    (message.text);
    if (message.context && message.context.length > 0) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "context" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.details, __VLS_intrinsicElements.details)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.summary, __VLS_intrinsicElements.summary)({});
        (message.context.length);
        for (const [ctx, ctxIndex] of __VLS_getVForSourceType((message.context))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                key: (ctxIndex),
                ...{ class: "context-item" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "context-content" },
            });
            (ctx.content);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "context-metadata" },
            });
            (ctx.metadata.source || '未知');
        }
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "timestamp" },
    });
    (__VLS_ctx.formatTime(message.timestamp));
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "input-area" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "input-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    ...{ onKeyup: (__VLS_ctx.sendQuestion) },
    disabled: (__VLS_ctx.isLoading),
    placeholder: "请输入您的问题...",
    ...{ class: "question-input" },
});
(__VLS_ctx.currentQuestion);
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.sendQuestion) },
    disabled: (__VLS_ctx.isLoading || !__VLS_ctx.currentQuestion.trim()),
    ...{ class: "send-button" },
});
(__VLS_ctx.isLoading ? '🤔 思考中...' : '📤 发送');
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "document-management" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "upload-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    ...{ onChange: (__VLS_ctx.handleFileUpload) },
    type: "file",
    ref: "fileInput",
    accept: ".json,.txt",
    ...{ style: {} },
});
/** @type {typeof __VLS_ctx.fileInput} */ ;
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.$refs.fileInput.click();
        } },
    ...{ class: "upload-button" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "text-input-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.textarea, __VLS_intrinsicElements.textarea)({
    value: (__VLS_ctx.textToAdd),
    placeholder: "或者直接输入文本内容...",
    ...{ class: "text-input" },
    rows: "3",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.addTextDocument) },
    disabled: (!__VLS_ctx.textToAdd.trim()),
    ...{ class: "add-text-button" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "management-buttons" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.refreshStats) },
    ...{ class: "refresh-button" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.clearAllDocuments) },
    ...{ class: "clear-button" },
});
/** @type {__VLS_StyleScopedClasses['rag-chat']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-header']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-container']} */ ;
/** @type {__VLS_StyleScopedClasses['messages']} */ ;
/** @type {__VLS_StyleScopedClasses['message']} */ ;
/** @type {__VLS_StyleScopedClasses['message-content']} */ ;
/** @type {__VLS_StyleScopedClasses['text']} */ ;
/** @type {__VLS_StyleScopedClasses['context']} */ ;
/** @type {__VLS_StyleScopedClasses['context-item']} */ ;
/** @type {__VLS_StyleScopedClasses['context-content']} */ ;
/** @type {__VLS_StyleScopedClasses['context-metadata']} */ ;
/** @type {__VLS_StyleScopedClasses['timestamp']} */ ;
/** @type {__VLS_StyleScopedClasses['input-area']} */ ;
/** @type {__VLS_StyleScopedClasses['input-group']} */ ;
/** @type {__VLS_StyleScopedClasses['question-input']} */ ;
/** @type {__VLS_StyleScopedClasses['send-button']} */ ;
/** @type {__VLS_StyleScopedClasses['document-management']} */ ;
/** @type {__VLS_StyleScopedClasses['upload-section']} */ ;
/** @type {__VLS_StyleScopedClasses['upload-button']} */ ;
/** @type {__VLS_StyleScopedClasses['text-input-section']} */ ;
/** @type {__VLS_StyleScopedClasses['text-input']} */ ;
/** @type {__VLS_StyleScopedClasses['add-text-button']} */ ;
/** @type {__VLS_StyleScopedClasses['management-buttons']} */ ;
/** @type {__VLS_StyleScopedClasses['refresh-button']} */ ;
/** @type {__VLS_StyleScopedClasses['clear-button']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            messages: messages,
            currentQuestion: currentQuestion,
            textToAdd: textToAdd,
            isLoading: isLoading,
            messagesContainer: messagesContainer,
            sendQuestion: sendQuestion,
            handleFileUpload: handleFileUpload,
            addTextDocument: addTextDocument,
            refreshStats: refreshStats,
            clearAllDocuments: clearAllDocuments,
            formatTime: formatTime,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
