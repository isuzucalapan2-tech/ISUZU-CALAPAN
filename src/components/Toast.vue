<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg min-w-[300px] max-w-[400px] transform transition-all duration-300"
          :class="getToastClass(toast.type)"
        >
          <!-- Icon -->
          <div class="flex-shrink-0">
            <CheckCircle v-if="toast.type === 'success'" class="w-5 h-5" />
            <AlertCircle v-else-if="toast.type === 'error'" class="w-5 h-5" />
            <Info v-else-if="toast.type === 'info'" class="w-5 h-5" />
            <AlertTriangle v-else-if="toast.type === 'warning'" class="w-5 h-5" />
          </div>

          <!-- Content -->
          <div class="flex-1">
            <p v-if="toast.title" class="font-semibold text-sm">{{ toast.title }}</p>
            <p class="text-sm" :class="toast.title ? 'text-xs opacity-90' : ''">{{ toast.message }}</p>
          </div>

          <!-- Close Button -->
          <button
            @click="removeToast(toast.id)"
            class="flex-shrink-0 p-1 hover:bg-black/10 rounded transition-colors"
          >
            <X class="w-4 h-4" />
          </button>

          <!-- Progress Bar -->
          <div
            v-if="toast.duration > 0"
            class="absolute bottom-0 left-0 h-1 bg-black/20 rounded-b-lg transition-all duration-100"
            :style="{ width: `${toast.progress}%` }"
          ></div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-vue-next'

const toasts = ref([])
let toastId = 0
let intervals = new Map()

const getToastClass = (type) => {
  const baseClasses = 'relative overflow-hidden'
  switch (type) {
    case 'success':
      return `${baseClasses} bg-green-500 text-white border border-green-600`
    case 'error':
      return `${baseClasses} bg-red-500 text-white border border-red-600`
    case 'warning':
      return `${baseClasses} bg-yellow-500 text-white border border-yellow-600`
    case 'info':
      return `${baseClasses} bg-blue-500 text-white border border-blue-600`
    default:
      return `${baseClasses} bg-gray-800 text-white border border-gray-900`
  }
}

const addToast = (options) => {
  const id = ++toastId
  const duration = options.duration ?? 5000
  
  const toast = {
    id,
    type: options.type || 'info',
    title: options.title || '',
    message: options.message,
    duration,
    progress: 100
  }
  
  toasts.value.push(toast)
  
  if (duration > 0) {
    const interval = setInterval(() => {
      toast.progress -= (100 / (duration / 100))
      if (toast.progress <= 0) {
        removeToast(id)
      }
    }, 100)
    
    intervals.set(id, interval)
  }
  
  return id
}

const removeToast = (id) => {
  const index = toasts.value.findIndex(t => t.id === id)
  if (index > -1) {
    toasts.value.splice(index, 1)
    if (intervals.has(id)) {
      clearInterval(intervals.get(id))
      intervals.delete(id)
    }
  }
}

// Expose methods to be used by the composable
defineExpose({
  addToast,
  removeToast
})
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
