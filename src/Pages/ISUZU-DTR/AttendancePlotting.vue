

<template>
  <div :class="themeClass" :style="themeStyle" class="min-h-screen flex flex-col font-sans relative overflow-hidden">
    <!-- Background Decoration -->
    <div class="absolute top-0 left-0 w-full z-0 opacity-10 pointer-events-none">
      <svg viewBox="0 0 500 60" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full">
        <path d="M0 15 H280 L330 45 H500" stroke="#2563eb" stroke-width="2" />
      </svg>
    </div>

    <!-- Header -->
    <header class="relative z-10 px-8 py-6 flex justify-between items-center backdrop-blur-none">
      <div class="flex items-center gap-4">
        <div class="bg-blue-600 p-2 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <div>
          <h1 class="text-2xl font-black isuzu-font uppercase tracking-widest text-neutral-800">
            Attendance <span class="text-blue-600">Plotting</span>
          </h1>
          <p class="text-[10px] text-gray-500 uppercase tracking-[0.3em]">Attendance Visualization & Analytics</p>
        </div>
      </div>
      <button @click="showAddEmployee = true" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
        Add Employee
      </button>
    </header>

    <!-- Main Content -->
    <main class="flex-1 relative z-10 overflow-auto p-6 lg:p-6">
      <div class="max-w-[1800px] mx-auto space-y-6">
        <!-- Employees List -->
        <div v-if="employees.length === 0" class="bg-white rounded-2xl border border-neutral-300 p-12 flex flex-col items-center justify-center min-h-[300px]">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-24 h-24 text-blue-200 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 17v2a2 2 0 002 2h14a2 2 0 002-2v-2M16 11V7a4 4 0 00-8 0v4M5 11h14M12 17v.01" /></svg>
          <h2 class="text-xl font-black isuzu-font uppercase tracking-widest text-neutral-700 mb-2">No Employees Added</h2>
          <p class="text-[12px] text-gray-500 mb-4">Click "Add Employee" to start plotting attendance.</p>
        </div>

        <div v-else>
          <!-- Color Legend -->
          <div class="flex flex-wrap gap-4 mb-6 items-center justify-center">
            <div class="flex items-center gap-2">
              <span class="w-5 h-5 rounded-full border-2 border-gray-300 inline-block" style="background-color: #F68EA0;"></span>
              <span class="text-xs font-bold text-gray-700">WORKING DAY</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-5 h-5 rounded-full border-2 border-gray-300 inline-block" style="background-color: #B3B3E3;"></span>
              <span class="text-xs font-bold text-gray-700">REST DAY</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-5 h-5 rounded-full border-2 border-gray-300 inline-block" style="background-color: #7FC3FF;"></span>
              <span class="text-xs font-bold text-gray-700">HOLIDAY</span>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div v-for="(employee, idx) in employees" :key="employee.id" class="bg-white rounded-2xl border border-neutral-300 p-6 flex flex-col shadow relative">
              <div class="absolute top-4 right-4 flex gap-2">
              <button @click="startEditEmployee(idx)" class="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-full p-2 shadow transition-all" title="Edit Employee">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536M9 13h3l8-8a2.828 2.828 0 10-4-4l-8 8v3z" /></svg>
              </button>
              <button @click="removeEmployee(idx)" class="bg-red-100 hover:bg-red-200 text-red-600 rounded-full p-2 shadow transition-all" title="Remove Employee">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div class="flex items-center gap-3 mb-4">
              <div class="bg-blue-100 p-2 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m13-7V7a4 4 0 00-3-3.87M9 4a4 4 0 00-3 3.87V7m0 0a4 4 0 013-3.87M9 4a4 4 0 013 3.87M9 4a4 4 0 013 3.87" /></svg>
              </div>
              <div>
                <p class="text-[10px] font-black text-gray-400 uppercase">Employee</p>
                <p class="text-lg font-black text-neutral-800">{{ employee.name }}</p>
              </div>
            </div>
            <!-- Editable Calendar -->
            <div class="flex-1 flex flex-col items-center justify-center">
              <div class="w-full mb-2 flex justify-between items-center">
                <button @click="() => { if (currentMonth > 0) currentMonth--; else { currentMonth = 11; currentYear--; } }" class="text-blue-500 hover:text-blue-700 px-2">&lt;</button>
                <span class="font-bold">{{ new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' }) }}</span>
                <button @click="() => { if (currentMonth < 11) currentMonth++; else { currentMonth = 0; currentYear++; } }" class="text-blue-500 hover:text-blue-700 px-2">&gt;</button>
              </div>
              <div class="grid grid-cols-7 gap-1 w-full">
                <div v-for="d in ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']" :key="d" class="text-center text-xs font-bold text-gray-400 py-1">{{ d }}</div>
                <template v-if="(() => { const firstDay = new Date(currentYear, currentMonth, 1).getDay(); return firstDay; })() > 0">
                  <div v-for="n in new Array(new Date(currentYear, currentMonth, 1).getDay()).fill(0)" :key="'empty'+n" class="" />
                </template>
                <div v-for="(dayObj, dayIdx) in (employee.attendance?.[getMonthKey(currentYear, currentMonth)] || getDefaultAttendance(currentYear, currentMonth))" :key="dayObj.day" class="flex justify-center items-center">
                  <button
                    :class="[
                      'w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border',
                      dayObj.status === 'required' ? 'text-gray-900 border-gray-300' :
                      dayObj.status === 'holiday' ? 'text-white border-gray-300' :
                      dayObj.status === 'rest' ? 'text-white border-gray-300' :
                      dayObj.status === 'late' ? 'text-white border-gray-300' :
                      dayObj.status === 'absent' ? 'text-white border-gray-300' :
                      dayObj.status === 'undertime' ? 'text-white border-gray-300' :
                      dayObj.status === 'overtime' ? 'text-white border-gray-300' :
                      'bg-white text-gray-700 border-gray-300'
                    ]"
                    @click="() => updateAttendance(idx, dayIdx, cycleStatus(dayObj.status))"
                    :title="dayObj.status.charAt(0).toUpperCase() + dayObj.status.slice(1)"
                    :style="{
                      backgroundColor: dayObj._color
                        ? dayObj._color
                        : dayObj.status === 'required' ? '#F68EA0'
                        : dayObj.status === 'rest' ? '#B3B3E3'
                        : dayObj.status === 'holiday' ? '#7FC3FF'
                        : '#fff',
                      color: dayObj.status === 'required' ? '#222' : '#fff'
                    }"
                  >
                    {{ dayObj.day }}
                  </button>
                </div>
              </div>
              <!-- (Optional) Small legend below calendar, can be removed if redundant -->
              <div class="flex gap-2 mt-2">
                <span class="w-4 h-4 rounded-full border-2 border-gray-300 inline-block" style="background-color: #F68EA0;" title="Working Day"></span>
                <span class="w-4 h-4 rounded-full border-2 border-gray-300 inline-block" style="background-color: #B3B3E3;" title="Rest Day"></span>
                <span class="w-4 h-4 rounded-full border-2 border-gray-300 inline-block" style="background-color: #7FC3FF;" title="Holiday"></span>
              </div>
              <div class="w-full mt-2">
                <p class="text-[11px] text-gray-500 mb-1 font-bold uppercase">Notes / Updates</p>
                <ul class="text-[11px] text-gray-600 list-disc pl-5">
                  <li v-for="(note, nidx) in employee.notes" :key="nidx">{{ note }}</li>
                  <li v-if="employee.notes.length === 0" class="italic text-gray-400">No updates yet.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Add Employee Modal -->
      <div v-if="showAddEmployee" class="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
        <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
          <button @click="showAddEmployee = false" class="absolute top-4 right-4 text-gray-400 hover:text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <h2 class="text-xl font-black isuzu-font uppercase tracking-widest mb-4">Add Employee</h2>
          <form @submit.prevent="addEmployee">
            <label class="block mb-2 text-xs font-bold uppercase text-gray-600">Employee Name</label>
            <input v-model="newEmployeeName" type="text" class="w-full px-4 py-2 rounded-lg border border-gray-300 mb-4 focus:ring-2 focus:ring-blue-500" placeholder="Enter employee name" required />
            <div class="flex justify-end">
              <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest shadow">Add</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Edit Employee Modal -->
      <div v-if="editEmployeeIdx !== null" class="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
        <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
          <button @click="cancelEditEmployee" class="absolute top-4 right-4 text-gray-400 hover:text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <h2 class="text-xl font-black isuzu-font uppercase tracking-widest mb-4">Edit Employee</h2>
          <form @submit.prevent="saveEditEmployee">
            <label class="block mb-2 text-xs font-bold uppercase text-gray-600">Employee Name</label>
            <input v-model="editEmployeeName" type="text" class="w-full px-4 py-2 rounded-lg border border-gray-300 mb-4 focus:ring-2 focus:ring-blue-500" placeholder="Enter employee name" required />
            <div class="flex justify-end">
              <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest shadow">Save</button>
            </div>
          </form>
        </div>
      </div>
      </div> <!-- closes max-w-[1800px] mx-auto space-y-6 -->
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { db } from '@/Firebase/Firebase';
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc
} from 'firebase/firestore';

// DTR Firestore collection reference
const dtrRef = collection(db, 'dtr');

// Color mapping for statuses
const DTR_STATUS_COLORS = {
  late: '#F2720C',
  absent: '#650000',
  undertime: '#F5BF0F',
  overtime: '#AC693C',
};

// Helper to get YYYY-MM-DD string
function getDateKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

// Fetch DTR data for current month/year and update calendar
async function syncCalendarWithDTR() {
  // Fetch all DTR records for the current month
  const dtrSnapshot = await getDocs(dtrRef);
  const dtrRecords = dtrSnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));

  // Build a lookup: { employeeName: { 'YYYY-MM-DD': {status, note} } }
  const dtrMap = {};
  dtrRecords.forEach(dtr => {
    const name = dtr.name?.trim();
    if (!name || !dtr.date) return;
    const dateObj = new Date(dtr.date);
    if (dateObj.getFullYear() !== currentYear.value || dateObj.getMonth() !== currentMonth.value) return;
    const dateKey = getDateKey(currentYear.value, currentMonth.value, dateObj.getDate());
    if (!dtrMap[name]) dtrMap[name] = {};
    // Determine status
    let status = null;
    let note = '';
    if (/absent/i.test(dtr.remarks)) {
      status = 'absent';
      note = `Absent on ${dateKey}`;
    } else if (/late/i.test(dtr.remarks)) {
      status = 'late';
      note = `Late on ${dateKey}`;
    } else if (/undertime/i.test(dtr.remarks)) {
      status = 'undertime';
      note = `Undertime on ${dateKey}`;
    } else if (/overtime/i.test(dtr.remarks)) {
      status = 'overtime';
      note = `Overtime on ${dateKey}`;
    }
    if (status) {
      dtrMap[name][dateKey] = { status, note };
    }
  });

  // Update employees' attendance and notes
  for (const emp of employees.value) {
    const monthKey = getMonthKey(currentYear.value, currentMonth.value);
    let attendance = emp.attendance?.[monthKey] || getDefaultAttendance(currentYear.value, currentMonth.value);
    let notes = Array.isArray(emp.notes) ? [...emp.notes] : [];
    let updated = false;
    for (let i = 0; i < attendance.length; i++) {
      const dayObj = attendance[i];
      const dateKey = getDateKey(currentYear.value, currentMonth.value, dayObj.day);
      const dtrDay = dtrMap[emp.name]?.[dateKey];
      if (dtrDay) {
        // Update color and status
        dayObj.status = dtrDay.status;
        dayObj._color = DTR_STATUS_COLORS[dtrDay.status];
        // Add note if not already present
        if (!notes.includes(dtrDay.note)) {
          notes.push(dtrDay.note);
        }
        updated = true;
      }
    }
    if (updated) {
      // Save to Firestore
      await updateDoc(doc(employeesPlotRef, emp.id), {
        [`attendance.${monthKey}`]: attendance,
        notes
      });
    }
  }
}

const isDarkMode = computed(() => document.documentElement.classList.contains('dark'));
const themeClass = computed(() =>
  isDarkMode.value ? 'text-white' : 'bg-gray-100 text-gray-900'
);
const themeStyle = computed(() =>
  isDarkMode.value ? { backgroundColor: '#232323' } : {}
);

// Employees state
const employees = ref([]);
const showAddEmployee = ref(false);
const newEmployeeName = ref("");
const editEmployeeIdx = ref(null); // index of employee being edited
const editEmployeeName = ref("");

// Calendar state
const currentMonth = ref(new Date().getMonth()); // 0-indexed
const currentYear = ref(new Date().getFullYear());
const holidays = ref([ // Example: list of holidays (can be fetched from Firestore or API)
  // Format: { month: 2, day: 25 } for March 25
]);

// Firestore collection reference
const employeesPlotRef = collection(db, 'employeesPlot');

// Real-time sync with Firestore and auto-sync calendar with DTR
onMounted(() => {
  onSnapshot(employeesPlotRef, (snapshot) => {
    employees.value = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data(),
      notes: docSnap.data().notes || [],
      attendance: docSnap.data().attendance || {}
    }));
    // After employees are loaded, sync calendar with DTR
    syncCalendarWithDTR();
  });
});

function getMonthKey(year, month) {
  return `${year}-${String(month + 1).padStart(2, '0')}`;
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getDefaultAttendance(year, month) {
  const days = getDaysInMonth(year, month);
  const arr = [];
  for (let d = 1; d <= days; d++) {
    const date = new Date(year, month, d);
    const dow = date.getDay();
    let status = 'required'; // Default: working day
    if (dow === 0) status = 'rest'; // Sunday is rest day
    // Monday-Saturday are required/working days
    // Holidays override all
    if (holidays.value.some(h => h.month === month && h.day === d)) status = 'holiday';
    arr.push({ day: d, status });
  }
  return arr;
}

async function addEmployee() {
  if (!newEmployeeName.value.trim()) return;
  // Generate default attendance for current month
  const monthKey = getMonthKey(currentYear.value, currentMonth.value);
  const defaultAttendance = getDefaultAttendance(currentYear.value, currentMonth.value);
  await addDoc(employeesPlotRef, {
    name: newEmployeeName.value.trim(),
    notes: [],
    attendance: {
      [monthKey]: defaultAttendance
    }
  });
  newEmployeeName.value = "";
  showAddEmployee.value = false;
}

async function removeEmployee(idx) {
  const employee = employees.value[idx];
  if (!employee || !employee.id) return;
  await deleteDoc(doc(employeesPlotRef, employee.id));
}

function startEditEmployee(idx) {
  editEmployeeIdx.value = idx;
  editEmployeeName.value = employees.value[idx]?.name || "";
}

function cancelEditEmployee() {
  editEmployeeIdx.value = null;
  editEmployeeName.value = "";
}

async function saveEditEmployee() {
  const idx = editEmployeeIdx.value;
  if (idx === null || !editEmployeeName.value.trim()) return;
  const employee = employees.value[idx];
  if (!employee || !employee.id) return;
  await updateDoc(doc(employeesPlotRef, employee.id), {
    name: editEmployeeName.value.trim()
  });
  cancelEditEmployee();
}

// Calendar editing logic
async function updateAttendance(idx, dayIdx, newStatus) {
  const employee = employees.value[idx];
  if (!employee || !employee.id) return;
  const monthKey = getMonthKey(currentYear.value, currentMonth.value);
  const attendance = employee.attendance?.[monthKey] || getDefaultAttendance(currentYear.value, currentMonth.value);
  attendance[dayIdx].status = newStatus;
  await updateDoc(doc(employeesPlotRef, employee.id), {
    [`attendance.${monthKey}`]: attendance
  });
}

function cycleStatus(status) {
  const order = ['required', 'holiday', 'rest'];
  const idx = order.indexOf(status);
  return order[(idx + 1) % order.length];
}
</script>

<style scoped>
.isuzu-font { font-family: 'IsuzuFont', sans-serif; }
.ring-calendar-placeholder {
  position: relative;
}
</style>
