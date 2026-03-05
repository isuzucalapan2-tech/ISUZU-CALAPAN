<template>
  <div class="loader-wrapper">
    <div class="loader">
      <div class="ring"></div>
      <h1 class="brand isuzu-font">ISUZU</h1>
    </div>
  </div>
</template>

<style scoped>
/* Loader wrapper */
.loader-wrapper {
  position: fixed;
  inset: 0;
  background-color: var(--bg-color);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  transition: background-color 0.3s ease;
}

/* Main container */
.loader {
  position: relative;
  width: 180px;
  height: 180px;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Rotating ring */
.ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 6px solid transparent;
  border-top-color: var(--ring-color);
  border-bottom-color: var(--ring-color);
  animation: spin 1.2s linear infinite;
  box-shadow: 0 0 20px var(--ring-color-glow);
  transition: all 0.3s ease;
}

/* ISUZU text */
.brand {
  font-size: 32px;
  font-weight: 900;
  letter-spacing: 6px;
  color: var(--text-color);
  animation: pulse 1.5s ease-in-out infinite;
  transition: color 0.3s ease;
}

/* Spin animation */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Text glow animation */
@keyframes pulse {
  0% { text-shadow: 0 0 5px var(--text-glow); }
  50% { text-shadow: 0 0 20px var(--text-glow); }
  100% { text-shadow: 0 0 5px var(--text-glow); }
}

/* ISUZU font */
.isuzu-font {
  font-family: 'IsuzuFont', sans-serif;
}

/* Light mode */
@media (prefers-color-scheme: light) {
  :root {
    --bg-color: #f9fafb;
    --ring-color: #DA251C;
    --ring-color-glow: rgba(218,37,28,0.5);
    --text-color: #DA251C;
    --text-glow: rgba(218,37,28,0.6);
  }
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  :root {
    --bg-color: #0f0f0f;
    --ring-color: #ffffff;
    --ring-color-glow: rgba(255,255,255,0.6);
    --text-color: #ffffff;
    --text-glow: rgba(255,255,255,0.7);
  }
}
</style>