import { ref, provide, inject } from 'vue'

const ToastSymbol = Symbol('toast')

export function provideToast() {
  const toastRef = ref(null)
  
  const toast = {
    success: (message, title = '', duration = 5000) => {
      return toastRef.value?.addToast({ type: 'success', message, title, duration })
    },
    error: (message, title = '', duration = 5000) => {
      return toastRef.value?.addToast({ type: 'error', message, title, duration })
    },
    warning: (message, title = '', duration = 5000) => {
      return toastRef.value?.addToast({ type: 'warning', message, title, duration })
    },
    info: (message, title = '', duration = 5000) => {
      return toastRef.value?.addToast({ type: 'info', message, title, duration })
    }
  }
  
  provide(ToastSymbol, toast)
  
  return { toastRef, toast }
}

export function useToast() {
  const toast = inject(ToastSymbol)
  if (!toast) {
    console.warn('useToast() called without provider. Make sure to call provideToast() in a parent component.')
    return {
      success: () => {},
      error: () => {},
      warning: () => {},
      info: () => {}
    }
  }
  return toast
}
