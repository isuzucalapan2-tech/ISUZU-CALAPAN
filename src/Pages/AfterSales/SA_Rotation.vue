x
<template>
  <div class="min-h-screen w-full bg-neutral-100 font-sans overflow-hidden flex" @click="closeDropdown">

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col overflow-hidden">
      
      <!-- Page Header and Mode Banner -->
      <header class="bg-white border-b border-neutral-200 px-6 py-3 flex flex-col md:flex-row items-start md:items-center justify-between shrink-0 gap-3">
        <div class="flex items-center gap-3">
          <span class="w-1.5 h-8 bg-red-600 rounded-full shrink-0"></span>
          <div>
            <h2 class="font-black text-neutral-900 uppercase tracking-widest text-sm isuzu-font leading-none">Retail Orders</h2>
            <p class="text-[9px] text-neutral-400 uppercase tracking-widest font-bold mt-0.5">Service Advisor Assignment</p>
          </div>
        </div>
        
        <!-- View Mode Indicator -->
        <div v-if="viewMode !== 'TODAY'" class="bg-amber-100 border border-amber-300 text-amber-800 px-4 py-2 rounded-lg text-sm font-semibold flex items-center justify-between gap-4">
          <div class="flex items-center gap-2">
            <span>📖</span>
            <span>Viewing {{ viewMode === 'RANGE' ? `Range: ${historyFromDate} to ${historyToDate}` : `History: ${historyFromDate}` }}</span>
          </div>
          <button @click="resetToToday" class="text-xs bg-amber-200 hover:bg-amber-300 px-3 py-1 rounded transition-colors">
            Back to Today
          </button>
        </div>
        <div v-else class="bg-green-100 border border-green-300 text-green-800 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
          <span class="relative flex h-3 w-3">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span>Live Mode - Today's Assignments</span>
        </div>
      </header>

      <!-- Main Grid Content -->
      <div class="flex-1 p-4 overflow-hidden">
        <div class="h-full grid grid-rows-[1fr_1fr] gap-4">
          
          <!-- Top Row: Auto Assign + Active Orders -->
          <div class="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-4 min-h-0">
            
            <!-- Auto Assign Order Card -->
            <div class="bg-white rounded-xl shadow-sm border border-neutral-200 flex flex-col overflow-hidden hover:shadow-md transition-all duration-300"
                 :class="{ 'opacity-75': !canCreateAssignments }">
              <div class="bg-neutral-900 p-3 text-white flex items-center gap-2 shrink-0 z-10">
                <span class="text-base">🎯</span>
                <h2 class="font-black text-xs tracking-widest uppercase">Auto Assign Order</h2>
              </div>

              <div v-if="!canCreateAssignments && viewMode !== 'TODAY'" class="bg-amber-50 border-b border-amber-200 p-2 text-center shrink-0">
                <p class="text-[10px] text-amber-700 font-medium">⚠️ Switch to Today's view to create assignments</p>
              </div>

              <!-- Discontinued Orders Warning -->
              <div v-if="hasDiscontinuedOrders" class="bg-red-50 border-b border-red-200 p-2 text-center shrink-0">
                <p class="text-[10px] text-red-700 font-bold">
                  ⚠️ {{ discontinuedAssignments.length }} Discontinued Order(s) from Previous Day
                </p>
                <p class="text-[9px] text-red-600 mt-0.5">
                  Delete or reassign all discontinued orders to enable new assignments
                </p>
              </div>

              <div class="flex-1 overflow-y-auto p-3 bg-neutral-50/50">
                <div class="space-y-3">
                  <div>
                    <label class="block text-[9px] font-black text-neutral-500 uppercase tracking-widest mb-1">Select Retail Order</label>
                    <select v-model="assignmentForm.selectedPRO" @change="onPROSelected" class="w-full rounded-lg border-neutral-300 text-xs shadow-sm focus:border-red-600 focus:ring-red-600 py-2 hover:border-neutral-400 transition-colors duration-200"
                            :disabled="!canCreateAssignments">
                      <option value="">Choose a Retail Order</option>
                      <option v-for="pro in availablePROs" :key="pro" :value="pro">{{ pro }}</option>
                    </select>
                  </div>

                  <!-- Auto-Assigned Display -->
                  <div v-if="assignmentForm.selectedPRO && autoAssignedSA" class="bg-neutral-50 border border-neutral-200 rounded-lg p-3 text-center transition-all">
                    <div class="text-[8px] font-black text-neutral-400 uppercase tracking-widest mb-1">Auto-Assigned</div>
                    <div class="bg-neutral-900 text-white text-sm font-bold py-2 px-4 rounded-lg shadow-md inline-block mb-1">
                      {{ autoAssignedSA.saName }}
                    </div>
                    <div class="text-[9px] text-neutral-600 font-medium">
                      {{ getAssignmentReasonText(autoAssignedSA) }}
                    </div>
                  </div>

                  <div v-if="assignmentForm.selectedPRO && !autoAssignedSA && !assignmentForm.selectedSA" class="text-red-500 text-[10px] font-bold bg-red-50 p-2 rounded text-center">
                    {{ noAssignmentReason || 'No available advisors' }}
                  </div>

                  <!-- Manual Override -->
                  <button 
                    @click="showManualSelection = !showManualSelection"
                    class="w-full py-2 text-[10px] font-medium text-neutral-500 bg-white border border-neutral-200 rounded-md hover:text-neutral-900 hover:border-neutral-300 hover:shadow-sm transition-all duration-200"
                    :disabled="!canCreateAssignments || !assignmentForm.selectedPRO"
                  >
                    {{ showManualSelection ? 'Close Manual Selection' : 'Manual Override' }}
                  </button>

                  <div v-if="showManualSelection" class="bg-white p-3 rounded-lg border border-neutral-200">
                    <div class="text-[9px] font-black text-neutral-500 uppercase tracking-widest mb-2">Select Advisor</div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button 
                        v-for="sa in rankedSAsForManual" 
                        :key="sa.saName"
                        type="button"
                        :class="[
                          'flex flex-col items-center p-2 rounded-md border text-[10px] transition-all duration-200',
                          assignmentForm.selectedSA === sa.saName 
                            ? 'border-neutral-900 bg-neutral-100 text-neutral-900 font-bold ring-1 ring-neutral-900' 
                            : 'border-neutral-100 hover:bg-neutral-50 hover:border-neutral-300 text-neutral-600',
                          !sa.isAvailable && 'opacity-50 cursor-not-allowed'
                        ]"
                        @click="sa.isAvailable && selectManualSA(sa.saName)"
                        :disabled="!sa.isAvailable"
                      >
                        <span class="flex items-center gap-1">
                          {{ sa.saName }}
                          <span v-if="sa.isNewHandler" class="text-green-500">●</span>
                          <span v-else-if="!sa.isAvailable" class="text-red-500">✕</span>
                          <span v-else class="text-amber-500">↻</span>
                        </span>
                        <span class="text-[8px] opacity-70">{{ getSAQuickStatus(sa) }}</span>
                      </button>
                    </div>
                    <button @click="resetToAutoAssignment" class="w-full mt-2 text-[9px] text-green-600 font-bold uppercase tracking-wide py-1 hover:underline hover:text-green-700 transition-colors duration-200">
                      ↻ Reset to Auto
                    </button>
                  </div>

                  <!-- Manual Override Warning -->
                  <div v-if="manualOverrideWarning" class="bg-amber-50 border border-amber-200 rounded-lg p-2">
                    <p class="text-[10px] text-amber-800 font-medium">{{ manualOverrideWarning }}</p>
                  </div>

                  <div>
                    <label class="block text-[9px] font-black text-neutral-500 uppercase tracking-widest mb-1">Note (Optional)</label>
                    <textarea 
                      v-model="assignmentForm.note" 
                      class="w-full rounded-lg border-neutral-300 text-xs shadow-sm focus:border-red-600 focus:ring-red-600 p-2 min-h-16 hover:border-neutral-400 hover:bg-white transition-all duration-200"
                      placeholder="Add notes..."
                      rows="2"
                      :disabled="!canCreateAssignments"
                    ></textarea>
                  </div>
                </div>
              </div>

              <div class="p-3 bg-white border-t border-neutral-100 shrink-0 z-10 space-y-2">
                  <button 
                    @click="proceedAssignment"
                    :disabled="!canCreateAssignments || !assignmentForm.selectedPRO || !assignmentForm.selectedSA"
                    class="w-full bg-linear-to-r from-green-500 to-emerald-600 text-white font-bold py-2.5 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 active:translate-y-0 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    {{ canCreateAssignments ? 'Assign Order' : 'View Mode Only' }}
                  </button>
                  <button 
                    @click="clearAssignmentForm"
                    :disabled="!canCreateAssignments || (!assignmentForm.selectedPRO && !assignmentForm.selectedSA && !assignmentForm.note)"
                    class="w-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 font-bold py-2 rounded-lg border border-neutral-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                  >
                    ✕ Clear Fields
                  </button>
              </div>
            </div>

            <!-- Active Orders Card -->
            <div class="bg-white rounded-xl shadow-sm border border-neutral-200 flex flex-col overflow-hidden hover:shadow-md transition-all duration-300">
              <div class="bg-neutral-50 border-b border-neutral-200 p-3 flex justify-between items-center shrink-0">
                <div class="flex items-center gap-2 text-neutral-900">
                  <span class="text-base">📋</span>
                  <h2 class="font-black text-xs tracking-widest uppercase">Active Orders</h2>
                  <span v-if="viewMode === 'TODAY'" class="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Live</span>
                </div>
                <input 
                    v-model="searchQuery"
                    type="text"
                    class="bg-white border border-neutral-300 text-xs rounded-md px-3 py-1.5 w-full max-w-xs focus:ring-red-600 focus:border-red-600 hover:border-neutral-400 transition-colors duration-200"
                    placeholder="Search PRO or SA..."
                />
              </div>
              
              <div class="flex-1 overflow-x-auto">
                <table class="min-w-full divide-y divide-neutral-200">
                  <thead class="bg-neutral-50 sticky top-0 z-10">
                    <tr>
                      <th class="px-3 py-2 text-left text-[10px] font-black text-neutral-500 uppercase tracking-widest">PRO</th>
                      <th class="px-3 py-2 text-left text-[10px] font-black text-neutral-500 uppercase tracking-widest">Advisor</th>
                      <th class="px-3 py-2 text-left text-[10px] font-black text-neutral-500 uppercase tracking-widest">Status</th>
                      <th class="px-3 py-2 text-left text-[10px] font-black text-neutral-500 uppercase tracking-widest">Date</th>
                      <th class="px-3 py-2 text-right text-[10px] font-black text-neutral-500 uppercase tracking-widest">Actions</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-neutral-100">
                    <tr v-for="(assignment, index) in paginatedActiveAssignments" :key="index" class="hover:bg-neutral-50 hover:shadow-sm transition-all duration-200">
                      <td class="px-3 py-2 whitespace-nowrap text-[12px] font-medium text-neutral-900">{{ assignment.pro }}</td>
                      <td class="px-3 py-2 whitespace-nowrap text-[12px] text-neutral-600">{{ assignment.saName }}</td>
                      <td class="px-3 py-2 whitespace-nowrap">
                        <span 
                          :class="[
                            'px-1.5 inline-flex text-[10px] leading-4 font-semibold rounded-full uppercase',
                            isAssignmentCutOff(assignment) 
                              ? 'bg-red-100 text-red-800'
                              : 'bg-blue-100 text-blue-800'
                          ]"
                        >
                          {{ isAssignmentCutOff(assignment) ? 'CUT OFF' : assignment.status }}
                        </span>
                      </td>
                      <td class="px-3 py-2 whitespace-nowrap text-[12px] text-neutral-400">{{ formatDate(assignment.date) }}</td>
                      <td class="px-3 py-2 whitespace-nowrap text-right text-sm font-medium space-x-1">
                        <template v-if="isAssignmentCutOff(assignment)">
                          <button class="text-red-600 hover:text-red-900" title="Delete" @click="deleteAssignmentDirect(getOriginalIndex(assignment))">🗑</button>
                          <button class="text-amber-600 hover:text-amber-900" title="Reassign" @click="reassignAssignment(getOriginalIndex(assignment))">🔄</button>
                        </template>
                        <template v-else>
                          <button class="text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded px-1 transition-all duration-200" title="Edit" @click="openEditModal(getOriginalIndex(assignment), assignment)">✎</button>
                          <button class="text-green-600 hover:text-green-900 hover:bg-green-100 rounded px-1 transition-all duration-200" title="Done" @click="markAsDone(getOriginalIndex(assignment))">✓</button>
                          <button class="text-orange-500 hover:text-orange-900 hover:bg-orange-100 rounded px-1 transition-all duration-200" title="Cancel" @click="cancelAssignment(getOriginalIndex(assignment))">✕</button>
                        </template>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div v-if="filteredActiveAssignments.length === 0" class="p-8 text-center text-neutral-400 text-sm">
                  No active assignments found.
                </div>
              </div>

              <div class="p-2 border-t border-neutral-200 bg-neutral-50 flex justify-center gap-2 shrink-0">
                <button @click="currentPage--" :disabled="currentPage === 1" class="px-2 py-1 text-xs border border-neutral-200 rounded hover:bg-white hover:shadow-sm transition-all duration-200 disabled:opacity-50">← Prev</button>
                <span class="text-xs self-center font-medium text-neutral-600">Page {{ currentPage }}</span>
                <button @click="currentPage++" :disabled="currentPage === totalActivePages" class="px-2 py-1 text-xs border border-neutral-200 rounded hover:bg-white hover:shadow-sm transition-all duration-200 disabled:opacity-50">Next →</button>
              </div>
            </div>
          </div>

          <!-- Bottom Row: Switchable Card + History -->
          <div class="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-4 min-h-0">
            
            <!-- Switchable Card: Retail Orders / Service Advisors -->
            <div class="bg-white rounded-xl shadow-sm border border-neutral-200 flex flex-col overflow-hidden hover:shadow-md transition-all duration-300">
              <!-- Toggle Buttons -->
              <div class="bg-neutral-50 border-b border-neutral-200 p-2 flex gap-1 shrink-0">
                <button 
                  @click="switchableTab = 'advisors'"
                  :class="[
                    'flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2',
                    switchableTab === 'advisors' 
                      ? 'bg-neutral-900 text-white shadow-md' 
                      : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
                  ]"
                >
                  <span>👤</span> Service Advisors
                </button>
                <button 
                  @click="switchableTab = 'orders'"
                  :class="[
                    'flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2',
                    switchableTab === 'orders' 
                      ? 'bg-neutral-900 text-white shadow-md' 
                      : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
                  ]"
                >
                  <span>📦</span> Retail Orders
                </button>
              </div>

              <!-- Service Advisors View (Default) -->
              <div v-if="switchableTab === 'advisors'" class="flex-1 flex flex-col overflow-hidden">
                <div class="bg-neutral-900 p-2 text-white flex items-center gap-2 shrink-0">
                  <span class="text-base">👤</span>
                  <h2 class="font-black text-xs tracking-widest uppercase">Service Advisors</h2>
                </div>

                <!-- Assignment Stats Panel -->
                <div class="bg-neutral-50 border-b border-neutral-200 p-2 shrink-0">
                  <div class="text-[9px] font-black text-neutral-500 uppercase tracking-widest mb-1">Assignment Stats</div>
                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-1 text-center">
                    <div class="bg-white rounded-lg border border-neutral-100 p-1">
                      <div class="text-[8px] font-black text-neutral-400 uppercase tracking-widest">Total</div>
                      <div class="text-xs font-black text-red-600">{{ getTotalAssignedAll() }}</div>
                    </div>
                    <div class="bg-white rounded-lg border border-neutral-100 p-1">
                      <div class="text-[8px] font-black text-neutral-400 uppercase tracking-widest">Active</div>
                      <div class="text-xs font-bold text-green-600">{{ getTotalActiveAll() }}</div>
                    </div>
                    <div class="bg-white rounded-lg border border-neutral-100 p-1">
                      <div class="text-[8px] font-black text-neutral-400 uppercase tracking-widest">Capacity</div>
                      <div class="text-xs font-bold text-amber-600">{{ getCapacityPercentage() }}%</div>
                    </div>
                  </div>
                </div>

                <div class="flex-1 p-3 overflow-y-auto">
                  <ul class="space-y-2">
                    <li v-for="(sa, index) in serviceAdvisors" :key="index" 
                        class="flex flex-col sm:flex-row items-start sm:items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                        :class="{ 'opacity-50': !isSAAvailable(sa) }">
                      <div class="flex flex-col min-w-0 flex-1 mr-0 sm:mr-2 mb-2 sm:mb-0">
                        <span class="text-sm font-bold text-slate-700 truncate">{{ sa.saName }}</span>
                        <span 
                          class="text-[10px] font-bold px-2 py-0.5 rounded-full w-fit mt-1 uppercase"
                          :class="getSAStatusColor(sa.saStatus)"
                        >
                          {{ sa.saStatus }}
                        </span>
                        <div class="mt-1.5 flex items-center gap-1">
                          <div class="flex-1 bg-slate-200 rounded-full h-1">
                            <div 
                              class="h-1 rounded-full transition-all duration-300"
                              :class="getWorkloadColor(getCurrentActive(sa.saName))"
                              :style="{ width: Math.min(100, (getCurrentActive(sa.saName) / 5) * 100) + '%' }"
                            ></div>
                          </div>
                          <span class="text-[8px] text-slate-400 w-3">{{ getCurrentActive(sa.saName) }}/5</span>
                        </div>
                      </div>

                      <div class="flex gap-1">
                        <div class="flex flex-col items-center bg-white border border-slate-200 rounded px-2 py-1">
                          <span class="text-xs font-black text-indigo-600 leading-none">{{ getTotalAssigned(sa.saName) }}</span>
                          <span class="text-[8px] text-slate-400 uppercase">Total</span>
                        </div>

                        <div class="relative group" @mouseenter="hoveringSAIndex = index" @mouseleave="hoveringSAIndex = null">
                          <div class="flex flex-col items-center bg-white border border-indigo-100 shadow-sm rounded px-2 py-1 cursor-help hover:border-indigo-400 transition-all duration-200">
                            <span class="text-xs font-black text-indigo-600 leading-none">{{ getCurrentActive(sa.saName) }}</span>
                            <span class="text-[8px] text-slate-400 uppercase">Active</span>
                          </div>
                          <div v-if="hoveringSAIndex === index" class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-white rounded-lg shadow-xl border border-slate-200 z-50 overflow-hidden animate-fade-in-up">
                            <div class="bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 text-center">Active PROs</div>
                            <ul class="max-h-32 overflow-y-auto py-1">
                              <li v-if="getActiveProsList(sa.saName).length === 0" class="text-center text-[10px] text-slate-400 py-2 italic">No active PROs</li>
                              <li v-for="pro in getActiveProsList(sa.saName)" :key="pro" class="px-2 py-1 text-[10px] text-slate-700 border-b border-slate-50 last:border-0 truncate">
                                {{ pro }}
                              </li>
                            </ul>
                          </div>
                        </div>

                        <div class="relative">
                          <button class="h-full px-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 hover:shadow-sm rounded transition-all duration-200"
                             @click.stop="toggleDropdown(index, 'serviceAdvisors')">
                            ⋮
                          </button>
                          <div v-if="dropdownIndex === index && dropdownType === 'serviceAdvisors'" 
                               class="absolute right-0 bottom-full mb-1 w-32 bg-white rounded-lg shadow-xl border border-slate-100 z-60 overflow-hidden animate-fade-in-up">
                            <button class="w-full text-left px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 hover:pl-4 transition-all duration-200" @click.stop="openSAEditModal(index, sa.saName, sa.saStatus)">✎ Edit</button>
                            <button class="w-full text-left px-3 py-2 text-xs text-red-500 hover:bg-red-50 hover:pl-4 border-t border-slate-100 transition-all duration-200" @click.stop="openSADeleteModal(index, sa.saName)">🗑 Delete</button>
                          </div>
                        </div>
                      </div>
                    </li>
                  </ul>
                  <div v-if="serviceAdvisors.length === 0" class="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                    <span class="text-4xl mb-2">📭</span>
                    <span class="text-xs">No advisors</span>
                  </div>
                </div>

                <div class="p-3 bg-white border-t border-slate-100 shrink-0 z-10">
                  <form @submit.prevent="addServiceAdvisor" class="flex gap-2">
                    <input 
                      v-model="newServiceAdvisor" 
                      @input="newServiceAdvisor = newServiceAdvisor.toUpperCase()" 
                      type="text"
                      class="flex-1 rounded-lg border-slate-300 bg-slate-50 text-xs px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all hover:bg-white hover:border-indigo-300"
                      placeholder="Enter name..." 
                      required
                    />
                    <button type="submit" class="bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 shadow-md">
                      Add
                    </button>
                  </form>
                </div>
              </div>

              <!-- Retail Orders View -->
              <div v-else class="flex-1 flex flex-col overflow-hidden">
                <div class="bg-linear-to-r from-indigo-600 to-purple-600 p-2 text-white flex items-center gap-2 shadow-sm shrink-0 z-10">
                  <span class="text-xl">📦</span>
                  <h2 class="font-bold text-sm tracking-wide uppercase">Retail Orders</h2>
                </div>

                <div class="flex-1 overflow-y-auto p-3 relative">
                  <ul class="space-y-2">
                    <li v-for="(pr, index) in prOrders" :key="index" 
                        class="group flex justify-between items-center p-2.5 bg-slate-50 hover:bg-indigo-50 hover:shadow-md rounded-lg border border-slate-100 transition-all duration-200 relative">
                      <span class="text-xs font-semibold text-slate-700 truncate pr-2">{{ pr }}</span>
                      <div class="relative">
                        <button 
                          class="p-1 text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-sm rounded-md transition-all duration-200"
                          @click.stop="toggleDropdown(index, 'prOrders')"
                        >
                          <span class="text-lg leading-none font-bold">⋮</span>
                        </button>
                        <div v-if="dropdownIndex === index && dropdownType === 'prOrders'" 
                             class="absolute right-0 top-full mt-1 w-32 bg-white rounded-lg shadow-xl border border-slate-100 z-50 overflow-hidden animate-fade-in-down">
                          <button class="w-full text-left px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:pl-5 transition-all duration-200 flex items-center gap-2" @click.stop="openPREditModal(index, pr)">
                            <span>✎</span> Edit
                          </button>
                          <button class="w-full text-left px-4 py-2 text-xs font-medium text-red-500 hover:bg-red-50 hover:pl-5 transition-all duration-200 flex items-center gap-2 border-t border-slate-100" @click.stop="openPRDeleteModal(index, pr)">
                            <span>🗑</span> Delete
                          </button>
                        </div>
                      </div>
                    </li>
                  </ul>
                  <div v-if="prOrders.length === 0" class="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                    <span class="text-4xl mb-2">📭</span>
                    <span class="text-xs">No items added</span>
                  </div>
                </div>

                <div class="p-3 bg-white border-t border-slate-100 shrink-0 z-10">
                  <form @submit.prevent="addPROrder" class="flex gap-2">
                    <input 
                      v-model="newPROrder" 
                      @input="newPROrder = newPROrder.toUpperCase()" 
                      type="text"
                      class="flex-1 rounded-lg border-slate-300 bg-slate-50 text-xs px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none hover:bg-white hover:border-indigo-300 transition-all duration-200"
                      placeholder="Enter order..." 
                      required
                    />
                    <button type="submit" class="bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 shadow-md">
                      Add
                    </button>
                  </form>
                </div>
              </div>
            </div>

            <!-- History Card -->
            <div class="bg-white rounded-xl shadow-md border border-slate-200 flex flex-col overflow-hidden opacity-90 hover:opacity-100 hover:shadow-xl transition-all duration-300">
              <div class="bg-slate-50 border-b border-slate-200 p-3 flex justify-between items-center gap-2 shrink-0 flex-wrap">
                <div class="flex items-center gap-2 text-slate-600">
                  <span class="text-xl">📊</span>
                  <h2 class="font-bold text-sm tracking-wide uppercase">History</h2>
                </div>
                <div class="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center flex-wrap">
                  <input 
                    v-model="historyFromDate"
                    @change="onDateFilterChange"
                    type="date"
                    :max="todayDate"
                    class="bg-white border border-slate-300 text-xs rounded-md px-3 py-1.5 focus:ring-indigo-500 focus:border-indigo-500 hover:border-indigo-400 transition-colors duration-200"
                  />
                  <span class="text-xs text-slate-400">to</span>
                  <input 
                    v-model="historyToDate"
                    @change="onDateFilterChange"
                    type="date"
                    :max="todayDate"
                    class="bg-white border border-slate-300 text-xs rounded-md px-3 py-1.5 focus:ring-indigo-500 focus:border-indigo-500 hover:border-indigo-400 transition-colors duration-200"
                  />
                  <input 
                    v-model="historySearchQuery"
                    type="text"
                    class="bg-white border border-slate-300 text-xs rounded-md px-3 py-1.5 w-full sm:w-32 focus:ring-indigo-500 focus:border-indigo-500 hover:border-indigo-400 hover:shadow-sm transition-all duration-200"
                    placeholder="Search..."
                  />
                  <select v-model="historyStatusFilter" @change="historyPage = 1" class="bg-white border border-slate-300 text-xs rounded-md px-2 py-1.5 focus:ring-indigo-500 hover:border-indigo-400 transition-colors duration-200">
                    <option value="">All</option>
                    <option value="JOB DONE">Done</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>

              <div v-if="viewMode === 'RANGE'" class="bg-indigo-50 border-b border-indigo-100 p-1 text-center shrink-0">
                <span class="text-[10px] text-indigo-600 font-medium">
                  {{ filteredHistoryAssignments.length }} records across {{ dateRangeDays }} days
                </span>
              </div>

              <div class="flex-1 overflow-x-auto">
                <table class="min-w-full divide-y divide-slate-200">
                  <thead class="bg-slate-50 sticky top-0 z-10">
                    <tr>
                      <th class="px-2 py-1 text-left text-[13px] font-bold text-slate-500 uppercase">PRO</th>
                      <th class="px-2 py-1 text-left text-[13px] font-bold text-slate-500 uppercase">Status</th>
                      <th class="px-2 py-1 text-right text-[13px] font-bold text-slate-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-slate-100">
                    <tr v-for="(assignment, index) in paginatedHistoryAssignments" :key="index" class="hover:bg-slate-100 hover:shadow-sm transition-all duration-200">
                      <td class="px-2 py-1 whitespace-nowrap text-[10px]">
                        <div class="font-bold text-slate-700">{{ assignment.pro }}</div>
                        <div class="text-[9px] text-slate-400">{{ assignment.saName }}</div>
                      </td>
                      <td class="px-2 py-1 whitespace-nowrap">
                        <span 
                          class="px-1.5 py-0.5 inline-flex text-[8px] leading-3 font-bold rounded-full uppercase tracking-wider"
                          :class="assignment.status === 'JOB DONE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                        >
                          {{ assignment.status }}
                        </span>
                      </td>
                      <td class="px-3 py-2 whitespace-nowrap text-right text-sm">
                        <button class="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded px-1 transition-all duration-200" @click="deleteAssignment(getOriginalIndex(assignment))">🗑</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div v-if="filteredHistoryAssignments.length === 0" class="p-8 text-center text-slate-400 text-sm">
                  No history records found.
                </div>
              </div>

              <div class="p-2 border-t border-slate-200 bg-slate-50 flex justify-center gap-2 shrink-0">
                <button @click="historyPage--" :disabled="historyPage === 1" class="px-2 py-1 text-xs border rounded hover:bg-white hover:shadow-sm transition-all duration-200 disabled:opacity-50">← Prev</button>
                <span class="text-xs self-center font-medium text-slate-600">Page {{ historyPage }}</span>
                <button @click="historyPage++" :disabled="historyPage === totalHistoryPages" class="px-2 py-1 text-xs border rounded hover:bg-white hover:shadow-sm transition-all duration-200 disabled:opacity-50">Next →</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals (Edit Assignment, Edit PR, Delete PR, Edit SA, Delete SA) -->
    <!-- [All your existing modals remain unchanged] -->
    
    <!-- Edit Assignment Modal -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-100 flex items-center justify-center animate-fade-in" @click="closeEditModal">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100" @click.stop>
        <div class="bg-linear-to-r from-indigo-600 to-purple-600 p-4 flex justify-between items-center text-white">
          <h3 class="font-bold">Edit Assignment</h3>
          <button @click="closeEditModal" class="text-white/80 hover:text-white hover:scale-110 font-bold text-xl transition-transform duration-200">✕</button>
        </div>
        <div class="p-6 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-1">PRO</label>
              <input v-model="editingAssignment.pro" disabled class="w-full bg-slate-100 border border-slate-200 rounded px-3 py-2 text-sm text-slate-500" />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Advisor</label>
              <input v-model="editingAssignment.saName" disabled class="w-full bg-slate-100 border border-slate-200 rounded px-3 py-2 text-sm text-slate-500" />
            </div>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Status</label>
            <select v-model="editingAssignment.status" class="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-indigo-500">
              <option value="ON GOING">ON GOING</option>
              <option value="IN PROGRESS">IN PROGRESS</option>
              <option value="JOB DONE">JOB DONE</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Note</label>
            <textarea v-model="editingAssignment.note" rows="3" class="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-indigo-500"></textarea>
          </div>
        </div>
        <div class="bg-slate-50 p-4 flex justify-end gap-3 border-t border-slate-100">
          <button @click="closeEditModal" class="px-4 py-2 rounded text-slate-600 font-bold text-xs hover:bg-slate-200 hover:shadow-sm transition-all duration-200">Cancel</button>
          <button @click="saveEditedAssignment" class="px-4 py-2 rounded bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5 shadow-md transition-all duration-200">Save Changes</button>
        </div>
      </div>
    </div>

    <!-- Edit PR Order Modal -->
    <div v-if="showEditPRModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-100 flex items-center justify-center animate-fade-in" @click="closePREditModal">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100" @click.stop>
        <div class="bg-linear-to-r from-indigo-600 to-purple-600 p-4 flex justify-between items-center text-white">
          <h3 class="font-bold">Edit Retail Order</h3>
          <button @click="closePREditModal" class="text-white/80 hover:text-white hover:scale-110 font-bold text-xl transition-transform duration-200">✕</button>
        </div>
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase mb-2">PR Order Name</label>
            <input 
              v-model="editingPROrder" 
              @input="editingPROrder = editingPROrder.toUpperCase()"
              class="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter PR Order name..."
            />
          </div>
        </div>
        <div class="bg-slate-50 p-4 flex justify-end gap-3 border-t border-slate-100">
          <button @click="closePREditModal" class="px-4 py-2 rounded text-slate-600 font-bold text-xs hover:bg-slate-200 hover:shadow-sm transition-all duration-200">Cancel</button>
          <button @click="savePROrderEdit" class="px-4 py-2 rounded bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5 shadow-md transition-all duration-200">Save Changes</button>
        </div>
      </div>
    </div>

    <!-- Delete PR Order Modal -->
    <div v-if="showDeletePRModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-100 flex items-center justify-center animate-fade-in" @click="closePRDeleteModal">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100" @click.stop>
        <div class="bg-linear-to-r from-red-600 to-red-700 p-4 flex justify-between items-center text-white">
          <h3 class="font-bold">Delete Retail Order</h3>
          <button @click="closePRDeleteModal" class="text-white/80 hover:text-white hover:scale-110 font-bold text-xl transition-transform duration-200">✕</button>
        </div>
        <div class="p-6 space-y-4">
          <div class="bg-red-50 border border-red-200 rounded-lg p-3">
            <p class="text-sm text-slate-700"><span class="font-bold">PR Order:</span> {{ deletingPROrder }}</p>
          </div>
          <p class="text-sm text-slate-600">Are you sure you want to delete this retail order? This action cannot be undone.</p>
        </div>
        <div class="bg-slate-50 p-4 flex justify-end gap-3 border-t border-slate-100">
          <button @click="closePRDeleteModal" class="px-4 py-2 rounded text-slate-600 font-bold text-xs hover:bg-slate-200 hover:shadow-sm transition-all duration-200">Cancel</button>
          <button @click="confirmDeletePROrder" class="px-4 py-2 rounded bg-red-600 text-white font-bold text-xs hover:bg-red-700 hover:shadow-lg hover:-translate-y-0.5 shadow-md transition-all duration-200">Delete</button>
        </div>
      </div>
    </div>

    <!-- Edit Service Advisor Modal -->
    <div v-if="showEditSAModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-100 flex items-center justify-center animate-fade-in" @click="closeSAEditModal">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100" @click.stop>
        <div class="bg-linear-to-r from-indigo-600 to-purple-600 p-4 flex justify-between items-center text-white">
          <h3 class="font-bold">Edit Service Advisor</h3>
          <button @click="closeSAEditModal" class="text-white/80 hover:text-white hover:scale-110 font-bold text-xl transition-transform duration-200">✕</button>
        </div>
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase mb-2">Service Advisor Name</label>
            <input 
              v-model="editingSAName" 
              @input="editingSAName = editingSAName.toUpperCase()"
              class="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter Service Advisor name..."
            />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase mb-2">Status</label>
            <select v-model="editingSAStatus" class="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500">
              <option v-for="status in statuses" :key="status" :value="status">{{ status }}</option>
            </select>
          </div>
        </div>
        <div class="bg-slate-50 p-4 flex justify-end gap-3 border-t border-slate-100">
          <button @click="closeSAEditModal" class="px-4 py-2 rounded text-slate-600 font-bold text-xs hover:bg-slate-200 hover:shadow-sm transition-all duration-200">Cancel</button>
          <button @click="saveSAEdit" class="px-4 py-2 rounded bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5 shadow-md transition-all duration-200">Save Changes</button>
        </div>
      </div>
    </div>

    <!-- Delete Service Advisor Modal -->
    <div v-if="showDeleteSAModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-100 flex items-center justify-center animate-fade-in" @click="closeSADeleteModal">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100" @click.stop>
        <div class="bg-linear-to-r from-red-600 to-red-700 p-4 flex justify-between items-center text-white">
          <h3 class="font-bold">Delete Service Advisor</h3>
          <button @click="closeSADeleteModal" class="text-white/80 hover:text-white hover:scale-110 font-bold text-xl transition-transform duration-200">✕</button>
        </div>
        <div class="p-6 space-y-4">
          <div class="bg-red-50 border border-red-200 rounded-lg p-3">
            <p class="text-sm text-slate-700"><span class="font-bold">Service Advisor:</span> {{ deletingSAName }}</p>
          </div>
          <p class="text-sm text-slate-600">Are you sure you want to delete this service advisor? This action cannot be undone.</p>
        </div>
        <div class="bg-slate-50 p-4 flex justify-end gap-3 border-t border-slate-100">
          <button @click="closeSADeleteModal" class="px-4 py-2 rounded text-slate-600 font-bold text-xs hover:bg-slate-200 hover:shadow-sm transition-all duration-200">Cancel</button>
          <button @click="confirmDeleteSA" class="px-4 py-2 rounded bg-red-600 text-white font-bold text-xs hover:bg-red-700 hover:shadow-lg hover:-translate-y-0.5 shadow-md transition-all duration-200">Delete</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue';
import { db } from "../../Firebase/Firebase";
import { doc, onSnapshot, updateDoc, getDoc, deleteField, setDoc, collection, getDocs } from "firebase/firestore";
import { useToast } from "../../composables/useToast";

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
const switchableTab = ref('advisors');

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
/* ==========================================
   ANIMATIONS
   ========================================== */

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.animate-fade-in { 
  animation: fadeIn 0.2s ease-out; 
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in-up { 
  animation: fadeInUp 0.2s ease-out; 
}

@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in-down { 
  animation: fadeInDown 0.2s ease-out; 
}

@keyframes pulse-ring {
  0% { transform: scale(0.8); opacity: 0.5; }
  100% { transform: scale(1.2); opacity: 0; }
}

.animate-ping {
  animation: pulse-ring 1.25s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
}

/* ==========================================
   SCROLLBAR STYLING
   ========================================== */

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent; 
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1; 
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8; 
}

/* ==========================================
   UTILITY CLASSES
   ========================================== */

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ==========================================
   COMPONENT SPECIFIC STYLES
   ========================================== */

/* View mode indicator transitions */
.bg-amber-100, .bg-green-100 {
  transition: all 0.3s ease;
}

/* Table row hover enhancement */
tr.hover\:bg-indigo-50\/50:hover {
  background-color: rgba(238, 242, 255, 0.5);
}

/* Status badge transitions */
span[class*="bg-"] {
  transition: all 0.2s ease;
}

/* Button active states */
button:active:not(:disabled) {
  transform: scale(0.98);
}

/* Modal backdrop blur support */
.backdrop-blur-sm {
  backdrop-filter: blur(4px);
}

/* Assignment card disabled state */
.opacity-75 {
  filter: grayscale(0.3);
}

/* Workload bar animation */
.rounded-full > div {
  transition: width 0.5s ease, background-color 0.3s ease;
}

/* Dropdown menu animation */
.animate-fade-in-up,
.animate-fade-in-down {
  transform-origin: center bottom;
}

/* Focus ring consistency */
input:focus, select:focus, textarea:focus {
  outline: none;
  range: 2px;
  outline-color: rgb(99 102 241);
}

/* Smooth height transitions for expanding sections */
.space-y-2 > * {
  transition: all 0.2s ease;
}
</style>