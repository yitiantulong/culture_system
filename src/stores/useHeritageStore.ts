// src/stores/useHeritageStore.ts
import { defineStore } from 'pinia'
import axios, { type AxiosError } from 'axios'
import { v4 as uuidv4 } from 'uuid'

// 定义枚举保护级别
enum ProtectionLevel {
  National = '国家级',
  Provincial = '省级',
  Municipal = '市级'
}

interface ApiHeritageItem {
  _id?: string
  name: string
  longitude: number
  latitude: number
  category: string
  protectionLevel: string
  region: string
  year: number
  description: string
  imageUrls?: string[]
  protectedUnit?: string
}

interface HeritageItem {
  id: string
  name: string
  coordinates: [number, number]
  type: string
  level: ProtectionLevel
  region: string
  establishedYear: number
  description: string
  imageUrl: string
  protectedUnit?: string
}

interface HeritageState {
  heritageData: HeritageItem[]
  isLoading: boolean
  error: string | null
  lastUpdated: Date | null
}

interface ApiErrorResponse {
  message?: string
  [key: string]: unknown
}

// 类型保护函数（增强版）
const isAxiosErrorWithMessage = (error: unknown): error is AxiosError<ApiErrorResponse> => {
  return axios.isAxiosError(error)
}

export const useHeritageStore = defineStore('heritage', {
  state: (): HeritageState => ({
    heritageData: [],
    isLoading: false,
    error: null,
    lastUpdated: null
  }),
  getters: {
    getByRegion: (state) => (region: string) => {
      return state.heritageData.filter(item => item.region === region)
    },
    getByType: (state) => (type: string) => {
      return state.heritageData.filter(item => item.type === type)
    },
    geoJSONData: (state) => {
      return {
        type: "FeatureCollection" as const,
        features: state.heritageData.map(item => ({
          type: "Feature" as const,
          geometry: {
            type: "Point" as const,
            coordinates: item.coordinates
          },
          properties: {
            ...item,
            image: item.imageUrl
          }
        }))
      }
    }
  },
  actions: {
    async fetchData() {
      this.isLoading = true
      this.error = null

      try {
        const response = await axios.get<ApiHeritageItem[]>(
          import.meta.env.VITE_HERITAGE_API_URL || '/api/heritage',
          {
            timeout: 10000,
            headers: {
              'Cache-Control': 'no-cache',
              'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`
            }
          }
        )

        if (response.data?.length) {
          this.heritageData = this.transformData(response.data)
          this.lastUpdated = new Date()
        }
      } catch (error) {
        console.error('获取非遗数据失败:', error)
        this.error = this.handleError(error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // 使用明确类型替代any
    transformData(apiData: ApiHeritageItem[]): HeritageItem[] {
      return apiData.map(item => ({
        id: item._id || uuidv4(),
        name: item.name,
        coordinates: [
          Number(item.longitude),
          Number(item.latitude)
        ] as [number, number],
        type: item.category,
        level: this.validateProtectionLevel(item.protectionLevel),
        region: item.region,
        establishedYear: item.year,
        description: item.description,
        imageUrl: item.imageUrls?.[0] || '/default-heritage.png',
        protectedUnit: item.protectedUnit
      }))
    },

    // 移除private修饰符，添加类型保护
    validateProtectionLevel(level: string): ProtectionLevel {
      const validLevels = Object.values(ProtectionLevel) as string[]
      return validLevels.includes(level)
        ? level as ProtectionLevel
        : ProtectionLevel.Municipal
    },

    // 增强错误处理类型
    handleError(error: unknown): string {
      if (isAxiosErrorWithMessage(error)) {
        return error.response?.data?.message || '网络请求失败'
      }
      return error instanceof Error ? error.message : '未知错误'
    },

    async refreshData() {
      if (this.isLoading) return
      await this.fetchData()
    }
  }
})
