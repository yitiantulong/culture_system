import axios from 'axios';
// 配置基础URL - 支持多个可能的前端端口
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
const ragApi = axios.create({
    baseURL: `${API_BASE_URL}/api/rag`,
    timeout: 300000, // 增加到5分钟（300秒）
    headers: {
        'Content-Type': 'application/json',
    },
});
// 创建基础API实例用于健康检查
const baseApi = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000, // 健康检查10秒超时
    headers: {
        'Content-Type': 'application/json',
    },
});
// 请求拦截器 - 添加请求日志
ragApi.interceptors.request.use((config) => {
    console.log(`🔄 RAG API 请求: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
}, (error) => {
    console.error('📤 RAG API 请求错误:', error);
    return Promise.reject(error);
});
// 响应拦截器 - 改善错误处理
ragApi.interceptors.response.use((response) => {
    console.log(`✅ RAG API 响应成功: ${response.config.url}`);
    return response;
}, (error) => {
    console.error('❌ RAG API 错误:', error);
    // 检查错误类型
    if (error.code === 'ECONNABORTED') {
        error.message = '请求超时，请检查后端服务是否正常运行';
    }
    else if (error.code === 'ERR_NETWORK') {
        error.message = '网络连接失败，请检查后端服务是否启动';
    }
    else if (error.response?.status === 500) {
        error.message = '后端服务器错误，请检查后端日志';
    }
    return Promise.reject(error);
});
// RAG API 方法
export const ragApiMethods = {
    // 提问
    async query(question) {
        try {
            console.log(`🤔 发送问题: ${question}`);
            const response = await ragApi.post('/query', { question });
            return response.data;
        }
        catch (error) {
            console.error('❌ 查询失败:', error.message);
            throw error;
        }
    },
    // 上传文档
    async uploadDocument(file) {
        const formData = new FormData();
        formData.append('document', file);
        const response = await ragApi.post('/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            timeout: 300000, // 文件上传5分钟超时
        });
        return response.data;
    },
    // 添加文本文档
    async addTextDocument(text, metadata) {
        const response = await ragApi.post('/add-text', { text, metadata });
        return response.data;
    },
    // 添加网页文档
    async addWebDocument(url, selector) {
        const response = await ragApi.post('/add-web', { url, selector });
        return response.data;
    },
    // 获取统计信息
    async getStats() {
        const response = await ragApi.get('/stats');
        return response.data;
    },
    // 清空文档
    async clearDocuments() {
        const response = await ragApi.delete('/documents');
        return response.data;
    },
    // RAG健康检查
    async checkHealth() {
        try {
            console.log('🔍 检查RAG服务健康状态...');
            const response = await ragApi.get('/health', { timeout: 30000 });
            console.log('✅ RAG健康检查成功');
            return response.data;
        }
        catch (error) {
            console.error('❌ RAG健康检查失败:', error.message);
            throw error;
        }
    },
    // 测试基础后端连接
    async testConnection() {
        try {
            console.log('🔍 测试后端基础连接...');
            const response = await baseApi.get('/api/health');
            console.log('✅ 后端基础连接成功');
            return response.status === 200;
        }
        catch (error) {
            console.error('❌ 后端基础连接失败:', error.message);
            return false;
        }
    },
    // 完整连接测试（先测试基础连接，再测试RAG服务）
    async fullConnectionTest() {
        const results = { basic: false, rag: false };
        try {
            // 1. 测试基础连接
            results.basic = await this.testConnection();
            // 2. 如果基础连接成功，测试RAG服务
            if (results.basic) {
                try {
                    await this.checkHealth();
                    results.rag = true;
                }
                catch (error) {
                    console.log('RAG服务连接失败，但基础服务正常');
                }
            }
        }
        catch (error) {
            console.error('连接测试失败:', error);
        }
        return results;
    },
};
export default ragApiMethods;
