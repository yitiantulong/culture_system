<template>
  <div class="home-container">
    <div class="welcome-section">
      <h1 class="main-title">非遗万象</h1>
      <p class="subtitle">探索中华非物质文化遗产的智慧宝库</p>
    </div>

    <div class="navigation-cards">
      <router-link to="/chat" class="nav-card">
        <div class="card-content">
          <h2>文化对话</h2>
          <p>与AI助手展开关于非物质文化遗产的深度对话</p>
        </div>
      </router-link>

      <router-link to="/heritage-map" class="nav-card">
        <div class="card-content">
          <h2>非遗地图</h2>
          <p>探索中国非物质文化遗产的地理分布</p>
        </div>
      </router-link>

      <router-link to="/rag-chat" class="nav-card">
        <div class="card-content">
          <h2>智能问答</h2>
          <p>基于RAG技术的智能问答系统，解答您的非遗疑问</p>
        </div>
      </router-link>
    </div>

    <div class="heritage-quote-section">
      <p class="heritage-quote">
        "历史文化遗产承载着中华民族的基因和血脉，不仅属于我们这一代人，也属于子孙万代。要敬畏历史、敬畏文化、敬畏生态，全面保护好历史文化遗产"
      </p>
      <p class="quote-author">——习近平总书记</p>
    </div>
  </div>
</template>

<style scoped>
.home-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4rem 2rem;
  background: linear-gradient(rgba(87, 4, 4, 0.9), rgba(87, 4, 4, 0.8));
  color: white;
}

.welcome-section {
  text-align: center;
  margin-bottom: 4rem;
}

.main-title {
  font-family: '楷体', cursive;
  font-size: 4rem;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.subtitle {
  font-size: 1.5rem;
  color: #f0e5d8;
  margin-bottom: 2rem;
}

.heritage-quote-section {
  text-align: center;
  margin-top: 4rem;
  max-width: 800px;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.heritage-quote {
  font-size: 1.3rem;
  line-height: 1.8;
  color: #f0e5d8;
  font-family: '楷体', cursive;
  margin-bottom: 1rem;
}

.quote-author {
  font-size: 1.1rem;
  color: #f0e5d8;
  text-align: right;
  font-family: '楷体', cursive;
}

.navigation-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  max-width: 1200px;
  width: 100%;
}

.nav-card {
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 2rem;
  text-decoration: none;
  color: white;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  height: 100%;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-card:hover {
  transform: translateY(-10px);
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.card-content {
  text-align: center;
}

.card-content h2 {
  font-size: 1.8rem;
  margin-bottom: 1rem;
  font-family: '楷体', cursive;
}

.card-content p {
  font-size: 1rem;
  color: #f0e5d8;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .navigation-cards {
    grid-template-columns: 1fr;
  }

  .main-title {
    font-size: 3rem;
  }

  .subtitle {
    font-size: 1.2rem;
  }
}
</style>
