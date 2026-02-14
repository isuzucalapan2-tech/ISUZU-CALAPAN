import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut,
  sendEmailVerification,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from 'firebase/auth'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { auth, db } from '../Firebase/Firebase'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const userRole = ref(null)
  const userProfile = ref(null)
  const isAuthenticated = ref(false)
  const isLoading = ref(true)
  const authError = ref(null)
  const sessionExpiry = ref(null)
  const lastActivity = ref(Date.now())

  // Getters
  const isAdmin = computed(() => userRole.value === 'admin')
  const isManager = computed(() => userRole.value === 'manager')
  const isUser = computed(() => userRole.value === 'user')
  const hasRole = (role) => userRole.value === role
  const canAccess = (allowedRoles) => {
    if (!Array.isArray(allowedRoles)) return userRole.value === allowedRoles
    return allowedRoles.includes(userRole.value)
  }
  const isSessionValid = computed(() => {
    if (!sessionExpiry.value) return true
    return Date.now() < sessionExpiry.value
  })

  // Actions
  const initializeAuth = () => {
    return new Promise((resolve) => {
      onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser && firebaseUser.emailVerified) {
          // Only authenticate if email is verified
          user.value = firebaseUser
          isAuthenticated.value = true
          lastActivity.value = Date.now()
          
          // Fetch user profile and role from Firestore
          await fetchUserProfile(firebaseUser.uid)
          
          // Set session expiry (e.g., 8 hours from login)
          sessionExpiry.value = Date.now() + (8 * 60 * 60 * 1000)
        } else if (firebaseUser && !firebaseUser.emailVerified) {
          // User exists but email not verified - don't authenticate
          user.value = firebaseUser
          isAuthenticated.value = false
          userRole.value = null
        } else {
          resetAuth()
        }
        isLoading.value = false
        resolve(firebaseUser)
      })
    })
  }


  const fetchUserProfile = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, 'Administrator', uid))
      if (userDoc.exists()) {
        userProfile.value = userDoc.data()
        userRole.value = userDoc.data().role
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }


  const login = async (email, password, rememberMe = false) => {
    authError.value = null
    try {
      // Set persistence based on remember me
      const persistence = rememberMe ? browserLocalPersistence : browserSessionPersistence
      await setPersistence(auth, persistence)
      
      const credential = await signInWithEmailAndPassword(auth, email, password)
      
      if (!credential.user.emailVerified) {
        throw new Error('Email not verified')
      }
      
      // Update last login
      await updateDoc(doc(db, 'Administrator', credential.user.uid), {
        lastLogin: new Date().toISOString()
      }).catch(() => {
        // Ignore if document doesn't exist
      })
      
      lastActivity.value = Date.now()
      sessionExpiry.value = Date.now() + (8 * 60 * 60 * 1000)
      
      return { success: true, user: credential.user }
    } catch (error) {
      authError.value = getErrorMessage(error.code || error.message)
      return { success: false, error: authError.value }
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      resetAuth()
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const resendVerification = async () => {
    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser)
        return { success: true }
      }
      return { success: false, error: 'No user logged in' }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const updateLastActivity = () => {
    lastActivity.value = Date.now()
  }

  const checkSessionTimeout = () => {
    const inactiveTime = Date.now() - lastActivity.value
    const timeoutDuration = 30 * 60 * 1000 // 30 minutes
    
    if (inactiveTime > timeoutDuration) {
      logout()
      return true
    }
    return false
  }

  const resetAuth = () => {
    user.value = null
    userRole.value = null
    userProfile.value = null
    isAuthenticated.value = false
    sessionExpiry.value = null
    authError.value = null
  }

  const getErrorMessage = (code) => {
    const errorMessages = {
      'auth/user-not-found': 'Account not found.',
      'auth/wrong-password': 'Wrong password.',
      'auth/invalid-email': 'Invalid email address.',
      'auth/user-disabled': 'Account has been disabled.',
      'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
      'auth/invalid-credential': 'Invalid email or password.',
      'Email not verified': 'Please verify your email first.'
    }
    return errorMessages[code] || 'Login failed. Please try again.'
  }

  return {
    // State
    user,
    userRole,
    userProfile,
    isAuthenticated,
    isLoading,
    authError,
    sessionExpiry,
    lastActivity,
    // Getters
    isAdmin,
    isManager,
    isUser,
    hasRole,
    canAccess,
    isSessionValid,
    // Actions
    initializeAuth,
    login,
    logout,
    resendVerification,
    updateLastActivity,
    checkSessionTimeout,
    fetchUserProfile
  }
})
