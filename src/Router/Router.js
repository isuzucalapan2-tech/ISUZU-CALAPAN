import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../Firebase/Firebase'

// Master Admin role identifiers
const MASTER_ADMIN_ROLES = ['Master Admin', 'isuzu&calapan&master&admin101']

// Global state for multiple Master Admin warning
let multipleMasterAdminsWarning = false
let masterAdminCheckPromise = null

// Check Master Admin count across all users
const checkMasterAdminCount = async () => {
  // Return cached promise if already checking
  if (masterAdminCheckPromise) {
    return masterAdminCheckPromise
  }
  
  masterAdminCheckPromise = (async () => {
    try {
      const adminsRef = collection(db, 'Administrator')
      const adminsSnapshot = await getDocs(adminsRef)
      
      let masterAdminCount = 0
      
      for (const adminDoc of adminsSnapshot.docs) {
        const adminId = adminDoc.id
        const roleDocRef = doc(db, 'Administrator', adminId, 'Roles', 'Default_Roles')
        const roleDoc = await getDoc(roleDocRef)
        
        if (roleDoc.exists()) {
          const roleData = roleDoc.data()
          if (MASTER_ADMIN_ROLES.includes(roleData.role)) {
            masterAdminCount++
          }
        }
      }
      
      multipleMasterAdminsWarning = masterAdminCount > 1
      return { count: masterAdminCount, hasMultiple: masterAdminCount > 1 }
    } catch (err) {
      console.error('Error checking Master Admin count:', err)
      return { count: 0, hasMultiple: false }
    } finally {
      // Reset promise after 5 seconds to allow future checks
      setTimeout(() => {
        masterAdminCheckPromise = null
      }, 5000)
    }
  })()
  
  return masterAdminCheckPromise
}

// Export function to check warning state
export const hasMultipleMasterAdmins = () => multipleMasterAdminsWarning

// Export function to manually refresh check
export const refreshMasterAdminCheck = () => {
  masterAdminCheckPromise = null
  return checkMasterAdminCount()
}

import LandingPage from '../Pages/LandingPage.vue'
import Login from '../Pages/Login.vue'
import Register from '../Pages/Register.vue'
import ForgotPassword from '../Pages/ForgotPassword.vue'
import AdminParent from '../Pages/Admin/AdminParent.vue'
import Dashboard from '../Pages/Admin/Dashboard.vue'
import Approve from '../Pages/Admin/Approve.vue'
import Setting from '../Pages/Admin/Setting.vue'
import Inventory from '../Pages/Admin/Inventory.vue'
import UserManagement from '../Pages/Admin/UserManagement.vue'
import SA_Rotation from '../Pages/AfterSales/SA_Rotation.vue'
import PageControl from '../Pages/Admin/PageControl.vue'
import TransactionIn from '../Pages/Admin/TransactionIn.vue'
import TransactionOut from '../Pages/Admin/TransactionOut.vue'
import IsuzuDTR from '../Pages/ISUZU-DTR/IsuzuDTR.vue'
import Unauthorized from '../Pages/401Page.vue'
import Forbidden from '../Pages/403Page.vue'
import NotFound from '../Pages/404Page.vue'
import Test from '../Pages/Test.vue'

const routes = [
  { 
    path: '/', 
    name: 'LandingPage', 
    component: LandingPage,
    meta: { requiresGuest: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresGuest: true }
  },
  { 
    path: '/register', 
    name: 'Register', 
    component: Register,
    meta: { requiresGuest: true }
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: ForgotPassword,
    meta: { requiresGuest: true }
  },
  { 
    path: '/test', 
    name: 'Test', 
    component: Test
  },
  {
    path: '/admin',
    component: AdminParent,
    meta: { requiresAuth: true },
    children: [
      { 
        path: 'dashboard', 
        name: 'Dashboard', 
        component: Dashboard,
        meta: { requiresAuth: true, pageId: 'dashboard' }
      },
      { 
        path: 'approve', 
        name: 'Approve', 
        component: Approve,
        meta: { requiresAuth: true, pageId: 'approve' }
      },
      { 
        path: 'settings', 
        name: 'Settings', 
        component: Setting,
        meta: { requiresAuth: true, pageId: 'settings' }
      },
      { 
        path: 'inventory',
        name: 'Inventory', 
        component: Inventory,
        meta: { requiresAuth: true, pageId: 'inventory' }
      },
      { 
        path: 'user-management', 
        name: 'UserManagement', 
        component: UserManagement,
        meta: { requiresAuth: true, pageId: 'user-management' }
      },
      { 
        path: 'sa-rotation', 
        name: 'SA_Rotation', 
        component: SA_Rotation,
        meta: { requiresAuth: true, pageId: 'sa-rotation' }
      },
      { 
        path: 'transaction-in', 
        name: 'TransactionIn', 
        component: TransactionIn,
        meta: { requiresAuth: true, pageId: 'transaction-in' }
      },
      { 
        path: 'transaction-out', 
        name: 'TransactionOut', 
        component: TransactionOut,
        meta: { requiresAuth: true, pageId: 'transaction-out' }
      },
      { 
        path: 'page-control', 
        name: 'PageControl', 
        component: PageControl,
        meta: { 
          requiresAuth: true, 
          pageId: 'page-control',
          requiresMasterAdmin: true 
        }
      },
      { 
        path: 'isuzu-dtr', 
        name: 'IsuzuDTR', 
        component: IsuzuDTR,
        meta: { requiresAuth: true, pageId: 'isuzu-dtr' }
      },
    ]
  },
  // --- Error Routes ---
  {
    path: '/unauthorized',
    name: 'Unauthorized',
    component: Unauthorized
  },
  {
    path: '/forbidden',
    name: 'Forbidden',
    component: Forbidden
  },
  // --- 404 CATCH-ALL ---
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (authStore.isLoading) {
    const checkAuth = setInterval(() => {
      if (!authStore.isLoading) {
        clearInterval(checkAuth)
        handleNavigation(to, from, next, authStore)
      }
    }, 100)
    return
  }
  
  handleNavigation(to, from, next, authStore)
})

async function checkPageAccess(pageId, userId) {
  try {
    // Get user's role and position from Default_Roles
    const roleDoc = await getDoc(doc(db, 'Administrator', userId, 'Roles', 'Default_Roles'))
    if (!roleDoc.exists()) return false
    
    const userRoles = roleDoc.data()
    const userRole = userRoles.role
    const userPosition = userRoles.position
    
    // Check if Master Admin - always has access
    if (MASTER_ADMIN_ROLES.includes(userRole)) {
      return true
    }
    
    // Check Page_Access collection (new simplified structure)
    const docId = `${userRole}_${userPosition}_${pageId}`
    const pageAccessDoc = await getDoc(doc(db, 'Page_Access', docId))
    
    if (pageAccessDoc.exists()) {
      return pageAccessDoc.data().canView === true
    }
    
    // No permissions found - check if there's a default entry in old Page_Control
    // This is for backward compatibility during migration
    const pageDoc = await getDoc(doc(db, 'Page_Control', pageId))
    if (pageDoc.exists()) {
      const config = pageDoc.data()
      const { allowedRoles = [], allowedPositions = [] } = config
      
      if (allowedRoles.includes('All')) return true
      
      const roleMatch = allowedRoles.includes(userRole)
      const positionMatch = allowedPositions.includes(userPosition)
      
      return roleMatch && positionMatch
    }
    
    // No permissions found at all - default to no access (secure by default)
    return false
  } catch (err) {
    console.error('Error checking page access:', err)
    return false
  }
}

async function handleNavigation(to, from, next, authStore) {
  const isAuthenticated = authStore.isAuthenticated

  // 1. Skip checks for Error Pages and NotFound
  if (['NotFound', 'Unauthorized', 'Forbidden'].includes(to.name)) {
    return next()
  }

  // 2. 401 Unauthorized Check
  // Kung kailangan ng auth pero hindi logged in
  if (to.meta.requiresAuth && !isAuthenticated) {
    return next({ name: 'Unauthorized' }) 
    // Note: Pwede ring redirect sa Login, pero since hiningi mo ang 401, dito natin sila itatapon.
  }

  // 3. Guest Route Check (prevent logged in users from seeing login/register)
  if (to.meta.requiresGuest && isAuthenticated) {
    return next({ name: 'Dashboard' })
  }
  
  // 4. RBAC Check (403 Forbidden)
  if (to.meta.requiresAuth && isAuthenticated && to.meta.pageId) {
    const hasAccess = await checkPageAccess(to.meta.pageId, authStore.user.uid)
    if (!hasAccess) {
      return next({ name: 'Forbidden' })
    }
  }
  
  // 5. Master Admin Check (403 Forbidden)
  if (to.meta.requiresMasterAdmin && isAuthenticated) {
    const roleDoc = await getDoc(doc(db, 'Administrator', authStore.user.uid, 'Roles', 'Default_Roles'))
    if (!roleDoc.exists()) {
      return next({ name: 'Forbidden' })
    }
    
    const userRoles = roleDoc.data()
    const isMaster = MASTER_ADMIN_ROLES.includes(userRoles.role)
    
    if (!isMaster) {
      return next({ name: 'Forbidden' })
    }
  }
  
  // 6. Session Timeout Check
  if (isAuthenticated && !authStore.isSessionValid) {
    authStore.logout()
    return next({ 
      name: 'Login', 
      query: { session: 'expired', reason: 'timeout' } 
    })
  }
  
  // 7. Check Master Admin count (for all authenticated routes)
  if (isAuthenticated) {
    // Run check in background (don't block navigation)
    checkMasterAdminCount().then(result => {
      if (result.hasMultiple) {
        console.warn('SYSTEM CRITICAL: Multiple Master Admins detected:', result.count)
        // Emit event for global warning banner
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('master-admin-warning', {
            detail: { count: result.count }
          }))
        }
      }
    }).catch(err => {
      console.error('Failed to check Master Admin count:', err)
    })
  }
  
  next()
}

export default router
