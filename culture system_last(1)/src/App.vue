<template>
  <div class="app-container">
    <header v-if="!isHomePage" class="main-header">
      <div class="header-content">
        <h1 class="title">非遗万象：基于RAG增强的非遗问答系统</h1>
      </div>
      <GlobalNavigation />
      <img src="./assets/san.png" class="header-pattern" />
    </header>

    <main :class="{ 'main-content': !isHomePage }">
      <RouterView />
    </main>

    <footer v-if="!isHomePage" class="main-footer">
      <p>© 2025 中山大学网络空间安全学院 · 传承千年智慧 · 守护文化根脉</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import { computed } from 'vue'
import GlobalNavigation from '@/components/GlobalNavigation.vue'

const route = useRoute()
const isHomePage = computed(() => route.path === '/')
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-image: url('./assets/san.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
}

.main-header {
  position: relative;
  padding: 0.5rem 2rem;
  background: rgb(87, 4, 4);
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 90px;
}

.header-pattern {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.1;
  pointer-events: none;
}

.header-content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
}

.title {
  font-family: '楷体', cursive;
  font-size: 1.8rem;
  margin: 0;
  white-space: nowrap;
  text-align: left;
}

.subtitle {
  font-size: 1.2rem;
  color: #f0e5d8;
}

.main-content {
  flex: 1;
  display: flex;
  padding: 0;
  min-height: 0;
  overflow: hidden;
  margin-top: 0;
}

.main-footer {
  background: rgb(87, 4, 4);
  color: white;
  padding: 1rem;
  text-align: center;
  font-size: 0.9rem;
}
</style>
