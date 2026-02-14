<template>
  <div id="app" :class="themeClass" :style="themeStyle">
    <!-- Session Warning Modal -->
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

    <!-- Main Router View -->
    <router-view></router-view>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue';
import { useAuthStore } from './stores/auth';
import { AlertTriangleIcon } from 'lucide-vue-next';

const authStore = useAuthStore();
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
    if (prefersDark) {
      html.classList.add('dark');
    } else {
      html.classList.add('light');
    }
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
  
  // Show warning 5 minutes before 30-minute timeout
  warningTimeout = setTimeout(() => {
    if (authStore.isAuthenticated) {
      showSessionWarning.value = true;
    }
  }, 25 * 60 * 1000); // 25 minutes
};

// Listen for session warning events from composable
onMounted(() => {
  const savedTheme = localStorage.getItem('appTheme');
  if (savedTheme) {
    applyTheme(savedTheme);
  }

  // Start session warning timer if authenticated
  if (authStore.isAuthenticated) {
    resetWarningTimer();
  }

  // Listen for custom session warning event
  window.addEventListener('session-warning', (event) => {
    showSessionWarning.value = true;
  });

  // Update activity on user interaction
  const events = ['click', 'keydown', 'scroll', 'touchstart'];
  const handleActivity = () => {
    if (authStore.isAuthenticated) {
      authStore.updateLastActivity();
      if (showSessionWarning.value) {
        showSessionWarning.value = false;
      }
      resetWarningTimer();
    }
  };

  events.forEach(event => {
    document.addEventListener(event, handleActivity);
  });

  // Cleanup
  onUnmounted(() => {
    events.forEach(event => {
      document.removeEventListener(event, handleActivity);
    });
    if (warningTimeout) clearTimeout(warningTimeout);
  });
});
</script>

<style>
/* Global styles for session management */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
