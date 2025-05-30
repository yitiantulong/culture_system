<template>
  <div class="cultural-spinner">
    <div class="lotus"></div>
  </div>
</template>

<style scoped>
.cultural-spinner {
  width: 40px;
  height: 40px;
  position: relative;
}

.lotus {
  width: 100%;
  height: 100%;
  background: url('@/assets/lotus.png') no-repeat center;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
