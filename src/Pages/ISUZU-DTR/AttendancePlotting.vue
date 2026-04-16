<template>
  <div :class="themeClass" :style="themeStyle" class="min-h-screen bg-white flex flex-col font-sans relative overflow-hidden">
    <div class="absolute top-0 left-0 w-full z-0 opacity-20 pointer-events-none">
      <svg viewBox="0 0 500 60" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full">
        <path d="M0 15 H280 L330 45 H500" stroke="url(#paint0_linear)" stroke-width="1.5" />
        <defs>
          <linearGradient id="paint0_linear" x1="0" y1="0" x2="500" y2="0" gradientUnits="userSpaceOnUse">
            <stop stop-color="#2563eb" />
            <stop offset="1" stop-color="#3b82f6" stop-opacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>

    <header class="relative z-10 px-8 py-8 flex justify-between items-center bg-white/7 backdrop-blur-none ">
      <div class="flex items-center gap-5">
        <div class="bg-blue-600 p-2.5 rounded-xl ring-4 ring-blue-50">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h1 class="text-2xl font-black uppercase tracking-tight text-neutral-900 leading-none mb-1 isuzu-font">
            Attendance <span class="text-blue-600">Plotting</span>
          </h1>
          <p class="text-[10px] text-blue-500/70 font-bold uppercase tracking-[0.4em]">Analytics Engine v2.0</p>
        </div>
      </div>
      <button @click="showAddEmployee = true" class="bg-neutral-900 hover:bg-blue-600 text-white px-7 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 transform hover:-translate-y-0.5 shadow-xl shadow-slate-200 flex items-center gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
        Add Employee
      </button>
    </header>

    <main class="flex-1 relative z-10 overflow-auto p-5">
      <div class="max-w-350 mx-auto space-y-8">
        
        <div v-if="employees.length === 0" class="bg-white rounded-3xl border border-dashed border-gray-300 p-20 flex flex-col items-center justify-center transition-all">
          <div class="bg-gray-50 p-8 rounded-full mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-20 h-20 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 17v2a2 2 0 002 2h14a2 2 0 002-2v-2M16 11V7a4 4 0 00-8 0v4M5 11h14M12 17v.01" />
            </svg>
          </div>
          <h2 class="text-xl font-bold text-neutral-800 uppercase tracking-widest mb-2">System Ready</h2>
          <p class="text-sm text-gray-400">Add an employee to begin attendance visualization.</p>
        </div>

        <div v-else>
          <div class="bg-white/50 backdrop-blur-none rounded-2xl p-1 flex flex-wrap gap-8 mb-5 items-center justify-left">
            <div class="flex items-center gap-3">
              <span class="w-3 h-3 rounded-full ring-4 ring-[#F68EA0]/20" style="background-color: #F68EA0;"></span>
              <span class="text-[11px] font-black text-slate-600 uppercase tracking-tighter">Working Day</span>
            </div>
            <div class="flex items-center gap-3">
              <span class="w-3 h-3 rounded-full ring-4 ring-[#B3B3E3]/20" style="background-color: #B3B3E3;"></span>
              <span class="text-[11px] font-black text-slate-600 uppercase tracking-tighter">Rest Day</span>
            </div>
            <div class="flex items-center gap-3">
              <span class="w-3 h-3 rounded-full ring-4 ring-[#7FC3FF]/20" style="background-color: #7FC3FF;"></span>
              <span class="text-[11px] font-black text-slate-600 uppercase tracking-tighter">Holiday</span>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            <div v-for="(employee, idx) in employees" :key="employee.id" class="group bg-white rounded-2xl border border-neutral-300 p-7 flex flex-col  hover:shadow-blue-500/5 transition-all duration-500 relative">
              
              <div class="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button @click="startEditEmployee(idx)" class="bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-xl p-2.5 transition-colors" title="Edit">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536M9 13h3l8-8a2.828 2.828 0 10-4-4l-8 8v3z" /></svg>
                </button>
                <button @click="removeEmployee(idx)" class="bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl p-2.5 transition-colors" title="Delete">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div class="flex items-center gap-4 mb-8">
                <div class="bg-slate-50 p-3 rounded-2xl group-hover:bg-blue-50 transition-colors duration-500">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-slate-400 group-hover:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m13-7V7a4 4 0 00-3-3.87M9 4a4 4 0 00-3 3.87V7m0 0a4 4 0 013-3.87M9 4a4 4 0 013 3.87M9 4a4 4 0 013 3.87" /></svg>
                </div>
                <div>
                  <p class="text-[9px] font-black text-blue-500 uppercase tracking-widest">ID: {{ 1000 + idx }}</p>
                  <p class="text-xl font-bold text-slate-800 tracking-tight">{{ employee.name }}</p>
                </div>
              </div>

              <div class="flex-1 flex flex-col">
                <div class="w-full mb-6 flex justify-between items-center bg-slate-50 rounded-xl p-2">
                  <button @click="() => { if (currentMonth > 0) currentMonth--; else { currentMonth = 11; currentYear--; } }" class="p-2 hover:bg-white rounded-lg transition-all text-slate-400 hover:text-blue-600 font-black">&larr;</button>
                  <span class="font-black text-xs uppercase tracking-widest text-slate-600">{{ new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' }) }}</span>
                  <button @click="() => { if (currentMonth < 11) currentMonth++; else { currentMonth = 0; currentYear++; } }" class="p-2 hover:bg-white rounded-lg transition-all text-slate-400 hover:text-blue-600 font-black">&rarr;</button>
                </div>

                <div class="grid grid-cols-7 gap-2 w-full mb-6">
                  <div v-for="d in ['S','M','T','W','T','F','S']" :key="d" class="text-center text-[10px] font-black text-slate-300 py-1">{{ d }}</div>
                  
                  <template v-if="(() => { const firstDay = new Date(currentYear, currentMonth, 1).getDay(); return firstDay; })() > 0">
                    <div v-for="n in new Array(new Date(currentYear, currentMonth, 1).getDay()).fill(0)" :key="'empty'+n" class="h-9" />
                  </template>

                  <div v-for="(dayObj, dayIdx) in (employee.attendance?.[getMonthKey(currentYear, currentMonth)] || getDefaultAttendance(currentYear, currentMonth))" :key="dayObj.day" class="flex justify-center items-center">
                    <button
                      :class="[
                        'w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs transition-all duration-200 active:scale-90 border-2',
                        dayObj.status === 'required' ? 'border-transparent shadow-md shadow-red-100' :
                        dayObj.status === 'holiday' ? 'border-transparent shadow-md shadow-blue-100' :
                        dayObj.status === 'rest' ? 'border-transparent shadow-md shadow-indigo-100' :
                        'bg-white text-slate-400 border-slate-100 hover:border-slate-200'
                      ]"
                      @click="() => updateAttendance(idx, dayIdx, cycleStatus(dayObj.status))"
                      :style="{
                        backgroundColor: dayObj._color
                          ? dayObj._color
                          : dayObj.status === 'required' ? '#F68EA0'
                          : dayObj.status === 'rest' ? '#B3B3E3'
                          : dayObj.status === 'holiday' ? '#7FC3FF'
                          : '',
                        color: (dayObj.status === 'required' || dayObj.status === 'rest' || dayObj.status === 'holiday') ? '#fff' : ''
                      }"
                    >
                      {{ dayObj.day }}
                    </button>
                  </div>
                </div>

                <div class="pt-6 border-t border-slate-50">
                  <div class="flex items-center gap-2 mb-3">
                    <span class="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                    <p class="text-[10px] text-slate-400 font-black uppercase tracking-tighter">Activity Stream</p>
                  </div>
                  <ul class="space-y-2">
                    <li v-for="(note, nidx) in employee.notes" :key="nidx" class="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border-l-2 border-blue-400">{{ note }}</li>
                    <li v-if="employee.notes.length === 0" class="italic text-[11px] text-slate-300">No recent activity detected.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="showAddEmployee || editEmployeeIdx !== null" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" @click="cancelModals"></div>
        
        <div v-if="showAddEmployee" class="bg-white rounded-[2.5rem] shadow-2xl p-10 w-full max-w-md relative z-10 border border-white">
          <button @click="showAddEmployee = false" class="absolute top-6 right-6 text-slate-300 hover:text-rose-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <div class="mb-8">
            <h2 class="text-2xl font-black text-slate-900 uppercase tracking-tight">New Member</h2>
            <p class="text-xs text-slate-400 mt-1 uppercase font-bold tracking-widest">Employee Directory</p>
          </div>
          <form @submit.prevent="addEmployee">
            <div class="mb-6">
              <label class="block mb-2 text-[10px] font-black uppercase text-blue-500 tracking-widest">Full Name</label>
              <input v-model="newEmployeeName" type="text" class="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none ring-2 ring-transparent focus:ring-blue-500/20 focus:bg-white transition-all text-sm font-bold text-slate-700 placeholder:text-slate-300" placeholder="e.g. Juan Dela Cruz" required />
            </div>
            <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-lg shadow-blue-200 transition-all">
              Initialize Profile
            </button>
          </form>
        </div>

        <div v-if="editEmployeeIdx !== null" class="bg-white rounded-[2.5rem] shadow-2xl p-10 w-full max-w-md relative z-10 border border-white">
          <button @click="cancelEditEmployee" class="absolute top-6 right-6 text-slate-300 hover:text-rose-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <div class="mb-8">
            <h2 class="text-2xl font-black text-slate-900 uppercase tracking-tight">Update Details</h2>
            <p class="text-xs text-slate-400 mt-1 uppercase font-bold tracking-widest">ID Modification</p>
          </div>
          <form @submit.prevent="saveEditEmployee">
             <div class="mb-6">
              <label class="block mb-2 text-[10px] font-black uppercase text-blue-500 tracking-widest">Updated Name</label>
              <input v-model="editEmployeeName" type="text" class="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none ring-2 ring-transparent focus:ring-blue-500/20 focus:bg-white transition-all text-sm font-bold text-slate-700" required />
            </div>
            <button type="submit" class="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-lg shadow-slate-200 transition-all">
              Sync Changes
            </button>
          </form>
        </div>
      </div>
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

// Helper to get YYYY-MM-DD stringwwwwwwwwwwwwwwwwwwwwwwwwww
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
