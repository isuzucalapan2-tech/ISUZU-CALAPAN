<template>
  <div class="admin-parent">
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>Loading...</p>
      </div>
    </div>
    
    <!-- Authenticated Content -->
    <template v-else-if="isAuthenticated">
      <Topbar class="sticky-topbar" />
      <div class="admin-content">
        <router-view />
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import Topbar from '@/components/Topbar.vue'

const router = useRouter()
const authStore = useAuthStore()

const isLoading = computed(() => authStore.isLoading)
const isAuthenticated = computed(() => authStore.isAuthenticated)

onMounted(() => {
  // Start activity monitoring for session timeout
  if (isAuthenticated.value) {
    window.addEventListener('click', updateActivity)
    window.addEventListener('keydown', updateActivity)
    window.addEventListener('scroll', updateActivity)
  }
})

const updateActivity = () => {
  authStore.updateLastActivity()
}

// Cleanup
window.removeEventListener('click', updateActivity)
window.removeEventListener('keydown', updateActivity)
window.removeEventListener('scroll', updateActivity)
</script>

<style scoped>
.admin-parent {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.sticky-topbar {
  position: sticky;
  top: 0;
  z-index: 10;
}

.admin-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

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
  z-index: 100;
}

.loading-spinner {
  text-align: center;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
