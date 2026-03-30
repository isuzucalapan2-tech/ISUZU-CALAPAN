import { ref, computed } from 'vue'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../Firebase/Firebase'
import { useAuthStore } from '../stores/auth'

export function usePermissions() {
  const authStore = useAuthStore()
  
  // User roles from Default_Roles subcollection
  const userRoles = ref(null)
  const pageAccess = ref({})
  const loading = ref(false)

  // Permission hierarchy levels
  const PERMISSION_LEVELS = {
    'View': 1,
    'Edit': 2,
    'Create': 3,
    'Delete': 4,
    'All': 5
  }

  // Fetch user's Default_Roles from Firestore
  const fetchUserRoles = async () => {
    if (!authStore.user?.uid) return
    
    loading.value = true
    try {
      const roleDoc = await getDoc(
        doc(db, 'Administrator', authStore.user.uid, 'Roles', 'Default_Roles')
      )
      
      if (roleDoc.exists()) {
        userRoles.value = roleDoc.data()
        // Also update auth store for compatibility
        authStore.userRole = roleDoc.data().role
      }
    } catch (err) {
      console.error('Error fetching user roles:', err)
    } finally {
      loading.value = false
    }
  }

  // Fetch page access configuration from Page_Control
  const fetchPageAccess = async (pageId) => {
    try {
      const pageDoc = await getDoc(doc(db, 'Page_Control', pageId))
      if (pageDoc.exists()) {
        pageAccess.value[pageId] = pageDoc.data()
        return pageDoc.data()
      }
      return null
    } catch (err) {
      console.error('Error fetching page access:', err)
      return null
    }
  }

  // Check if user can access page (based on Role AND Position - BOTH must match)
  const canAccessPage = async (pageId) => {
    if (!userRoles.value) {
      await fetchUserRoles()
    }

    const config = await fetchPageAccess(pageId)
    if (!config) {
      // If no config exists, allow access by default (or restrict for security)
      return true
    }

    const { allowedRoles = [], allowedPositions = [] } = config

    // If "All" is in allowed roles, grant access
    if (allowedRoles.includes('All')) return true

    // Check role match
    const userRole = userRoles.value?.role
    const roleMatch = allowedRoles.includes(userRole)

    // Check position match
    const userPosition = userRoles.value?.position
    const positionMatch = allowedPositions.includes(userPosition)

    // BOTH role AND position must match (AND logic)
    return roleMatch && positionMatch
  }

  // Check if user has specific permission level
  const hasPermission = (requiredLevel) => {
    // First check if permissionMap exists (new structure)
    if (userRoles.value?.permissionMap) {
      const map = userRoles.value.permissionMap
      switch (requiredLevel) {
        case 'View':
          return map.canView === true
        case 'Create':
          return map.canCreate === true
        case 'Edit':
          return map.canEdit === true
        case 'Delete':
          return map.canDelete === true
        case 'All':
          return map.canView === true && map.canCreate === true && 
                 map.canEdit === true && map.canDelete === true
        default:
          return false
      }
    }
    
    // Fallback to old permission structure for backward compatibility
    if (!userRoles.value?.permission) return false
    
    const userLevel = PERMISSION_LEVELS[userRoles.value.permission] || 0
    const required = PERMISSION_LEVELS[requiredLevel] || 0
    
    return userLevel >= required
  }

  // Check if user can perform specific feature on page
  const canPerform = async (pageId, featureName) => {
    // First check page access
    const hasPageAccess = await canAccessPage(pageId)
    if (!hasPageAccess) return false

    // Get page config
    const config = pageAccess.value[pageId] || await fetchPageAccess(pageId)
    if (!config?.features?.[featureName]) {
      // If no specific feature config, check general permission
      return hasPermission('View')
    }

    const requiredPermission = config.features[featureName].minPermission
    return hasPermission(requiredPermission)
  }

  // Get accessible pages for current user
  const getAccessiblePages = async () => {
    const allPages = [
      'dashboard',
      'user-management',
      'approve',
      'inventory',
      'transaction-in',
      'transaction-out',
      'sa-rotation',
      'settings'
    ]
    
    const accessible = []
    for (const pageId of allPages) {
      const canAccess = await canAccessPage(pageId)
      if (canAccess) {
        accessible.push(pageId)
      }
    }
    
    return accessible
  }


  // Computed helpers
  const canView = computed(() => hasPermission('View'))
  const canEdit = computed(() => hasPermission('Edit'))
  const canCreate = computed(() => hasPermission('Create'))
  const canDelete = computed(() => hasPermission('Delete'))
  const canAll = computed(() => hasPermission('All'))

  // Check if Master Admin
  const isMasterAdmin = computed(() => {
    return userRoles.value?.role === 'Master Admin' || 
           userRoles.value?.role === 'isuzu&calapan&master&admin101'
  })

  return {
    userRoles,
    pageAccess,
    loading,
    fetchUserRoles,
    fetchPageAccess,
    canAccessPage,
    hasPermission,
    canPerform,
    getAccessiblePages,
    canView,
    canEdit,
    canCreate,
    canDelete,
    canAll,
    isMasterAdmin
  }
}
