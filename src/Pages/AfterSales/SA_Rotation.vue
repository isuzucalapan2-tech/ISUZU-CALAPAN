<template>
  <div v-if="isLoading" class="min-h-screen flex items-center justify-center bg-white">
    <div class="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent"></div>
  </div>

  <div v-else :class="themeClass" class="min-h-screen flex flex-col font-sans relative overflow-hidden" @click="closeDropdown">
    
    <div class="absolute top-0 left-0 w-full z-0 opacity-5 pointer-events-none">
      <svg viewBox="0 0 500 60" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full">
        <path d="M0 15 H280 L330 45 H500" stroke="currentColor" stroke-width="1" />
      </svg>
    </div>

    <header class="relative z-10 px-8 py-8 flex justify-between items-center">
      <div class="flex items-center gap-4">
        <div class="bg-red-600 p-2 rounded-lg text-white">
          <ClipboardList class="w-5 h-5" />
        </div>
        <div>
          <h1 class="text-xl font-bold tracking-tight uppercase isuzu-font">
            Order <span class="text-red-600">Assignments</span>
          </h1>
          <div class="flex items-center gap-2 mt-1">
            <span v-if="viewMode === 'TODAY'" class="flex items-center gap-1 text-[10px] text-green-600 font-bold uppercase tracking-widest">
              <span class="w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse"></span> Live Mode
            </span>
            <span v-else class="text-[10px] text-orange-500 font-bold uppercase tracking-widest">
              History Mode: {{ historyFromDate }} {{ historyToDate ? 'to ' + historyToDate : '' }}
            </span>
          </div>
        </div>
      </div>

      <button v-if="viewMode !== 'TODAY'" @click="resetToToday" 
        class="flex items-center gap-2 px-4 py-2 bg-neutral-800 text-white text-[11px] font-bold rounded-lg hover:bg-red-600 transition-all uppercase tracking-wider">
        <RotateCcw class="w-3.5 h-3.5" /> Back to Today
      </button>
    </header>

    <main class="flex-1 relative z-10 overflow-auto px-8 pb-12">
      <div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <div class="lg:col-span-4 space-y-6">
          
          <section class="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
            <div class="px-5 py-4 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
              <h2 class="text-xs font-bold uppercase tracking-wider text-neutral-800">Retail Orders</h2>
              <span class="text-[10px] font-bold text-neutral-400">{{ prOrders.length }} Items</span>
            </div>
            <div class="p-4">
              <ul class="space-y-2 mb-4 max-h-48 overflow-y-auto pr-1">
                <li v-for="(pr, index) in prOrders" :key="index" 
                  class="group flex items-center justify-between p-3 bg-neutral-50 border border-neutral-100 rounded-lg hover:border-red-200 transition-all">
                  <span class="text-sm font-medium text-neutral-700">{{ pr }}</span>
                  <div class="relative">
                    <button @click.stop="toggleDropdown(index, 'prOrders')" class="p-1 text-neutral-400 hover:text-neutral-900">
                      <MoreVertical class="w-4 h-4" />
                    </button>
                    <div v-if="dropdownIndex === index && dropdownType === 'prOrders'" 
                      class="absolute right-0 mt-1 w-32 bg-white border border-neutral-200 shadow-xl rounded-lg z-50 py-1">
                      <button @click.stop="openPREditModal(index, pr)" class="w-full text-left px-4 py-2 text-xs font-bold hover:bg-neutral-50 flex items-center gap-2">
                        <Edit2 class="w-3 h-3 text-blue-500" /> Edit
                      </button>
                      <button @click.stop="openPRDeleteModal(index, pr)" class="w-full text-left px-4 py-2 text-xs font-bold hover:bg-neutral-50 text-red-600 flex items-center gap-2">
                        <Trash2 class="w-3 h-3" /> Delete
                      </button>
                    </div>
                  </div>
                </li>
                <li v-if="prOrders.length === 0" class="py-8 text-center text-neutral-400 text-xs italic">No items added</li>
              </ul>
              <form @submit.prevent="addPROrder" class="relative">
                <input v-model="newPROrder" type="text" placeholder="Add new order..." 
                  class="w-full pl-4 pr-12 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all" />
                <button type="submit" class="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-neutral-900 text-white rounded-lg hover:bg-red-600 transition-colors">
                  <Plus class="w-4 h-4" />
                </button>
              </form>
            </div>
          </section>

          <section class="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
            <div class="px-5 py-4 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
              <h2 class="text-xs font-bold uppercase tracking-wider text-neutral-800">Service Advisors</h2>
              <span class="text-[10px] font-bold text-neutral-400">{{ serviceAdvisors.length }} Active</span>
            </div>
            <div class="p-4">
              <ul class="space-y-2 mb-4 max-h-48 overflow-y-auto pr-1">
                <li v-for="(sa, index) in serviceAdvisors" :key="index" 
                  class="flex items-center justify-between p-3 bg-neutral-50 border border-neutral-100 rounded-lg">
                  <div class="flex flex-col">
                    <span class="text-sm font-bold text-neutral-800">{{ sa.saName }}</span>
                    <span :class="sa.saStatus === 'Available' ? 'text-green-600' : 'text-orange-500'" class="text-[10px] font-bold uppercase">{{ sa.saStatus }}</span>
                  </div>
                  <div class="relative">
                    <button @click.stop="toggleDropdown(index, 'serviceAdvisors')" class="p-1 text-neutral-400 hover:text-neutral-900">
                      <MoreVertical class="w-4 h-4" />
                    </button>
                    <div
                      v-if="dropdownIndex === index && dropdownType === 'serviceAdvisors'"
                      class="absolute right-0 mt-1 w-32 bg-white border border-neutral-200 shadow-xl rounded-lg z-50 py-1"
                    >
                      <button
                        @click.stop="openSAEditModal(index, sa.saName, sa.saStatus)"
                        class="w-full text-left px-4 py-2 text-xs font-bold hover:bg-neutral-50 flex items-center gap-2"
                      >
                        <Edit2 class="w-3 h-3 text-blue-500" /> Edit
                      </button>
                      <button
                        @click.stop="openSADeleteModal(index, sa.saName)"
                        class="w-full text-left px-4 py-2 text-xs font-bold hover:bg-neutral-50 text-red-600 flex items-center gap-2"
                      >
                        <Trash2 class="w-3 h-3" /> Delete
                      </button>
                    </div>
                  </div>
                </li>
                <li v-if="serviceAdvisors.length === 0" class="py-8 text-center text-neutral-400 text-xs italic">No advisors registered</li>
              </ul>
              <form @submit.prevent="addServiceAdvisor" class="relative">
                <input v-model="newServiceAdvisor" type="text" placeholder="Advisor name..." 
                  class="w-full pl-4 pr-12 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all" />
                <button type="submit" class="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-neutral-900 text-white rounded-lg hover:bg-red-600 transition-colors">
                  <Plus class="w-4 h-4" />
                </button>
              </form>
            </div>
          </section>
        </div>

        <div class="lg:col-span-8 space-y-6">
          
          <section class="bg-white rounded-xl border-2 border-red-100 shadow-sm overflow-hidden">
            <div class="px-6 py-4 bg-red-600 flex justify-between items-center text-white">
              <h2 class="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <Zap class="w-4 h-4" /> Auto Assign Order
              </h2>
              <div v-if="hasDiscontinuedOrders" class="px-2 py-1 bg-white/20 rounded text-[10px] font-bold">
                {{ discontinuedAssignments.length }} DISCONTINUED ORDERS
              </div>
            </div>
            
            <div class="p-6">
              <div v-if="!canCreateAssignments && viewMode !== 'TODAY'" class="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-xl flex items-center gap-3 text-orange-700">
                <AlertCircle class="w-5 h-5" />
                <p class="text-xs font-bold uppercase">Switch to "Today's View" to create new assignments.</p>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-4">
                  <div>
                    <label class="block text-[11px] font-bold text-neutral-400 uppercase mb-2">Select Retail Order</label>
                    <select v-model="assignmentForm.selectedPRO" @change="onPROSelected"
                      class="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-bold focus:border-red-500 outline-none transition-all appearance-none cursor-pointer">
                      <option value="">CHOOSE AN ORDER</option>
                      <option v-for="pro in availablePROs" :key="pro" :value="pro">{{ pro }}</option>
                    </select>
                  </div>

                  <div v-if="assignmentForm.selectedPRO" class="p-4 rounded-xl border-2 border-dashed border-neutral-200 bg-neutral-50/50">
                    <p class="text-[10px] font-bold text-neutral-400 uppercase mb-1">Target Advisor</p>
                    <div v-if="autoAssignedSA" class="flex items-center gap-2 text-green-700">
                      <UserCheck class="w-5 h-5" />
                      <span class="text-lg font-bold">{{ autoAssignedSA.saName }}</span>
                    </div>
                    <div v-else class="text-red-500 font-bold text-sm">No available advisors</div>
                  </div>
                </div>

                <div class="space-y-4">
                  <div>
                    <label class="block text-[11px] font-bold text-neutral-400 uppercase mb-2">Internal Note (Optional)</label>
                    <textarea v-model="assignmentForm.note" rows="3" placeholder="Add instructions..."
                      class="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:border-red-500 outline-none transition-all resize-none"></textarea>
                  </div>
                  
                  <div class="flex gap-2">
                    <button @click="proceedAssignment" class="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-200">
                      Assign Now
                    </button>
                    <button @click="clearAssignmentForm" class="px-4 py-3 bg-neutral-100 text-neutral-600 rounded-xl font-bold text-xs hover:bg-neutral-200 transition-all">
                      <X class="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div class="mt-6 pt-6 border-t border-neutral-100">
                <button @click="showManualSelection = !showManualSelection" 
                  class="text-[11px] font-bold text-neutral-400 hover:text-red-600 transition-colors uppercase flex items-center gap-2">
                  <SlidersHorizontal class="w-3.5 h-3.5" /> Manual Override {{ showManualSelection ? '▲' : '▼' }}
                </button>
                
                <div v-if="showManualSelection" class="mt-4 flex flex-wrap gap-2">
                  <button v-for="sa in rankedSAsForManual" :key="sa.saName" @click="selectManualSA(sa.saName)"
                    class="px-4 py-2 border border-neutral-200 rounded-lg text-xs font-bold hover:border-red-600 hover:text-red-600 transition-all">
                    {{ sa.saName }}
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section class="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
            <div class="px-6 py-4 border-b border-neutral-100 flex flex-wrap justify-between items-center gap-4 bg-neutral-50/50">
              <h2 class="text-xs font-bold uppercase tracking-wider text-neutral-800">Active Assignments</h2>
              <div class="relative w-full md:w-64">
                <Search class="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input v-model="searchQuery" type="text" placeholder="Search orders..." 
                  class="w-full pl-9 pr-4 py-1.5 bg-white border border-neutral-200 rounded-lg text-[11px] focus:border-red-500 outline-none transition-all" />
              </div>
            </div>
            
            <div class="overflow-x-auto">
              <table class="w-full text-left">
                <thead>
                  <tr class="bg-neutral-50/50 border-b border-neutral-100">
                    <th class="px-6 py-3 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Order (PRO)</th>
                    <th class="px-6 py-3 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Advisor</th>
                    <th class="px-6 py-3 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Status</th>
                    <th class="px-6 py-3 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Date</th>
                    <th class="px-6 py-3 text-[10px] font-bold text-neutral-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-neutral-50">
                  <tr v-for="(assignment, index) in paginatedActiveAssignments" :key="index" class="hover:bg-neutral-50 transition-colors">
                    <td class="px-6 py-4 text-sm font-bold text-neutral-800">{{ assignment.pro }}</td>
                    <td class="px-6 py-4 text-sm text-neutral-600">{{ assignment.saName }}</td>
                    <td class="px-6 py-4">
                      <span class="px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded-md uppercase">
                        {{ assignment.status }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-[11px] text-neutral-400 font-medium">{{ assignment.date }}</td>
                    <td class="px-6 py-4 text-right space-x-1">
                      <button @click="openEditModal(getOriginalIndex(assignment), assignment)" class="p-1.5 text-neutral-400 hover:text-blue-600 transition-colors" title="Edit"><Edit2 class="w-4 h-4" /></button>
                      <button @click="markAsDone(getOriginalIndex(assignment))" class="p-1.5 text-neutral-400 hover:text-green-600 transition-colors" title="Mark Done"><CheckCircle2 class="w-4 h-4" /></button>
                      <button @click="cancelAssignment(getOriginalIndex(assignment))" class="p-1.5 text-neutral-400 hover:text-red-600 transition-colors" title="Cancel"><XCircle class="w-4 h-4" /></button>
                    </td>
                  </tr>
                  <tr v-if="paginatedActiveAssignments.length === 0">
                    <td colspan="5" class="px-6 py-12 text-center text-neutral-400 text-xs italic">No active assignments found</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section class="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
            <div class="px-6 py-5 border-b border-neutral-100 bg-neutral-50/50">
              <h2 class="text-xs font-bold uppercase tracking-wider text-neutral-800 mb-4">Historical Records</h2>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="relative">
                  <Calendar class="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input v-model="historyFromDate" @change="onDateFilterChange" type="date" class="w-full pl-9 pr-4 py-2 border border-neutral-200 rounded-xl text-xs font-bold outline-none" />
                </div>
                <div class="relative">
                  <Calendar class="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input v-model="historyToDate" @change="onDateFilterChange" type="date" class="w-full pl-9 pr-4 py-2 border border-neutral-200 rounded-xl text-xs font-bold outline-none" />
                </div>
                <div class="relative">
                  <Search class="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input v-model="historySearchQuery" type="text" placeholder="Filter history..." class="w-full pl-9 pr-4 py-2 border border-neutral-200 rounded-xl text-xs font-bold outline-none" />
                </div>
              </div>
            </div>
            
            <div class="overflow-x-auto">
              <table class="w-full text-left">
                <thead>
                  <tr class="bg-neutral-50/50 border-b border-neutral-100">
                    <th class="px-6 py-3 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Order (PRO)</th>
                    <th class="px-6 py-3 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Final Status</th>
                    <th class="px-6 py-3 text-[10px] font-bold text-neutral-400 uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-neutral-50">
                  <tr v-for="(assignment, index) in paginatedHistoryAssignments" :key="index" class="hover:bg-neutral-50 transition-colors">
                    <td class="px-6 py-4 text-sm font-bold text-neutral-800">{{ assignment.pro }}</td>
                    <td class="px-6 py-4">
                      <span :class="assignment.status === 'DONE' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'" 
                        class="px-2 py-1 text-[10px] font-black rounded-md uppercase">
                        {{ assignment.status }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-right">
                      <button @click="deleteAssignment(getOriginalIndex(assignment))" class="p-1.5 text-neutral-400 hover:text-red-600 transition-colors">
                        <Trash2 class="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                  <tr v-if="paginatedHistoryAssignments.length === 0">
                    <td colspan="3" class="px-6 py-12 text-center text-neutral-400 text-xs italic">No historical records for this criteria</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </main>

    <div v-if="showEditPRModal" class="fixed inset-0 z-70 flex items-center justify-center bg-black/40 p-4" @click="closePREditModal">
      <div class="w-full max-w-md rounded-xl border border-neutral-200 bg-white shadow-2xl" @click.stop>
        <div class="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
          <h3 class="text-sm font-bold uppercase tracking-wider text-neutral-800">Edit Retail Order</h3>
          <button @click="closePREditModal" class="rounded-md p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-800">
            <X class="h-4 w-4" />
          </button>
        </div>
        <div class="space-y-3 px-5 py-4">
          <label class="block text-[11px] font-bold uppercase tracking-wider text-neutral-500">Retail Order</label>
          <input
            v-model="editingPROrder"
            type="text"
            class="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-medium outline-none transition-all focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
            placeholder="Enter order name"
          />
        </div>
        <div class="flex justify-end gap-2 border-t border-neutral-100 px-5 py-4">
          <button @click="closePREditModal" class="rounded-lg bg-neutral-100 px-4 py-2 text-xs font-bold uppercase tracking-wider text-neutral-700 transition-colors hover:bg-neutral-200">
            Cancel
          </button>
          <button @click="savePROrderEdit" class="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-red-700">
            Save Changes
          </button>
        </div>
      </div>
    </div>

    <div v-if="showDeletePRModal" class="fixed inset-0 z-70 flex items-center justify-center bg-black/40 p-4" @click="closePRDeleteModal">
      <div class="w-full max-w-md rounded-xl border border-neutral-200 bg-white shadow-2xl" @click.stop>
        <div class="border-b border-neutral-100 px-5 py-4">
          <h3 class="text-sm font-bold uppercase tracking-wider text-neutral-800">Delete Retail Order</h3>
        </div>
        <div class="px-5 py-4">
          <p class="text-sm text-neutral-600">
            Delete <span class="font-bold text-neutral-900">{{ deletingPROrder }}</span>? This action cannot be undone.
          </p>
        </div>
        <div class="flex justify-end gap-2 border-t border-neutral-100 px-5 py-4">
          <button @click="closePRDeleteModal" class="rounded-lg bg-neutral-100 px-4 py-2 text-xs font-bold uppercase tracking-wider text-neutral-700 transition-colors hover:bg-neutral-200">
            Cancel
          </button>
          <button @click="confirmDeletePROrder" class="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-red-700">
            Delete
          </button>
        </div>
      </div>
    </div>

    <div v-if="showEditSAModal" class="fixed inset-0 z-70 flex items-center justify-center bg-black/40 p-4" @click="closeSAEditModal">
      <div class="w-full max-w-md rounded-xl border border-neutral-200 bg-white shadow-2xl" @click.stop>
        <div class="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
          <h3 class="text-sm font-bold uppercase tracking-wider text-neutral-800">Edit Service Advisor</h3>
          <button @click="closeSAEditModal" class="rounded-md p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-800">
            <X class="h-4 w-4" />
          </button>
        </div>
        <div class="space-y-3 px-5 py-4">
          <div>
            <label class="mb-1 block text-[11px] font-bold uppercase tracking-wider text-neutral-500">Advisor Name</label>
            <input
              v-model="editingSAName"
              type="text"
              class="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-medium outline-none transition-all focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
              placeholder="Enter advisor name"
            />
          </div>
          <div>
            <label class="mb-1 block text-[11px] font-bold uppercase tracking-wider text-neutral-500">Status</label>
            <select
              v-model="editingSAStatus"
              class="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-medium outline-none transition-all focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
            >
              <option v-for="status in statuses" :key="status" :value="status">{{ status }}</option>
            </select>
          </div>
        </div>
        <div class="flex justify-end gap-2 border-t border-neutral-100 px-5 py-4">
          <button @click="closeSAEditModal" class="rounded-lg bg-neutral-100 px-4 py-2 text-xs font-bold uppercase tracking-wider text-neutral-700 transition-colors hover:bg-neutral-200">
            Cancel
          </button>
          <button @click="saveSAEdit" class="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-red-700">
            Save Changes
          </button>
        </div>
      </div>
    </div>

    <div v-if="showDeleteSAModal" class="fixed inset-0 z-70 flex items-center justify-center bg-black/40 p-4" @click="closeSADeleteModal">
      <div class="w-full max-w-md rounded-xl border border-neutral-200 bg-white shadow-2xl" @click.stop>
        <div class="border-b border-neutral-100 px-5 py-4">
          <h3 class="text-sm font-bold uppercase tracking-wider text-neutral-800">Delete Service Advisor</h3>
        </div>
        <div class="px-5 py-4">
          <p class="text-sm text-neutral-600">
            Delete <span class="font-bold text-neutral-900">{{ deletingSAName }}</span>? This action cannot be undone.
          </p>
        </div>
        <div class="flex justify-end gap-2 border-t border-neutral-100 px-5 py-4">
          <button @click="closeSADeleteModal" class="rounded-lg bg-neutral-100 px-4 py-2 text-xs font-bold uppercase tracking-wider text-neutral-700 transition-colors hover:bg-neutral-200">
            Cancel
          </button>
          <button @click="confirmDeleteSA" class="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-red-700">
            Delete
          </button>
        </div>
      </div>
    </div>

    <div class="absolute bottom-0 left-0 w-full z-0 opacity-5 pointer-events-none transform rotate-180">
      <svg viewBox="0 0 500 60" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full">
        <path d="M0 45 H170 L220 15 H500" stroke="currentColor" stroke-width="1" />
      </svg>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue';
import { db } from "../../Firebase/Firebase";
import { doc, onSnapshot, updateDoc, getDoc, deleteField, setDoc, collection, getDocs } from "firebase/firestore";
import { useToast } from "../../composables/useToast";
import { 
  ClipboardList, Search, Plus, MoreVertical, Edit2, Trash2, 
  RotateCcw, Zap, UserCheck, SlidersHorizontal, AlertCircle, X, 
  CheckCircle2, XCircle, Calendar 
} from "lucide-vue-next";

// Initialize toast notifications
const toast = useToast();

// ==========================================
// CONFIGURATION
// ==========================================
const CONFIG = {
  MAX_ONGOING_PER_SA: 5,
  STATUS_UNAVAILABLE: ['BUSY', 'ABSENT'],
  STATUS_AVAILABLE: ['AVAILABLE', 'WORKING'],
  MAX_HISTORY_RANGE_DAYS: 31
};

// ==========================================
// STATE
// ==========================================

// Core Data
const serviceAdvisors = ref([]);
const prOrders = ref([]);
const assignments = ref([]);
const statuses = ref([]);

// Assignment Stats (persisted to Firebase)
const saStats = ref({}); // { saName: { totalAssigned, lastAssigned, handledPROs: [] } }
const proHandlers = ref({}); // { proName: [saNames] }

// UI State
const dropdownIndex = ref(null);
const dropdownType = ref(null);
const hoveringSAIndex = ref(null);
const showManualSelection = ref(false);
const manualOverrideWarning = ref(null);
const noAssignmentReason = ref('');

// Forms
const newServiceAdvisor = ref("");
const newPROrder = ref("");
const assignmentForm = ref({
  selectedPRO: "",
  selectedSA: "",
  note: "",
  isManualOverride: false
});

// Modals
const showEditModal = ref(false);
const showEditPRModal = ref(false);
const showDeletePRModal = ref(false);
const showEditSAModal = ref(false);
const showDeleteSAModal = ref(false);
const editingAssignment = ref(null);
const editingIndex = ref(null);
const editingPROrder = ref("");
const editingPRIndex = ref(null);
const deletingPROrder = ref("");
const deletingPRIndex = ref(null);
const editingSAName = ref("");
const editingSAStatus = ref("");
const editingSAIndex = ref(null);
const deletingSAName = ref("");
const deletingSAIndex = ref(null);

// Pagination & Search
const searchQuery = ref("");
const historySearchQuery = ref("");
const historyStatusFilter = ref("");
const currentPage = ref(1);
const historyPage = ref(1);
const itemsPerPage = ref(5);

// Date Filtering
const historyFromDate = ref(getTodayDateString());
const historyToDate = ref(getTodayDateString());
const currentlyViewingDateRange = ref(false);
const assignmentsListener = ref(null);
const statsListener = ref(null);
const proHandlersListener = ref(null);
const loadedDateKeys = ref(new Set()); // Track loaded dates for proper deletion

// ==========================================
// COMPUTED - VIEW MODE & DATE HANDLING
// ==========================================

const todayDate = computed(() => {
  const today = new Date();
  return formatDateKey(today);
});

const viewMode = computed(() => {
  if (!currentlyViewingDateRange.value) return 'TODAY';
  if (historyFromDate.value === todayDate.value && historyToDate.value === todayDate.value) return 'TODAY';
  if (historyFromDate.value === historyToDate.value) return 'SINGLE_DAY';
  return 'RANGE';
});

// Discontinued orders (yesterday's ON GOING assignments that persist to today)
const discontinuedAssignments = computed(() => {
  return assignments.value.filter(assignment => 
    assignment.status === "ON GOING" && isAssignmentCutOff(assignment)
  );
});

const hasDiscontinuedOrders = computed(() => discontinuedAssignments.value.length > 0);

const canCreateAssignments = computed(() => {
  // Can only create assignments in TODAY view AND when no discontinued orders exist
  return viewMode.value === 'TODAY' && !hasDiscontinuedOrders.value;
});

const dateRangeDays = computed(() => {
  if (viewMode.value !== 'RANGE') return 0;
  const from = new Date(historyFromDate.value);
  const to = new Date(historyToDate.value);
  return Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1;
});

// ==========================================
// COMPUTED - ASSIGNMENT DATA
// ==========================================

const availablePROs = computed(() => {
  // Show all PROs - allow assigning similar ROs
  // The assignment logic will prevent invalid duplicates (same PRO to same SA with ON GOING)
  return prOrders.value;
});

const autoAssignedSA = computed(() => {
  if (!assignmentForm.value.selectedPRO) return null;
  return getBestSA(assignmentForm.value.selectedPRO);
});

const rankedSAsForManual = computed(() => {
  if (!assignmentForm.value.selectedPRO) return [];
  
  const pro = assignmentForm.value.selectedPRO;
  const handlers = proHandlers.value[pro] || [];
  
  // Check which SAs already have this PRO in ON GOING or JOB DONE status
  const saHasSimilarRO = (saName) => {
    return assignments.value.some(a => 
      a.pro === pro && 
      a.saName === saName && 
      (a.status === 'ON GOING' || a.status === 'JOB DONE')
    );
  };
  
  return serviceAdvisors.value.map(sa => {
    const isUnavailable = CONFIG.STATUS_UNAVAILABLE.includes(sa.saStatus);
    const hasSimilarRO = saHasSimilarRO(sa.saName);
    
    // SA is available if not unavailable (BUSY/ABSENT)
    // Note: Having similar RO doesn't disable the SA, just marks them as repeat handler
    const isAvailable = !isUnavailable;
    
    // New handler = hasn't handled this PRO AND doesn't have similar RO ongoing/done
    const isNewHandler = !handlers.includes(sa.saName) && !hasSimilarRO;
    
    return {
      saName: sa.saName,
      saStatus: sa.saStatus,
      isAvailable,
      isNewHandler,
      hasSimilarRO, // Track this for UI indication
      totalAssigned: getTotalAssigned(sa.saName),
      currentActive: getCurrentActive(sa.saName),
      sortScore: (isNewHandler ? 0 : 1000) + getTotalAssigned(sa.saName)
    };
  }).sort((a, b) => {
    // New handlers first, then by total assigned
    if (a.isNewHandler !== b.isNewHandler) return a.isNewHandler ? -1 : 1;
    return a.totalAssigned - b.totalAssigned;
  });
});

const filteredActiveAssignments = computed(() => {
  return assignments.value.filter(assignment => {
    const matchesSearch = !searchQuery.value || 
      assignment.pro.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      assignment.saName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (assignment.note && assignment.note.toLowerCase().includes(searchQuery.value.toLowerCase()));
    const isOnGoing = assignment.status === "ON GOING";
    return matchesSearch && isOnGoing;
  });
});

const totalActivePages = computed(() => 
  Math.ceil(filteredActiveAssignments.value.length / itemsPerPage.value) || 1
);

const paginatedActiveAssignments = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return filteredActiveAssignments.value.slice(start, start + itemsPerPage.value);
});

const filteredHistoryAssignments = computed(() => {
  return assignments.value.filter(assignment => {
    const matchesSearch = !historySearchQuery.value || 
      assignment.pro.toLowerCase().includes(historySearchQuery.value.toLowerCase()) ||
      assignment.saName.toLowerCase().includes(historySearchQuery.value.toLowerCase());
    const matchesStatus = !historyStatusFilter.value || assignment.status === historyStatusFilter.value;
    const isInHistory = assignment.status === "JOB DONE" || assignment.status === "CANCELLED";
    return matchesSearch && matchesStatus && isInHistory;
  });
});

const totalHistoryPages = computed(() => 
  Math.ceil(filteredHistoryAssignments.value.length / itemsPerPage.value) || 1
);

const paginatedHistoryAssignments = computed(() => {
  const start = (historyPage.value - 1) * itemsPerPage.value;
  return filteredHistoryAssignments.value.slice(start, start + itemsPerPage.value);
});

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

function getTodayDateString() {
  return formatDateKey(new Date());
}

function generateAssignmentId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDate(date) {
  if (!date) return "—";
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const year = d.getFullYear();
  return `${month}/${day}/${year}`;
}

function fisherYatesShuffle(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// ==========================================
// SA STATUS & STATS HELPERS
// ==========================================

function getSAStatusColor(status) {
  const colors = {
    'WORKING': 'bg-green-600 text-white',
    'BUSY': 'bg-red-600 text-white',
    'AVAILABLE': 'bg-blue-600 text-white',
    'ABSENT': 'bg-amber-700 text-white',
    'IDLE': 'bg-slate-500 text-white'
  };
  return colors[status] || 'bg-slate-500 text-white';
}

function getWorkloadColor(count) {
  if (count <= 1) return 'bg-green-500';
  if (count === 2) return 'bg-yellow-500';
  if (count === 3) return 'bg-orange-500';
  if (count >= 4) return 'bg-red-500';
  return 'bg-slate-400';
}

function isSAAvailable(sa) {
  // Remove capacity restriction - only check status availability
  return CONFIG.STATUS_AVAILABLE.includes(sa.saStatus);
}

function getCurrentActive(saName) {
  return assignments.value.filter(
    a => a.saName === saName && a.status === "ON GOING"
  ).length;
}

function getActiveProsList(saName) {
  return assignments.value
    .filter(a => a.saName === saName && a.status === "ON GOING")
    .map(a => a.pro);
}

function getTotalAssigned(saName) {
  return saStats.value[saName]?.totalAssigned || 0;
}

function getTotalAssignedAll() {
  return Object.values(saStats.value).reduce((sum, stat) => sum + (stat.totalAssigned || 0), 0);
}

function getTotalActiveAll() {
  return serviceAdvisors.value.reduce((sum, sa) => sum + getCurrentActive(sa.saName), 0);
}

function getCapacityPercentage() {
  const totalCapacity = serviceAdvisors.value.length * CONFIG.MAX_ONGOING_PER_SA;
  return totalCapacity > 0 ? Math.round((getTotalActiveAll() / totalCapacity) * 100) : 0;
}

function getSAQuickStatus(sa) {
  if (!sa.isAvailable) {
    if (CONFIG.STATUS_UNAVAILABLE.includes(sa.saStatus)) return sa.saStatus;
    if (sa.currentActive >= CONFIG.MAX_ONGOING_PER_SA) return 'AT CAPACITY';
    return 'ASSIGNED';
  }
  if (sa.isNewHandler) return 'NEW';
  if (sa.hasSimilarRO) return 'HAS SIMILAR RO';
  return 'HANDLED BEFORE';
}

// ==========================================
// CORE ASSIGNMENT ALGORITHM
// ==========================================

function getBestSA(proName) {
  noAssignmentReason.value = '';
  
  // Get handlers for this PRO
  const handlers = proHandlers.value[proName] || [];
  
  // Check which SAs already have this PRO in ON GOING or JOB DONE status
  const saHasSimilarRO = (saName) => {
    return assignments.value.some(a => 
      a.pro === proName && 
      a.saName === saName && 
      (a.status === 'ON GOING' || a.status === 'JOB DONE')
    );
  };
  
  // Step 1: Filter by availability
  let availableSAs = serviceAdvisors.value.filter(sa => {
    const isUnavailable = CONFIG.STATUS_UNAVAILABLE.includes(sa.saStatus);
    return !isUnavailable;
  });
  
  if (availableSAs.length === 0) {
    noAssignmentReason.value = 'No available advisors (all busy)';
    return null;
  }
  
  // Step 2: Split by handler history AND similar RO status
  // New handlers = haven't handled this PRO AND don't have similar RO ongoing/done
  const newHandlers = availableSAs.filter(sa => 
    !handlers.includes(sa.saName) && !saHasSimilarRO(sa.saName)
  );
  
  // Repeat handlers = have handled this PRO OR have similar RO ongoing/done
  const repeatHandlers = availableSAs.filter(sa => 
    handlers.includes(sa.saName) || saHasSimilarRO(sa.saName)
  );
  
  // Step 3: Determine candidate pool
  let candidatePool;
  let selectionReason;
  
  if (newHandlers.length > 0) {
    // Prefer SAs who haven't handled this PRO at all
    candidatePool = newHandlers;
    selectionReason = 'new_handler';
  } else if (repeatHandlers.length > 0) {
    // All SAs have handled this PRO or have it ongoing/done - must cycle
    candidatePool = repeatHandlers;
    selectionReason = 'all_handled_before';
  } else {
    noAssignmentReason.value = 'All eligible advisors have handled this RO';
    return null;
  }
  
  // Step 4: Shuffle for randomization (combined random + time-based)
  let shuffled = fisherYatesShuffle(candidatePool);
  
  // Step 5: Sort by fairness criteria (stable sort preserves shuffle randomness for ties)
  shuffled.sort((a, b) => {
    // Primary: Total assigned count (lower first)
    const totalA = getTotalAssigned(a.saName);
    const totalB = getTotalAssigned(b.saName);
    if (totalA !== totalB) return totalA - totalB;
    
    // Secondary: Current active count (lower first)
    const activeA = getCurrentActive(a.saName);
    const activeB = getCurrentActive(b.saName);
    if (activeA !== activeB) return activeA - activeB;
    
    // Tertiary: Time since last assignment (longer = higher priority)
    // Since we shuffled, this acts as random tiebreaker for equal scores
    const lastA = saStats.value[a.saName]?.lastAssigned?.toMillis?.() || 0;
    const lastB = saStats.value[b.saName]?.lastAssigned?.toMillis?.() || 0;
    return lastB - lastA; // Longer ago = higher priority
  });
  
  const bestSA = shuffled[0];
  return {
    saName: bestSA.saName,
    reason: selectionReason,
    isNewHandler: selectionReason === 'new_handler'
  };
}

function getAssignmentReasonText(sa) {
  if (!sa) return '';
  if (sa.reason === 'new_handler') {
    return 'First time handling this RO';
  }
  return 'All advisors have handled this RO';
}

// ==========================================
// UI ACTIONS
// ==========================================

function closeDropdown() {
  dropdownIndex.value = null;
  dropdownType.value = null;
}

function toggleDropdown(index, type) {
  if (dropdownIndex.value === index && dropdownType.value === type) {
    closeDropdown();
  } else {
    dropdownIndex.value = index;
    dropdownType.value = type;
  }
}

function onPROSelected() {
  // Auto-assignment happens via computed property
  const auto = autoAssignedSA.value;
  if (auto) {
    assignmentForm.value.selectedSA = auto.saName;
  } else {
    assignmentForm.value.selectedSA = '';
  }
  showManualSelection.value = false;
  manualOverrideWarning.value = null;
}

function selectManualSA(saName) {
  const pro = assignmentForm.value.selectedPRO;
  const handlers = proHandlers.value[pro] || [];
  const sa = serviceAdvisors.value.find(s => s.saName === saName);
  
  assignmentForm.value.selectedSA = saName;
  assignmentForm.value.isManualOverride = true;
  
  // Check if SA has similar RO (ON GOING or JOB DONE)
  const hasSimilarRO = assignments.value.some(a => 
    a.pro === pro && 
    a.saName === saName && 
    (a.status === 'ON GOING' || a.status === 'JOB DONE')
  );
  
  // Check if this is a "forced" override (violates fairness rules)
  const isRepeatHandler = handlers.includes(saName) || hasSimilarRO;
  
  if (isRepeatHandler) {
    // Find SAs who haven't handled this PRO and don't have similar RO
    const newHandlers = serviceAdvisors.value.filter(s => {
      const sHasSimilarRO = assignments.value.some(a => 
        a.pro === pro && 
        a.saName === s.saName && 
        (a.status === 'ON GOING' || a.status === 'JOB DONE')
      );
      return !handlers.includes(s.saName) && !sHasSimilarRO && CONFIG.STATUS_AVAILABLE.includes(s.saStatus);
    });
    
    if (newHandlers.length > 0) {
      if (hasSimilarRO && !handlers.includes(saName)) {
        manualOverrideWarning.value = 
          `⚠️ ${saName} currently has or recently completed this RO. ${newHandlers.length} other(s) available.`;
      } else if (handlers.includes(saName) && hasSimilarRO) {
        manualOverrideWarning.value = 
          `⚠️ ${saName} has handled this RO before AND currently has it. ${newHandlers.length} other(s) available.`;
      } else {
        manualOverrideWarning.value = 
          `⚠️ ${saName} has handled this RO before. ${newHandlers.length} other(s) have not.`;
      }
    } else {
      manualOverrideWarning.value = null; // All have handled, no issue
    }
  } else {
    manualOverrideWarning.value = null;
  }
}

function resetToAutoAssignment() {
  const auto = autoAssignedSA.value;
  if (auto) {
    assignmentForm.value.selectedSA = auto.saName;
    assignmentForm.value.isManualOverride = false;
  }
  showManualSelection.value = false;
  manualOverrideWarning.value = null;
}

function resetToToday() {
  historyFromDate.value = todayDate.value;
  historyToDate.value = todayDate.value;
  currentlyViewingDateRange.value = false;
  onDateFilterChange();
}

// ==========================================
// FIREBASE - LISTENERS
// ==========================================

function listenToStatuses() {
  const docRef = doc(db, "Service_Advisor", "isuzu&calapan&status");
  onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      statuses.value = Object.keys(data)
        .filter(key => key.startsWith("status"))
        .sort((a, b) => parseInt(a.replace("status", "")) - parseInt(b.replace("status", "")))
        .map(key => data[key]);
    }
  });
}

function listenToServiceAdvisors() {
  const docRef = doc(db, "Service_Advisor", "isuzu&calapan&sa");
  onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      serviceAdvisors.value = Object.values(data).map(item => ({
        saName: item.saName,
        saStatus: item.saStatus
      }));
    }
  });
}

function listenToPROrders() {
  const docRef = doc(db, "PR_Order", "isuzu&calapan&pro");
  onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      prOrders.value = Object.values(data);
    }
  });
}

function listenToAssignments() {
  const dateKey = todayDate.value;
  const docRef = doc(db, "SA_Assignment", `isuzu&calapan&assignments&${dateKey}`);
  
  if (assignmentsListener.value) {
    assignmentsListener.value();
  }
  
  // Track today's date for proper deletion handling
  loadedDateKeys.value = new Set([dateKey]);
  
  assignmentsListener.value = onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      assignments.value = Object.values(data).map(item => ({
        id: item.id || null, // Preserve ID field
        pro: item.pro || "",
        saName: item.saName || "",
        note: item.note || "",
        status: item.status || "ON GOING",
        date: item.date instanceof Date ? item.date : (item.date ? new Date(item.date) : new Date())
      }));
    } else {
      assignments.value = [];
    }
  });
}

function listenToSAStats() {
  const docRef = doc(db, "SA_Assignment_Stats", "isuzu&calapan&stats");
  
  if (statsListener.value) {
    statsListener.value();
  }
  
  statsListener.value = onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      saStats.value = docSnap.data();
    } else {
      saStats.value = {};
    }
  });
}

function listenToPROHandlers() {
  const docRef = doc(db, "PRO_Handlers", "isuzu&calapan&handlers");
  
  if (proHandlersListener.value) {
    proHandlersListener.value();
  }
  
  proHandlersListener.value = onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      proHandlers.value = docSnap.data();
    } else {
      proHandlers.value = {};
    }
  });
}

function stopAssignmentsListener() {
  if (assignmentsListener.value) {
    assignmentsListener.value();
    assignmentsListener.value = null;
  }
}

// ==========================================
// FIREBASE - DATA OPERATIONS
// ==========================================

async function onDateFilterChange() {
  // Validate range
  let from = new Date(historyFromDate.value);
  let to = new Date(historyToDate.value);
  
  if (from > to) {
    [historyFromDate.value, historyToDate.value] = [historyToDate.value, historyFromDate.value];
    from = new Date(historyFromDate.value);
    to = new Date(historyToDate.value);
  }
  
  const daysDiff = Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1;
  if (daysDiff > CONFIG.MAX_HISTORY_RANGE_DAYS) {
    alert(`Maximum range is ${CONFIG.MAX_HISTORY_RANGE_DAYS} days`);
    historyToDate.value = formatDateKey(new Date(from.getTime() + (CONFIG.MAX_HISTORY_RANGE_DAYS - 1) * 24 * 60 * 60 * 1000));
    to = new Date(historyToDate.value);
  }
  
  currentlyViewingDateRange.value = !(historyFromDate.value === todayDate.value && historyToDate.value === todayDate.value);
  
  if (viewMode.value === 'TODAY') {
    listenToAssignments();
  } else {
    stopAssignmentsListener();
    await loadAssignmentsByDateRange();
  }
  
  // Reset pagination
  currentPage.value = 1;
  historyPage.value = 1;
}

async function loadAssignmentsByDateRange() {
  try {
    let fromDate = new Date(historyFromDate.value);
    let toDate = new Date(historyToDate.value);
    
    const allAssignments = [];
    const newLoadedDateKeys = new Set(); // Track dates we load from
    let currentDate = new Date(fromDate);
    let daysChecked = 0;
    
    while (currentDate <= toDate && daysChecked < CONFIG.MAX_HISTORY_RANGE_DAYS) {
      const dateKey = formatDateKey(currentDate);
      const docRef = doc(db, "SA_Assignment", `isuzu&calapan&assignments&${dateKey}`);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        const dayAssignments = Object.values(data).map(item => ({
          id: item.id || null, // Preserve ID field
          pro: item.pro || "",
          saName: item.saName || "",
          note: item.note || "",
          status: item.status || "ON GOING",
          date: item.date ? new Date(item.date) : new Date(),
          sourceDate: dateKey
        }));
        allAssignments.push(...dayAssignments);
        newLoadedDateKeys.add(dateKey); // Track this date as loaded
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
      daysChecked++;
    }
    
    assignments.value = allAssignments;
    loadedDateKeys.value = newLoadedDateKeys; // Update loaded dates tracking
  } catch (error) {
    console.error("Error loading date range:", error);
  }
}

async function recordAssignmentStats(saName, proName) {
  try {
    const docRef = doc(db, "SA_Assignment_Stats", "isuzu&calapan&stats");
    const docSnap = await getDoc(docRef);
    
    const now = new Date();
    let currentStats = docSnap.exists() ? docSnap.data() : {};
    
    // Update SA stats
    if (!currentStats[saName]) {
      currentStats[saName] = { totalAssigned: 0, handledPROs: [] };
    }
    currentStats[saName].totalAssigned = (currentStats[saName].totalAssigned || 0) + 1;
    currentStats[saName].lastAssigned = now.toISOString();
    
    if (!currentStats[saName].handledPROs.includes(proName)) {
      currentStats[saName].handledPROs.push(proName);
    }
    
    if (docSnap.exists()) {
      await updateDoc(docRef, currentStats);
    } else {
      await setDoc(docRef, currentStats);
    }
  } catch (error) {
    console.error("Error recording SA stats:", error);
  }
}

async function decrementSAStats(saName, proName) {
  try {
    const docRef = doc(db, "SA_Assignment_Stats", "isuzu&calapan&stats");
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) return;
    
    let currentStats = docSnap.data();
    
    // Only decrement if stats exist for this SA
    if (currentStats[saName]) {
      // Decrement totalAssigned (minimum 0)
      currentStats[saName].totalAssigned = Math.max(0, (currentStats[saName].totalAssigned || 0) - 1);
      
      // Remove pro from handledPROs if it exists
      if (currentStats[saName].handledPROs && currentStats[saName].handledPROs.includes(proName)) {
        currentStats[saName].handledPROs = currentStats[saName].handledPROs.filter(p => p !== proName);
      }
      
      await updateDoc(docRef, currentStats);
    }
  } catch (error) {
    console.error("Error decrementing SA stats:", error);
  }
}

async function recordPROHandler(proName, saName) {
  try {
    const docRef = doc(db, "PRO_Handlers", "isuzu&calapan&handlers");
    const docSnap = await getDoc(docRef);
    
    // Sanitize PRO name for use as Firebase field key
    // Replace invalid characters: ~ * / [ ] with underscores
    const sanitizedProName = proName.replace(/[~/[\]]/g, '_');
    
    let currentHandlers = docSnap.exists() ? docSnap.data() : {};
    
    if (!currentHandlers[sanitizedProName]) {
      currentHandlers[sanitizedProName] = [];
    }
    if (!currentHandlers[sanitizedProName].includes(saName)) {
      currentHandlers[sanitizedProName].push(saName);
    }
    
    if (docSnap.exists()) {
      await updateDoc(docRef, currentHandlers);
    } else {
      await setDoc(docRef, currentHandlers);
    }
  } catch (error) {
    console.error("Error recording PRO handler:", error);
  }
}

async function saveAssignmentsToFirebase() {
  try {
    const assignmentsByDate = {};
    assignments.value.forEach(assignment => {
      const dateStr = assignment.date instanceof Date ? 
        formatDateKey(assignment.date) : 
        String(assignment.date).split('T')[0];
      if (!assignmentsByDate[dateStr]) {
        assignmentsByDate[dateStr] = [];
      }
      assignmentsByDate[dateStr].push(assignment);
    });
    
    // Get all dates that need to be updated (loaded dates + dates with remaining assignments)
    const allDatesToUpdate = new Set([...loadedDateKeys.value, ...Object.keys(assignmentsByDate)]);
    
    for (const dateKey of allDatesToUpdate) {
      const docRef = doc(db, "SA_Assignment", `isuzu&calapan&assignments&${dateKey}`);
      const docSnap = await getDoc(docRef);
      
      const dateAssignments = assignmentsByDate[dateKey] || [];
      
      let updateData = {};
      
      // If no assignments for this date, clear the document
      if (dateAssignments.length === 0) {
        if (docSnap.exists()) {
          // Clear all existing fields
          const existingData = docSnap.data();
          Object.keys(existingData).forEach(key => {
            updateData[key] = deleteField();
          });
          await updateDoc(docRef, updateData);
        }
        continue; // Skip to next date
      }
      
      // Clear existing assignment fields before saving new ones
      if (docSnap.exists()) {
        const existingData = docSnap.data();
        Object.keys(existingData).forEach(key => {
          if (key.startsWith("assign")) updateData[key] = deleteField();
        });
      }
      
      // Add current assignments
      dateAssignments.forEach((assignment, index) => {
        const assignmentData = {
          pro: assignment.pro,
          saName: assignment.saName,
          note: assignment.note || "",
          status: assignment.status,
          date: assignment.date instanceof Date ? assignment.date.toISOString() : assignment.date,
          timestamp: new Date().toISOString()
        };
        
        // Preserve ID if it exists (for new assignments)
        if (assignment.id) {
          assignmentData.id = assignment.id;
        }
        
        updateData[`assign${index + 1}`] = assignmentData;
      });
      
      if (docSnap.exists()) {
        await updateDoc(docRef, updateData);
      } else {
        await setDoc(docRef, updateData);
      }
    }
  } catch (error) {
    console.error("Error saving assignments:", error);
  }
}

async function updateSAStatus(saName, newStatus) {
  try {
    const docRef = doc(db, "Service_Advisor", "isuzu&calapan&sa");
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      const fieldKey = Object.keys(data).find(key => data[key].saName === saName);
      if (fieldKey) {
        await updateDoc(docRef, {
          [fieldKey]: { saName: data[fieldKey].saName, saStatus: newStatus }
        });
      }
    }
  } catch (error) {
    console.error("Error updating SA status:", error);
  }
}

// ==========================================
// CRUD OPERATIONS
// ==========================================

async function addServiceAdvisor() {
  if (!newServiceAdvisor.value.trim()) return;
  
  try {
    const uppercaseName = newServiceAdvisor.value.trim().toUpperCase();
    const docRef = doc(db, "Service_Advisor", "isuzu&calapan&sa");
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      const existingFields = Object.keys(data)
        .filter(key => key.startsWith("sa"))
        .map(key => parseInt(key.replace("sa", ""), 10))
        .filter(num => !isNaN(num));
      const nextField = `sa${Math.max(...existingFields, 0) + 1}`;
      
      await updateDoc(docRef, { 
        [nextField]: { saName: uppercaseName, saStatus: "AVAILABLE" }
      });
      newServiceAdvisor.value = "";
    }
  } catch (error) {
    console.error("Error adding SA:", error);
  }
}

async function addPROrder() {
  if (!newPROrder.value.trim()) return;
  
  try {
    const uppercaseName = newPROrder.value.trim();
    const docRef = doc(db, "PR_Order", "isuzu&calapan&pro");
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      const existingFields = Object.keys(data)
        .filter(key => key.startsWith("pro"))
        .map(key => parseInt(key.replace("pro", ""), 10))
        .filter(num => !isNaN(num));
      const nextField = `pro${Math.max(...existingFields, 0) + 1}`;
      
      await updateDoc(docRef, { [nextField]: uppercaseName });
      newPROrder.value = "";
    }
  } catch (error) {
    console.error("Error adding PRO:", error);
  }
}

async function proceedAssignment() {
  if (!assignmentForm.value.selectedPRO || !assignmentForm.value.selectedSA) return;
  if (!canCreateAssignments.value) {
    alert('Can only create assignments in Today view');
    return;
  }
  
  const now = new Date();
  const newAssignment = {
    id: generateAssignmentId(), // Generate unique ID
    pro: assignmentForm.value.selectedPRO,
    saName: assignmentForm.value.selectedSA,
    note: assignmentForm.value.note,
    status: "ON GOING",
    date: now,
    timestamp: now.toISOString(),
    isManualOverride: assignmentForm.value.isManualOverride
  };
  
  // Reset form immediately for better UX
  resetAssignmentForm();
  
  // Add to local state for immediate UI update
  assignments.value.push(newAssignment);
  
  // Record stats for fairness tracking (background operations)
  await recordAssignmentStats(newAssignment.saName, newAssignment.pro);
  await recordPROHandler(newAssignment.pro, newAssignment.saName);
  
  await updateSAStatus(newAssignment.saName, "WORKING");
  await saveAssignmentsToFirebase();
}

function resetAssignmentForm() {
  assignmentForm.value = {
    selectedPRO: "",
    selectedSA: "",
    note: "",
    isManualOverride: false
  };
  showManualSelection.value = false;
  manualOverrideWarning.value = null;
  noAssignmentReason.value = '';
}

function clearAssignmentForm() {
  assignmentForm.value = {
    selectedPRO: "",
    selectedSA: "",
    note: "",
    isManualOverride: false
  };
  showManualSelection.value = false;
  manualOverrideWarning.value = null;
  noAssignmentReason.value = '';
}

// ==========================================
// MODAL OPERATIONS
// ==========================================

function openPREditModal(index, prName) {
  editingPRIndex.value = index;
  editingPROrder.value = prName;
  showEditPRModal.value = true;
  closeDropdown();
}

function closePREditModal() {
  showEditPRModal.value = false;
  editingPROrder.value = "";
  editingPRIndex.value = null;
}

async function savePROrderEdit() {
  if (!editingPROrder.value.trim()) return;
  
  try {
    const oldName = prOrders.value[editingPRIndex.value];
    const newName = editingPROrder.value.trim().toUpperCase();
    const docRef = doc(db, "PR_Order", "isuzu&calapan&pro");
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      const fieldKey = Object.keys(data).find(key => data[key] === oldName);
      if (fieldKey) {
        await updateDoc(docRef, { [fieldKey]: newName });
        closePREditModal();
      }
    }
  } catch (error) {
    console.error("Error saving PRO:", error);
  }
}

function openPRDeleteModal(index, prName) {
  deletingPRIndex.value = index;
  deletingPROrder.value = prName;
  showDeletePRModal.value = true;
  closeDropdown();
}

function closePRDeleteModal() {
  showDeletePRModal.value = false;
  deletingPROrder.value = "";
  deletingPRIndex.value = null;
}

async function confirmDeletePROrder() {
  try {
    const docRef = doc(db, "PR_Order", "isuzu&calapan&pro");
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      const fieldKey = Object.keys(data).find(key => data[key] === deletingPROrder.value);
      if (fieldKey) {
        await updateDoc(docRef, { [fieldKey]: deleteField() });
        closePRDeleteModal();
      }
    }
  } catch (error) {
    console.error("Error deleting PRO:", error);
  }
}

function openSAEditModal(index, saName, saStatus) {
  editingSAIndex.value = index;
  editingSAName.value = saName;
  editingSAStatus.value = saStatus;
  showEditSAModal.value = true;
  closeDropdown();
}

function closeSAEditModal() {
  showEditSAModal.value = false;
  editingSAName.value = "";
  editingSAStatus.value = "";
  editingSAIndex.value = null;
}

async function saveSAEdit() {
  if (!editingSAName.value.trim()) return;
  
  try {
    const oldName = serviceAdvisors.value[editingSAIndex.value].saName;
    const newName = editingSAName.value.trim().toUpperCase();
    const docRef = doc(db, "Service_Advisor", "isuzu&calapan&sa");
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      const fieldKey = Object.keys(data).find(key => data[key].saName === oldName);
      if (fieldKey) {
        await updateDoc(docRef, {
          [fieldKey]: { saName: newName, saStatus: editingSAStatus.value }
        });
        closeSAEditModal();
      }
    }
  } catch (error) {
    console.error("Error saving SA:", error);
  }
}

function openSADeleteModal(index, saName) {
  deletingSAIndex.value = index;
  deletingSAName.value = saName;
  showDeleteSAModal.value = true;
  closeDropdown();
}

function closeSADeleteModal() {
  showDeleteSAModal.value = false;
  deletingSAName.value = "";
  deletingSAIndex.value = null;
}

async function confirmDeleteSA() {
  try {
    const docRef = doc(db, "Service_Advisor", "isuzu&calapan&sa");
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      const fieldKey = Object.keys(data).find(key => data[key].saName === deletingSAName.value);
      if (fieldKey) {
        await updateDoc(docRef, { [fieldKey]: deleteField() });
        closeSADeleteModal();
      }
    }
  } catch (error) {
    console.error("Error deleting SA:", error);
  }
}

function openEditModal(index, assignment) {
  editingIndex.value = index;
  editingAssignment.value = { ...assignment };
  showEditModal.value = true;
}

function closeEditModal() {
  showEditModal.value = false;
  editingAssignment.value = null;
  editingIndex.value = null;
}

async function saveEditedAssignment() {
  if (editingIndex.value === null || !editingAssignment.value) return;
  
  const previousStatus = assignments.value[editingIndex.value].status;
  const previousSA = assignments.value[editingIndex.value].saName;
  const newStatus = editingAssignment.value.status;
  
  assignments.value[editingIndex.value] = editingAssignment.value;
  await saveAssignmentsToFirebase();
  
  // Handle status change side effects
  if (previousStatus === "ON GOING" && newStatus !== "ON GOING") {
    const hasOnGoing = assignments.value.some(
      (a, idx) => a.saName === previousSA && a.status === "ON GOING" && idx !== editingIndex.value
    );
    if (!hasOnGoing) {
      await updateSAStatus(previousSA, "AVAILABLE");
    }
  } else if (previousStatus !== "ON GOING" && newStatus === "ON GOING") {
    await updateSAStatus(previousSA, "WORKING");
  }
  
  closeEditModal();
}

// ==========================================
// ASSIGNMENT ACTIONS
// ==========================================

async function markAsDone(index) {
  const saName = assignments.value[index].saName;
  const now = new Date();
  
  assignments.value[index].status = "JOB DONE";
  assignments.value[index].completedDate = now.toISOString();
  
  await saveAssignmentsToFirebase();
  
  const hasOnGoing = assignments.value.some(
    (a, idx) => a.saName === saName && a.status === "ON GOING" && idx !== index
  );
  if (!hasOnGoing) {
    await updateSAStatus(saName, "AVAILABLE");
  }
}

async function cancelAssignment(index) {
  const saName = assignments.value[index].saName;
  
  assignments.value[index].status = "CANCELLED";
  await saveAssignmentsToFirebase();
  
  const hasOnGoing = assignments.value.some(
    (a, idx) => a.saName === saName && a.status === "ON GOING" && idx !== index
  );
  if (!hasOnGoing) {
    await updateSAStatus(saName, "AVAILABLE");
  }
}

async function deleteAssignment(index) {
  const saName = assignments.value[index].saName;
  const proName = assignments.value[index].pro;
  const wasOnGoing = assignments.value[index].status === "ON GOING";
  
  // Decrement stats for ALL deletions (including history records)
  // This ensures the total count in the SA card updates correctly
  await decrementSAStats(saName, proName);
  
  assignments.value.splice(index, 1);
  await saveAssignmentsToFirebase();
  
  if (wasOnGoing) {
    const hasOnGoing = assignments.value.some(
      a => a.saName === saName && a.status === "ON GOING"
    );
    if (!hasOnGoing) {
      await updateSAStatus(saName, "AVAILABLE");
    }
  }
}

async function deleteAssignmentDirect(index) {
  await deleteAssignment(index);
}

async function reassignAssignment(index) {
  const assignment = assignments.value[index];
  const saName = assignment.saName;
  const proName = assignment.pro;
  
  // Initialize reAssigned array if it doesn't exist
  if (!assignment.reAssigned) {
    assignment.reAssigned = [];
  }
  
  // Add current timestamp to reAssigned array
  const now = new Date();
  assignment.reAssigned.push(now.toISOString());
  
  // Mark old as cancelled
  assignment.status = "CANCELLED";
  await saveAssignmentsToFirebase();
  
  // Create new assignment with fresh date
  const newAssignment = {
    id: generateAssignmentId(),
    pro: proName,
    saName: saName,
    note: `Reassigned from ${formatDate(assignment.date)}`,
    status: "ON GOING",
    date: now,
    timestamp: now.toISOString(),
    reassignedFrom: assignment.date,
    reAssigned: [] // Initialize empty reAssigned array for new assignment
  };
  
  assignments.value.push(newAssignment);
  
  // Record stats for the reassignment (increment totalAssigned, update lastAssigned)
  await recordAssignmentStats(saName, proName);
  await recordPROHandler(proName, saName);
  
  await saveAssignmentsToFirebase();
  
  // Ensure SA is marked WORKING
  const sa = serviceAdvisors.value.find(s => s.saName === saName);
  if (sa && CONFIG.STATUS_AVAILABLE.includes(sa.saStatus)) {
    await updateSAStatus(saName, "WORKING");
  }
  
  // Show success toast notification
  toast.success(
    `Order ${proName} has been reassigned to ${saName}`,
    'Reassignment Successful',
    5000
  );
  
  // Check if all discontinued orders have been handled
  const remainingDiscontinued = discontinuedAssignments.value.length - 1;
  if (remainingDiscontinued > 0) {
    toast.warning(
      `${remainingDiscontinued} discontinued order(s) still need to be handled before new assignments can be created.`,
      'Discontinued Orders Remaining',
      7000
    );
  } else {
    toast.success(
      'All discontinued orders have been handled. You can now create new assignments.',
      'Ready for New Assignments',
      5000
    );
  }
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

function isAssignmentCutOff(assignment) {
  if (assignment.status !== "ON GOING") return false;
  const assignmentDate = assignment.date instanceof Date ? 
    formatDateKey(assignment.date) : 
    String(assignment.date).split('T')[0];
  return assignmentDate !== todayDate.value;
}

function getOriginalIndex(assignment) {
  // If assignment has an ID, match by ID for precise identification
  if (assignment.id) {
    return assignments.value.findIndex(a => a.id === assignment.id);
  }
  
  // Fallback to legacy matching for assignments without IDs
  return assignments.value.findIndex(a => {
    const aDateStr = a.date instanceof Date ? 
      formatDateKey(a.date) : 
      String(a.date).split('T')[0];
    const assignmentDateStr = assignment.date instanceof Date ? 
      formatDateKey(assignment.date) : 
      String(assignment.date).split('T')[0];
    return a.pro === assignment.pro && 
           a.saName === assignment.saName && 
           aDateStr === assignmentDateStr;
  });
}

function getJobDoneProCount(saName) {
  return new Set(
    assignments.value
      .filter(a => a.saName === saName && a.status === "JOB DONE")
      .map(a => a.pro)
  ).size;
}

function getJobDoneProsList(saName) {
  return [...new Set(
    assignments.value
      .filter(a => a.saName === saName && a.status === "JOB DONE")
      .map(a => a.pro)
  )];
}

function getCancelledProCount(saName) {
  return new Set(
    assignments.value
      .filter(a => a.saName === saName && a.status === "CANCELLED")
      .map(a => a.pro)
  ).size;
}

function getCancelledProsList(saName) {
  return [...new Set(
    assignments.value
      .filter(a => a.saName === saName && a.status === 'CANCELLED')
      .map(a => a.pro)
  )];
}

// ==========================================
// WATCHERS
// ==========================================

watch(searchQuery, () => {
  currentPage.value = 1;
});

watch(historySearchQuery, () => {
  historyPage.value = 1;
});

watch(historyStatusFilter, () => {
  historyPage.value = 1;
});

// Watch for discontinued orders - handles changes during session (not initial load)
const hasShownDiscontinuedNotification = ref(false);
const isInitialLoadComplete = ref(false);

watch(hasDiscontinuedOrders, (newValue) => {
  // Only handle changes after initial load is complete
  if (!isInitialLoadComplete.value) return;
  
  if (newValue && !hasShownDiscontinuedNotification.value) {
    toast.warning(
      `${discontinuedAssignments.value.length} discontinued order(s) from previous day detected. Please delete or reassign them to enable new assignments.`,
      'Discontinued Orders Detected',
      8000
    );
    hasShownDiscontinuedNotification.value = true;
  } else if (!newValue && hasShownDiscontinuedNotification.value) {
    // Reset when all discontinued orders are handled during session
    hasShownDiscontinuedNotification.value = false;
    
    toast.success(
      'All cut-off orders handled. Date filter reset to today.',
      'Ready for Today',
      5000
    );
  }
});

// ==========================================
// INITIALIZATION - CHECK YESTERDAY FIRST
// ==========================================

async function checkYesterdayForCutOff() {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = formatDateKey(yesterday);
    
    const docRef = doc(db, "SA_Assignment", `isuzu&calapan&assignments&${yesterdayKey}`);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      const yesterdayAssignments = Object.values(data);
      
      // Check if any are ON GOING (cut-off orders)
      const cutOffOrders = yesterdayAssignments.filter(item => 
        item.status === "ON GOING"
      );
      
      if (cutOffOrders.length > 0) {
        // Set date to yesterday to show cut-off orders
        historyFromDate.value = yesterdayKey;
        historyToDate.value = yesterdayKey;
        currentlyViewingDateRange.value = true;
        
        // Load yesterday's assignments
        await loadAssignmentsByDateRange();
        
        // Show notification
        toast.warning(
          `${cutOffOrders.length} cut-off order(s) from yesterday detected. Please delete or reassign them to enable new assignments.`,
          'Cut-off Orders Detected',
          8000
        );
        
        return true; // Has cut-off orders
      }
    }
    
    return false; // No cut-off orders
  } catch (error) {
    console.error("Error checking yesterday for cut-off:", error);
    return false;
  }
}

// ==========================================
// LIFECYCLE
// ==========================================

onMounted(async () => {
  // Start listeners for static data
  listenToStatuses();
  listenToServiceAdvisors();
  listenToPROrders();
  listenToSAStats();
  listenToPROHandlers();
  
  // Check yesterday first for cut-off orders BEFORE setting date
  const hasCutOffOrders = await checkYesterdayForCutOff();
  
  if (!hasCutOffOrders) {
    // No cut-off orders, set to today and start live listener
    historyFromDate.value = todayDate.value;
    historyToDate.value = todayDate.value;
    currentlyViewingDateRange.value = false;
    listenToAssignments();
  }
  
  // Mark initial load as complete
  isInitialLoadComplete.value = true;
});

onUnmounted(() => {
  stopAssignmentsListener();
  if (statsListener.value) statsListener.value();
  if (proHandlersListener.value) proHandlersListener.value();
});
</script>

<style scoped>
.isuzu-font {
  font-family: 'IsuzuFont', sans-serif;
}
</style>