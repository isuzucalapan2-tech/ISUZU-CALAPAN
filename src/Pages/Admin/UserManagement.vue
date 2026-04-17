<template>
  <div v-if="isLoading" class="min-h-screen flex items-center justify-center bg-white">
    <Loaders />
  </div>

  <div v-else :class="themeClass" class="min-h-screen flex flex-col font-sans relative overflow-hidden">
    
    <div class="absolute top-0 left-0 w-full z-0 opacity-5 pointer-events-none">
      <svg viewBox="0 0 500 60" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full">
        <path d="M0 15 H280 L330 45 H500" stroke="currentColor" stroke-width="1" />
      </svg>
    </div>

    <header :class="[headerClass, 'relative z-10 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex justify-between items-center']">
      <div class="flex items-center gap-3 sm:gap-4">
        <div class="bg-red-600 p-2 rounded-lg text-white">
          <Users class="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <div>
          <h1 :class="['text-sm sm:text-xl font-bold tracking-tight uppercase isuzu-font', textClass]">
            User <span class="text-red-600">Management</span>
          </h1>
          <p :class="['text-[9px] sm:text-[10px] uppercase tracking-widest font-medium opacity-50', subTextClass]">Access Control Matrix</p>
        </div>
      </div>

      <div class="flex items-center gap-4">
         <span :class="['text-[10px] sm:text-[11px] font-bold uppercase tracking-wider', isDarkMode ? 'text-neutral-400' : 'text-neutral-500']">
            {{ resultCount }} Active Records
         </span>
      </div>
    </header>

    <main class="flex-1 relative z-10 overflow-auto px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12">
      <div class="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <div class="relative flex-1 min-w-70 sm:min-w-75">
            <Search class="w-4 h-4 absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 opacity-30" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search users..."
              :class="['w-full pl-10 sm:pl-11 pr-4 py-2.5 sm:py-2.5 rounded-xl text-sm border focus:ring-2 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all', isDarkMode ? 'bg-neutral-800/50 border-neutral-700 text-white' : 'bg-white border-neutral-200 text-neutral-800']"
            />
          </div>

          <div class="flex flex-wrap items-center gap-2 sm:gap-2">
            <select v-model="selectedRole" :class="['px-3 sm:px-4 py-2.5 border rounded-xl text-xs font-bold outline-none cursor-pointer min-w-30', isDarkMode ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-white border-neutral-200 text-neutral-800']">
              <option value="">ALL ROLES</option>
              <option v-for="role in roleOptions" :key="role" :value="role">{{ role.toUpperCase() }}</option>
            </select>

            <select v-model="selectedStatus" :class="['px-3 sm:px-4 py-2.5 border rounded-xl text-xs font-bold outline-none cursor-pointer min-w-30', isDarkMode ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-white border-neutral-200 text-neutral-800']">
              <option value="">ALL STATUS</option>
              <option value="Active">ACTIVE</option>
              <option value="Deactivated">DEACTIVATED</option>
            </select>

            <button
              v-if="hasActiveFilters"
              @click="clearAllFilters"
              class="p-2.5 text-neutral-500 hover:text-red-600 transition-colors"
            >
              <X class="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        <!-- Master Admin Transfer Section (Visible only to Master Admin) -->
        <div v-if="authStore.isMasterAdmin" class="bg-linear-to-r from-red-600/10 to-orange-600/10 border border-red-200 rounded-xl p-4 sm:p-6">
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <div class="bg-red-600 p-2 rounded-lg text-white">
                <Crown class="w-5 h-5" />
              </div>
              <div>
                <h2 class="text-sm font-bold text-red-700 uppercase tracking-wide">Master Admin Control</h2>
                <p class="text-xs text-red-600/80">Transfer your Master Admin privileges to another user</p>
              </div>
            </div>
            <button 
              @click="openTransferModal"
              class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase rounded-lg transition-colors flex items-center gap-2"
            >
              <Key class="w-4 h-4" />
              Transfer Privileges
            </button>
          </div>
        </div>

        <!-- Critical Alert: Multiple Master Admins -->
        <div v-if="masterAdminWarning" class="bg-red-50 border-2 border-red-500 rounded-xl p-4 sm:p-6 animate-pulse">
          <div class="flex items-start gap-3">
            <AlertTriangle class="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h2 class="text-sm font-bold text-red-700 uppercase tracking-wide">System Critical Alert</h2>
              <p class="text-xs text-red-600 mt-1">
                Multiple Master Admins detected ({{ masterAdminCount }}). Only one Master Admin is allowed in the system. 
                Please transfer privileges immediately to resolve this issue.
              </p>
            </div>
          </div>
        </div>

        <div :class="[cardClass, 'rounded-xl border overflow-hidden shadow-sm']" :style="cardStyle">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr :class="['border-b', isDarkMode ? 'border-neutral-700' : 'border-neutral-100']">
                  <th class="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4 text-[8px] sm:text-[10px] lg:text-[11px] font-bold uppercase tracking-wider opacity-40">Administrator</th>
                  <th class="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4 text-[8px] sm:text-[10px] lg:text-[11px] font-bold uppercase tracking-wider opacity-40 hidden sm:table-cell">Contact</th>
                  <th class="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4 text-[8px] sm:text-[10px] lg:text-[11px] font-bold uppercase tracking-wider opacity-40">Position & Role</th>
                  <th class="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4 text-[8px] sm:text-[10px] lg:text-[11px] font-bold uppercase tracking-wider opacity-40 hidden md:table-cell">Permission</th>
                  <th class="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4 text-[8px] sm:text-[10px] lg:text-[11px] font-bold uppercase tracking-wider opacity-40">Status</th>
                  <th class="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4 text-[8px] sm:text-[10px] lg:text-[11px] font-bold uppercase tracking-wider text-right opacity-40">Actions</th>
                </tr>
              </thead>
              <tbody :class="['divide-y', isDarkMode ? 'divide-neutral-800' : 'divide-neutral-50']">
                <tr v-for="admin in paginatedAdmins" :key="admin.id" class="transition-colors">
                  <td class="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4">
                    <div class="flex items-center gap-1.5 sm:gap-2 lg:gap-3">
                      <div :class="['w-6 h-6 sm:w-8 sm:h-8 lg:w-9 lg:h-9 rounded-full flex items-center justify-center text-[7px] sm:text-[9px] lg:text-[10px] font-bold text-white', isDarkMode ? 'bg-neutral-700' : 'bg-neutral-900']">
                        {{ admin.firstName?.[0] }}{{ admin.lastName?.[0] }}
                      </div>
                      <div class="min-w-0 flex-1">
                        <p :class="['text-xs sm:text-sm font-semibold truncate', textClass]">{{ admin.firstName }} {{ admin.lastName }}</p>
                        <p class="text-[9px] sm:text-[10px] lg:text-[11px] text-neutral-500 truncate">@{{ admin.username }}</p>
                        <p class="text-[8px] sm:text-[9px] lg:text-[10px] text-neutral-500 sm:hidden">{{ admin.email }}</p>
                      </div>
                    </div>
                  </td>

                  <td :class="['px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4 text-[9px] sm:text-xs font-medium hidden sm:table-cell', isDarkMode ? 'text-neutral-400' : 'text-neutral-500']">
                    {{ admin.email }}
                  </td>

                  <td class="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4">
                    <div v-if="admin.isEditing" class="flex flex-col gap-1 sm:gap-2 max-w-25 sm:max-w-30 lg:max-w-35">
                      <select v-model="admin.selectedPosition" class="bg-transparent border border-neutral-500/30 rounded px-1 sm:px-2 py-0.5 sm:py-1 text-[7px] sm:text-[9px] lg:text-[10px] font-bold outline-none">
                        <option v-for="pos in positionOptions" :key="pos" :value="pos">{{ pos }}</option>
                      </select>
                      <select v-model="admin.selectedRole" class="bg-transparent border border-neutral-500/30 rounded px-1 sm:px-2 py-0.5 sm:py-1 text-[7px] sm:text-[9px] lg:text-[10px] font-bold outline-none">
                        <option v-for="role in availableRoleOptions" :key="role" :value="role">{{ role }}</option>
                      </select>
                    </div>
                    <div v-else>
                      <p :class="['text-[9px] sm:text-xs font-semibold uppercase', textClass]">{{ admin.position || 'N/A' }}</p>
                      <p class="text-[7px] sm:text-[9px] lg:text-[10px] font-medium text-neutral-500 uppercase">{{ admin.roleName || 'N/A' }}</p>
                    </div>
                  </td>

                  <td class="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4">
                    <div v-if="admin.isEditing" class="flex flex-col gap-1">
                      <label class="flex items-center gap-1 text-[10px] cursor-pointer" :class="{ 'opacity-50 cursor-not-allowed': admin.selectedRole === 'Master Admin' || admin.selectedRole === 'isuzu&calapan&master&admin101' }">
                        <input type="checkbox" v-model="admin.selectedPermissionMap.canView" :disabled="admin.selectedRole === 'Master Admin' || admin.selectedRole === 'isuzu&calapan&master&admin101'" class="accent-red-600 w-3 h-3" />
                        <span>View</span>
                      </label>
                      <label class="flex items-center gap-1 text-[10px] cursor-pointer" :class="{ 'opacity-50 cursor-not-allowed': admin.selectedRole === 'Master Admin' || admin.selectedRole === 'isuzu&calapan&master&admin101' }">
                        <input type="checkbox" v-model="admin.selectedPermissionMap.canCreate" :disabled="admin.selectedRole === 'Master Admin' || admin.selectedRole === 'isuzu&calapan&master&admin101'" class="accent-red-600 w-3 h-3" />
                        <span>Create</span>
                      </label>
                      <label class="flex items-center gap-1 text-[10px] cursor-pointer" :class="{ 'opacity-50 cursor-not-allowed': admin.selectedRole === 'Master Admin' || admin.selectedRole === 'isuzu&calapan&master&admin101' }">
                        <input type="checkbox" v-model="admin.selectedPermissionMap.canEdit" :disabled="admin.selectedRole === 'Master Admin' || admin.selectedRole === 'isuzu&calapan&master&admin101'" class="accent-red-600 w-3 h-3" />
                        <span>Edit</span>
                      </label>
                      <label class="flex items-center gap-1 text-[10px] cursor-pointer" :class="{ 'opacity-50 cursor-not-allowed': admin.selectedRole === 'Master Admin' || admin.selectedRole === 'isuzu&calapan&master&admin101' }">
                        <input type="checkbox" v-model="admin.selectedPermissionMap.canDelete" :disabled="admin.selectedRole === 'Master Admin' || admin.selectedRole === 'isuzu&calapan&master&admin101'" class="accent-red-600 w-3 h-3" />
                        <span>Delete</span>
                      </label>
                    </div>
                    <div v-else class="flex flex-col gap-1">
                      <div class="flex items-center gap-1 text-[10px]">
                        <span :class="admin.permissionMap?.canView ? 'text-green-600' : 'text-neutral-400'">●</span>
                        <span :class="admin.permissionMap?.canView ? 'text-neutral-700' : 'text-neutral-400'">View</span>
                      </div>
                      <div class="flex items-center gap-1 text-[10px]">
                        <span :class="admin.permissionMap?.canCreate ? 'text-green-600' : 'text-neutral-400'">●</span>
                        <span :class="admin.permissionMap?.canCreate ? 'text-neutral-700' : 'text-neutral-400'">Create</span>
                      </div>
                      <div class="flex items-center gap-1 text-[10px]">
                        <span :class="admin.permissionMap?.canEdit ? 'text-green-600' : 'text-neutral-400'">●</span>
                        <span :class="admin.permissionMap?.canEdit ? 'text-neutral-700' : 'text-neutral-400'">Edit</span>
                      </div>
                      <div class="flex items-center gap-1 text-[10px]">
                        <span :class="admin.permissionMap?.canDelete ? 'text-green-600' : 'text-neutral-400'">●</span>
                        <span :class="admin.permissionMap?.canDelete ? 'text-neutral-700' : 'text-neutral-400'">Delete</span>
                      </div>
                    </div>
                  </td>

                  <td class="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4">
                    <div class="flex items-center gap-1 sm:gap-2">
                      <div :class="['w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full', admin.Status === 'Active' ? 'bg-green-500' : 'bg-neutral-400']"></div>
                      <span :class="['text-[8px] sm:text-[10px] lg:text-[11px] font-bold uppercase', admin.Status === 'Active' ? 'text-green-600' : 'text-red-600']">
                        {{ admin.Status || "Deactivated" }}
                        <span v-if="admin.Status !== 'Active' && admin.deactivationReason" 
                              class="block text-[6px] sm:text-[7px] font-normal mt-0.5 leading-tight opacity-80 max-w-30 truncate" 
                              :title="admin.deactivationReason">
                          {{ admin.deactivationReason }}
                        </span>
                      </span>
                    </div>
                  </td>

                  <td class="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4">
                    <div class="flex justify-end items-center gap-0.5 sm:gap-1">
                      <!-- Edit/Save buttons - always show but lock if no permission -->
                      <button 
                        v-if="!admin.isEditing" 
                        @click="enableEditing(admin)" 
                        :disabled="!canEditUsers || isMasterAdminSelf(admin)"
                        :class="(!canEditUsers || isMasterAdminSelf(admin)) ? 'opacity-30 cursor-not-allowed' : 'hover:text-blue-600'"
                        class="p-1 sm:p-1.5 lg:p-2 text-neutral-400 transition-colors"
                        :title="isMasterAdminSelf(admin) ? 'Master Admin cannot edit their own role. Use Transfer Privileges instead.' : !canEditUsers ? 'You do not have permission to edit users' : ''"
                      >
                        <Edit class="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-4 lg:h-4" />
                      </button>
                      <button 
                        v-else 
                        @click="grantPrivilege(admin)" 
                        :disabled="!canEditUsers"
                        :class="!canEditUsers ? 'opacity-30 cursor-not-allowed' : 'hover:text-green-600'"
                        class="p-1 sm:p-1.5 lg:p-2 text-green-600 transition-colors"
                        :title="!canEditUsers ? 'You do not have permission to save changes' : ''"
                      >
                        <CheckCircle class="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-4 lg:h-4" />
                      </button>
                      
                      <!-- Activate/Deactivate button - always show but lock if no permission -->
                      <button 
                        v-if="admin.accountStatus !== 'pending'" 
                        @click="toggleStatus(admin)" 
                        :disabled="!canDeleteUsers || isMasterAdminSelf(admin)"
                        :class="[
                          (!canDeleteUsers || isMasterAdminSelf(admin)) ? 'opacity-30 cursor-not-allowed' : '',
                          admin.Status === 'Active' ? 'text-neutral-400 hover:text-orange-500' : 'text-neutral-400 hover:text-green-500'
                        ]" 
                        class="p-1 sm:p-1.5 lg:p-2 transition-colors"
                        :title="isMasterAdminSelf(admin) ? 'Master Admin cannot deactivate their own account' : !canDeleteUsers ? 'You do not have permission to activate/deactivate users' : ''"
                      >
                        <Power class="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-4 lg:h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div :class="['px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 border-t flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3 lg:gap-4', isDarkMode ? 'border-neutral-700' : 'border-neutral-50']">
            <p class="text-[9px] sm:text-[10px] lg:text-[11px] font-medium text-neutral-500 text-center sm:text-left">
              Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to {{ Math.min(currentPage * itemsPerPage, filteredAdmins.length) }} of {{ filteredAdmins.length }}
            </p>
            
            <div class="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 lg:gap-4">
              <div class="flex items-center gap-1 sm:gap-2">
                <span class="text-[8px] sm:text-[9px] lg:text-[10px] font-bold text-neutral-400 uppercase">Rows:</span>
                <select v-model="itemsPerPage" :class="['text-[9px] sm:text-[10px] lg:text-[11px] font-bold bg-transparent outline-none focus:text-red-600 transition-colors', isDarkMode ? 'text-white' : 'text-neutral-800']">
                  <option v-for="opt in itemsPerPageOptions" :key="opt" :value="opt">{{ opt }}</option>
                </select>
              </div>

              <div class="flex items-center gap-0.5 sm:gap-1">
                <button @click="currentPage--" :disabled="currentPage === 1" class="p-1 sm:p-1.5 lg:p-2 disabled:opacity-20 hover:text-red-600 transition-all"><ChevronLeft class="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-4 lg:h-4" /></button>
                <span class="text-[9px] sm:text-[10px] lg:text-[11px] font-bold mx-0.5 sm:mx-1 lg:mx-2">
                  <span class="text-red-600">{{ currentPage }}</span> / {{ totalPages }}
                </span>
                <button @click="currentPage++" :disabled="currentPage === totalPages" class="p-1 sm:p-1.5 lg:p-2 disabled:opacity-20 hover:text-red-600 transition-all"><ChevronRight class="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-4 lg:h-4" /></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>

  <!-- Transfer Master Admin Modal -->
  <div v-if="showTransferModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div :class="['w-full max-w-md rounded-2xl shadow-2xl overflow-hidden', isDarkMode ? 'bg-neutral-800' : 'bg-white']">
      <!-- Modal Header -->
      <div class="bg-linear-to-r from-red-600 to-orange-600 p-4 sm:p-6">
        <div class="flex items-center gap-3">
          <Crown class="w-6 h-6 text-white" />
          <h2 class="text-lg font-bold text-white uppercase tracking-wide">Transfer Master Admin</h2>
        </div>
        <p class="text-white/80 text-xs mt-1">Transfer your privileges to another user</p>
      </div>

      <!-- Modal Body -->
      <div class="p-4 sm:p-6 space-y-4">
        <!-- Warning Message -->
        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div class="flex items-start gap-2">
            <AlertTriangle class="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
            <p class="text-xs text-yellow-700">
              This action will demote you to "Admin" role and promote the selected user to Master Admin. 
              This cannot be undone without another Master Admin.
            </p>
          </div>
        </div>

        <!-- User Selection -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider mb-2" :class="isDarkMode ? 'text-neutral-400' : 'text-neutral-600'">
            Select Target User
          </label>
          <select 
            v-model="selectedTransferUser"
            :class="['w-full px-3 py-2.5 rounded-lg text-sm border outline-none transition-all', isDarkMode ? 'bg-neutral-700 border-neutral-600 text-white' : 'bg-white border-neutral-300 text-neutral-800']"
          >
            <option value="">Select a user...</option>
            <option v-for="user in eligibleTransferUsers" :key="user.id" :value="user.id">
              {{ user.firstName }} {{ user.lastName }} ({{ user.currentRole }})
            </option>
          </select>
        </div>

        <!-- Password Verification -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider mb-2" :class="isDarkMode ? 'text-neutral-400' : 'text-neutral-600'">
            Confirm Your Password
          </label>
          <input 
            v-model="transferPassword"
            type="password"
            placeholder="Enter your current password"
            :class="['w-full px-3 py-2.5 rounded-lg text-sm border outline-none transition-all', isDarkMode ? 'bg-neutral-700 border-neutral-600 text-white' : 'bg-white border-neutral-300 text-neutral-800']"
          />
          <p class="text-[10px] text-neutral-500 mt-1">Required for security verification</p>
        </div>

        <!-- Error Message -->
        <div v-if="transferError" class="bg-red-50 border border-red-200 rounded-lg p-3">
          <p class="text-xs text-red-600">{{ transferError }}</p>
        </div>

        <!-- Success Message -->
        <div v-if="transferSuccess" class="bg-green-50 border border-green-200 rounded-lg p-3">
          <p class="text-xs text-green-600">{{ transferSuccess }}</p>
        </div>
      </div>

      <!-- Modal Footer -->
      <div :class="['p-4 sm:p-6 border-t flex gap-3', isDarkMode ? 'border-neutral-700' : 'border-neutral-200']">
        <button 
          @click="closeTransferModal"
          class="flex-1 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
          :class="isDarkMode ? 'bg-neutral-700 text-white hover:bg-neutral-600' : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'"
        >
          Cancel
        </button>
        <button 
          @click="executeTransfer"
          :disabled="!selectedTransferUser || !transferPassword || transferLoading"
          class="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
        >
          <span v-if="transferLoading">Processing...</span>
          <span v-else>Confirm Transfer</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick } from "vue";
import { db } from "../../Firebase/Firebase";
import { collection, getDocs, updateDoc, doc, getDoc, serverTimestamp, writeBatch } from "firebase/firestore";
import Loaders from "../../components/Loaders.vue";
import { useMasterAdmin } from "../../composables/useMasterAdmin";
import { useAuthStore } from "../../stores/auth";
import { useAuth } from "../../composables/useAuth";
import { usePermissions } from "../../composables/usePermissions";
import { 
  Users, Edit, CheckCircle, Power, Search, X, 
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  Shield, AlertTriangle, Crown, Key
} from "lucide-vue-next";

// Auth composable for logout functionality
const { logout } = useAuth();

/* ===== THEME & STYLES ===== */
// Inalis ang mga duplicate declarations dito
const isDarkMode = computed(() => document.documentElement.classList.contains('dark'));
const themeClass = computed(() => isDarkMode.value ? 'text-white bg-neutral-900' : 'bg-neutral-50 text-gray-900');
const headerClass = computed(() => isDarkMode.value ? 'bg-neutral-800/10' : 'bg-white/10');
const cardClass = computed(() => isDarkMode.value ? 'text-white' : 'bg-white text-gray-900');
const cardStyle = computed(() => isDarkMode.value ? { backgroundColor: '#262626', borderColor: '#374151' } : { borderColor: '#e5e7eb' });
const textClass = computed(() => isDarkMode.value ? 'text-white' : 'text-neutral-800');
const subTextClass = computed(() => isDarkMode.value ? 'text-gray-400' : 'text-gray-500');

/* ===== STATE MANAGEMENT ===== */
const admins = ref([]);
const isLoading = ref(true);
const positionOptions = ref([]);
const roleOptions = ref([]);
const permissionOptions = ref([]);

const searchQuery = ref("");
const debouncedSearchQuery = ref("");
const selectedRole = ref("");
const selectedStatus = ref("");

const currentPage = ref(1);
const itemsPerPage = ref(10);
const itemsPerPageOptions = [10, 25, 50];

// Master Admin Transfer State
const showTransferModal = ref(false);
const selectedTransferUser = ref("");
const transferPassword = ref("");
const transferLoading = ref(false);
const transferError = ref("");
const transferSuccess = ref("");
const eligibleTransferUsers = ref([]);
const masterAdminWarning = ref(false);
const masterAdminCount = ref(0);
const masterAdminExists = ref(false); // Track if Master Admin exists

// Initialize Master Admin composable
const masterAdmin = useMasterAdmin();
const authStore = useAuthStore();

// Initialize Permissions composable
const permissions = usePermissions();

// Computed property to check if user can edit users
const canEditUsers = computed(() => {
  return authStore.isMasterAdmin || permissions.canEdit.value;
});

// Computed property to check if user can delete/deactivate users
const canDeleteUsers = computed(() => {
  return authStore.isMasterAdmin || permissions.canDelete.value;
});

// Filtered role options - hide Master Admin if one already exists
const availableRoleOptions = computed(() => {
  // If no Master Admin exists, show all roles
  if (!masterAdminExists.value) return roleOptions.value;
  
  // If Master Admin exists, filter out Master Admin role
  return roleOptions.value.filter(role => 
    role !== 'Master Admin' && role !== 'isuzu&calapan&master&admin101'
  );
});

/* =====================
   FETCHING LOGIC
===================== */
const fetchPositionOptions = async () => {
  try {
    const snapshot = await getDocs(collection(db, "Position_Access"));
    positionOptions.value = snapshot.docs
      .map(doc => doc.data().position)
      .filter(pos => pos) // Remove any undefined/null values
      .sort(); // Sort alphabetically
  } catch (error) {
    console.error("Error fetching positions:", error);
  }
};

const fetchRoleOptions = async () => {
  try {
    const snapshot = await getDocs(collection(db, "Role_Access"));
    roleOptions.value = snapshot.docs
      .map(doc => doc.data().roleName)
      .filter(role => role) // Remove any undefined/null values
      .sort(); // Sort alphabetically
  } catch (error) {
    console.error("Error fetching roles:", error);
  }
};

// Keep for backward compatibility if needed
const fetchOptions = async (collectionName, docIds, fieldName, targetRef) => {
  try {
    const options = [];
    for (const id of docIds) {
      const d = await getDoc(doc(db, collectionName, id));
      if (d.exists() && d.data()[fieldName]) options.push(d.data()[fieldName]);
    }
    targetRef.value = options;
  } catch (err) { console.error(`Error fetching ${collectionName}:`, err); }
};

const fetchAdminRoles = async (adminId) => {
  try {
    const roleDoc = await getDoc(doc(db, "Administrator", adminId, "Roles", "Default_Roles"));
    if (roleDoc.exists()) {
      const data = roleDoc.data();
      // Return permissionMap if it exists, otherwise fallback to old structure
      return {
        position: data.position || "",
        role: data.role || "",
        permissionMap: data.permissionMap || {
          canView: data.permission ? true : false, // Fallback: if old permission exists, set canView to true
          canCreate: false,
          canEdit: false,
          canDelete: false
        }
      };
    }
    return { 
      position: "", 
      role: "", 
      permissionMap: {
        canView: false,
        canCreate: false,
        canEdit: false,
        canDelete: false
      }
    };
  } catch { 
    return { 
      position: "", 
      role: "", 
      permissionMap: {
        canView: false,
        canCreate: false,
        canEdit: false,
        canDelete: false
      }
    }; 
  }
};

const fetchAdmins = async () => {
  isLoading.value = true;
  try {
    const snapshot = await getDocs(collection(db, "Administrator"));
    const adminPromises = snapshot.docs.map(async (d) => {
      const roleData = await fetchAdminRoles(d.id);
      const permissionMap = roleData.permissionMap || {
        canView: false,
        canCreate: false,
        canEdit: false,
        canDelete: false
      };
      return {
        id: d.id,
        ...d.data(),
        Status: d.data().Status || "Deactivated",
        accountStatus: d.data().accountStatus || "pending",
        position: roleData.position || "",
        roleName: roleData.role || "",
        permissionMap: permissionMap,
        isEditing: false,
        selectedPosition: roleData.position || "",
        selectedRole: roleData.role || "",
        selectedPermissionMap: { ...permissionMap } // Copy for editing
      };
    });
    admins.value = await Promise.all(adminPromises);
  } catch (err) {
    console.error("Error fetching admins:", err);
  } finally {
    isLoading.value = false;
  }
};

/* =====================
   ACTIONS
===================== */
const enableEditing = (admin) => {
  // Siguraduhin na isa lang ang ine-edit at a time para iwas gulo sa UI
  admins.value.forEach(a => a.isEditing = false);
  admin.isEditing = true;
};

const grantPrivilege = async (admin) => {
  if (!admin.selectedPosition || !admin.selectedRole) return;
  try {
    await updateDoc(doc(db, "Administrator", admin.id, "Roles", "Default_Roles"), {
      position: admin.selectedPosition,
      role: admin.selectedRole,
      permissionMap: admin.selectedPermissionMap,
      updateAt: new Date()
    });
    admin.position = admin.selectedPosition;
    admin.roleName = admin.selectedRole;
    admin.permissionMap = { ...admin.selectedPermissionMap };
    admin.isEditing = false;
  } catch (err) { console.error(err); }
};

const toggleStatus = async (admin) => {
  if (!authStore.isMasterAdmin) {
    console.error('Only Master Admin can toggle status');
    return;
  }

  const newStatus = admin.Status === 'Active' ? 'Deactivated' : 'Active';
  const action = newStatus === 'Deactivated' ? 'deactivate' : 'reactivate';
  
  if (!confirm(`Are you sure you want to ${action} "${admin.firstName} ${admin.lastName}"?\n\n${newStatus === 'Active' ? 'DDOS counters will be reset.' : ''}`)) {
    return;
  }

  try {
    const batch = writeBatch(db);
    const mainDocRef = doc(db, "Administrator", admin.id);
    const logRef = doc(collection(db, "Administrator", admin.id, "loginAttempts"));

    // Update status and handle reactivation cleanup
    const statusUpdate = { Status: newStatus };
    if (newStatus === 'Active') {
      statusUpdate.failedAttempts = 0;
      statusUpdate.lastFailedAttempt = null;
      statusUpdate.deactivationReason = null;
    }
    batch.update(mainDocRef, statusUpdate);

    // Log manual action
    batch.set(logRef, {
      timestamp: serverTimestamp(),
      reason: `Manually ${action}ed by Master Admin`,
      manualAction: true,
      performedBy: authStore.user.uid,
      performedByEmail: authStore.user.email
    });

    await batch.commit();
    admin.Status = newStatus;

    // Refresh list
    await fetchAdmins();
  } catch (err) { 
    console.error('Error toggling status:', err);
  }
};

const clearAllFilters = () => {
  searchQuery.value = ""; 
  debouncedSearchQuery.value = "";
  selectedRole.value = ""; 
  selectedStatus.value = "";
  currentPage.value = 1;
};

const getStatusBadgeClass = (status) => {
  if (isDarkMode.value) {
    return status === 'Active' 
      ? "bg-green-900/30 border-green-700 text-green-400" 
      : "bg-red-900/30 border-red-700 text-red-400";
  }
  return status === 'Active' 
    ? "bg-green-50 border-green-200 text-green-700" 
    : "bg-red-50 border-red-200 text-red-700";
};

/* =====================
   MASTER ADMIN TRANSFER LOGIC
===================== */
const openTransferModal = () => {
  // Get eligible users (all users except current Master Admin)
  eligibleTransferUsers.value = admins.value
    .filter(admin => admin.id !== authStore.user?.uid)
    .map(admin => ({
      id: admin.id,
      firstName: admin.firstName,
      lastName: admin.lastName,
      currentRole: admin.roleName || 'No Role'
    }));
  
  showTransferModal.value = true;
  transferError.value = "";
  transferSuccess.value = "";
};

const closeTransferModal = () => {
  showTransferModal.value = false;
  selectedTransferUser.value = "";
  transferPassword.value = "";
  transferError.value = "";
  transferSuccess.value = "";
};

const executeTransfer = async () => {
  if (!selectedTransferUser.value || !transferPassword.value) {
    transferError.value = "Please select a user and enter your password";
    return;
  }

  transferLoading.value = true;
  transferError.value = "";
  transferSuccess.value = "";

  try {
    // Execute the transfer using the composable
    const result = await masterAdmin.transferMasterAdmin(
      selectedTransferUser.value,
      transferPassword.value
    );

    if (result.success) {
      transferSuccess.value = "Master Admin privileges transferred successfully! You have been demoted to Admin. Logging out...";
      
      // Refresh the admin list to show updated roles
      await fetchAdmins();
      
      // Close modal after 2 seconds then logout
      setTimeout(() => {
        closeTransferModal();
        // Logout the user (same logic as Settings page)
        logout();
      }, 2000);
    } else {
      // Handle specific error codes from verifyPassword
      const errorCode = result.code || 'unknown';
      
      switch (errorCode) {
        case 'auth/no-user':
        case 'auth/no-email':
        case 'auth/invalid-credential':
        case 'auth/requires-recent-login':
          transferError.value = `${result.error} Click "Re-login" below to refresh your session.`;
          // Add a re-login button option
          transferError.value += ' <button onclick="window.location.href=\'/login\'" class="text-red-600 underline font-bold ml-2">Re-login</button>';
          break;
        case 'auth/wrong-password':
          transferError.value = result.error;
          break;
        case 'auth/too-many-requests':
          transferError.value = result.error;
          break;
        case 'auth/user-disabled':
          transferError.value = result.error;
          break;
        case 'auth/network-request-failed':
          transferError.value = result.error;
          break;
        default:
          transferError.value = result.error || "Transfer failed. Please try again.";
      }
    }
  } catch (err) {
    console.error("Transfer error:", err);
    transferError.value = err.message || "An unexpected error occurred";
  } finally {
    transferLoading.value = false;
  }
};

const checkMasterAdminStatus = async () => {
  try {
    const result = await masterAdmin.checkMasterAdminCount();
    masterAdminWarning.value = result.hasMultiple;
    masterAdminCount.value = result.count;
    masterAdminExists.value = result.count > 0;
  } catch (err) {
    console.error("Error checking Master Admin status:", err);
  }
};

// Helper function to check if an admin is the current Master Admin (self)
const isMasterAdminSelf = (admin) => {
  // Check if this is the current user and they are a Master Admin
  const isCurrentUser = admin.id === authStore.user?.uid;
  const isMasterAdminRole = admin.roleName === 'Master Admin' || 
                              admin.roleName === 'isuzu&calapan&master&admin101';
  return isCurrentUser && isMasterAdminRole;
};

/* =====================
   COMPUTED & WATCHERS
===================== */
let debounceTimeout = null;
watch(searchQuery, (v) => {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => { 
    debouncedSearchQuery.value = v; 
    currentPage.value = 1; // Reset to page 1 on search
  }, 300);
});

// Watch for Master Admin role selection and auto-enable all permissions
// Use a separate ref to track processed admins to avoid recursive updates
const processedAdmins = ref(new Set());

watch(() => admins.value, (newAdmins) => {
  // Use nextTick to avoid recursive updates
  nextTick(() => {
    newAdmins.forEach(admin => {
      // Skip if already processed or not editing
      if (!admin.isEditing || !admin.selectedRole || processedAdmins.value.has(admin.id)) {
        return;
      }
      
      const isMasterAdminRole = admin.selectedRole === 'Master Admin' || 
                                admin.selectedRole === 'isuzu&calapan&master&admin101';
      
      if (isMasterAdminRole) {
        // Mark as processed to avoid recursive updates
        processedAdmins.value.add(admin.id);
        
        // Auto-enable all permissions for Master Admin
        admin.selectedPermissionMap = {
          canView: true,
          canCreate: true,
          canEdit: true,
          canDelete: true
        };
      }
    });
  });
}, { deep: true, flush: 'post' });

// Clear processed admins when editing state changes
watch(() => admins.value.map(a => a.isEditing), () => {
  processedAdmins.value.clear();
}, { deep: true });

const filteredAdmins = computed(() => {
  return admins.value.filter(admin => {
    const query = debouncedSearchQuery.value.toLowerCase().trim();
    const fullName = `${admin.firstName || ''} ${admin.lastName || ''}`.toLowerCase();
    const username = (admin.username || '').toLowerCase();
    const email = (admin.email || '').toLowerCase();
    
    const matchesSearch = !query || fullName.includes(query) || username.includes(query) || email.includes(query);
    const matchesRole = !selectedRole.value || admin.roleName === selectedRole.value;
    const matchesStat = !selectedStatus.value || admin.Status === selectedStatus.value;
    
    // Hide Master Admin records from non-Master Admin users
    const isMasterAdminRole = admin.roleName === 'Master Admin' || admin.roleName === 'isuzu&calapan&master&admin101';
    const canViewMasterAdmin = authStore.isMasterAdmin || !isMasterAdminRole;
    
    return matchesSearch && matchesRole && matchesStat && canViewMasterAdmin;
  });
});

const paginatedAdmins = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return filteredAdmins.value.slice(start, start + itemsPerPage.value);
});

const totalPages = computed(() => Math.ceil(filteredAdmins.value.length / itemsPerPage.value) || 1);
const resultCount = computed(() => filteredAdmins.value.length);
const hasActiveFilters = computed(() => selectedRole.value || selectedStatus.value || searchQuery.value);

/* =====================
   LIFECYCLE
===================== */
onMounted(async () => {
  // Fetch user permissions first (required for permission checks)
  await permissions.fetchUserRoles();
  
  fetchAdmins();
  // Fetch dynamic roles and positions from collections
  fetchPositionOptions();
  fetchRoleOptions();
  // Keep permission options as before (hardcoded document IDs)
  fetchOptions("Permission_Access", ["isuzu#calapan#permission301", "isuzu#calapan#permission302", "isuzu#calapan#permission303", "isuzu#calapan#permission304", "isuzu#calapan#permission305"], "permission", permissionOptions);
  
  // Check Master Admin status for warning display
  checkMasterAdminStatus();
  
  // Listen for Master Admin warning events from router
  window.addEventListener('master-admin-warning', (event) => {
    masterAdminWarning.value = true;
    masterAdminCount.value = event.detail?.count || 0;
  });
});
</script>

<style scoped>
.isuzu-font {
  font-family: 'IsuzuFont', sans-serif;
}

/* Transisyon para sa smooth editing UI */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>