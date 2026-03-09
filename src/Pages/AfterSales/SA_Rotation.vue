<template>
  <div class="h-screen w-screen bg-slate-100 p-4 font-sans overflow-hidden flex flex-col gap-4" @click="closeDropdown">
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 h-[50%] shrink-0">
      
      <!-- Retail Orders Card -->
      <RetailOrdersCard
        :pr-orders="prOrders"
        :new-p-r-order="newPROrder"
        :dropdown-index="dropdownIndex"
        :dropdown-type="dropdownType"
        @add-pr-order="addPROrder"
        @update:newPROrder="val => newPROrder = val"
        @toggle-dropdown="toggleDropdown"
        @open-pr-edit="openPREditModal"
        @open-pr-delete="openPRDeleteModal"
      />

      <!-- Service Advisors Card -->
      <ServiceAdvisorsCard
        :service-advisors="serviceAdvisors"
        :new-service-advisor="newServiceAdvisor"
        :assignments="assignments"
        :show-fairness-dashboard="showFairnessDashboard"
        :dropdown-index="dropdownIndex"
        :dropdown-type="dropdownType"
        :hovering-s-a-index="hoveringSAIndex"
        :hovering-job-done-index="hoveringJobDoneIndex"
        :hovering-cancelled-index="hoveringCancelledIndex"
        :workload-distribution="getWorkloadDistribution()"
        @add-service-advisor="addServiceAdvisor"
        @update:newServiceAdvisor="val => newServiceAdvisor = val"
        @toggle-dropdown="toggleDropdown"
        @open-sa-edit="openSAEditModal"
        @open-sa-delete="openSADeleteModal"
        @toggle-fairness-dashboard="showFairnessDashboard = !showFairnessDashboard"
        @hover-sa="val => hoveringSAIndex = val"
        @hover-job-done="val => hoveringJobDoneIndex = val"
        @hover-cancelled="val => hoveringCancelledIndex = val"
      />

      <!-- Assignment Card -->
      <AssignmentCard
        :pr-orders="prOrders"
        :service-advisors="serviceAdvisors"
        :assignments="assignments"
        :assignment-form="assignmentForm"
        :show-manual-selection="showManualSelection"
        :show-top-candidates="showTopCandidates"
        :top-candidates="getTopCandidates()"
        :fairness-warning="fairnessWarning"
        :is-history-date-filter-not-today="isHistoryDateFilterNotToday"
        @update:assignmentForm="val => assignmentForm = val"
        @proceed-assignment="proceedAssignment"
        @toggle-manual-selection="showManualSelection = !showManualSelection"
        @toggle-top-candidates="showTopCandidates = !showTopCandidates"
        @select-manual-sa="selectManualSA"
        @reset-auto-assignment="resetToAutoAssignment"
        @clear-fairness-warning="clearFairnessWarning"
        @pro-selected="onProSelected"
      />
    </div>

    <div class="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4 min-h-0">
      <!-- Performed Retail Orders Table -->
      <div class="md:col-span-3">
        <PerformedRetailOrders
          :assignments="assignments"
          :search-query="searchQuery"
          :items-per-page="itemsPerPage"
          :current-page="currentPage"
          :today-date="todayDate"
          @update:searchQuery="val => searchQuery = val"
          @delete-assignment-direct="deleteAssignmentDirect"
          @reassign-assignment="reassignAssignment"
          @open-edit-modal="openEditModal"
          @mark-as-done="markAsDone"
          @cancel-assignment="cancelAssignment"
          @prev-page="currentPage--"
          @next-page="currentPage++"
        />
      </div>

      <!-- Analytics & History Table -->
      <div class="md:col-span-2">
        <AnalyticsHistory
          :assignments="assignments"
          :history-search-query="historySearchQuery"
          :history-status-filter="historyStatusFilter"
          :history-from-date="historyFromDate"
          :history-to-date="historyToDate"
          :items-per-page="itemsPerPage"
          :history-page="historyPage"
          :today-date="todayDate"
          :fairness-analytics="getFairnessAnalytics()"
          @update:historySearchQuery="val => historySearchQuery = val"
          @update:historyStatusFilter="val => historyStatusFilter = val"
          @update:historyFromDate="val => historyFromDate = val"
          @update:historyToDate="val => historyToDate = val"
          @delete-assignment="deleteAssignment"
          @prev-history-page="historyPage--"
          @next-history-page="historyPage++"
        />
      </div>
    </div>

    <!-- Modals -->
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
import { db } from "../../Firebase/Firebase";
import { doc, onSnapshot, updateDoc, getDoc, deleteField, setDoc } from "firebase/firestore";
import { useSAFairness } from "../../composables/useSAFairness";

// Import child components
import RetailOrdersCard from "./components/RetailOrdersCard.vue";
import ServiceAdvisorsCard from "./components/ServiceAdvisorsCard.vue";
import AssignmentCard from "./components/AssignmentCard.vue";
import PerformedRetailOrders from "./components/PerformedRetailOrders.vue";
import AnalyticsHistory from "./components/AnalyticsHistory.vue";

export default {
    name: 'SARotation',
    components: {
        RetailOrdersCard,
        ServiceAdvisorsCard,
        AssignmentCard,
        PerformedRetailOrders,
        AnalyticsHistory
    },
    setup() {
        const { 
            getBestSA, 
            getRankedSAs, 
            recordAssignment, 
            getWorkloadStats, 
            checkFairnessImpact,
            getAnalytics,
            resetFairnessData,
            updateWeights,
            exportData,
            importData,
            lastAssignmentTimes,
            manualOverrideCount,
            weights,
            DEFAULT_WEIGHTS
        } = useSAFairness();
        
        return {
            fairnessUtils: {
                getBestSA,
                getRankedSAs,
                recordAssignment,
                getWorkloadStats,
                checkFairnessImpact,
                getAnalytics,
                resetFairnessData,
                updateWeights,
                exportData,
                importData,
                lastAssignmentTimes,
                manualOverrideCount,
                weights,
                DEFAULT_WEIGHTS
            }
        };
    },

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
                assignmentReason: "",
                isManualOverride: false
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
            currentlyViewingDateRange: false,
            showFairnessDashboard: true,
            showTopCandidates: false,
            fairnessWarning: null,
            isAutoAssigning: false,
            bulkAssignmentMode: false,
            selectedBulkPROs: [],
            assignmentHistory: [],
            saPerformanceCache: {},
            shuffleSeed: Date.now()
        };
    },

    computed: {
        shuffledServiceAdvisors() {
            const array = [...this.serviceAdvisors];
            return this.fisherYatesShuffle(array);
        },
        
        shuffledAvailableSAs() {
            const available = this.serviceAdvisors.filter(s => s.saStatus !== 'BUSY' && s.saStatus !== 'ABSENT');
            return this.fisherYatesShuffle([...available]);
        },
        
        availableSAs() {
            if (!this.assignmentForm.selectedPRO) {
                return [];
            }
            const assignedToThisPRO = this.assignments
                .filter(a => a.pro === this.assignmentForm.selectedPRO && a.status !== "JOB DONE")
                .map(a => a.saName);
            const availableSANames = this.serviceAdvisors
                .filter(sa => {
                    const isAssignedOngoing = assignedToThisPRO.includes(sa.saName);
                    return !isAssignedOngoing;
                })
                .map(sa => sa);
            return availableSANames;
        },
        
        todayDate() {
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        },
        
        isHistoryDateFilterNotToday() {
            const today = this.todayDate;
            if (!this.historyFromDate && !this.historyToDate) {
                return false;
            }
            const fromIsToday = this.historyFromDate === today;
            const toIsToday = this.historyToDate === today || !this.historyToDate;
            return !(fromIsToday && toIsToday);
        }
    },
    
    methods: {
        fisherYatesShuffle(array) {
            const shuffled = [...array];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            return shuffled;
        },
        
        triggerReshuffle() {
            this.shuffleSeed = Date.now();
        },
        
        getTodayDateString() {
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
            return [...new Set(
                this.assignments
                    .filter(a => a.saName === saName && a.status === 'CANCELLED')
                    .map(a => a.pro)
            )];
        },
        
        onProSelected() {
            const bestSA = this.selectBestServiceAdvisor();
            if (bestSA) {
                this.assignmentForm.selectedSA = bestSA.saName;
                this.assignmentForm.assignmentReason = bestSA.reason;
            } else {
                this.assignmentForm.selectedSA = "";
                this.assignmentForm.assignmentReason = "";
            }
            this.showManualSelection = false;
            this.triggerReshuffle();
        },
        
        selectBestServiceAdvisor() {
            if (!this.assignmentForm.selectedPRO || this.serviceAdvisors.length === 0) {
                return null;
            }
            const bestSA = this.fairnessUtils.getBestSA(
                this.serviceAdvisors, 
                this.assignments,
                this.assignmentForm.selectedPRO
            );
            return bestSA;
        },
        
        getTopCandidates() {
            if (!this.assignmentForm.selectedPRO || this.serviceAdvisors.length === 0) {
                return [];
            }
            return this.fairnessUtils.getRankedSAs(
                this.serviceAdvisors,
                this.assignments,
                null,
                this.assignmentForm.selectedPRO
            ).slice(0, 3);
        },
        
        getWorkloadDistribution() {
            return this.fairnessUtils.getWorkloadStats(this.serviceAdvisors, this.assignments);
        },
        
        getFairnessAnalytics() {
            return this.fairnessUtils.getAnalytics(this.assignments, 7);
        },
        
        exportFairnessData() {
            const data = this.fairnessUtils.exportData();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `sa-fairness-data-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
        },
        
        importFairnessData(event) {
            const file = event.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    this.fairnessUtils.importData(data);
                    alert('Fairness data imported successfully!');
                } catch (err) {
                    console.error('Error importing fairness data:', err);
                    alert('Failed to import fairness data. Please check the file format.');
                }
            };
            reader.readAsText(file);
        },
        
        resetFairnessData() {
            if (confirm('Are you sure you want to reset all fairness tracking data? This cannot be undone.')) {
                this.fairnessUtils.resetFairnessData();
                alert('Fairness data has been reset.');
            }
        },
        
        syncSAStatusesWithAssignments() {
            this.serviceAdvisors.forEach(sa => {
                const hasOnGoing = this.assignments.some(
                    a => a.saName === sa.saName && a.status === "ON GOING"
                );
                const currentStatus = sa.saStatus;
                let targetStatus = currentStatus;
                if (hasOnGoing && currentStatus !== "WORKING" && currentStatus !== "BUSY") {
                    targetStatus = "WORKING";
                } else if (!hasOnGoing && currentStatus === "WORKING") {
                    targetStatus = "AVAILABLE";
                }
                if (targetStatus !== currentStatus) {
                    this.updateSAStatus(sa.saName, targetStatus);
                    console.log(`Synced ${sa.saName} status from ${currentStatus} to ${targetStatus}`);
                }
            });
        },

        getAssignmentReason() {
            return this.assignmentForm.assignmentReason;
        },
        
        getOriginalIndex(assignment) {
            return this.assignments.findIndex(a => {
                const aDateStr = a.date instanceof Date ? a.date.toISOString().split('T')[0] : String(a.date).split('T')[0];
                const assignmentDateStr = assignment.date instanceof Date ? assignment.date.toISOString().split('T')[0] : String(assignment.date).split('T')[0];
                return a.pro === assignment.pro && 
                      a.saName === assignment.saName && 
                      aDateStr === assignmentDateStr;
            });
        },
        
        async deleteAssignmentDirect(index) {
            const saName = this.assignments[index].saName;
            const wasOnGoing = this.assignments[index].status === "ON GOING";
            this.assignments.splice(index, 1);
            await this.saveAssignmentsToFirebase();
            if (wasOnGoing) {
                const hasOnGoingAssignments = this.assignments.some(
                    a => a.saName === saName && a.status === "ON GOING"
                );
                if (!hasOnGoingAssignments) {
                    await this.updateSAStatus(saName, "AVAILABLE");
                }
            }
        },

        async reassignAssignment(index) {
            const assignment = this.assignments[index];
            const saName = assignment.saName;
            assignment.status = "ON GOING";
            assignment.date = new Date();
            assignment.reassignedDate = new Date().toISOString();
            await this.saveAssignmentsToFirebase();
            const sa = this.serviceAdvisors.find(s => s.saName === saName);
            if (sa && sa.saStatus !== "WORKING" && sa.saStatus !== "BUSY") {
                await this.updateSAStatus(saName, "WORKING");
            }
        },

        selectManualSA(saName) {
            const recommendedSA = this.selectBestServiceAdvisor();
            const impact = this.fairnessUtils.checkFairnessImpact(
                saName,
                recommendedSA,
                this.serviceAdvisors,
                this.assignments
            );
            this.assignmentForm.selectedSA = saName;
            this.assignmentForm.isManualOverride = true;
            this.fairnessWarning = impact.wouldImpact ? impact : null;
            if (!impact.wouldImpact) {
                this.assignmentForm.assignmentReason = "👤 Manually selected";
            } else {
                this.assignmentForm.assignmentReason = `👤 Manual (${impact.severity === 'high' ? '⚠️' : 'ℹ️'})`;
            }
        },
        
        clearFairnessWarning() {
            this.fairnessWarning = null;
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
                return;
            }
            try {
                const uppercaseName = this.newPROrder.trim();
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
                console.error("Error deleting PR Order:", error);
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
            if (this.dropdownIndex === index && this.dropdownType === type) {
                this.closeDropdown();
            } else {
                this.dropdownIndex = index;
                this.dropdownType = type;
            }
        },
        
        async proceedAssignment() {
            if (!this.assignmentForm.selectedPRO || !this.assignmentForm.selectedSA) {
                return;
            }
            const now = new Date();
            const newAssignment = {
                pro: this.assignmentForm.selectedPRO,
                saName: this.assignmentForm.selectedSA,
                note: this.assignmentForm.note,
                status: "ON GOING",
                date: now,
                timestamp: now.toISOString(),
                isManualOverride: this.assignmentForm.isManualOverride,
                assignmentReason: this.assignmentForm.assignmentReason
            };
            this.assignments.push(newAssignment);
            this.fairnessUtils.recordAssignment(
                this.assignmentForm.selectedSA,
                this.assignmentForm.isManualOverride
            );
            await this.updateSAStatus(this.assignmentForm.selectedSA, "WORKING");
            await this.saveAssignmentsToFirebase();
            this.resetAssignmentForm();
            this.fairnessWarning = null;
        },
        
        async proceedBulkAssignment() {
            if (this.selectedBulkPROs.length === 0 || !this.assignmentForm.selectedSA) {
                return;
            }
            this.isAutoAssigning = true;
            const now = new Date();
            for (const pro of this.selectedBulkPROs) {
                const newAssignment = {
                    pro: pro,
                    saName: this.assignmentForm.selectedSA,
                    note: this.assignmentForm.note,
                    status: "ON GOING",
                    date: new Date(now),
                    timestamp: now.toISOString(),
                    isManualOverride: true,
                    assignmentReason: "📦 Bulk Assignment"
                };
                this.assignments.push(newAssignment);
                this.fairnessUtils.recordAssignment(this.assignmentForm.selectedSA, true);
            }
            await this.updateSAStatus(this.assignmentForm.selectedSA, "WORKING");
            await this.saveAssignmentsToFirebase();
            this.selectedBulkPROs = [];
            this.bulkAssignmentMode = false;
            this.isAutoAssigning = false;
            this.resetAssignmentForm();
        },

        resetAssignmentForm() {
            this.assignmentForm.selectedPRO = "";
            this.assignmentForm.selectedSA = "";
            this.assignmentForm.note = "";
            this.assignmentForm.assignmentReason = "";
            this.assignmentForm.isManualOverride = false;
            this.fairnessWarning = null;
            this.showTopCandidates = false;
        },
        
        toggleBulkMode() {
            this.bulkAssignmentMode = !this.bulkAssignmentMode;
            this.selectedBulkPROs = [];
        },
        
        togglePROSelection(pro) {
            const index = this.selectedBulkPROs.indexOf(pro);
            if (index > -1) {
                this.selectedBulkPROs.splice(index, 1);
            } else {
                this.selectedBulkPROs.push(pro);
            }
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
                await this.saveAssignmentsToFirebase();
                if (previousStatus === "ON GOING" && newStatus !== "ON GOING") {
                    const hasOnGoingAssignments = this.assignments.some(
                        (a, idx) => a.saName === previousSA && a.status === "ON GOING" && idx !== this.editingIndex
                    );
                    if (!hasOnGoingAssignments) {
                        await this.updateSAStatus(previousSA, "AVAILABLE");
                    }
                } else if (previousStatus !== "ON GOING" && newStatus === "ON GOING") {
                    await this.updateSAStatus(previousSA, "WORKING");
                }
                this.closeEditModal();
            }
        },

        async markAsDone(index) {
            const saName = this.assignments[index].saName;
            const now = new Date();
            this.assignments[index].status = "JOB DONE";
            this.assignments[index].completedDate = now.toISOString();
            await this.saveAssignmentsToFirebase();
            const hasOnGoingAssignments = this.assignments.some(
                (a, idx) => a.saName === saName && a.status === "ON GOING" && idx !== index
            );
            if (!hasOnGoingAssignments) {
                await this.updateSAStatus(saName, "AVAILABLE");
            }
        },

        async cancelAssignment(index) {
            const saName = this.assignments[index].saName;
            this.assignments[index].status = "CANCELLED";
            await this.saveAssignmentsToFirebase();
            const hasOnGoingAssignments = this.assignments.some(
                (a, idx) => a.saName === saName && a.status === "ON GOING" && idx !== index
            );
            if (!hasOnGoingAssignments) {
                await this.updateSAStatus(saName, "AVAILABLE");
            }
        },

        async deleteAssignment(index) {
            const saName = this.assignments[index].saName;
            const wasOnGoing = this.assignments[index].status === "ON GOING";
            this.assignments.splice(index, 1);
            await this.saveAssignmentsToFirebase();
            if (wasOnGoing) {
                const hasOnGoingAssignments = this.assignments.some(
                    a => a.saName === saName && a.status === "ON GOING"
                );
                if (!hasOnGoingAssignments) {
                    await this.updateSAStatus(saName, "AVAILABLE");
                }
            }
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
                const assignmentsByDate = {};
                this.assignments.forEach(assignment => {
                    const dateStr = assignment.date instanceof Date ? assignment.date.toISOString().split('T')[0] : String(assignment.date).split('T')[0];
                    if (!assignmentsByDate[dateStr]) {
                        assignmentsByDate[dateStr] = [];
                    }
                    assignmentsByDate[dateStr].push(assignment);
                });
                for (const [dateKey, dateAssignments] of Object.entries(assignmentsByDate)) {
                    const docRef = doc(db, "SA_Assignment", `isuzu&calapan&assignments&${dateKey}`);
                    const docSnap = await getDoc(docRef);
                    let updateData = {};
                    if (docSnap.exists()) {
                        const existingData = docSnap.data();
                        Object.keys(existingData).forEach(key => {
                            if (key.startsWith("assign")) {
                                updateData[key] = deleteField();
                            }
                        });
                    }
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
            const today = this.todayDate;
            let fromDateStr = this.historyFromDate;
            let toDateStr = this.historyToDate;
            if (!fromDateStr && toDateStr) {
                fromDateStr = toDateStr;
            }
            if (fromDateStr && !toDateStr) {
                toDateStr = fromDateStr;
            }
            const isViewingTodayOnly = fromDateStr === today && toDateStr === today;
            if (isViewingTodayOnly || !fromDateStr) {
                this.currentlyViewingDateRange = false;
                this.listenToAssignments();
                return;
            }
            this.currentlyViewingDateRange = true;
            if (this.assignmentsListener) {
                this.assignmentsListener();
                this.assignmentsListener = null;
            }
            try {
                let fromDate = new Date(fromDateStr);
                let toDate = new Date(toDateStr);
                if (fromDate > toDate) {
                    [fromDate, toDate] = [toDate, fromDate];
                }
                const allAssignments = [];
                let currentDate = new Date(fromDate);
                const maxDays = 31;
                let daysChecked = 0;
                while (currentDate <= toDate && daysChecked < maxDays) {
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
                            date: item.date instanceof Date ? item.date : (item.date ? new Date(item.date) : new Date()),
                            sourceDate: dateKey
                        }));
                        allAssignments.push(...dayAssignments);
                    }
                    currentDate.setDate(currentDate.getDate() + 1);
                    daysChecked++;
                }
                this.assignments = allAssignments;
                console.log(`Loaded ${allAssignments.length} assignments for date range ${fromDateStr} to ${toDateStr}`);
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
        historyFromDate(newVal, oldVal) {
            this.historyPage = 1;
            if (newVal !== oldVal) {
                this.loadAssignmentsByDateRange();
            }
        },
        historyToDate(newVal, oldVal) {
            this.historyPage = 1;
            if (newVal !== oldVal) {
                this.loadAssignmentsByDateRange();
            }
        }
    },
    
    created() {
        this.listenToStatuses();
        this.listenToServiceAdvisors();
        this.listenToPROrders();
        this.listenToAssignments();
        setTimeout(() => {
            this.syncSAStatusesWithAssignments();
        }, 2000);
    }
};
</script>

<style>
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.animate-fade-in { animation: fadeIn 0.2s ease-out; }

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

