<!-- src/components/CultureCarousel.vue -->
<template>
  <div class="carousel-container">
    <div
      class="carousel-item"
      v-for="(item, index) in items"
      :key="index"
    >
      <img
        :src="item.image"
        :alt="item.title"
        class="carousel-image"
      >
      <div class="carousel-caption">
        <h3 class="caption-title">{{ item.title }}</h3>
        <p class="caption-description">{{ item.description }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 类型定义
interface CarouselItem {
  title: string
  description: string
  image: string
}

// 响应式数据（带完整类型注解）
const items = ref<CarouselItem[]>([
  {
    title: '昆曲',
    description: '中国最古老的剧种之一',
    image: '/images/kunqu.jpg' // 确保图片位于 public/images 目录
  },
  {
    title: '剪纸',
    description: '千年传承的民间艺术',
    image: '/images/papercut.jpg'
  }
])
</script>

<style scoped>
.carousel-container {
  display: flex;
  overflow-x: auto;
  gap: 1rem;
  padding: 1rem 0;
  scroll-snap-type: x mandatory; /* 滚动捕捉优化 */
}

.carousel-item {
  min-width: 300px;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  scroll-snap-align: start; /* 滚动捕捉优化 */
}

.carousel-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.carousel-image:hover {
  transform: scale(1.05);
}

.carousel-caption {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.8),
    rgba(0, 0, 0, 0.4)
  );
  color: white;
  padding: 1.5rem 1rem;
}

.caption-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.caption-description {
  margin: 0.5rem 0 0;
  font-size: 0.875rem;
  opacity: 0.9;
}
</style>
