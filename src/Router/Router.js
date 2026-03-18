import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../Firebase/Firebase'

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
import Payroll from '../Pages/Admin/Payroll.vue'
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
        path: 'payroll',
        name: 'Payroll',
        component: Payroll,
        meta: { requiresAuth: true, pageId: 'payroll' }
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
    ]
  },
  // --- 404 CATCH-ALL ROUTE ---
  // Siguraduhin na ito ay laging nasa pinaka-baba ng routes array
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

// Navigation Guard for Authentication
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
    const roleDoc = await getDoc(doc(db, 'Administrator', userId, 'Roles', 'Default_Roles'))
    if (!roleDoc.exists()) return false
    
    const userRoles = roleDoc.data()
    const pageDoc = await getDoc(doc(db, 'Page_Control', pageId))
    
    if (!pageDoc.exists()) return true
    
    const config = pageDoc.data()
    const { allowedRoles = [], allowedPositions = [] } = config
    
    if (allowedRoles.includes('All')) return true
    
    const roleMatch = allowedRoles.includes(userRoles.role)
    const positionMatch = allowedPositions.includes(userRoles.position)
    
    return roleMatch && positionMatch
  } catch (err) {
    console.error('Error checking page access:', err)
    return false
  }
}

async function handleNavigation(to, from, next, authStore) {
  const isAuthenticated = authStore.isAuthenticated
  const userRole = authStore.userRole
  
  // 1. Kung ang route ay hindi nage-exist (NotFound), hayaan lang siyang dumeretso
  if (to.name === 'NotFound') {
    return next()
  }

  // 2. Auth Check
  if (to.meta.requiresAuth && !isAuthenticated) {
    return next({ 
      name: 'Login', 
      query: { redirect: to.fullPath, session: 'expired' } 
    })
  }
  
  // 3. RBAC Check
  if (to.meta.requiresAuth && isAuthenticated && to.meta.pageId) {
    const hasAccess = await checkPageAccess(to.meta.pageId, authStore.user.uid)
    if (!hasAccess) {
      return next({ name: 'Dashboard' })
    }
  }
  
  // 4. Master Admin Check
  if (to.meta.requiresMasterAdmin && isAuthenticated) {
    const roleDoc = await getDoc(doc(db, 'Administrator', authStore.user.uid, 'Roles', 'Default_Roles'))
    if (!roleDoc.exists()) {
      return next({ name: 'Dashboard' })
    }
    
    const userRoles = roleDoc.data()
    const isMaster = userRoles.role === 'Master Admin' || 
                     userRoles.role === 'isuzu&calapan&master&admin101'
    
    if (!isMaster) {
      return next({ name: 'Dashboard' })
    }
  }
  
  // 5. Guest Route Check (prevent logged in users from seeing login/register)
  if (to.meta.requiresGuest && isAuthenticated) {
    return next({ name: 'Dashboard' })
  }
  
  // 6. Session Timeout Check
  if (isAuthenticated && !authStore.isSessionValid) {
    authStore.logout()
    return next({ 
      name: 'Login', 
      query: { session: 'expired', reason: 'timeout' } 
    })
  }
  
  next()
}

export default router