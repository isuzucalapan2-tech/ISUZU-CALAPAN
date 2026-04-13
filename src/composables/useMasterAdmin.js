import { ref, computed } from 'vue'
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  writeBatch,
  Timestamp 
} from 'firebase/firestore'
import { 
  reauthenticateWithCredential, 
  EmailAuthProvider,
  updatePassword
} from 'firebase/auth'
import { db, auth } from '../Firebase/Firebase'
import { useAuthStore } from '../stores/auth'

// Master Admin role identifiers
const MASTER_ADMIN_ROLES = ['Master Admin', 'isuzu&calapan&master&admin101']

// Default role after demotion
const DEFAULT_ROLE_AFTER_DEMOTION = 'Staff'
const DEFAULT_POSITION_AFTER_DEMOTION = 'Staff'

// Default permissions after demotion (only canView: true)
const DEFAULT_PERMISSIONS_AFTER_DEMOTION = {
  canView: true,
  canCreate: false,
  canEdit: false,
  canDelete: false
}

export function useMasterAdmin() {
  const authStore = useAuthStore()
  
  // State
  const masterAdminCount = ref(0)
  const masterAdmins = ref([])
  const multipleMasterAdminsWarning = ref(false)
  const loading = ref(false)
  const error = ref(null)
  const transferSuccess = ref(false)

  // Getters
  const isMasterAdmin = computed(() => {
    if (!authStore.user?.uid) return false
    const userRole = authStore.userProfile?.role || authStore.userRole
    return MASTER_ADMIN_ROLES.includes(userRole)
  })

  const currentUserIsMasterAdmin = computed(() => {
    return isMasterAdmin.value
  })

  const hasMultipleMasterAdmins = computed(() => {
    return masterAdminCount.value > 1
  })

  // Check if a user is Master Admin by role
  const checkIsMasterAdmin = (role) => {
    return MASTER_ADMIN_ROLES.includes(role)
  }

  // Get Master Admin count and list
  const getMasterAdminCount = async () => {
    loading.value = true
    error.value = null
    
    try {
      // Query all users with Master Admin roles from Roles subcollection
      const adminsRef = collection(db, 'Administrator')
      const adminsSnapshot = await getDocs(adminsRef)
      
      const masterAdminList = []
      
      for (const adminDoc of adminsSnapshot.docs) {
        const adminId = adminDoc.id
        const adminData = adminDoc.data()
        
        // Check the Roles subcollection
        const roleDocRef = doc(db, 'Administrator', adminId, 'Roles', 'Default_Roles')
        const roleDoc = await getDoc(roleDocRef)
        
        if (roleDoc.exists()) {
          const roleData = roleDoc.data()
          const role = roleData.role || ''
          
          if (checkIsMasterAdmin(role)) {
            masterAdminList.push({
              id: adminId,
              ...adminData,
              role: role,
              position: roleData.position || '',
              permissionMap: roleData.permissionMap || {}
            })
          }
        }
      }
      
      masterAdmins.value = masterAdminList
      masterAdminCount.value = masterAdminList.length
      multipleMasterAdminsWarning.value = masterAdminList.length > 1
      
      return {
        count: masterAdminList.length,
        masterAdmins: masterAdminList,
        hasMultiple: masterAdminList.length > 1
      }
    } catch (err) {
      console.error('Error getting Master Admin count:', err)
      error.value = err.message
      return { count: 0, masterAdmins: [], hasMultiple: false }
    } finally {
      loading.value = false
    }
  }

  // Check for multiple Master Admins (to be called on app init and navigation)
  const checkMultipleMasterAdmins = async () => {
    const result = await getMasterAdminCount()
    return result.hasMultiple
  }

  // Verify current user's password
  const verifyPassword = async (password) => {
    try {
      const user = auth.currentUser
      
      // Check if user is logged in
      if (!user) {
        console.error('verifyPassword: No user is currently logged in')
        return { 
          success: false, 
          error: 'Session expired. Please log in again.',
          code: 'auth/no-user'
        }
      }
      
      // Check if user email exists
      if (!user.email) {
        console.error('verifyPassword: Current user has no email')
        return { 
          success: false, 
          error: 'User email not found. Please log in again.',
          code: 'auth/no-email'
        }
      }
      
      console.log('verifyPassword: Attempting to reauthenticate user:', user.email)
      
      const credential = EmailAuthProvider.credential(user.email, password)
      await reauthenticateWithCredential(user, credential)
      
      console.log('verifyPassword: Reauthentication successful')
      return { success: true }
    } catch (err) {
      console.error('Password verification failed:', err)
      console.error('Error code:', err.code)
      console.error('Error message:', err.message)
      
      // Handle specific Firebase auth error codes
      let errorMessage = 'Verification failed. Please try again.'
      let errorCode = err.code || 'auth/unknown'
      
      switch (err.code) {
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password. Please check your password and try again.'
          break
        case 'auth/invalid-credential':
          errorMessage = 'Invalid credentials. Your session may have expired. Please log in again.'
          break
        case 'auth/user-not-found':
          errorMessage = 'User not found. Please log in again.'
          break
        case 'auth/user-disabled':
          errorMessage = 'Your account has been disabled. Please contact support.'
          break
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later.'
          break
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your internet connection.'
          break
        case 'auth/invalid-email':
          errorMessage = 'Invalid email format.'
          break
        case 'auth/requires-recent-login':
          errorMessage = 'This action requires recent authentication. Please log in again.'
          break
        default:
          // Log unknown errors for debugging
          console.error('Unknown auth error:', err)
      }
      
      return { 
        success: false, 
        error: errorMessage,
        code: errorCode
      }
    }
  }

  // Transfer Master Admin privileges to another user
  const transferMasterAdmin = async (targetUserId, currentPassword) => {
    loading.value = true
    error.value = null
    transferSuccess.value = false
    
    try {
      // 1. Verify current user is Master Admin
      if (!isMasterAdmin.value) {
        throw new Error('Only Master Admin can transfer privileges')
      }

      // 2. Verify current user's password
      const verifyResult = await verifyPassword(currentPassword)
      if (!verifyResult.success) {
        throw new Error(verifyResult.error)
      }

      // 3. Get target user's current role data
      const targetRoleDocRef = doc(db, 'Administrator', targetUserId, 'Roles', 'Default_Roles')
      const targetRoleDoc = await getDoc(targetRoleDocRef)
      
      if (!targetRoleDoc.exists()) {
        throw new Error('Target user role data not found')
      }

      const targetRoleData = targetRoleDoc.data()
      
      // 4. Get current user's data for demotion
      const currentUserId = authStore.user.uid
      const currentRoleDocRef = doc(db, 'Administrator', currentUserId, 'Roles', 'Default_Roles')
      const currentRoleDoc = await getDoc(currentRoleDocRef)
      
      if (!currentRoleDoc.exists()) {
        throw new Error('Current user role data not found')
      }

      // 5. Use batch write for atomic operation
      const batch = writeBatch(db)
      
      // Promote target user to Master Admin with default position
      batch.update(targetRoleDocRef, {
        role: 'Master Admin',
        position: 'Staff', // Default position for new Master Admin
        previousRole: targetRoleData.role, // Store previous role for rollback if needed
        previousPosition: targetRoleData.position,
        promotedAt: Timestamp.now(),
        promotedBy: currentUserId
      })
      
      // Demote current user to Staff role with limited permissions
      batch.update(currentRoleDocRef, {
        role: DEFAULT_ROLE_AFTER_DEMOTION,
        position: DEFAULT_POSITION_AFTER_DEMOTION,
        permissionMap: DEFAULT_PERMISSIONS_AFTER_DEMOTION,
        previousRole: 'Master Admin',
        demotedAt: Timestamp.now(),
        demotedBy: 'self-transfer'
      })
      
      // Commit the batch
      await batch.commit()
      
      // Update local state
      transferSuccess.value = true
      
      return { 
        success: true, 
        message: 'Master Admin privileges transferred successfully. You have been demoted to Staff role with view-only permissions.' 
      }
    } catch (err) {
      console.error('Transfer failed:', err)
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // Demote current Master Admin to default role (used after transfer)
  const demoteToDefaultRole = async () => {
    try {
      if (!isMasterAdmin.value) {
        throw new Error('User is not Master Admin')
      }

      const currentUserId = authStore.user.uid
      const currentRoleDocRef = doc(db, 'Administrator', currentUserId, 'Roles', 'Default_Roles')
      
      await updateDoc(currentRoleDocRef, {
        role: DEFAULT_ROLE_AFTER_DEMOTION,
        position: DEFAULT_POSITION_AFTER_DEMOTION,
        permissionMap: DEFAULT_PERMISSIONS_AFTER_DEMOTION,
        demotedAt: Timestamp.now()
      })

      return { success: true }
    } catch (err) {
      console.error('Demotion failed:', err)
      return { success: false, error: err.message }
    }
  }

  // Force demote a specific user (emergency use)
  const forceDemoteUser = async (userId) => {
    try {
      // Only Master Admin can force demote
      if (!isMasterAdmin.value) {
        throw new Error('Only Master Admin can force demote users')
      }

      const roleDocRef = doc(db, 'Administrator', userId, 'Roles', 'Default_Roles')
      const roleDoc = await getDoc(roleDocRef)
      
      if (!roleDoc.exists()) {
        throw new Error('User role data not found')
      }

      const roleData = roleDoc.data()
      
      // Only demote if user is Master Admin
      if (!checkIsMasterAdmin(roleData.role)) {
        throw new Error('User is not Master Admin')
      }

      await updateDoc(roleDocRef, {
        role: DEFAULT_ROLE_AFTER_DEMOTION,
        position: DEFAULT_POSITION_AFTER_DEMOTION,
        permissionMap: DEFAULT_PERMISSIONS_AFTER_DEMOTION,
        demotedAt: Timestamp.now(),
        demotedBy: authStore.user.uid,
        demotionReason: 'Force demoted by Master Admin'
      })

      return { success: true }
    } catch (err) {
      console.error('Force demote failed:', err)
      return { success: false, error: err.message }
    }
  }

  // Get eligible users for Master Admin transfer (exclude current user and existing Master Admins)
  const getEligibleTransferTargets = async () => {
    try {
      const adminsRef = collection(db, 'Administrator')
      const adminsSnapshot = await getDocs(adminsRef)
      
      const eligibleUsers = []
      const currentUserId = authStore.user.uid
      
      for (const adminDoc of adminsSnapshot.docs) {
        const adminId = adminDoc.id
        
        // Skip current user
        if (adminId === currentUserId) continue
        
        const adminData = adminDoc.data()
        
        // Check role
        const roleDocRef = doc(db, 'Administrator', adminId, 'Roles', 'Default_Roles')
        const roleDoc = await getDoc(roleDocRef)
        
        if (roleDoc.exists()) {
          const roleData = roleDoc.data()
          const role = roleData.role || ''
          
          // Skip existing Master Admins
          if (checkIsMasterAdmin(role)) continue
          
          // Skip inactive users
          if (adminData.Status !== 'Active') continue
          
          eligibleUsers.push({
            id: adminId,
            firstName: adminData.firstName || '',
            lastName: adminData.lastName || '',
            email: adminData.email || '',
            username: adminData.username || '',
            currentRole: role,
            currentPosition: roleData.position || ''
          })
        }
      }
      
      return eligibleUsers
    } catch (err) {
      console.error('Error getting eligible users:', err)
      return []
    }
  }

  // Monitor Master Admin count in real-time (optional enhancement)
  const startMasterAdminMonitoring = (callback) => {
    // Initial check
    checkMultipleMasterAdmins().then(hasMultiple => {
      if (callback) callback(hasMultiple)
    })
    
    // Set up interval for periodic checks (every 30 seconds)
    const intervalId = setInterval(async () => {
      const hasMultiple = await checkMultipleMasterAdmins()
      if (callback) callback(hasMultiple)
    }, 30000)
    
    // Return cleanup function
    return () => clearInterval(intervalId)
  }

  return {
    // State
    masterAdminCount,
    masterAdmins,
    multipleMasterAdminsWarning,
    loading,
    error,
    transferSuccess,
    
    // Getters
    isMasterAdmin,
    currentUserIsMasterAdmin,
    hasMultipleMasterAdmins,
    
    // Methods
    getMasterAdminCount,
    checkMultipleMasterAdmins,
    checkMasterAdminCount: getMasterAdminCount, // Alias for UserManagement.vue compatibility
    verifyPassword,
    transferMasterAdmin,
    demoteToDefaultRole,
    forceDemoteUser,
    getEligibleTransferTargets,
    checkIsMasterAdmin,
    startMasterAdminMonitoring
  }
}
