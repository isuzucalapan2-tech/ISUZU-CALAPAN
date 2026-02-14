<template>

  <div class="h-screen w-screen bg-slate-100 p-4 font-sans overflow-hidden flex flex-col gap-4" @click="closeDropdown">
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 h-[50%] shrink-0">
      
      <div class="bg-white rounded-xl shadow-md border border-slate-200 flex flex-col overflow-hidden hover:shadow-xl transition-all duration-300">
        <div class="bg-gradient-to-r from-indigo-600 to-purple-600 p-2 text-white flex items-center gap-2 shadow-sm shrink-0 z-10">
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

      <div class="bg-white rounded-xl shadow-md border border-slate-200 flex flex-col overflow-hidden hover:shadow-xl transition-all duration-300">
        <div class="bg-gradient-to-r from-indigo-600 to-purple-600 p-2 text-white flex items-center gap-2 shadow-sm  shrink-0 ">
          <span class="text-xl">👤</span>
          <h2 class="font-bold text-sm tracking-wide uppercase">Service Advisors</h2>
        </div>


        <div class="flex-1 p-3">
          <ul class="space-y-2">
            <li v-for="(sa, index) in serviceAdvisors" :key="index" 
                class="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">

              
              <div class="flex flex-col min-w-0 flex-1 mr-2">
                <span class="text-sm font-bold text-slate-700 truncate">{{ sa.saName }}</span>
                <span 
                  class="text-[10px] font-bold px-2 py-0.5 rounded-full w-fit mt-1 uppercase"
                  :class="{
                    'bg-green-600 text-white': sa.saStatus === 'WORKING',
                    'bg-red-600 text-white': sa.saStatus === 'BUSY',
                    'bg-blue-600 text-white': sa.saStatus === 'AVAILABLE',
                    'bg-amber-700 text-white': sa.saStatus === 'ABSENT',
                    'bg-slate-500 text-white': sa.saStatus === 'IDLE'
                  }"
                >
                  {{ sa.saStatus }}
                </span>
              </div>

              <div class="flex gap-2">
                <div class="relative group" @mouseenter="hoveringSAIndex = index" @mouseleave="hoveringSAIndex = null">
                  <div class="flex flex-col items-center bg-white border border-indigo-100 shadow-sm rounded px-2 py-1 cursor-help hover:border-indigo-400 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                    <span class="text-xs font-black text-indigo-600 leading-none">{{ getOngoingProCount(sa.saName) }}</span>
                    <span class="text-[8px] text-slate-400 uppercase">Ongoing</span>
                  </div>

                  
                  <div v-if="hoveringSAIndex === index" class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-white rounded-lg shadow-xl border border-slate-200 z-50 overflow-hidden animate-fade-in-up">
                    <div class="bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 text-center">Handled PROs</div>
                    <ul class="max-h-32 overflow-y-auto py-1">
                      <li v-if="getOngoingProsList(sa.saName).length === 0" class="text-center text-[10px] text-slate-400 py-2 italic">No ongoing PROs</li>
                      <li v-for="pro in getOngoingProsList(sa.saName)" :key="pro" class="px-2 py-1 text-[10px] text-slate-700 border-b border-slate-50 last:border-0 truncate">
                        {{ pro }}
                      </li>
                    </ul>
                  </div>
                </div>

                <div class="relative group" @mouseenter="hoveringJobDoneIndex = index" @mouseleave="hoveringJobDoneIndex = null">
                  <div class="flex flex-col items-center bg-white border border-green-100 shadow-sm rounded px-2 py-1 cursor-help hover:border-green-400 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                    <span class="text-xs font-black text-green-600 leading-none">{{ getJobDoneProCount(sa.saName) }}</span>
                    <span class="text-[8px] text-slate-400 uppercase">Job Done</span>
                  </div>

                  
                   <div v-if="hoveringJobDoneIndex === index" class="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-lg shadow-xl border border-slate-200 z-50 overflow-hidden animate-fade-in-up">
                    <div class="bg-green-600 text-white text-[10px] font-bold px-2 py-1 text-center">Completed PROs</div>
                    <ul class="max-h-32 overflow-y-auto py-1">
                      <li v-if="getJobDoneProsList(sa.saName).length === 0" class="text-center text-[10px] text-slate-400 py-2 italic">No completed PROs</li>
                      <li v-for="pro in getJobDoneProsList(sa.saName)" :key="pro" class="px-2 py-1 text-[10px] text-slate-700 border-b border-slate-50 last:border-0 truncate">
                        {{ pro }}
                      </li>
                    </ul>
                  </div>
                </div>

                <div class="relative group" @mouseenter="hoveringCancelledIndex = index" @mouseleave="hoveringCancelledIndex = null">
                  <div class="flex flex-col items-center bg-white border border-red-100 shadow-sm rounded px-2 py-1 cursor-help hover:border-red-400 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                    <span class="text-xs font-black text-red-600 leading-none">{{ getCancelledProCount(sa.saName) }}</span>
                    <span class="text-[8px] text-slate-400 uppercase">Cancelled</span>
                  </div>

                  
                   <div v-if="hoveringCancelledIndex === index" class="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-lg shadow-xl border border-slate-200 z-50 overflow-hidden animate-fade-in-up">
                    <div class="bg-red-600 text-white text-[10px] font-bold px-2 py-1 text-center">Cancelled PROs</div>
                    <ul class="max-h-32 overflow-y-auto py-1">
                      <li v-if="getCancelledProsList(sa.saName).length === 0" class="text-center text-[10px] text-slate-400 py-2 italic">No cancelled PROs</li>
                      <li v-for="pro in getCancelledProsList(sa.saName)" :key="pro" class="px-2 py-1 text-[10px] text-slate-700 border-b border-slate-50 last:border-0 truncate">
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
                       class="absolute right-0 bottom-full mb-1 w-32 bg-white rounded-lg shadow-xl border border-slate-100 z-[60] overflow-hidden animate-fade-in-up">
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

      <div class="bg-white rounded-xl shadow-md border border-slate-200 flex flex-col overflow-hidden hover:shadow-xl transition-all duration-300">
        <div class="bg-gradient-to-r from-indigo-600 to-purple-600 p-2 text-white flex items-center gap-2 shadow-sm shrink-0 z-10">
          <span class="text-xl">🎯</span>
          <h2 class="font-bold text-sm tracking-wide uppercase">SA's Assign to RO's</h2>
        </div>


        <div class="flex-1 overflow-y-auto p-2 bg-slate-50/50">
          <div class="space-y-2">
            
            <div>
              <label class="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">Select Retail Order</label>
            <select v-model="assignmentForm.selectedPRO" @change="onProSelected" class="w-full rounded-lg border-slate-300 text-xs shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-1.5 hover:border-indigo-400 transition-colors duration-200">

                <option value="">Choose a Retail Order</option>
                <option v-for="pro in prOrders" :key="pro" :value="pro">{{ pro }}</option>
              </select>
            </div>

            <div v-if="assignmentForm.selectedPRO" class="bg-indigo-50 border border-indigo-100 rounded-lg p-1 text-center transition-all">
              <div class="text-[8px] font-bold text-indigo-400 uppercase tracking-widest mb-0.5">Auto-Assigned Agent</div>
              
              <div v-if="assignmentForm.selectedSA">
                 <div class="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs font-bold py-0.5 px-1.5 rounded-lg shadow-lg inline-block mb-0.5">
                   {{ assignmentForm.selectedSA }}
                 </div>
                 <div class="text-[9px] text-indigo-600 font-medium">{{ getAssignmentReason() }}</div>
              </div>
              <div v-else class="text-red-500 text-[9px] font-bold bg-red-50 p-0.5 rounded">
                No Agents Available
              </div>
            </div>

            <button 
              @click="showManualSelection = !showManualSelection"
              class="w-full py-1 text-[10px] font-medium text-slate-500 bg-white border border-slate-200 rounded-md hover:text-indigo-600 hover:border-indigo-300 hover:shadow-md transition-all duration-200"
            >
              {{ showManualSelection ? 'Close Manual Selection' : '+ Override Auto-Assign' }}
            </button>


            <div v-if="showManualSelection" class="grid grid-cols-3 gap-1 bg-white p-1.5 rounded-lg border border-slate-200">
              <button 
                v-for="sa in serviceAdvisors.filter(s => s.saStatus !== 'BUSY' && s.saStatus !== 'ABSENT')" 
                :key="sa.saName"
                type="button"
                :class="[
                  'flex flex-col items-center p-1.5 rounded-md border text-[10px] transition-all duration-200',
                  assignmentForm.selectedSA === sa.saName 
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-bold ring-1 ring-indigo-500' 
                    : 'border-slate-100 hover:bg-indigo-50 hover:border-indigo-300 hover:shadow-sm hover:-translate-y-0.5 text-slate-600'
                ]"
                @click="selectManualSA(sa.saName)"
              >


                <span>{{ sa.saName }}</span>
                <span class="text-[8px] opacity-70">{{ sa.saStatus }}</span>
              </button>
              <button @click="resetToAutoAssignment" class="col-span-3 text-[9px] text-green-600 font-bold uppercase tracking-wide py-0.5 hover:underline hover:text-green-700 transition-colors duration-200">
                ↻ Reset to Auto
              </button>

            </div>

            <div>
              <label class="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">Note (Optional)</label>
              <textarea 
                v-model="assignmentForm.note" 
                class="w-full rounded-lg border-slate-300 text-xs shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-1 min-h-12 hover:border-indigo-400 hover:bg-white transition-all duration-200"
                placeholder="Add notes..."
                rows="2"
              ></textarea>


            </div>
          </div>
        </div>

        <div class="p-3 bg-white border-t border-slate-100 shrink-0 z-10">
            <button 
              @click="proceedAssignment"
              :disabled="!assignmentForm.selectedPRO || !assignmentForm.selectedSA || isHistoryDateFilterNotToday"
            :title="isHistoryDateFilterNotToday ? 'Can only assign when viewing today\'s history' : ''"
              class="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-2.5 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 active:translate-y-0 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Assign Order
            </button>

        </div>
      </div>
    </div>


    <div class="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4 min-h-0">
      
      <div class="md:col-span-3 bg-white rounded-xl shadow-md border border-slate-200 flex flex-col overflow-hidden hover:shadow-xl transition-all duration-300">

         <div class="bg-slate-50 border-b border-slate-200 p-3 flex justify-between items-center shrink-0">
            <div class="flex items-center gap-2 text-indigo-700">
               <span class="text-xl">📋</span>
               <h2 class="font-bold text-sm tracking-wide uppercase">Performed Retail Orders</h2>
            </div>
            <input 
                v-model="searchQuery"
                type="text"
                class="bg-white border border-slate-300 text-xs rounded-md px-3 py-1.5 w-64 focus:ring-indigo-500 focus:border-indigo-500 hover:border-indigo-400 transition-colors duration-200"
                placeholder="Search PRO or SA..."
            />

         </div>
         
         <div class="flex-1 overflow-auto">
            <table class="min-w-full divide-y divide-slate-200">
               <thead class="bg-slate-50 sticky top-0 z-10">
                  <tr>
                     <th class="px-2 py-1 text-left text-[13px] font-bold text-slate-500 uppercase tracking-wider">PRO</th>
                     <th class="px-2 py-1 text-left text-[13px] font-bold text-slate-500 uppercase tracking-wider">Advisor</th>
                     <th class="px-2 py-1 text-left text-[13px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                     <th class="px-2 py-1 text-left text-[13px] font-bold text-slate-500 uppercase tracking-wider">Date</th>
                     <th class="px-2 py-1 text-right text-[13px] font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
               </thead>
               <tbody class="bg-white divide-y divide-slate-100">
                  <tr v-for="(assignment, index) in paginatedActiveAssignments" :key="index" class="hover:bg-indigo-50/50 hover:shadow-sm transition-all duration-200">

                     <td class="px-3 py-2 whitespace-nowrap text-[12px] font-medium text-slate-900">{{ assignment.pro }}</td>
                     <td class="px-3 py-2 whitespace-nowrap text-[12px] text-slate-600">{{ assignment.saName }}</td>
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
                     <td class="px-3 py-2 whitespace-nowrap text-[12px] text-slate-400">{{ formatDate(assignment.date) }}</td>
                     <td class="px-3 py-2 whitespace-nowrap text-right text-sm font-medium space-x-1">
                        <template v-if="isAssignmentCutOff(assignment)">
                           <button class="text-red-600 hover:text-red-900" title="Delete" @click="deleteAssignmentDirect(getOriginalIndex(assignment))">🗑</button>
                           <button class="text-amber-600 hover:text-amber-900" title="Reassign" @click="reassignAssignment(getOriginalIndex(assignment))">🔄</button>
                        </template>
                        <template v-else>
                           <button class="text-indigo-600 hover:text-indigo-900 hover:bg-indigo-100 rounded px-1 transition-all duration-200" title="Edit" @click="openEditModal(getOriginalIndex(assignment), assignment)">✎</button>
                           <button class="text-green-600 hover:text-green-900 hover:bg-green-100 rounded px-1 transition-all duration-200" title="Done" @click="markAsDone(getOriginalIndex(assignment))">✓</button>
                           <button class="text-orange-500 hover:text-orange-900 hover:bg-orange-100 rounded px-1 transition-all duration-200" title="Cancel" @click="cancelAssignment(getOriginalIndex(assignment))">✕</button>
                        </template>
                     </td>

                  </tr>
               </tbody>
            </table>
            <div v-if="filteredActiveAssignments.length === 0" class="p-8 text-center text-slate-400 text-sm">
               No active assignments found.
            </div>
         </div>

         <div class="p-2 border-t border-slate-200 bg-slate-50 flex justify-center gap-2 shrink-0">
             <button @click="currentPage--" :disabled="currentPage === 1" class="px-2 py-1 text-xs border rounded hover:bg-white hover:shadow-sm transition-all duration-200 disabled:opacity-50">← Prev</button>
             <span class="text-xs self-center font-medium text-slate-600">Page {{ currentPage }}</span>
             <button @click="currentPage++" :disabled="currentPage === totalActivePages" class="px-2 py-1 text-xs border rounded hover:bg-white hover:shadow-sm transition-all duration-200 disabled:opacity-50">Next →</button>
         </div>

      </div>

      <div class="md:col-span-2 bg-white rounded-xl shadow-md border border-slate-200 flex flex-col overflow-hidden opacity-90 hover:opacity-100 hover:shadow-xl transition-all duration-300">

         <div class="bg-slate-50 border-b border-slate-200 p-3 flex justify-between items-center gap-2 shrink-0 flex-wrap">
            <div class="flex items-center gap-2 text-slate-600">
               <span class="text-xl">📜</span>
               <h2 class="font-bold text-sm tracking-wide uppercase">History</h2>
            </div>
            <div class="flex gap-2 items-center flex-wrap">
               <input 
                  v-model="historyFromDate"
                  type="date"
                  :max="todayDate"
                  class="bg-white border border-slate-300 text-xs rounded-md px-3 py-1.5 focus:ring-indigo-500 focus:border-indigo-500 hover:border-indigo-400 transition-colors duration-200"
               />
               <span class="text-xs text-slate-400">to</span>
               <input 
                  v-model="historyToDate"
                  type="date"
                  :max="todayDate"
                  class="bg-white border border-slate-300 text-xs rounded-md px-3 py-1.5 focus:ring-indigo-500 focus:border-indigo-500 hover:border-indigo-400 transition-colors duration-200"
               />
               <input 
                  v-model="historySearchQuery"
                  type="text"
                  class="bg-white border border-slate-300 text-xs rounded-md px-3 py-1.5 w-32 focus:ring-indigo-500 focus:border-indigo-500 hover:border-indigo-400 hover:shadow-sm transition-all duration-200"
                  placeholder="Search PRO or SA..."
               />


               <select v-model="historyStatusFilter" class="bg-white border border-slate-300 text-xs rounded-md px-2 py-1.5 focus:ring-indigo-500 hover:border-indigo-400 transition-colors duration-200">

                  <option value="">All Status</option>
                  <option value="JOB DONE">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
               </select>
            </div>
         </div>

         <div class="flex-1 overflow-auto">
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
         </div>

         <div class="p-2 border-t border-slate-200 bg-slate-50 flex justify-center gap-2 shrink-0">
             <button @click="historyPage--" :disabled="historyPage === 1" class="px-2 py-1 text-xs border rounded hover:bg-white hover:shadow-sm transition-all duration-200 disabled:opacity-50">← Prev</button>
             <span class="text-xs self-center font-medium text-slate-600">Page {{ historyPage }}</span>
             <button @click="historyPage++" :disabled="historyPage === totalHistoryPages" class="px-2 py-1 text-xs border rounded hover:bg-white hover:shadow-sm transition-all duration-200 disabled:opacity-50">Next →</button>
         </div>

      </div>
    </div>

    <div v-if="showEditModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center animate-fade-in" @click="closeEditModal">
       <div class="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100" @click.stop>
          <div class="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex justify-between items-center text-white">
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

    <div v-if="showEditPRModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center animate-fade-in" @click="closePREditModal">
       <div class="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100" @click.stop>
          <div class="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex justify-between items-center text-white">
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

    <div v-if="showDeletePRModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center animate-fade-in" @click="closePRDeleteModal">
       <div class="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100" @click.stop>
          <div class="bg-gradient-to-r from-red-600 to-red-700 p-4 flex justify-between items-center text-white">
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

    <div v-if="showEditSAModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center animate-fade-in" @click="closeSAEditModal">
       <div class="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100" @click.stop>
          <div class="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex justify-between items-center text-white">
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

    <div v-if="showDeleteSAModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center animate-fade-in" @click="closeSADeleteModal">
       <div class="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100" @click.stop>
          <div class="bg-gradient-to-r from-red-600 to-red-700 p-4 flex justify-between items-center text-white">
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

<script>
import { db } from "../Firebase/Firebase";
import { doc, onSnapshot, updateDoc, getDoc, deleteField, setDoc } from "firebase/firestore";

export default {
    data() {
        return {
            serviceAdvisors: [],
            newServiceAdvisor: "",
            prOrders: [],
            newPROrder: "",
            dropdownIndex: null,
            dropdownType: null,
            showEditPRModal: false,
            showDeletePRModal: false,
            editingPROrder: "",
            editingPRIndex: null,
            deletingPROrder: "",
            deletingPRIndex: null,
            showEditSAModal: false,
            showDeleteSAModal: false,
            editingSAName: "",
            editingSAStatus: "",
            editingSAIndex: null,
            deletingSAName: "",
            deletingSAIndex: null,
            activeTab: "sa",
            statuses: [],
            assignments: [],
            assignmentForm: {
                selectedPRO: "",
                selectedSA: "",
                note: "",
                assignmentReason: ""
            },
            showEditModal: false,
            editingAssignment: null,
            editingIndex: null,
            hoveringSAIndex: null,
            hoveringJobDoneIndex: null,
            hoveringCancelledIndex: null,
            showManualSelection: false,
            assignmentsView: "active",
            searchQuery: "",
            statusFilter: "",
            historySearchQuery: "",
            historyStatusFilter: "",
            historyFromDate: this.getTodayDateString(),
            historyToDate: this.getTodayDateString(),
            currentPage: 1,
            historyPage: 1,
            itemsPerPage: 5,
            assignmentsListener: null,
            currentlyViewingDateRange: false
        };
    },
    computed: {
        availableSAs() {
            if (!this.assignmentForm.selectedPRO) {
                return [];
            }
            
            // Get all SAs who have not been assigned to this PRO
            const assignedToThisPRO = this.assignments
                .filter(a => a.pro === this.assignmentForm.selectedPRO && a.status !== "JOB DONE")
                .map(a => a.saName);
            
            // Also include SAs who have completed this PRO (status: JOB DONE) as they can do it again
            const availableSANames = this.serviceAdvisors
                .filter(sa => {
                    const isAssignedOngoing = assignedToThisPRO.includes(sa.saName);
                    return !isAssignedOngoing; // Show if not currently assigned (pending/in progress)
                })
                .map(sa => sa);
            
            return availableSANames;
        },
        filteredActiveAssignments() {
            return this.assignments.filter(assignment => {
                const matchesSearch = !this.searchQuery || 
                    assignment.pro.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                    assignment.saName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                    (assignment.note && assignment.note.toLowerCase().includes(this.searchQuery.toLowerCase()));
                
                const isOnGoing = assignment.status === "ON GOING";
                
                return matchesSearch && isOnGoing;
            });
        },
        filteredHistoryAssignments() {
            return this.assignments.filter(assignment => {
                const matchesSearch = !this.historySearchQuery || 
                    assignment.pro.toLowerCase().includes(this.historySearchQuery.toLowerCase()) ||
                    assignment.saName.toLowerCase().includes(this.historySearchQuery.toLowerCase()) ||
                    (assignment.note && assignment.note.toLowerCase().includes(this.historySearchQuery.toLowerCase()));
                
                const matchesStatus = !this.historyStatusFilter || assignment.status === this.historyStatusFilter;
                const isInHistory = assignment.status === "JOB DONE" || assignment.status === "CANCELLED";
                
                return matchesSearch && matchesStatus && isInHistory;
            });
        },
        totalActivePages() {
            return Math.ceil(this.filteredActiveAssignments.length / this.itemsPerPage) || 1;
        },
        totalHistoryPages() {
            return Math.ceil(this.filteredHistoryAssignments.length / this.itemsPerPage) || 1;
        },
        paginatedActiveAssignments() {
            const start = (this.currentPage - 1) * this.itemsPerPage;
            return this.filteredActiveAssignments.slice(start, start + this.itemsPerPage);
        },
        paginatedHistoryAssignments() {
            const start = (this.historyPage - 1) * this.itemsPerPage;
            return this.filteredHistoryAssignments.slice(start, start + this.itemsPerPage);
        },
        todayDate() {
            // Return today's date in YYYY-MM-DD format for max date restriction
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        },
        isHistoryDateFilterNotToday() {
            // Check if user is filtering history by a date that is NOT today
            const today = this.todayDate;
            // If either date filter is set and not equal to today, disable assignment
            return (this.historyFromDate && this.historyFromDate !== today) || 
                   (this.historyToDate && this.historyToDate !== today);
        }
    },
    methods: {
        isAssignmentCutOff(assignment) {
            // Check if assignment is ON GOING but not from today
            if (assignment.status !== "ON GOING") {
                return false;
            }
            
            const today = this.todayDate;
            const assignmentDateStr = assignment.date instanceof Date ? assignment.date.toISOString().split('T')[0] : String(assignment.date).split('T')[0];
            return assignmentDateStr !== today;
        },
        getTodayDateString() {
            // Return today's date in YYYY-MM-DD format
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        },
        getOngoingProCount(saName) {
            return this.assignments.filter(
                a => a.saName === saName && a.status === "ON GOING"
            ).length;
        },
        getOngoingProsList(saName) {
            return this.assignments
                .filter(a => a.saName === saName && a.status === "ON GOING")
                .map(a => a.pro);
        },
        getJobDoneProCount(saName) {
            return new Set(
                this.assignments
                    .filter(a => a.saName === saName && a.status === "JOB DONE")
                    .map(a => a.pro)
            ).size;
        },
        getJobDoneProsList(saName) {
            // Get unique PROs completed (JOB DONE)
            return [...new Set(
                this.assignments
                    .filter(a => a.saName === saName && a.status === "JOB DONE")
                    .map(a => a.pro)
            )];
        },
        getCancelledProCount(saName) {
            return new Set(
                this.assignments
                    .filter(a => a.saName === saName && a.status === "CANCELLED")
                    .map(a => a.pro)
            ).size;
        },
        getCancelledProsList(saName) {
            // Get unique PROs cancelled (CANCELLED)
            return [...new Set(
                this.assignments
                    .filter(a => a.saName === saName && a.status === "CANCELLED")
                    .map(a => a.pro)
            )];
        },
        onProSelected() {
            // Auto-select the best SA when PRO is selected
            const bestSA = this.selectBestServiceAdvisor();
            if (bestSA) {
                this.assignmentForm.selectedSA = bestSA.saName;
                this.assignmentForm.assignmentReason = bestSA.reason;
            } else {
                this.assignmentForm.selectedSA = "";
                this.assignmentForm.assignmentReason = "";
            }
            // Close manual selection when PRO changes
            this.showManualSelection = false;
        },
        selectBestServiceAdvisor() {
            if (!this.assignmentForm.selectedPRO || this.serviceAdvisors.length === 0) {
                return null;
            }

            const selectedPRO = this.assignmentForm.selectedPRO;
            
            // Filter out BUSY and ABSENT SAs
            const availableSAs = this.serviceAdvisors.filter(sa => sa.saStatus !== 'BUSY' && sa.saStatus !== 'ABSENT');
            
            if (availableSAs.length === 0) {
                return null;
            }

            // Priority 1: SAs with NO ongoing assignments who have never done this PRO
            const availableNoOngoing = availableSAs.filter(sa => this.getOngoingProCount(sa.saName) === 0);
            
            if (availableNoOngoing.length > 0) {
                // Among those with no ongoing, find one who never did this PRO
                const neverDonePRO = availableNoOngoing.find(sa => {
                    const hasDonePRO = this.assignments.some(
                        a => a.saName === sa.saName && a.pro === selectedPRO
                    );
                    return !hasDonePRO;
                });
                
                if (neverDonePRO) {
                    return {
                        saName: neverDonePRO.saName,
                        reason: "✨ Available & New "
                    };
                }
                
                // If all available SAs have done this PRO, pick one with no ongoing
                return {
                    saName: availableNoOngoing[0].saName,
                    reason: "🎯 Available (No ongoing)"
                };
            }

            // Priority 2: Only if all available SAs have ongoing, pick the one with least ongoing
            const leastBusySA = availableSAs.reduce((least, current) => {
                const currentOngoing = this.getOngoingProCount(current.saName);
                const leastOngoing = this.getOngoingProCount(least.saName);
                return currentOngoing < leastOngoing ? current : least;
            });

            return {
                saName: leastBusySA.saName,
                reason: "⚖️ Least busy (All have orders)"
            };
        },
        getAssignmentReason() {
            return this.assignmentForm.assignmentReason;
        },
        getOriginalIndex(assignment) {
            return this.assignments.findIndex(a => {
                // Compare using ISO date strings to handle Date object comparisons correctly
                const aDateStr = a.date instanceof Date ? a.date.toISOString().split('T')[0] : String(a.date).split('T')[0];
                const assignmentDateStr = assignment.date instanceof Date ? assignment.date.toISOString().split('T')[0] : String(assignment.date).split('T')[0];
                
                return a.pro === assignment.pro && 
                       a.saName === assignment.saName && 
                       aDateStr === assignmentDateStr;
            });
        },
        deleteAssignmentDirect(index) {
            // Delete assignment directly without confirmation
            const saName = this.assignments[index].saName;
            const wasOnGoing = this.assignments[index].status === "ON GOING";
            
            this.assignments.splice(index, 1);
            this.saveAssignmentsToFirebase();
            
            // If deleted assignment was ON GOING, check if SA has other ON GOING assignments
            if (wasOnGoing) {
                const hasOnGoingAssignments = this.assignments.some(
                    a => a.saName === saName && a.status === "ON GOING"
                );
                
                // If no more ON GOING assignments, set status back to AVAILABLE
                if (!hasOnGoingAssignments) {
                    this.updateSAStatus(saName, "AVAILABLE");
                }
            }
        },
        async reassignAssignment(index) {
            // Reassign a cut-off assignment to today
            const assignment = this.assignments[index];
            
            // Change status to ON GOING and update date to today
            assignment.status = "ON GOING";
            assignment.date = new Date();
            
            // Save to Firebase (this will handle grouping by date)
            await this.saveAssignmentsToFirebase();
            
            // Update SA status to WORKING
            await this.updateSAStatus(assignment.saName, "WORKING");
        },
        selectManualSA(saName) {
            this.assignmentForm.selectedSA = saName;
            this.assignmentForm.assignmentReason = "👤 Manually selected";
        },
        resetToAutoAssignment() {
            const bestSA = this.selectBestServiceAdvisor();
            if (bestSA) {
                this.assignmentForm.selectedSA = bestSA.saName;
                this.assignmentForm.assignmentReason = bestSA.reason;
            } else {
                this.assignmentForm.selectedSA = "";
                this.assignmentForm.assignmentReason = "";
            }
            this.showManualSelection = false;
        },
        listenToStatuses() {
            const docRef = doc(db, "Service_Advisor", "isuzu&calapan&status");
            onSnapshot(docRef, (docSnap) => {
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    this.statuses = Object.keys(data)
                        .filter(key => key.startsWith("status"))
                        .sort((a, b) => {
                            const numA = parseInt(a.replace("status", ""));
                            const numB = parseInt(b.replace("status", ""));
                            return numA - numB;
                        })
                        .map(key => data[key]);
                } else {
                    console.error("No status document found!");
                }
            }, (error) => {
                console.error("Error listening to statuses:", error);
            });
        },
        listenToServiceAdvisors() {
            const docRef = doc(db, "Service_Advisor", "isuzu&calapan&sa");
            onSnapshot(docRef, (docSnap) => {
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    this.serviceAdvisors = Object.values(data).map(item => ({
                        saName: item.saName,
                        saStatus: item.saStatus
                    }));
                } else {
                    console.error("No such document!");
                }
            }, (error) => {
                console.error("Error listening to document:", error);
            });
        },
        async addServiceAdvisor() {
            if (!this.newServiceAdvisor.trim()) {
                //alert("Service Advisor name cannot be empty.");
                return;
            }

            try {
                const uppercaseName = this.newServiceAdvisor.trim().toUpperCase();
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
                        [nextField]: {
                            saName: uppercaseName,
                            saStatus: "AVAILABLE"
                        }
                    });
                    this.newServiceAdvisor = "";
                } else {
                    console.error("No such document!");
                }
            } catch (error) {
                console.error("Error adding service advisor:", error);
            }
        },
        async editServiceAdvisor(index, oldName) {
            const newName = prompt("Edit Service Advisor Name:", oldName);
            if (newName && newName.trim()) {
                const uppercaseName = newName.trim().toUpperCase();
                const docRef = doc(db, "Service_Advisor", "isuzu&calapan&sa");
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    const fieldKey = Object.keys(data).find(key => data[key].saName === oldName);
                    if (fieldKey) {
                        await updateDoc(docRef, { 
                            [fieldKey]: {
                                saName: uppercaseName,
                                saStatus: data[fieldKey].saStatus
                            }
                        });
                        this.closeDropdown();
                    }
                }
            }
        },
        async updateServiceAdvisorStatus(index, name, newStatus) {
            try {
                const docRef = doc(db, "Service_Advisor", "isuzu&calapan&sa");
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    const fieldKey = Object.keys(data).find(key => data[key].saName === name);
                    if (fieldKey) {
                        await updateDoc(docRef, {
                            [fieldKey]: {
                                saName: data[fieldKey].saName,
                                saStatus: newStatus
                            }
                        });
                        this.closeDropdown();
                    }
                }
            } catch (error) {
                console.error("Error updating service advisor status:", error);
            }
        },
        async deleteServiceAdvisor(index, name) {
            //if (confirm(`Are you sure you want to delete ${name}?`)) {
                try {
                    const docRef = doc(db, "Service_Advisor", "isuzu&calapan&sa");
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        const fieldKey = Object.keys(data).find(key => data[key].saName === name);
                        if (fieldKey) {
                            await updateDoc(docRef, { [fieldKey]: deleteField() });
                            this.closeDropdown();
                        }
                    } else {
                        console.error("No such document!");
                    }
                } catch (error) {
                    console.error("Error deleting service advisor:", error);
                }
            //}
        },
        listenToPROrders() {
            const docRef = doc(db, "PR_Order", "isuzu&calapan&pro");
            onSnapshot(docRef, (docSnap) => {
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    this.prOrders = Object.values(data);
                } else {
                    console.error("No such document!");
                }
            }, (error) => {
                console.error("Error listening to document:", error);
            });
        },
        async addPROrder() {
            if (!this.newPROrder.trim()) {
                //alert("PR Order cannot be empty.");
                return;
            }

            try {
                const uppercaseName = this.newPROrder.trim();
                const docRef = doc(db, "PR_Order", "isuzu&calapan&pro");
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    const existingFields = Object.keys(data)
                        .filter(key => key.startsWith("pro")) // Use "pro" as the prefix
                        .map(key => parseInt(key.replace("pro", ""), 10))
                        .filter(num => !isNaN(num));

                    const nextField = `pro${Math.max(...existingFields, 0) + 1}`;
                    await updateDoc(docRef, { [nextField]: uppercaseName });
                    this.newPROrder = "";
                } else {
                    console.error("No such document!");
                }
            } catch (error) {
                console.error("Error adding PR order:", error);
            }
        },
        async editPROrder(index, oldName) {
            const newName = prompt("Edit PR Order:", oldName);
            if (newName && newName.trim()) {
                const uppercaseName = newName.trim().toUpperCase();
                const docRef = doc(db, "PR_Order", "isuzu&calapan&pro");
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    const fieldKey = Object.keys(data).find(key => data[key] === oldName);
                    if (fieldKey) {
                        await updateDoc(docRef, { [fieldKey]: uppercaseName });
                        this.closeDropdown();
                    }
                }
            }
        },
        async deletePROrder(index, name) {
            //if (confirm(`Are you sure you want to delete ${name}?`)) {
                try {
                    const docRef = doc(db, "PR_Order", "isuzu&calapan&pro");
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        const fieldKey = Object.keys(data).find(key => data[key] === name);
                        if (fieldKey) {
                            await updateDoc(docRef, { [fieldKey]: deleteField() });
                            this.closeDropdown();
                        }
                    } else {
                        console.error("No such document!");
                    }
                } catch (error) {
            }
        },
        openPREditModal(index, prName) {
            this.editingPRIndex = index;
            this.editingPROrder = prName;
            this.showEditPRModal = true;
            this.closeDropdown();
        },
        closePREditModal() {
            this.showEditPRModal = false;
            this.editingPROrder = "";
            this.editingPRIndex = null;
        },
        async savePROrderEdit() {
            if (!this.editingPROrder.trim()) {
                return;
            }
            
            try {
                const oldName = this.prOrders[this.editingPRIndex];
                const newName = this.editingPROrder.trim().toUpperCase();
                const docRef = doc(db, "PR_Order", "isuzu&calapan&pro");
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    const fieldKey = Object.keys(data).find(key => data[key] === oldName);
                    if (fieldKey) {
                        await updateDoc(docRef, { [fieldKey]: newName });
                        this.closePREditModal();
                    }
                }
            } catch (error) {
                console.error("Error saving PR Order:", error);
            }
        },
        openPRDeleteModal(index, prName) {
            this.deletingPRIndex = index;
            this.deletingPROrder = prName;
            this.showDeletePRModal = true;
            this.closeDropdown();
        },
        closePRDeleteModal() {
            this.showDeletePRModal = false;
            this.deletingPROrder = "";
            this.deletingPRIndex = null;
        },
        async confirmDeletePROrder() {
            try {
                const docRef = doc(db, "PR_Order", "isuzu&calapan&pro");
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    const fieldKey = Object.keys(data).find(key => data[key] === this.deletingPROrder);
                    if (fieldKey) {
                        await updateDoc(docRef, { [fieldKey]: deleteField() });
                        this.closePRDeleteModal();
                    }
                }
            } catch (error) {
                console.error("Error deleting PR Order:", error);
            }
        },
        openSAEditModal(index, saName, saStatus) {
            this.editingSAIndex = index;
            this.editingSAName = saName;
            this.editingSAStatus = saStatus;
            this.showEditSAModal = true;
            this.closeDropdown();
        },
        closeSAEditModal() {
            this.showEditSAModal = false;
            this.editingSAName = "";
            this.editingSAStatus = "";
            this.editingSAIndex = null;
        },
        async saveSAEdit() {
            if (!this.editingSAName.trim()) {
                return;
            }

            try {
                const oldName = this.serviceAdvisors[this.editingSAIndex].saName;
                const newName = this.editingSAName.trim().toUpperCase();
                const docRef = doc(db, "Service_Advisor", "isuzu&calapan&sa");
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    const fieldKey = Object.keys(data).find(key => data[key].saName === oldName);
                    if (fieldKey) {
                        await updateDoc(docRef, {
                            [fieldKey]: {
                                saName: newName,
                                saStatus: this.editingSAStatus
                            }
                        });
                        this.closeSAEditModal();
                    }
                }
            } catch (error) {
                console.error("Error saving Service Advisor:", error);
            }
        },
        openSADeleteModal(index, saName) {
            this.deletingSAIndex = index;
            this.deletingSAName = saName;
            this.showDeleteSAModal = true;
            this.closeDropdown();
        },
        closeSADeleteModal() {
            this.showDeleteSAModal = false;
            this.deletingSAName = "";
            this.deletingSAIndex = null;
        },
        async confirmDeleteSA() {
            try {
                const docRef = doc(db, "Service_Advisor", "isuzu&calapan&sa");
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    const fieldKey = Object.keys(data).find(key => data[key].saName === this.deletingSAName);
                    if (fieldKey) {
                        await updateDoc(docRef, { [fieldKey]: deleteField() });
                        this.closeSADeleteModal();
                    }
                }
            } catch (error) {
                console.error("Error deleting Service Advisor:", error);
            }
        },
        closeDropdown() {
            this.dropdownIndex = null;
            this.dropdownType = null;
        },
        toggleDropdown(index, type) {
            // Toggle dropdown: if clicking the same button, close it; otherwise open it
            if (this.dropdownIndex === index && this.dropdownType === type) {
                this.closeDropdown();
            } else {
                this.dropdownIndex = index;
                this.dropdownType = type;
            }
        },
        // Assignment Methods
        async proceedAssignment() {
            if (!this.assignmentForm.selectedPRO || !this.assignmentForm.selectedSA) {
                //alert("Please select both PRO and Service Advisor");
                return;
            }

            const newAssignment = {
                pro: this.assignmentForm.selectedPRO,
                saName: this.assignmentForm.selectedSA,
                note: this.assignmentForm.note,
                status: "ON GOING",
                date: new Date()
            };

            this.assignments.push(newAssignment);
            // Update SA status to WORKING
            await this.updateSAStatus(this.assignmentForm.selectedSA, "WORKING");
            this.saveAssignmentsToFirebase();
            this.resetAssignmentForm();
            //alert("Assignment created successfully!");
        },
        resetAssignmentForm() {
            this.assignmentForm.selectedPRO = "";
            this.assignmentForm.selectedSA = "";
            this.assignmentForm.note = "";
            this.assignmentForm.assignmentReason = "";
        },
        openEditModal(index, assignment) {
            this.editingIndex = index;
            this.editingAssignment = { ...assignment };
            this.showEditModal = true;
        },
        closeEditModal() {
            this.showEditModal = false;
            this.editingAssignment = null;
            this.editingIndex = null;
        },
        async saveEditedAssignment() {
            if (this.editingIndex !== null && this.editingAssignment) {
                const previousStatus = this.assignments[this.editingIndex].status;
                const previousSA = this.assignments[this.editingIndex].saName;
                const newStatus = this.editingAssignment.status;
                
                this.assignments[this.editingIndex] = this.editingAssignment;
                this.saveAssignmentsToFirebase();
                
                // Handle status changes affecting SA status
                if (previousStatus === "ON GOING" && newStatus !== "ON GOING") {
                    // Assignment changed from ON GOING to something else
                    const hasOnGoingAssignments = this.assignments.some(
                        a => a.saName === previousSA && a.status === "ON GOING"
                    );
                    if (!hasOnGoingAssignments) {
                        await this.updateSAStatus(previousSA, "AVAILABLE");
                    }
                } else if (previousStatus !== "ON GOING" && newStatus === "ON GOING") {
                    // Assignment changed to ON GOING
                    await this.updateSAStatus(previousSA, "WORKING");
                }
                
                this.closeEditModal();
                //alert("Assignment updated successfully!");
            }
        },
        async markAsDone(index) {
            //if (confirm("Mark this assignment as JOB DONE?")) {
                const saName = this.assignments[index].saName;
                this.assignments[index].status = "JOB DONE";
                this.saveAssignmentsToFirebase();
                
                // Check if SA has any other ON GOING assignments
                const hasOnGoingAssignments = this.assignments.some(
                    a => a.saName === saName && a.status === "ON GOING"
                );
                
                // If no more ON GOING assignments, set status back to AVAILABLE
                if (!hasOnGoingAssignments) {
                    await this.updateSAStatus(saName, "AVAILABLE");
                }
                
                //alert("Assignment marked as done!");
            //}
        },
        async cancelAssignment(index) {
            //if (confirm("Are you sure you want to cancel this assignment?")) {
                const saName = this.assignments[index].saName;
                this.assignments[index].status = "CANCELLED";
                this.saveAssignmentsToFirebase();
                
                // Check if SA has any other ON GOING assignments
                const hasOnGoingAssignments = this.assignments.some(
                    a => a.saName === saName && a.status === "ON GOING"
                );
                
                // If no more ON GOING assignments, set status back to AVAILABLE
                if (!hasOnGoingAssignments) {
                    await this.updateSAStatus(saName, "AVAILABLE");
                }
                
                //alert("Assignment cancelled!");
            //}
        },
        async deleteAssignment(index) {
            //if (confirm("Are you sure you want to delete this assignment?")) {
                const saName = this.assignments[index].saName;
                const wasOnGoing = this.assignments[index].status === "ON GOING";
                
                this.assignments.splice(index, 1);
                this.saveAssignmentsToFirebase();
                
                // If deleted assignment was ON GOING, check if SA has other ON GOING assignments
                if (wasOnGoing) {
                    const hasOnGoingAssignments = this.assignments.some(
                        a => a.saName === saName && a.status === "ON GOING"
                    );
                    
                    // If no more ON GOING assignments, set status back to AVAILABLE
                    if (!hasOnGoingAssignments) {
                        await this.updateSAStatus(saName, "AVAILABLE");
                    }
                }
                
                //alert("Assignment deleted!");
            //}
        },
        formatDate(date) {
            if (!date) return "—";
            const d = new Date(date);
            const month = String(d.getMonth() + 1).padStart(2, "0");
            const day = String(d.getDate()).padStart(2, "0");
            const year = d.getFullYear();
            return `${month}/${day}/${year}`;
        },
        getTodayDateKey() {
            // Returns date in YYYY-MM-DD format for document ID
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, "0");
            const day = String(today.getDate()).padStart(2, "0");
            return `${year}-${month}-${day}`;
        },
        async updateSAStatus(saName, newStatus) {
            try {
                const docRef = doc(db, "Service_Advisor", "isuzu&calapan&sa");
                const docSnap = await getDoc(docRef);
                
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    const fieldKey = Object.keys(data).find(key => data[key].saName === saName);
                    
                    if (fieldKey) {
                        await updateDoc(docRef, {
                            [fieldKey]: {
                                saName: data[fieldKey].saName,
                                saStatus: newStatus
                            }
                        });
                        console.log(`Updated ${saName} status to ${newStatus}`);
                    }
                }
            } catch (error) {
                console.error("Error updating SA status:", error);
            }
        },
        async saveAssignmentsToFirebase() {
            try {
                // Group assignments by date
                const assignmentsByDate = {};
                
                this.assignments.forEach(assignment => {
                    const dateStr = assignment.date instanceof Date ? assignment.date.toISOString().split('T')[0] : String(assignment.date).split('T')[0];
                    if (!assignmentsByDate[dateStr]) {
                        assignmentsByDate[dateStr] = [];
                    }
                    assignmentsByDate[dateStr].push(assignment);
                });
                
                // Save assignments for each date
                for (const [dateKey, dateAssignments] of Object.entries(assignmentsByDate)) {
                    const docRef = doc(db, "SA_Assignment", `isuzu&calapan&assignments&${dateKey}`);
                    const docSnap = await getDoc(docRef);
                    
                    let updateData = {};
                    
                    if (docSnap.exists()) {
                        const existingData = docSnap.data();
                        // Mark all old assignment fields for deletion
                        Object.keys(existingData).forEach(key => {
                            if (key.startsWith("assign")) {
                                updateData[key] = deleteField();
                            }
                        });
                    }
                    
                    // Add new assignments for this date
                    dateAssignments.forEach((assignment, index) => {
                        updateData[`assign${index + 1}`] = {
                            pro: assignment.pro,
                            saName: assignment.saName,
                            note: assignment.note || "",
                            status: assignment.status,
                            date: assignment.date instanceof Date ? assignment.date.toISOString() : assignment.date,
                            timestamp: new Date().toISOString()
                        };
                    });
                    
                    // Update with both deletions and new data
                    if (docSnap.exists()) {
                        await updateDoc(docRef, updateData);
                    } else {
                        const newData = {};
                        dateAssignments.forEach((assignment, index) => {
                            newData[`assign${index + 1}`] = {
                                pro: assignment.pro,
                                saName: assignment.saName,
                                note: assignment.note || "",
                                status: assignment.status,
                                date: assignment.date instanceof Date ? assignment.date.toISOString() : assignment.date,
                                timestamp: new Date().toISOString()
                            };
                        });
                        await setDoc(docRef, newData);
                    }
                }
                
                console.log("Assignments saved to Firebase for all dates");
            } catch (error) {
                console.error("Error saving assignments to Firebase:", error);
            }
        },
        listenToAssignments() {
            const dateKey = this.getTodayDateKey();
            const docRef = doc(db, "SA_Assignment", `isuzu&calapan&assignments&${dateKey}`);
            // Unsubscribe from previous listener if it exists
            if (this.assignmentsListener) {
                this.assignmentsListener();
            }
            this.assignmentsListener = onSnapshot(docRef, (docSnap) => {
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    this.assignments = Object.values(data).map(item => ({
                        pro: item.pro || "",
                        saName: item.saName || "",
                        note: item.note || "",
                        status: item.status || "ON GOING",
                        date: item.date instanceof Date ? item.date : (item.date ? new Date(item.date) : new Date())
                    }));
                } else {
                    console.log(`No assignments found for ${dateKey}`);
                    this.assignments = [];
                }
            }, (error) => {
                console.error("Error listening to assignments:", error);
            });
        },
        async loadAssignmentsByDateRange() {
            // Load assignments for a specific date range
            const today = this.todayDate;
            
            // Check if filtering is for today only
            const isFilteringToday = this.historyFromDate === today && this.historyToDate === today;
            
            if (isFilteringToday || !this.historyFromDate) {
                // Re-enable real-time listening for today's data
                this.listenToAssignments();
                return;
            }

            // Unsubscribe from real-time listener before loading historical data
            if (this.assignmentsListener) {
                this.assignmentsListener();
                this.assignmentsListener = null;
            }

            try {
                const fromDate = new Date(this.historyFromDate);
                const toDate = this.historyToDate ? new Date(this.historyToDate) : fromDate;
                
                const allAssignments = [];
                let currentDate = new Date(fromDate);
                
                while (currentDate <= toDate) {
                    const year = currentDate.getFullYear();
                    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
                    const day = String(currentDate.getDate()).padStart(2, "0");
                    const dateKey = `${year}-${month}-${day}`;
                    
                    const docRef = doc(db, "SA_Assignment", `isuzu&calapan&assignments&${dateKey}`);
                    const docSnap = await getDoc(docRef);
                    
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        const dayAssignments = Object.values(data).map(item => ({
                            pro: item.pro || "",
                            saName: item.saName || "",
                            note: item.note || "",
                            status: item.status || "ON GOING",
                            date: item.date instanceof Date ? item.date : (item.date ? new Date(item.date) : new Date())
                        }));
                        allAssignments.push(...dayAssignments);
                    }
                    
                    // Move to next day
                    currentDate.setDate(currentDate.getDate() + 1);
                }
                
                this.assignments = allAssignments;
                console.log(`Loaded ${allAssignments.length} assignments for date range`);
            } catch (error) {
                console.error("Error loading assignments by date range:", error);
            }
        }
    },
    watch: {
        searchQuery() {
            this.currentPage = 1;
        },
        statusFilter() {
            this.currentPage = 1;
        },
        historySearchQuery() {
            this.historyPage = 1;
        },
        historyStatusFilter() {
            this.historyPage = 1;
        },
        historyFromDate() {
            this.historyPage = 1;
            this.loadAssignmentsByDateRange();
        },
        historyToDate() {
            this.historyPage = 1;
            this.loadAssignmentsByDateRange();
        }
    },
    created() {
        this.listenToStatuses();
        this.listenToServiceAdvisors();
        this.listenToPROrders();
        this.listenToAssignments();
    }
};
</script>

<style>
/* Custom Animation Classes 
  (Tailwind config usually handles this, but adding here for standard CSS support if config isn't edited)
*/
@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.animate-fade-in-down { animation: fadeInDown 0.2s ease-out; }
.animate-fade-in-up { animation: fadeInUp 0.2s ease-out; }
.animate-fade-in { animation: fadeIn 0.2s ease-out; }

/* Scrollbar Styling for Webkit */
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
</style>
