<template>
  <div class="ink-effect">
    <div class="ink-drop"></div>
  </div>
</template>

<style scoped>
.ink-effect {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.ink-drop {
  position: absolute;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(139,87,42,0.3) 0%, transparent 70%);
  animation: spread 0.5s ease-out;
}

@keyframes spread {
  from { transform: scale(0); }
  to { transform: scale(1); }
}
</style>
