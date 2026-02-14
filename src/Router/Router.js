import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import Login from '../Pages/Login.vue'
import Register from '../Pages/Register.vue'
import AdminParent from '../Pages/Admin/AdminParent.vue'
import Dashboard from '../Pages/Admin/Dashboard.vue'
import Approve from '../Pages/Admin/Approve.vue'
import Setting from '../Pages/Admin/Setting.vue'
import Inventory from '../Pages/Admin/Inventory.vue'
import UserManagement from '../Pages/Admin/UserManagement.vue'
import SA_Rotation from '../AfterSales/SA_Rotation.vue'

const routes = [
  { 
    path: '/', 
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
    path: '/admin',
    component: AdminParent,
    meta: { requiresAuth: true },
    children: [
      { 
        path: 'dashboard', 
        name: 'Dashboard', 
        component: Dashboard,
        meta: { requiresAuth: true }
      },
      { 
        path: 'approve', 
        name: 'Approve', 
        component: Approve,
        meta: { requiresAuth: true }
        //meta: { requiresAuth: true, allowedRoles: ['admin', 'manager'] }
      },
      { 
        path: 'settings', 
        name: 'Settings', 
        component: Setting,
        meta: { requiresAuth: true }
      },
      { 
        path: 'inventory',
        name: 'Inventory', 
        component: Inventory,
        meta: { requiresAuth: true }
      },
      { 
        path: 'user-management', 
        name: 'UserManagement', 
        component: UserManagement,
        meta: { requiresAuth: true }
        //meta: { requiresAuth: true, allowedRoles: ['admin'] }
      },
      { 
        path: 'sa-rotation', 
        name: 'SA_Rotation', 
        component: SA_Rotation,
        meta: { requiresAuth: true }
      },
    ]
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation Guard for Authentication
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // Wait for auth to initialize
  if (authStore.isLoading) {
    // Store the intended destination and check again after auth loads
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

function handleNavigation(to, from, next, authStore) {
  const isAuthenticated = authStore.isAuthenticated
  const userRole = authStore.userRole
  
  // Check if route requires authentication
  if (to.meta.requiresAuth && !isAuthenticated) {
    return next({ 
      name: 'Login', 
      query: { redirect: to.fullPath, session: 'expired' } 
    })
  }
  
  // Check if route requires specific roles
  if (to.meta.allowedRoles && isAuthenticated) {
    const allowedRoles = to.meta.allowedRoles
    if (!allowedRoles.includes(userRole)) {
      // Redirect to dashboard if user doesn't have permission
      return next({ name: 'Dashboard' })
    }
  }
  
  // Check if route requires guest (non-authenticated) access
  if (to.meta.requiresGuest && isAuthenticated) {
    return next({ name: 'Dashboard' })
  }
  
  // Check session validity
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
