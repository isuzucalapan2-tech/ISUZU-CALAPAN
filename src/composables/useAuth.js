import { computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

export function useAuth() {
  const authStore = useAuthStore()
  const router = useRouter()

  // Computed properties for easy access
  const user = computed(() => authStore.user)
  const userRole = computed(() => authStore.userRole)
  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const isLoading = computed(() => authStore.isLoading)
  const authError = computed(() => authStore.authError)
  const isAdmin = computed(() => authStore.isAdmin)
  const isManager = computed(() => authStore.isManager)
  const isUser = computed(() => authStore.isUser)

  // Activity monitoring
  let activityInterval = null
  let inactivityTimeout = null
  const INACTIVITY_LIMIT = 30 * 60 * 1000 // 30 minutes
  const WARNING_BEFORE = 5 * 60 * 1000 // 5 minutes warning

  const startActivityMonitoring = () => {
    // Update activity on user interactions
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart']
    const updateActivity = () => {
      authStore.updateLastActivity()
      resetInactivityTimer()
    }

    events.forEach(event => {
      document.addEventListener(event, updateActivity)
    })

    // Check session periodically
    activityInterval = setInterval(() => {
      if (authStore.isAuthenticated) {
        const isTimedOut = authStore.checkSessionTimeout()
        if (isTimedOut) {
          router.push({ 
            name: 'Login', 
            query: { session: 'expired', reason: 'inactivity' } 
          })
        }
      }
    }, 60000) // Check every minute

    // Cleanup function
    onUnmounted(() => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity)
      })
      if (activityInterval) clearInterval(activityInterval)
      if (inactivityTimeout) clearTimeout(inactivityTimeout)
    })
  }

  const resetInactivityTimer = () => {
    if (inactivityTimeout) clearTimeout(inactivityTimeout)
    
    inactivityTimeout = setTimeout(() => {
      // Show warning before logout
      showSessionWarning()
    }, INACTIVITY_LIMIT - WARNING_BEFORE)
  }

  const showSessionWarning = () => {
    // Emit event or use a global notification system
    window.dispatchEvent(new CustomEvent('session-warning', {
      detail: { 
        message: 'Your session will expire in 5 minutes due to inactivity. Click anywhere to extend.',
        timeout: WARNING_BEFORE
      }
    }))
  }

  const login = async (email, password, rememberMe = false) => {
    const result = await authStore.login(email, password, rememberMe)
    if (result.success) {
      startActivityMonitoring()
    }
    return result
  }

  const logout = async () => {
    const result = await authStore.logout()
    if (activityInterval) clearInterval(activityInterval)
    if (inactivityTimeout) clearTimeout(inactivityTimeout)
    router.push({ name: 'Login' })
    return result
  }

  const requireAuth = (allowedRoles = null) => {
    if (!isAuthenticated.value) {
      router.push({ 
        name: 'Login', 
        query: { redirect: router.currentRoute.value.fullPath } 
      })
      return false
    }

    if (allowedRoles && !authStore.canAccess(allowedRoles)) {
      router.push({ name: 'Dashboard' }) // Or access denied page
      return false
    }

    return true
  }

  const checkPermission = (permission) => {
    // Extend this based on your permission system
    const permissions = {
      admin: ['create', 'read', 'update', 'delete', 'manage_users'],
      manager: ['create', 'read', 'update', 'delete'],
      user: ['read']
    }
    
    const userPermissions = permissions[userRole.value] || []
    return userPermissions.includes(permission)
  }

  onMounted(() => {
    if (isAuthenticated.value) {
      startActivityMonitoring()
    }
  })

  return {
    // State
    user,
    userRole,
    isAuthenticated,
    isLoading,
    authError,
    isAdmin,
    isManager,
    isUser,
    // Methods
    login,
    logout,
    requireAuth,
    checkPermission,
    startActivityMonitoring,
    resendVerification: authStore.resendVerification,
    initializeAuth: authStore.initializeAuth
  }
}
