<template>
  <div class="loader-wrapper">
    <div class="loader-content">
      <div class="ring outer"></div>
      
      <div class="ring middle"></div>
      
      <div class="ring inner"></div>

      <div class="brand-container">
        <h1 class="brand-text isuzu-font">ISUZU</h1>
        <div class="loading-bar">
          <div class="bar-progress"></div>
        </div>
        <span class="system-text">Processing Data</span>
      </div>
    </div>
    
    <div class="tech-bg"></div>
  </div>
</template>

<style scoped>
.loader-wrapper {
  position: fixed;
  inset: 0;
  background-color: #ffffff;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 99999;
  overflow: hidden;
  transition: all 0.5s ease;
}

/* Dark Mode Logic */
:global(.dark) .loader-wrapper {
  background-color: #0a0a0a !important;
}

.loader-content {
  position: relative;
  width: 280px;
  height: 280px;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Perfect Circles (Rings) */
.ring {
  position: absolute;
  border-radius: 50%; /* Perfect Circle */
  border: 2px solid transparent;
}

.ring.outer {
  width: 100%;
  height: 100%;
  border-top-color: #cc0000;
  border-bottom-color: #cc0000;
  animation: spin-clockwise 2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
  filter: drop-shadow(0 0 8px rgba(204, 0, 0, 0.3));
}

.ring.middle {
  width: 85%;
  height: 85%;
  border-left-color: #cc0000;
  border-right-color: rgba(204, 0, 0, 0.1);
  animation: spin-counter-clockwise 1.2s linear infinite;
  opacity: 0.6;
}

.ring.inner {
  width: 70%;
  height: 70%;
  border: 1px dashed rgba(204, 0, 0, 0.2);
  animation: spin-clockwise 10s linear infinite;
}

/* Brand Styling */
.brand-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 10;
}

.brand-text {
  font-size: 40px;
  font-weight: 900;
  letter-spacing: 15px;
  color: #000000;
  margin: 0;
  padding-left: 15px; /* Alignment fix for tracking */
  transition: color 0.5s ease;
}

:global(.dark) .brand-text {
  color: #ffffff !important;
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
}

/* Animated Loading Bar */
.loading-bar {
  width: 100px;
  height: 2px;
  background: rgba(204, 0, 0, 0.1);
  margin-top: 15px;
  border-radius: 4px;
  overflow: hidden;
}

.bar-progress {
  height: 100%;
  width: 50%;
  background: #cc0000;
  animation: progress-slide 1.5s ease-in-out infinite;
}

.system-text {
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 5px;
  margin-top: 20px;
  font-weight: 800;
  color: #cc0000;
  opacity: 0.8;
}

/* Tech Background Pattern */
.tech-bg {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle, rgba(204, 0, 0, 0.05) 1px, transparent 1px);
  background-size: 30px 30px;
  opacity: 0.5;
  pointer-events: none;
}

/* Keyframes */
@keyframes spin-clockwise {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes spin-counter-clockwise {
  from { transform: rotate(360deg); }
  to { transform: rotate(0deg); }
}

@keyframes progress-slide {
  0% { transform: translateX(-150%); }
  50% { transform: translateX(50%); }
  100% { transform: translateX(150%); }
}

.isuzu-font {
  font-family: 'IsuzuFont', sans-serif;
}
</style>