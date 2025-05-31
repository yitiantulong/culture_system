// src/stores/useHeritageStore.ts
import { defineStore } from 'pinia';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
// 定义枚举保护级别
var ProtectionLevel;
(function (ProtectionLevel) {
    ProtectionLevel["National"] = "\u56FD\u5BB6\u7EA7";
    ProtectionLevel["Provincial"] = "\u7701\u7EA7";
    ProtectionLevel["Municipal"] = "\u5E02\u7EA7";
})(ProtectionLevel || (ProtectionLevel = {}));
// 类型保护函数（增强版）
const isAxiosErrorWithMessage = (error) => {
    return axios.isAxiosError(error);
};
export const useHeritageStore = defineStore('heritage', {
    state: () => ({
        heritageData: [],
        isLoading: false,
        error: null,
        lastUpdated: null
    }),
    getters: {
        getByRegion: (state) => (region) => {
            return state.heritageData.filter(item => item.region === region);
        },
        getByType: (state) => (type) => {
            return state.heritageData.filter(item => item.type === type);
        },
        geoJSONData: (state) => {
            return {
                type: "FeatureCollection",
                features: state.heritageData.map(item => ({
                    type: "Feature",
                    geometry: {
                        type: "Point",
                        coordinates: item.coordinates
                    },
                    properties: {
                        ...item,
                        image: item.imageUrl
                    }
                }))
            };
        }
    },
    actions: {
        async fetchData() {
            this.isLoading = true;
            this.error = null;
            try {
                const response = await axios.get(import.meta.env.VITE_HERITAGE_API_URL || '/api/heritage', {
                    timeout: 10000,
                    headers: {
                        'Cache-Control': 'no-cache',
                        'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`
                    }
                });
                if (response.data?.length) {
                    this.heritageData = this.transformData(response.data);
                    this.lastUpdated = new Date();
                }
            }
            catch (error) {
                console.error('获取非遗数据失败:', error);
                this.error = this.handleError(error);
                throw error;
            }
            finally {
                this.isLoading = false;
            }
        },
        // 使用明确类型替代any
        transformData(apiData) {
            return apiData.map(item => ({
                id: item._id || uuidv4(),
                name: item.name,
                coordinates: [
                    Number(item.longitude),
                    Number(item.latitude)
                ],
                type: item.category,
                level: this.validateProtectionLevel(item.protectionLevel),
                region: item.region,
                establishedYear: item.year,
                description: item.description,
                imageUrl: item.imageUrls?.[0] || '/default-heritage.png',
                protectedUnit: item.protectedUnit
            }));
        },
        // 移除private修饰符，添加类型保护
        validateProtectionLevel(level) {
            const validLevels = Object.values(ProtectionLevel);
            return validLevels.includes(level)
                ? level
                : ProtectionLevel.Municipal;
        },
        // 增强错误处理类型
        handleError(error) {
            if (isAxiosErrorWithMessage(error)) {
                return error.response?.data?.message || '网络请求失败';
            }
            return error instanceof Error ? error.message : '未知错误';
        },
        async refreshData() {
            if (this.isLoading)
                return;
            await this.fetchData();
        }
    }
});
