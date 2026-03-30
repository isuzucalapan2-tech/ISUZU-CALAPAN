<template>
  <div class="admin-parent">
    
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p class="mt-4 font-bold text-neutral-600 tracking-widest uppercase text-xs">Initializing System...</p>
      </div>
    </div>

    <template v-else-if="isAuthenticated">
      <Sidebar />
    </template>

    <div v-else class="flex items-center justify-center h-screen bg-neutral-100">
       <p>Redirecting to login...</p>
    </div>

  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, watchEffect } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useRouter } from 'vue-router'
import Sidebar from '@/components/Sidebar.vue'

const authStore = useAuthStore()
const router = useRouter()

const isLoading = computed(() => authStore.isLoading)
const isAuthenticated = computed(() => authStore.isAuthenticated)

// Monitor activity to prevent session timeout
const updateActivity = () => {
  if (isAuthenticated.value) {
    authStore.updateLastActivity()
  }
}

// Redirect if not authenticated (Security Layer)
watchEffect(() => {
  if (!isLoading.value && !isAuthenticated.value) {
    router.push('/login')
  }
})

onMounted(() => {
  // Listeners para sa auto-logout or activity tracking
  window.addEventListener('click', updateActivity)
  window.addEventListener('keydown', updateActivity)
  window.addEventListener('scroll', updateActivity)
  window.addEventListener('mousemove', updateActivity)
})

onUnmounted(() => {
  window.removeEventListener('click', updateActivity)
  window.removeEventListener('keydown', updateActivity)
  window.removeEventListener('scroll', updateActivity)
  window.removeEventListener('mousemove', updateActivity)
})
</script>

<style scoped>
.admin-parent {
  min-height: 100vh;
  min-height: 100dvh; /* Dynamic viewport height for mobile browsers */
  width: 100%;
  overflow: hidden;
}

.loading-overlay { 
  position: fixed; 
  inset: 0; 
  background: #ffffff; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  z-index: 9999; 
}

.loading-spinner {
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #ef4444; /* Isuzu Red */
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>