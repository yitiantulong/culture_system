<!-- src/components/GlobalNavigation.vue -->
<template>
  <nav class="global-nav">
    <router-link to="/" class="nav-btn" :class="{ active: $route.path === '/' }">
      <span>主页</span>
    </router-link>

    <router-link to="/rag-chat" class="nav-btn" :class="{ active: $route.path === '/rag-chat' }">
      <span>智能问答</span>
    </router-link>

    <router-link to="/chat" class="nav-btn" :class="{ active: $route.path === '/chat' }">
      <span>文化对话</span>
    </router-link>

    <router-link
      to="/heritage-map"
      class="nav-btn"
      :class="{ active: $route.path === '/heritage-map' }"
    >
      <span>非遗地图</span>
    </router-link>
  </nav>
</template>

<style scoped>
.global-nav {
  display: flex;
  gap: 45px;
  padding: 0;
  z-index: 2;
  margin-left: auto;
  align-items: center;
  margin-right: 100px;
}

.nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: #f0e5d8;
  transition: all 0.3s ease;
  height: 60px;
  padding: 0 30px;
  border-radius: 6px;
  font-size: 24px;
    font-weight: 500;

  &:hover {
    color: #fff;
    background: #ffffff;
    color: #570404;
  }

  &.active {
    color: #fff;
    background: #ffffff;
    color: #570404;
  }
}
</style>
