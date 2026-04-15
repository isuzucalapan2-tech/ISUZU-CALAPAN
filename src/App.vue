<template>
  <div id="app" :class="themeClass" :style="themeStyle">
    <SplashScreen :isVisible="isLoading" />

    <Toast ref="toastRef" />
    
    <div v-if="showSessionWarning" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg shadow-xl max-w-md mx-4">
        <div class="flex items-center gap-3 mb-4">
          <AlertTriangleIcon class="w-8 h-8 text-yellow-500" />
          <h3 class="text-lg font-bold text-gray-900">Session Expiring Soon</h3>
        </div>
        <p class="text-gray-600 mb-6">
          Your session will expire in 5 minutes due to inactivity. Click anywhere or press any key to extend your session.
        </p>
        <div class="flex gap-3">
          <button 
            @click="extendSession"
            class="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            Extend Session
          </button>
          <button 
            @click="logoutNow"
            class="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400 transition"
          >
            Logout Now
          </button>
        </div>
      </div>
    </div>

    <div v-show="!isLoading" class="animate-fade-in">
      <router-view></router-view>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue';
import { useAuthStore } from './stores/auth';
import { AlertTriangleIcon } from 'lucide-vue-next';
import Toast from './components/Toast.vue';
import SplashScreen from './components/SplashScreen.vue'; // Import the Splash Screen
import { provideToast } from './composables/useToast';

const authStore = useAuthStore();
const { toastRef } = provideToast();

// Loading state para sa Splash Screen
const isLoading = ref(true);

const showSessionWarning = ref(false);
let warningTimeout = null;

// Theme detection
const isDarkMode = computed(() => {
  return document.documentElement.classList.contains('dark');
});

const themeClass = computed(() => 
  isDarkMode.value ? 'text-white' : 'bg-gray-100 text-gray-900'
);

const themeStyle = computed(() => 
  isDarkMode.value ? { backgroundColor: '#232323' } : {}
);

// Apply theme globally
const applyTheme = (theme) => {
  const html = document.documentElement;
  html.classList.remove('dark', 'light');

  if (theme === 'dark') {
    html.classList.add('dark');
  } else if (theme === 'light') {
    html.classList.add('light');
  } else if (theme === 'auto') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    html.classList.add(prefersDark ? 'dark' : 'light');
  }
  localStorage.setItem('appTheme', theme);
};

// Session warning handlers
const extendSession = () => {
  showSessionWarning.value = false;
  authStore.updateLastActivity();
  resetWarningTimer();
};

const logoutNow = () => {
  showSessionWarning.value = false;
  authStore.logout();
};

const resetWarningTimer = () => {
  if (warningTimeout) clearTimeout(warningTimeout);
  
  warningTimeout = setTimeout(() => {
    if (authStore.isAuthenticated) {
      showSessionWarning.value = true;
    }
  }, 25 * 60 * 1000); // 25 minutes
};

onMounted(() => {
  // Theme initialization
  const savedTheme = localStorage.getItem('appTheme');
  if (savedTheme) {
    applyTheme(savedTheme);
  }

  // Session management initialization
  if (authStore.isAuthenticated) {
    resetWarningTimer();
  }

  window.addEventListener('session-warning', () => {
    showSessionWarning.value = true;
  });

  // Global activity listener
  const events = ['click', 'keydown', 'scroll', 'touchstart'];
  const handleActivity = () => {
    if (authStore.isAuthenticated) {
      authStore.updateLastActivity();
      if (showSessionWarning.value) showSessionWarning.value = false;
      resetWarningTimer();
    }
  };

  events.forEach(event => document.addEventListener(event, handleActivity));

  // --- SPLASH SCREEN TIMEOUT ---
  // Dito natin papatayin ang loading state. 
  // Pwedeng taasan ang delay kung gusto mong mas matagal makita ang logo.
  setTimeout(() => {
    isLoading.value = false;
  }, 1500);

  onUnmounted(() => {
    events.forEach(event => document.removeEventListener(event, handleActivity));
    if (warningTimeout) clearTimeout(warningTimeout);
  });
});
</script>

<style>
/* Smooth transition para sa paglitaw ng main content */
.animate-fade-in {
  animation: fadeInApp 0.6s ease-out forwards;
}

@keyframes fadeInApp {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Siguraduhin na hindi pwedeng mag-scroll habang loading */
body:has(.fixed.z-100) {
  overflow: hidden;
}
</style> 