<template>
  <div class="heritage-map-container">
    <div class="map-title">
      <h1>非物质文化遗产地图</h1>
    </div>
    <div class="map-content">
      <div class="map-wrapper">
        <div class="map-background">
          <div class="map-border">
            <div class="map-area" ref="mapArea">
              <!-- 地图将在这里通过Canvas绘制 -->
              <canvas ref="mapCanvas"></canvas>
              <!-- 加载状态 -->
              <div v-if="isLoading" class="loading-overlay">
                <div class="loading-spinner"></div>
                <div class="loading-text">正在加载地图数据...</div>
              </div>
              <!-- 错误状态 -->
              <div v-if="error" class="error-overlay">
                <div class="error-message">{{ error }}</div>
                <button class="retry-button" @click="fetchMapData">重试</button>
              </div>
            </div>
          </div>
        </div>
        <div class="map-note">
          <span class="note-icon">💡</span>
          点击相应省份可查看具体数据
        </div>
      </div>
      <div v-if="selectedProvince" class="province-stats">
        <h2>【{{ selectedProvince.name }}】</h2>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-number">{{ selectedProvince.stats.folk || 0 }}</div>
            <div class="stat-label">民间文学</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ selectedProvince.stats.music || 0 }}</div>
            <div class="stat-label">传统音乐</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ selectedProvince.stats.dance || 0 }}</div>
            <div class="stat-label">传统舞蹈</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ selectedProvince.stats.opera || 0 }}</div>
            <div class="stat-label">传统戏剧</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ selectedProvince.stats.art || 0 }}</div>
            <div class="stat-label">曲艺</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ selectedProvince.stats.sports || 0 }}</div>
            <div class="stat-label">传统体育</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ selectedProvince.stats.crafts || 0 }}</div>
            <div class="stat-label">传统技艺</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ selectedProvince.stats.medicine || 0 }}</div>
            <div class="stat-label">传统医药</div>
          </div>
          <div class="stat-item total">
            <div class="stat-number">{{ calculateTotal(selectedProvince.stats) }}</div>
            <div class="stat-label">民俗</div>
          </div>
        </div>
      </div>
    </div>
    <div class="map-footer">
      <p>说明：数据来自国家文化和旅游行政主管部门公开信息，数据统计截至2025年3月13日。</p>
      <p class="total-items">总计：{{ totalHeritageItems }} 项</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue'

interface ProvinceStats {
  folk: number
  music: number
  dance: number
  opera: number
  art: number
  sports: number
  crafts: number
  medicine: number
}

interface Province {
  name: string
  stats: ProvinceStats
  coordinates: [number, number]
}

interface GeoJSONFeature {
  type: string
  properties: {
    name: string
    adcode: string
  }
  geometry: {
    type: string
    coordinates: number[][][] | number[][][][]
  }
}

interface MapData {
  type: string
  features: GeoJSONFeature[]
}

const provinces: Record<string, Province> = {
  北京市: {
    name: '北京市',
    stats: {
      folk: 2,
      music: 8,
      dance: 5,
      opera: 4,
      art: 6,
      sports: 4,
      crafts: 7,
      medicine: 2,
    },
    coordinates: [116.3912757, 39.906217],
  },
  上海市: {
    name: '上海市',
    stats: {
      folk: 1,
      music: 7,
      dance: 4,
      opera: 3,
      art: 5,
      sports: 3,
      crafts: 6,
      medicine: 2,
    },
    coordinates: [121.4737, 31.2304],
  },
  广东省: {
    name: '广东省',
    stats: {
      folk: 3,
      music: 12,
      dance: 8,
      opera: 5,
      art: 7,
      sports: 6,
      crafts: 9,
      medicine: 4,
    },
    coordinates: [113.2592945, 23.1301964],
  },
  浙江省: {
    name: '浙江省',
    stats: {
      folk: 2,
      music: 9,
      dance: 6,
      opera: 4,
      art: 6,
      sports: 5,
      crafts: 8,
      medicine: 3,
    },
    coordinates: [120.2052342, 30.2489634],
  },
  江苏省: {
    name: '江苏省',
    stats: {
      folk: 2,
      music: 10,
      dance: 7,
      opera: 5,
      art: 7,
      sports: 5,
      crafts: 9,
      medicine: 3,
    },
    coordinates: [119.1075773, 33.5524785],
  },
  福建省: {
    name: '福建省',
    stats: {
      folk: 2,
      music: 8,
      dance: 5,
      opera: 4,
      art: 5,
      sports: 4,
      crafts: 7,
      medicine: 2,
    },
    coordinates: [119.2918215, 26.0774954],
  },
  山东省: {
    name: '山东省',
    stats: {
      folk: 2,
      music: 9,
      dance: 6,
      opera: 4,
      art: 6,
      sports: 5,
      crafts: 8,
      medicine: 3,
    },
    coordinates: [117.0, 36.0],
  },
  河南省: {
    name: '河南省',
    stats: {
      folk: 2,
      music: 8,
      dance: 5,
      opera: 4,
      art: 5,
      sports: 4,
      crafts: 7,
      medicine: 2,
    },
    coordinates: [113.6191483, 34.7487244],
  },
  湖北省: {
    name: '湖北省',
    stats: {
      folk: 2,
      music: 9,
      dance: 6,
      opera: 4,
      art: 6,
      sports: 5,
      crafts: 8,
      medicine: 3,
    },
    coordinates: [114.2919, 30.5928],
  },
  湖南省: {
    name: '湖南省',
    stats: {
      folk: 2,
      music: 8,
      dance: 5,
      opera: 4,
      art: 5,
      sports: 4,
      crafts: 7,
      medicine: 2,
    },
    coordinates: [112.9834, 28.1141],
  },
  江西省: {
    name: '江西省',
    stats: {
      folk: 2,
      music: 7,
      dance: 4,
      opera: 3,
      art: 4,
      sports: 3,
      crafts: 6,
      medicine: 2,
    },
    coordinates: [115.8921, 28.6765],
  },
  安徽省: {
    name: '安徽省',
    stats: {
      folk: 2,
      music: 8,
      dance: 5,
      opera: 4,
      art: 5,
      sports: 4,
      crafts: 7,
      medicine: 2,
    },
    coordinates: [117.2218033, 31.8228094],
  },
  陕西省: {
    name: '陕西省',
    stats: {
      folk: 2,
      music: 9,
      dance: 6,
      opera: 4,
      art: 6,
      sports: 5,
      crafts: 8,
      medicine: 3,
    },
    coordinates: [109.0861893, 34.53727],
  },
  山西省: {
    name: '山西省',
    stats: {
      folk: 2,
      music: 7,
      dance: 4,
      opera: 3,
      art: 4,
      sports: 3,
      crafts: 6,
      medicine: 2,
    },
    coordinates: [112.5489, 37.8706],
  },
  河北省: {
    name: '河北省',
    stats: {
      folk: 2,
      music: 8,
      dance: 5,
      opera: 4,
      art: 5,
      sports: 4,
      crafts: 7,
      medicine: 2,
    },
    coordinates: [114.5391, 38.0428],
  },
  吉林省: {
    name: '吉林省',
    stats: {
      folk: 2,
      music: 10,
      dance: 6,
      opera: 3,
      art: 6,
      sports: 5,
      crafts: 6,
      medicine: 3,
    },
    coordinates: [126.5287796, 45.8016143],
  },
  辽宁省: {
    name: '辽宁省',
    stats: {
      folk: 2,
      music: 8,
      dance: 5,
      opera: 4,
      art: 5,
      sports: 4,
      crafts: 7,
      medicine: 2,
    },
    coordinates: [123.4315, 41.8057],
  },
  黑龙江省: {
    name: '黑龙江省',
    stats: {
      folk: 2,
      music: 9,
      dance: 6,
      opera: 4,
      art: 6,
      sports: 5,
      crafts: 8,
      medicine: 3,
    },
    coordinates: [126.6424, 45.7574],
  },
  四川省: {
    name: '四川省',
    stats: {
      folk: 3,
      music: 11,
      dance: 7,
      opera: 5,
      art: 7,
      sports: 6,
      crafts: 9,
      medicine: 4,
    },
    coordinates: [104.0633717, 30.6598628],
  },
  云南省: {
    name: '云南省',
    stats: {
      folk: 3,
      music: 10,
      dance: 7,
      opera: 5,
      art: 6,
      sports: 5,
      crafts: 8,
      medicine: 3,
    },
    coordinates: [102.7103, 25.0389],
  },
  贵州省: {
    name: '贵州省',
    stats: {
      folk: 2,
      music: 8,
      dance: 5,
      opera: 4,
      art: 5,
      sports: 4,
      crafts: 7,
      medicine: 2,
    },
    coordinates: [106.7142, 26.5783],
  },
  青海省: {
    name: '青海省',
    stats: {
      folk: 2,
      music: 7,
      dance: 4,
      opera: 3,
      art: 4,
      sports: 3,
      crafts: 6,
      medicine: 2,
    },
    coordinates: [101.7761976, 36.617331],
  },
  甘肃省: {
    name: '甘肃省',
    stats: {
      folk: 2,
      music: 8,
      dance: 5,
      opera: 4,
      art: 5,
      sports: 4,
      crafts: 7,
      medicine: 2,
    },
    coordinates: [103.8318566, 36.0620781],
  },
  新疆维吾尔自治区: {
    name: '新疆',
    stats: {
      folk: 3,
      music: 12,
      dance: 8,
      opera: 5,
      art: 7,
      sports: 6,
      crafts: 9,
      medicine: 4,
    },
    coordinates: [87.6139038, 43.8244074],
  },
  西藏自治区: {
    name: '西藏',
    stats: {
      folk: 2,
      music: 8,
      dance: 5,
      opera: 4,
      art: 5,
      sports: 4,
      crafts: 7,
      medicine: 3,
    },
    coordinates: [94.3602321, 29.6510453],
  },
  内蒙古自治区: {
    name: '内蒙古',
    stats: {
      folk: 2,
      music: 9,
      dance: 6,
      opera: 4,
      art: 6,
      sports: 5,
      crafts: 8,
      medicine: 3,
    },
    coordinates: [111.6730788, 40.8337963],
  },
  广西壮族自治区: {
    name: '广西',
    stats: {
      folk: 2,
      music: 9,
      dance: 6,
      opera: 4,
      art: 6,
      sports: 5,
      crafts: 8,
      medicine: 3,
    },
    coordinates: [108.3207, 22.8152],
  },
  宁夏回族自治区: {
    name: '宁夏',
    stats: {
      folk: 1,
      music: 6,
      dance: 4,
      opera: 3,
      art: 4,
      sports: 3,
      crafts: 5,
      medicine: 2,
    },
    coordinates: [106.2719, 38.4681],
  },
  海南省: {
    name: '海南省',
    stats: {
      folk: 1,
      music: 6,
      dance: 4,
      opera: 3,
      art: 4,
      sports: 3,
      crafts: 5,
      medicine: 2,
    },
    coordinates: [110.3487, 20.0179],
  },
}

const mapCanvas = ref<HTMLCanvasElement | null>(null)
const selectedProvince = ref<Province | null>(null)
const hoveredProvince = ref<Province | null>(null)

const totalHeritageItems = computed(() => {
  return Object.values(provinces).reduce((total, province) => {
    return total + calculateTotal(province.stats)
  }, 0)
})

function calculateTotal(stats: ProvinceStats): number {
  return Object.values(stats).reduce((sum, value) => sum + value, 0)
}

const animationFrame = ref<number>(0)
const pulseScale = ref<number>(1)
const pulseDirection = ref<number>(1)

function animate() {
  // 更新脉冲动画
  pulseScale.value += pulseDirection.value * 0.01
  if (pulseScale.value >= 1.2) pulseDirection.value = -1
  if (pulseScale.value <= 1) pulseDirection.value = 1

  // 重绘地图
  const canvas = mapCanvas.value
  if (canvas) {
    const ctx = canvas.getContext('2d')
    if (ctx) {
      drawMap(ctx)
    }
  }

  // 继续动画循环
  animationFrame.value = requestAnimationFrame(animate)
}

const mapData = ref<MapData | null>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)

// 获取地图数据
async function fetchMapData() {
  isLoading.value = true
  error.value = null

  try {
    const response = await fetch('https://geojson.cn/api/china/100000.json')
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    mapData.value = data
    // 重新绘制地图
    const canvas = mapCanvas.value
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        drawMap(ctx)
      }
    }
  } catch (err) {
    console.error('Failed to fetch map data:', err)
    error.value = '地图数据加载失败，请刷新页面重试'
  } finally {
    isLoading.value = false
  }
}

function drawMap(ctx: CanvasRenderingContext2D) {
  // 设置背景
  ctx.fillStyle = '#2b0000'
  ctx.fillRect(0, 0, 800, 600)

  // 如果有地图数据，绘制地图轮廓
  if (mapData.value) {
    ctx.strokeStyle = '#d4b895'
    ctx.lineWidth = 2
    ctx.fillStyle = 'rgba(87, 4, 4, 0.3)'

    mapData.value.features.forEach((feature) => {
      if (feature.geometry.type === 'Polygon') {
        const coordinates = feature.geometry.coordinates as number[][][]
        drawPolygon(ctx, coordinates[0])
      } else if (feature.geometry.type === 'MultiPolygon') {
        const coordinates = feature.geometry.coordinates as number[][][][]
        coordinates.forEach((polygon) => {
          drawPolygon(ctx, polygon[0])
        })
      }
    })
  }

  // 绘制省份名称和数据点
  Object.values(provinces).forEach((province) => {
    const [x, y] = transformCoordinates(province.coordinates)

    // 判断是否是选中或悬停的省份
    const isActive = province === selectedProvince.value || province === hoveredProvince.value

    // 计算点的大小
    const baseSize = isActive ? 8 : 6
    const size = isActive ? baseSize * pulseScale.value : baseSize

    // 绘制光晕效果
    if (isActive) {
      ctx.beginPath()
      ctx.arc(x, y, size * 1.5, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
      ctx.fill()

      ctx.beginPath()
      ctx.arc(x, y, size * 1.2, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'
      ctx.fill()
    }

    // 绘制数据点
    ctx.beginPath()
    ctx.arc(x, y, size, 0, Math.PI * 2)
    ctx.fillStyle = isActive ? '#ffffff' : '#d4b895'
    ctx.fill()
    ctx.strokeStyle = isActive ? '#ffffff' : '#570404'
    ctx.lineWidth = isActive ? 3 : 2
    ctx.stroke()

    // 绘制省份名称
    ctx.fillStyle = isActive ? '#ffffff' : '#d4b895'
    ctx.font = isActive ? 'bold 16px sans-serif' : '14px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(province.name, x, y - 15)

    // 如果是悬停状态，显示总数
    if (isActive) {
      const total = calculateTotal(province.stats)
      ctx.fillStyle = '#ffffff'
      ctx.font = '14px sans-serif'
      ctx.fillText(`总计: ${total}`, x, y + 25)
    }
  })
}

// 绘制多边形
function drawPolygon(ctx: CanvasRenderingContext2D, coordinates: number[][]) {
  if (coordinates.length === 0) return

  ctx.beginPath()
  const [startX, startY] = transformCoordinates(coordinates[0] as [number, number])
  ctx.moveTo(startX, startY)

  for (let i = 1; i < coordinates.length; i++) {
    const [x, y] = transformCoordinates(coordinates[i] as [number, number])
    ctx.lineTo(x, y)
  }

  ctx.closePath()
  ctx.fill()
  ctx.stroke()
}

// 坐标转换函数
function transformCoordinates([lon, lat]: [number, number]): [number, number] {
  // 中国地图范围
  const bounds = {
    west: 73.5,
    east: 135.0,
    south: 18.2,
    north: 53.5,
  }

  // 转换为画布坐标
  const x = ((lon - bounds.west) / (bounds.east - bounds.west)) * 700 + 50
  const y = ((bounds.north - lat) / (bounds.north - bounds.south)) * 500 + 50

  return [x, y]
}

// 添加点击事件处理
function handleMapClick(event: MouseEvent) {
  const canvas = mapCanvas.value
  if (!canvas) return

  const rect = canvas.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top

  // 检查是否点击了某个省份的点
  Object.values(provinces).forEach((province) => {
    const [px, py] = transformCoordinates(province.coordinates)
    const distance = Math.sqrt((x - px) ** 2 + (y - py) ** 2)

    if (distance <= 6) {
      selectedProvince.value = province
    }
  })
}

function handleMapMouseMove(event: MouseEvent) {
  const canvas = mapCanvas.value
  if (!canvas) return

  const rect = canvas.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top

  // 检查是否悬停在某个省份的点上
  let found = false
  Object.values(provinces).forEach((province) => {
    const [px, py] = transformCoordinates(province.coordinates)
    const distance = Math.sqrt((x - px) ** 2 + (y - py) ** 2)

    if (distance <= 6) {
      hoveredProvince.value = province
      found = true
      canvas.style.cursor = 'pointer'
    }
  })

  if (!found) {
    hoveredProvince.value = null
    canvas.style.cursor = 'default'
  }

  // 重新绘制地图以更新悬停效果
  const ctx = canvas.getContext('2d')
  if (ctx) {
    drawMap(ctx)
  }
}

onMounted(() => {
  initializeMap()

  // 获取地图数据
  fetchMapData()

  // 添加事件监听
  const canvas = mapCanvas.value
  if (canvas) {
    canvas.addEventListener('click', handleMapClick)
    canvas.addEventListener('mousemove', handleMapMouseMove)
  }

  // 启动动画
  animate()
})

onUnmounted(() => {
  // 清理事件监听
  const canvas = mapCanvas.value
  if (canvas) {
    canvas.removeEventListener('click', handleMapClick)
    canvas.removeEventListener('mousemove', handleMapMouseMove)
  }

  // 停止动画
  if (animationFrame.value) {
    cancelAnimationFrame(animationFrame.value)
  }
})

function initializeMap() {
  if (!mapCanvas.value) return
  const ctx = mapCanvas.value.getContext('2d')
  if (!ctx) return

  // 设置画布大小
  mapCanvas.value.width = 800
  mapCanvas.value.height = 600

  // 绘制地图和点位的代码将在这里实现
  drawMap(ctx)
}
</script>

<style scoped>
.heritage-map-container {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(to bottom, #2b0000, #570404);
  color: #d4b895;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.map-title {
  text-align: center;
  margin-bottom: 2rem;
}

.map-title h1 {
  font-size: 2.5rem;
  color: #d4b895;
  margin: 0;
  padding: 1rem 2rem;
  border: 2px solid #d4b895;
  display: inline-block;
  position: relative;
}

.map-title h1::before,
.map-title h1::after {
  content: '❖';
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  color: #d4b895;
  font-size: 1.5rem;
}

.map-title h1::before {
  left: -2rem;
}

.map-title h1::after {
  right: -2rem;
}

.map-content {
  display: flex;
  gap: 2rem;
  margin: 2rem 0;
}

.map-wrapper {
  flex: 1;
  min-width: 800px;
  position: relative;
}

.map-background {
  background-color: rgba(87, 4, 4, 0.3);
  padding: 1rem;
  border-radius: 8px;
}

.map-border {
  border: 2px solid #d4b895;
  padding: 1rem;
}

.map-area {
  position: relative;
  width: 100%;
  height: 600px;
}

.map-area canvas {
  width: 100%;
  height: 100%;
}

.province-stats {
  background-color: rgba(87, 4, 4, 0.3);
  padding: 2rem;
  border-radius: 8px;
  border: 2px solid #d4b895;
  min-width: 300px;
}

.province-stats h2 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #d4b895;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.stat-item {
  text-align: center;
  padding: 0.5rem;
  border: 1px solid rgba(212, 184, 149, 0.3);
}

.stat-number {
  font-size: 1.5rem;
  font-weight: bold;
  color: #d4b895;
}

.stat-label {
  font-size: 0.9rem;
  color: #d4b895;
  margin-top: 0.25rem;
}

.stat-item.total {
  grid-column: span 2;
  background-color: rgba(212, 184, 149, 0.1);
}

.map-footer {
  text-align: center;
  margin-top: 2rem;
  color: #d4b895;
  font-size: 0.9rem;
}

.total-items {
  margin-top: 0.5rem;
  font-weight: bold;
}

@media (max-width: 1200px) {
  .map-content {
    flex-direction: column;
  }

  .map-wrapper {
    min-width: 100%;
  }

  .province-stats {
    width: 100%;
  }
}

.loading-overlay,
.error-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgba(43, 0, 0, 0.8);
  z-index: 10;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #d4b895;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

.loading-text,
.error-message {
  color: #d4b895;
  font-size: 1.2rem;
  text-align: center;
}

.retry-button {
  margin-top: 1rem;
  padding: 0.5rem 2rem;
  background-color: #570404;
  border: 2px solid #d4b895;
  color: #d4b895;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.retry-button:hover {
  background-color: #d4b895;
  color: #570404;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.map-note {
  margin-top: 1rem;
  text-align: center;
  color: #d4b895;
  font-size: 1rem;
  padding: 0.5rem;
  background-color: rgba(87, 4, 4, 0.3);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.note-icon {
  font-size: 1.2rem;
}
</style>
