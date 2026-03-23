<template>
  <div v-if="isLoading" class="min-h-screen flex items-center justify-center bg-white">
    <div class="flex flex-col items-center gap-3">
      <div class="w-8 h-8 border-2 border-neutral-100 border-t-neutral-900 rounded-full animate-spin"></div>
      <p class="text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-400">Loading Ledger</p>
    </div>
  </div>

  <div v-else class="min-h-screen flex flex-col bg-white text-neutral-900 font-sans selection:bg-neutral-100">
    
    <header class="px-8 pt-6 flex justify-between items-center">
      <div>
        <h1 class="text-lg font-bold tracking-tight uppercase isuzu-font">Payroll <span class="text-red-600">Register</span></h1>
        <p class="text-[10px] text-neutral-400 uppercase tracking-widest mt-0.5">
          {{ currentDateTime }} • Status: <span class="text-emerald-600">Finalized</span>
        </p>
      </div>

      <div class="flex items-center gap-4">
        <button @click="showModal = true" class="flex items-center gap-2 px-4 py-2 border border-neutral-200 rounded-lg text-[11px] font-semibold uppercase tracking-wider transition-colors active:bg-neutral-50">
          <BarChart3 class="w-4 h-4" /> View Analytics
        </button>
        <button class="bg-neutral-900 text-white px-5 py-2.5 rounded-lg text-[11px] font-bold uppercase tracking-wider active:bg-black">
          Export Bank File
        </button>
      </div>
    </header>

    <nav class="px-8 mt-6 flex gap-1 border-b border-neutral-100 overflow-x-auto">
      <button 
        v-for="tab in tabs" :key="tab.id"
        @click="activeTab = tab.id"
        :class="['px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all border-b-2 mb-[-1px] whitespace-nowrap',
          activeTab === tab.id ? 'border-red-600 text-neutral-900' : 'border-transparent text-neutral-400 hover:text-neutral-600']"
      >
        {{ tab.label }}
      </button>
    </nav>

    <main class="flex-1 flex flex-col overflow-hidden">
      <div class="flex-1 overflow-hidden flex flex-col p-6">
        
        <div class="flex-1 border border-neutral-600 rounded-xl overflow-hidden flex flex-col shadow-sm">
          
          <div v-if="activeTab === 'monthly_managers'" class="overflow-x-auto overflow-y-auto flex-1 bg-white">
            <table class="w-full text-[11px] border-separate border-spacing-0 min-w-[2000px]">
              <thead>
                <tr class="bg-neutral-50 text-neutral-500 uppercase tracking-tighter">
                  <th rowspan="2" class="px-6 py-4 font-bold border-b border-r border-neutral-600 sticky left-0 bg-neutral-50 z-30 text-neutral-900">Employee</th>
                  <th rowspan="2" class="px-4 py-4 font-bold border-b border-r border-neutral-600 text-center">Days</th>
                  <th colspan="2" class="px-4 py-2 font-bold border-b border-r border-neutral-600 text-center">Monthly Rates</th>
                  <th colspan="2" class="px-4 py-2 font-bold border-b border-r border-neutral-600 text-center text-emerald-600">Earnings</th>
                  <th rowspan="2" class="px-6 py-4 font-bold border-b border-r border-neutral-600 text-right bg-neutral-100">Gross Salary</th>
                  <th colspan="12" class="px-4 py-2 font-bold border-b border-r border-neutral-600 text-center text-red-600">Deductions</th>
                  <th rowspan="2" class="px-6 py-4 font-bold border-b border-neutral-600 text-right bg-emerald-600 text-white">Net Pay</th>
                </tr>
                <tr class="bg-neutral-50 text-[10px] text-neutral-400">
                  <th class="px-4 py-2 border-b border-r border-neutral-600 text-right">Basic</th><th class="px-4 py-2 border-b border-r border-neutral-600 text-right">Allow.</th>
                  <th class="px-4 py-2 border-b border-r border-neutral-600 text-right text-emerald-600">Basic</th><th class="px-4 py-2 border-b border-r border-neutral-600 text-right text-emerald-600">Allow.</th>
                  <th v-for="label in deductionLabels" :key="label" class="px-3 py-2 border-b border-r border-neutral-600 text-right text-red-400">{{ label }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-neutral-100">
                <tr v-for="row in payrollRows" :key="row.name">
                  <td class="px-6 py-4 border-r border-neutral-600 font-bold sticky left-0 bg-white z-20">{{ row.name }}</td>
                  <td class="px-4 py-4 border-r border-neutral-600 text-center">{{ row.days }}</td>
                  <td class="px-4 py-4 border-r border-neutral-600 text-right">{{ format(row.basicRate) }}</td>
                  <td class="px-4 py-4 border-r border-neutral-600 text-right">{{ format(row.allowanceRate) }}</td>
                  <td class="px-4 py-4 border-r border-neutral-600 text-right text-emerald-600">{{ format(row.basicPeriod) }}</td>
                  <td class="px-4 py-4 border-r border-neutral-600 text-right text-emerald-600">{{ format(row.allowancePeriod) }}</td>
                  <td class="px-6 py-4 border-r border-neutral-600 text-right font-bold">{{ format(row.gross) }}</td>
                  <td v-for="ded in deductionKeys" :key="ded" class="px-3 py-4 border-r border-neutral-600 text-right text-red-500">{{ format(row[ded]) }}</td>
                  <td class="px-6 py-4 text-right font-bold text-emerald-700 bg-emerald-50">₱{{ format(row.net) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-else-if="activeTab === 'summary_sheets_managers'" class="overflow-x-auto overflow-y-auto flex-1 bg-white">
            <table class="w-full text-[10px] border-separate border-spacing-0 min-w-[1500px]">
              <thead class="bg-neutral-50">
                <tr class="uppercase">
                  <th rowspan="2" class="w-50 px-4 py-3 border-b border-r border-neutral-600 sticky left-0 bg-neutral-50 z-30">Name of Employee</th>
                  <th colspan="14" class="px-2 py-2 border-b border-r border-neutral-600 text-center">Calendar Days</th>
                  <th colspan="3" class="px-2 py-2 border-b border-r border-neutral-600 text-center">Deductions</th>
                </tr>
                <tr class="text-[9px]">
                  <th v-for="day in calendarDays" :key="day.date" class="border-b border-r border-neutral-600 w-8 text-center" :class="day.isSun ? 'bg-blue-100' : ''">{{ day.date }}</th>
                  <th class="px-2 border-b border-r border-neutral-600">Absent</th><th class="px-2 border-b border-r border-neutral-600">Tardiness</th><th class="px-2 border-b border-r border-neutral-600">Undertime</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in summaryData" :key="item.name">
                  <td class="px-4 py-2 border-r border-neutral-600 font-bold sticky left-0 bg-white z-20">{{ item.name }}</td>
                  <td v-for="(status, idx) in item.calendar" :key="idx" class="border-r border-neutral-600 text-center" :class="{'bg-blue-50 text-blue-600': status==='SUN'}">{{ status }}</td>
                  <td class="px-2 py-2 border-r border-neutral-600 text-center">{{ item.absent }}</td>
                  <td class="px-2 py-2 border-r border-neutral-600 text-center">{{ item.tardiness }}</td>
                  <td class="px-2 py-2 border-r border-neutral-600 text-center">{{ item.undertime }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-else-if="activeTab === 'daily'" class="overflow-x-auto overflow-y-auto flex-1 bg-white">
            <table class="w-full text-[9px] border-separate border-spacing-0 min-w-[2500px]">
              <thead class="bg-neutral-50 uppercase font-bold text-center">
                <tr>
                  <th rowspan="2" class="px-4 py-4 border-b border-r border-neutral-600 sticky left-0 bg-neutral-50 z-30">Name</th>
                  <th rowspan="2" class="px-2 py-4 border-b border-r border-neutral-600">Basic Rate</th>
                  <th colspan="6" class="px-2 py-2 border-b border-r border-neutral-600 bg-emerald-50 text-emerald-700">Additional</th>
                  <th colspan="12" class="px-2 py-2 border-b border-r border-neutral-600 bg-red-50 text-red-700">Deductions</th>
                  <th rowspan="2" class="px-4 py-4 border-b border-neutral-600 bg-emerald-600 text-white">Net Salary</th>
                </tr>
                <tr class="text-[8px]">
                  <th v-for="h in ['OT','ND','Legal','Spl','Adj','Total']" :key="h" class="border-b border-r border-neutral-600">{{h}}</th>
                  <th v-for="h in deductionLabels" :key="h" class="border-b border-r border-neutral-600">{{h}}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in dailyRows" :key="row.name">
                  <td class="px-4 py-2 border-r border-neutral-600 font-bold sticky left-0 bg-white z-20">{{ row.name }}</td>
                  <td class="px-2 py-2 border-r border-neutral-600 text-right">{{ format(row.basicRate) }}</td>
                  <td v-for="i in 6" :key="i" class="px-2 py-2 border-r border-neutral-600 text-right italic text-neutral-400">—</td>
                  <td v-for="ded in deductionKeys" :key="ded" class="px-2 py-2 border-r border-neutral-600 text-right text-red-600">{{ format(row[ded]) }}</td>
                  <td class="px-4 py-2 text-right bg-emerald-50 font-black">₱{{ format(row.net) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-else-if="activeTab === 'summary_sheets_daily'" class="overflow-x-auto overflow-y-auto flex-1 bg-white">
            <table class="w-full text-[9px] border-separate border-spacing-0 min-w-[2800px]">
              <thead class="bg-neutral-50 text-center font-bold uppercase">
                <tr>
                  <th rowspan="2" class="w-50 px-4 py-3 border-b border-r border-neutral-600 sticky left-0 bg-neutral-50 z-40">Name of Employee</th>
                  <th colspan="14" class="px-2 py-2 border-b border-r border-neutral-600">Calendar Days (Dec 26 - Jan 10)</th>
                  <th colspan="3" class="px-2 py-2 border-b border-r border-neutral-600">Deductions</th>
                  <th colspan="6" class="px-2 py-2 border-b border-r border-neutral-600">Additional</th>
                  <th rowspan="2" class="px-4 py-3 border-b border-r border-neutral-600">Remarks</th>
                  <th colspan="6" class="px-2 py-2 border-b border-neutral-600 bg-neutral-200 text-neutral-700">Rate Adjustments</th>
                </tr>
                <tr class="text-[8px]">
                  <th v-for="day in calendarDays" :key="day.date" class="border-b border-r border-neutral-600 w-7" :class="day.isSun ? 'bg-blue-100' : ''">{{ day.date }}</th>
                  <th class="border-b border-r border-neutral-600 px-1">Abs</th><th class="border-b border-r border-neutral-600 px-1">Tard</th><th class="border-b border-r border-neutral-600 px-1">UT</th>
                  <th class="border-b border-r border-neutral-600 px-1">OT</th><th class="border-b border-r border-neutral-600 px-1">ND</th><th class="border-b border-r border-neutral-600 px-1">LH</th><th class="border-b border-r border-neutral-600 px-1">SNWH</th><th class="border-b border-r border-neutral-600 px-1">RD</th><th class="border-b border-r border-neutral-600 px-1">Adj</th>
                  <th class="border-b border-r border-neutral-600 px-2 bg-neutral-100">Old Rate</th>
                  <th class="border-b border-r border-neutral-600 px-1 bg-neutral-100">Days</th>
                  <th class="border-b border-r border-neutral-600 px-2 bg-neutral-100">New RA</th>
                  <th class="border-b border-r border-neutral-600 px-2 bg-neutral-100">Should Be</th>
                  <th class="border-b border-r border-neutral-600 px-2 bg-neutral-100">Patrol</th>
                  <th class="border-b border-neutral-600 px-2 bg-neutral-100">Adj</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(emp, index) in summaryDailyData" :key="emp.name" class="hover:bg-neutral-50 border-b border-neutral-100">
                  <td class="px-4 py-1.5 border-r border-neutral-600 font-bold sticky left-0 bg-white z-20">{{ index + 1 }}. {{ emp.name }}</td>
                  <td v-for="(status, idx) in emp.calendar" :key="idx" 
                      class="border-r border-neutral-300 text-center font-bold text-[8px]"
                      :class="[status === 'SUN' ? 'bg-blue-50 text-blue-600' : '', status === 'HD' ? 'bg-orange-100' : '', status === 'A' ? 'bg-red-50 text-red-600' : '', status === 'OB' ? 'bg-emerald-50 text-emerald-700' : '']">
                    {{ status }}
                  </td>
                  <td class="px-1 py-1.5 border-r border-neutral-300 text-center">{{ emp.abs || '' }}</td>
                  <td class="px-1 py-1.5 border-r border-neutral-300 text-center">{{ emp.tard || '' }}</td>
                  <td class="px-1 py-1.5 border-r border-neutral-300 text-center">{{ emp.ut || '' }}</td>
                  <td class="px-1 py-1.5 border-r border-neutral-300 text-center italic text-neutral-300">—</td>
                  <td class="px-1 py-1.5 border-r border-neutral-300 text-center italic text-neutral-300">—</td>
                  <td class="px-1 py-1.5 border-r border-neutral-300 text-center italic text-neutral-300">—</td>
                  <td class="px-1 py-1.5 border-r border-neutral-300 text-center italic text-neutral-300">—</td>
                  <td class="px-1 py-1.5 border-r border-neutral-300 text-center italic text-neutral-300">—</td>
                  <td class="px-1 py-1.5 border-r border-neutral-300 text-center italic text-neutral-300">—</td>
                  <td class="px-2 py-1.5 border-r border-neutral-600"></td>
                  <td class="px-2 py-1.5 border-r border-neutral-300 text-right">{{ formatRate(emp.oldRate) }}</td>
                  <td class="px-1 py-1.5 border-r border-neutral-300 text-center">{{ emp.adjDays || '' }}</td>
                  <td class="px-2 py-1.5 border-r border-neutral-300 text-right">{{ formatRate(emp.newRA) }}</td>
                  <td class="px-2 py-1.5 border-r border-neutral-300 text-right">{{ formatRate(emp.shouldBe) }}</td>
                  <td class="px-2 py-1.5 border-r border-neutral-300 text-right">{{ formatRate(emp.patrol) }}</td>
                  <td class="px-2 py-1.5 border-neutral-600 text-right font-bold">{{ formatRate(emp.finalAdj) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-else-if="activeTab === 'probi'" class="overflow-x-auto overflow-y-auto flex-1 bg-white">
            <table class="w-full text-[10px] border-separate border-spacing-0 min-w-[2200px]">
              <thead>
                <tr class="bg-neutral-50 text-[10px] uppercase font-bold text-center">
                  <th rowspan="2" class="px-6 py-4 border-b border-r border-neutral-600 sticky left-0 bg-neutral-50 z-30">Name</th>
                  <th rowspan="2" class="px-4 py-4 border-b border-r border-neutral-600">Overtime</th>
                  <th colspan="5" class="px-4 py-2 border-b border-r border-neutral-600">Additional</th>
                  <th rowspan="2" class="px-6 py-4 border-b border-r border-neutral-600 bg-neutral-100">Gross Salary for the Period</th>
                  <th colspan="8" class="px-4 py-2 border-b border-r border-neutral-600 text-red-600">Deductions</th>
                  <th rowspan="2" class="px-4 py-4 border-b border-r border-neutral-600">TOTAL</th>
                  <th rowspan="2" class="px-6 py-4 border-b border-r border-neutral-600 bg-emerald-600 text-white font-black">NET Salary for the Period</th>
                  <th rowspan="2" class="px-4 py-4 border-b border-neutral-600">Savings Account</th>
                </tr>
                <tr class="bg-neutral-50 text-[9px] text-neutral-500 uppercase">
                  <th class="px-2 py-2 border-b border-r border-neutral-600">Legal Holiday Pay</th>
                  <th class="px-2 py-2 border-b border-r border-neutral-600">Special Non-Working Holiday</th>
                  <th class="px-2 py-2 border-b border-r border-neutral-600">Others/Salary Adjustment</th>
                  <th class="px-2 py-2 border-b border-r border-neutral-600">Rest Day Pay (Sunday)</th>
                  <th class="px-2 py-2 border-b border-r border-neutral-600">TOTAL</th>
                  <th class="px-2 py-2 border-b border-r border-neutral-600">SSS Contribution</th>
                  <th class="px-2 py-2 border-b border-r border-neutral-600">PHIC Contribution</th>
                  <th class="px-2 py-2 border-b border-r border-neutral-600">HDMF Contribution</th>
                  <th class="px-2 py-2 border-b border-r border-neutral-600">Withholding Tax</th>
                  <th class="px-2 py-2 border-b border-r border-neutral-600">Absences</th>
                  <th class="px-2 py-2 border-b border-r border-neutral-600">Tardiness</th>
                  <th class="px-2 py-2 border-b border-r border-neutral-600">Undertime</th>
                  <th class="px-2 py-2 border-b border-r border-neutral-600">MP2/SSS Loan/Pagibig Loan/Others</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in probiRows" :key="row.name" class="font-bold">
                  <td class="px-6 py-3 border-b border-r border-neutral-600 sticky left-0 bg-white z-20">{{ row.name }}</td>
                  <td class="px-4 py-3 border-b border-r border-neutral-600 text-center">-</td>
                  <td class="px-2 py-3 border-b border-r border-neutral-600 text-center">-</td>
                  <td class="px-2 py-3 border-b border-r border-neutral-600 text-center">-</td>
                  <td class="px-2 py-3 border-b border-r border-neutral-600 text-center">-</td>
                  <td class="px-2 py-3 border-b border-r border-neutral-600 text-center">-</td>
                  <td class="px-2 py-3 border-b border-r border-neutral-600 text-center">-</td>
                  <td class="px-6 py-3 border-b border-r border-neutral-600 text-right">{{ format(row.gross) }}</td>
                  <td class="px-2 py-3 border-b border-r border-neutral-600 text-right text-red-600">{{ format(row.sss) }}</td>
                  <td class="px-2 py-3 border-b border-r border-neutral-600 text-right text-red-600">{{ format(row.phic) }}</td>
                  <td class="px-2 py-3 border-b border-r border-neutral-600 text-right text-red-600">{{ format(row.hdmf) }}</td>
                  <td class="px-2 py-3 border-b border-r border-neutral-600 text-right text-red-600">-</td>
                  <td class="px-2 py-3 border-b border-r border-neutral-600 text-right text-red-600">{{ format(row.absences) }}</td>
                  <td class="px-2 py-3 border-b border-r border-neutral-600 text-right text-red-600">-</td>
                  <td class="px-2 py-3 border-b border-r border-neutral-600 text-right text-red-600">-</td>
                  <td class="px-2 py-3 border-b border-r border-neutral-600 text-right text-red-600">-</td>
                  <td class="px-4 py-3 border-b border-r border-neutral-600 text-right text-red-600">{{ format(row.totalDeduct) }}</td>
                  <td class="px-6 py-3 border-b border-r border-neutral-600 text-right font-black text-emerald-700 bg-emerald-50">{{ format(row.net) }}</td>
                  <td class="px-4 py-3 border-b border-neutral-600 text-center"></td>
                </tr>
                <tr class="bg-neutral-50 font-black">
                  <td class="px-6 py-2 border-b border-r border-neutral-600 sticky left-0 bg-neutral-50 z-20"></td>
                  <td colspan="6" class="border-b border-r border-neutral-600"></td>
                  <td class="px-6 py-2 border-b border-r border-neutral-600 text-right">30,000.00</td>
                  <td class="px-2 py-2 border-b border-r border-neutral-600 text-right text-red-600">550.00</td>
                  <td class="px-2 py-2 border-b border-r border-neutral-600 text-right text-red-600">275.00</td>
                  <td class="px-2 py-2 border-b border-r border-neutral-600 text-right text-red-600">200.00</td>
                  <td colspan="4" class="border-b border-r border-neutral-600"></td>
                  <td class="px-4 py-2 border-b border-r border-neutral-600 text-right text-red-600">1,025.00</td>
                  <td class="px-6 py-2 border-b border-r border-neutral-600 text-right">28,975.00</td>
                  <td class="border-b border-neutral-600"></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-else-if="activeTab === 'summary_sheet_probi'" class="overflow-x-auto overflow-y-auto flex-1 bg-white">
            <table class="w-full text-[9px] border-separate border-spacing-0 min-w-[2000px]">
              <thead class="bg-neutral-50 text-center font-bold uppercase">
                <tr>
                  <th rowspan="3" class="px-4 py-4 border-b border-r border-neutral-600 sticky left-0 bg-neutral-50 z-30">Name of Employee</th>
                  <th rowspan="3" class="px-2 py-4 border-b border-r border-neutral-600 w-16">Work Days for the Cut Off</th>
                  <th rowspan="3" class="px-2 py-4 border-b border-r border-neutral-600 w-16">Actual days worked</th>
                  <th colspan="13" class="px-2 py-2 border-b border-r border-neutral-600 tracking-[0.3em]">Calendar Days</th>
                  <th colspan="3" class="px-2 py-2 border-b border-r border-neutral-600">Deductions</th>
                  <th colspan="4" class="px-2 py-2 border-b border-r border-neutral-600">Additional</th>
                  <th rowspan="3" class="px-4 py-4 border-b border-neutral-600">Remarks</th>
                </tr>
                <tr class="text-[8px]">
                  <th colspan="3" class="border-b border-r border-neutral-600 bg-neutral-100">Feb</th>
                  <th colspan="10" class="border-b border-r border-neutral-600 bg-neutral-100">Mar</th>
                  <th rowspan="2" class="border-b border-r border-neutral-600 px-2">Absent</th>
                  <th rowspan="2" class="border-b border-r border-neutral-600 px-2">Tardiness (in minutes)</th>
                  <th rowspan="2" class="border-b border-r border-neutral-600 px-2">Undertime (in minutes)</th>
                  <th rowspan="2" class="border-b border-r border-neutral-600 px-2">Overtime (in Hrs)</th>
                  <th rowspan="2" class="border-b border-r border-neutral-600 px-2">Rest day work (in Hrs)</th>
                  <th rowspan="2" class="border-b border-r border-neutral-600 px-2 leading-tight">Special Non-Working Holiday OT</th>
                  <th rowspan="2" class="border-b border-r border-neutral-600 px-2 leading-tight">Special Non-Working Holiday</th>
                </tr>
                <tr class="text-[8px]">
                  <th v-for="d in ['26','27','28','01','02','03','04','05','06','07','08','09','10']" :key="d" class="border-b border-r border-neutral-600 w-8">{{d}}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="emp in summarySheetProbiData" :key="emp.name" class="font-bold h-10">
                  <td class="px-4 py-2 border-b border-r border-neutral-600 sticky left-0 bg-white z-20">{{ emp.name }}</td>
                  <td class="px-2 py-2 border-b border-r border-neutral-600 text-center"></td>
                  <td class="px-2 py-2 border-b border-r border-neutral-600 text-center"></td>
                  <td v-for="i in 13" :key="i" class="border-b border-r border-neutral-600"></td>
                  <td class="px-2 py-2 border-b border-r border-neutral-600 text-center text-blue-400">0.0</td>
                  <td class="px-2 py-2 border-b border-r border-neutral-600 text-center text-blue-400">0.0</td>
                  <td class="px-2 py-2 border-b border-r border-neutral-600 text-center text-blue-400">0.0</td>
                  <td class="px-2 py-2 border-b border-r border-neutral-600 text-center bg-neutral-50">{{ emp.ot }}</td>
                  <td class="px-2 py-2 border-b border-r border-neutral-600 text-center bg-neutral-50">{{ emp.rd }}</td>
                  <td class="px-2 py-2 border-b border-r border-neutral-600 text-center text-blue-400">0.0</td>
                  <td class="px-2 py-2 border-b border-r border-neutral-600 text-center text-blue-400">0.0</td>
                  <td class="px-2 py-2 border-b border-neutral-600"></td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>

        <div class="mt-8 grid grid-cols-3 gap-12 max-w-5xl">
          <div v-for="sign in signatures" :key="sign.name" class="flex flex-col">
            <div class="h-px bg-neutral-200 w-full mb-3"></div>
            <span class="text-[10px] font-bold text-neutral-900 uppercase tracking-wider">{{ sign.name }}</span>
            <span class="text-[9px] text-neutral-400 uppercase font-medium">{{ sign.role }}</span>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { BarChart3 } from 'lucide-vue-next';

const isLoading = ref(true);
const activeTab = ref('summary_sheets_daily');
const timestamp = ref(new Date());

const tabs = [
  { id: 'monthly_managers', label: 'Monthly Managers' },
  { id: 'summary_sheets_managers', label: 'Summary Sheets Managers' },
  { id: 'daily', label: 'Daily' },
  { id: 'summary_sheets_daily', label: 'Summary Sheets Daily' },
  { id: 'probi', label: 'Probi' },
  { id: 'summary_sheet_probi', label: 'Summary Sheet Probi' }
];

const deductionLabels = ['SSS','PHIC','HDMF','Tax','Abs','Tard','UT','MP2','SSS Ln','P-Ib Ln','Coop','Other'];
const deductionKeys = ['sss', 'phic', 'hdmf', 'tax', 'absences', 'tardiness', 'undertime', 'mp2', 'sssLoan', 'pagibigLoan', 'coop', 'others'];

const calendarDays = [
  { date: '26', isSun: false }, { date: '27', isSun: false }, { date: '28', isSun: false },
  { date: '01', isSun: true }, { date: '02', isSun: false }, { date: '03', isSun: false },
  { date: '04', isSun: false }, { date: '05', isSun: false }, { date: '06', isSun: false },
  { date: '07', isSun: false }, { date: '08', isSun: true }, { date: '09', isSun: false },
  { date: '10', isSun: false }, { date: '11', isSun: false }
];

const format = (num) => (num === 0 || !num) ? '—' : num.toLocaleString('en-US', { minimumFractionDigits: 2 });
const formatRate = (num) => (num === 0 || !num) ? '' : num.toLocaleString('en-US', { minimumFractionDigits: 2 });

const signatures = [
  { name: 'VANESSA KYLA A. BARQUILLA', role: 'HR & Admin Officer' },
  { name: 'MARITES L. BERNALES', role: 'Accounting Supervisor' },
  { name: 'GENARO RHON D. CLEOFE JR.', role: 'Operations Manager' }
];

// DATA PARA SA MONTHLY MANAGERS (TAB 1)
const payrollRows = ref([
  {
    name: 'BERNALES, Marites L.',
    days: 15, basicRate: 60000, allowanceRate: 10000, basicPeriod: 30000, allowancePeriod: 5000,
    ot: 0, restDay: 0, legalHol: 0, rice: 0, totalAdd: 5000, gross: 35000,
    sss: 1025, phic: 517.50, hdmf: 200, tax: 689.93, absences: 0, tardiness: 215.65, undertime: 0,
    mp2: 0, sssLoan: 0, pagibigLoan: 0, coop: 1000, others: 0, totalDeduct: 3648.08, net: 31351.92
  },
  {
    name: 'DE JARO, Kimberly D.',
    days: 15, basicRate: 60000, allowanceRate: 5000, basicPeriod: 30000, allowancePeriod: 2500,
    ot: 0, restDay: 0, legalHol: 0, rice: 0, totalAdd: 2500, gross: 32500,
    sss: 900, phic: 450, hdmf: 200, tax: 313.80, absences: 3738.02, tardiness: 0, undertime: 0,
    mp2: 0, sssLoan: 0, pagibigLoan: 0, coop: 1000, others: 0, totalDeduct: 6601.82, net: 25898.18
  },
  {
    name: 'VELASQUEZ, Kathleene M.',
    days: 15, basicRate: 60000, allowanceRate: 5000, basicPeriod: 30000, allowancePeriod: 2500,
    ot: 0, restDay: 0, legalHol: 0, rice: 0, totalAdd: 2500, gross: 32500,
    sss: 900, phic: 450, hdmf: 200, tax: 313.80, absences: 1246.01, tardiness: 2966.45, undertime: 0,
    mp2: 0, sssLoan: 0, pagibigLoan: 0, coop: 0, others: 933.33, totalDeduct: 7009.59, net: 25490.41
  }
]);

// Exact data from your Summary Image
const summaryData = ref([
  {
    name: 'BERNALES, Marites L.', id: 1, workDaysCut: 14, actualWorked: 14.0,
    calendar: ['X','X','X','SUN','X','X','X','X','X','X','SUN','X','X','X'],
    absent: null, tardiness: 45, undertime: null, ot: null, rd: null, holiday: null
  },
  {
    name: 'DE JARO, Kimberly D.', id: 3, workDaysCut: 14, actualWorked: 12.5,
    calendar: ['X','X','X','SUN','X','X','X','X','X','X','SUN','HD','A','X'],
    absent: 1.5, tardiness: null, undertime: null, ot: null, rd: null, holiday: null
  },
  {
    name: 'VELASQUEZ, Kathleene M.', id: 4, workDaysCut: 14, actualWorked: 13.5,
    calendar: ['X','X','X','SUN','X','OB','X','X','X','X','SUN','X','X','X'],
    absent: 0.5, tardiness: 619, undertime: null, ot: null, rd: null, holiday: null
  }
]);

// DATA PARA SA DAILY (TAB 3 - Based on image)
const dailyRows = ref([
  {
    name: 'DE ROXAS, Rosio A.', designation: 'TI', days: 11, basicRate: 800, basicPeriod: 8800,
    allowanceDay: 136.36, allowancePeriod: 1500, ot: 0, nd: 0, legalHol: 0, splHol: 0, adj: 0, totalAdd: 1500,
    gross: 10300, sss: 225, phic: 66.5, hdmf: 200, tax: 0, absences: 0, tardiness: 0, undertime: 0,
    mp2: 0, sssLoan: 0, pibLoan: 0, coop: 1000, others: 0, totalDeduct: 2291.50, net: 8008.50, account: '1234567890'
  },
  {
    name: 'DELICA, Rico T.', designation: 'TI', days: 11, basicRate: 800, basicPeriod: 8800,
    allowanceDay: 90.91, allowancePeriod: 1000, ot: 0, nd: 12000, legalHol: 0, splHol: 0, adj: 0, totalAdd: 13000,
    gross: 21800, sss: 900, phic: 450, hdmf: 200, tax: 0, absences: 228.21, tardiness: 55.67, undertime: 0,
    mp2: 0, sssLoan: 0, pibLoan: 0, coop: 2000, others: 0, totalDeduct: 4122.55, net: 17677.45, account: '0987654321'
  },
  {
    name: 'MINA, Anthony C.', designation: 'TI', days: 11, basicRate: 800, basicPeriod: 8800,
    allowanceDay: 90.91, allowancePeriod: 1000, ot: 1562.50, nd: 0, legalHol: 0, splHol: 0, adj: 1170, totalAdd: 3732.50,
    gross: 12532.50, sss: 550, phic: 275, hdmf: 200, tax: 422.13, absences: 175, tardiness: 200, undertime: 0,
    mp2: 0, sssLoan: 0, pibLoan: 0, coop: 1000, others: 0, totalDeduct: 2822.13, net: 9710.37, account: '1122334455'
  }
]);

// NEW DATA FOR SUMMARY SHEETS DAILY (Mula sa Image 144716.jpg)
const summaryDailyData = ref([
  { name: 'ABISTADO, Ada Tessa', calendar: ['X','X','X','SUN','X','X','X','X','X','X','SUN','X','X','X'], abs: null, tard: 59, oldRate: 860, adjDays: 8, newRA: 3640, shouldBe: 4500, patrol: 4550, finalAdj: 50 },
  { name: 'ABLING, JOHN JOMER', calendar: ['X','HD','X','SUN','X','X','X','X','X','X','HD','SUN','X','X'], abs: null, tard: 1, oldRate: 860, adjDays: 9, newRA: 4095, shouldBe: 4955, patrol: 5005, finalAdj: 50 },
  { name: 'AGOM, Jimmert Ace M.', calendar: ['X','X','X','SUN','X','X','A','A','X','X','SUN','A','A','A'], abs: 5, tard: null, oldRate: 1075, adjDays: 8.5, newRA: 3867.5, shouldBe: 4942.5, patrol: 5005, finalAdj: 62.5 },
  { name: 'AGUHO, Raphael C.', calendar: ['X','X','X','SUN','X','X','X','X','X','X','SUN','X','X','X'], abs: null, tard: null, oldRate: 1075, adjDays: 7, newRA: 3185, shouldBe: 4260, patrol: 4322.5, finalAdj: 62.5 },
  { name: 'BAUTISTA, Andrie', calendar: ['X','X','X','SUN','X','X','X','X','A','X','SUN','X','X','X'], abs: 1.5, tard: 55, oldRate: 1290, adjDays: 7, newRA: 3185, shouldBe: 4475, patrol: 4550, finalAdj: 75 },
  { name: 'CHAVEZ, JOVIN', calendar: ['X','X','X','SUN','X','X','OB','OB','X','X','SUN','X','X','X'], abs: null, tard: 42, oldRate: 1290, adjDays: 8, newRA: 3640, shouldBe: 4930, patrol: 5005, finalAdj: 75 },
  { name: 'DAVID, John Heron Q.', calendar: ['X','X','X','SUN','X','X','X','X','X','X','SUN','HD','X','X'], abs: 1.5, tard: 5, oldRate: 1290, adjDays: 8, newRA: 3640, shouldBe: 4930, patrol: 5005, finalAdj: 75 },
  { name: 'MENDOZA, Gilbert B.', calendar: ['X','X','X','SUN','X','X','X','X','X','X','SUN','X','HD','X'], abs: 1.5, tard: 185, oldRate: 1290, adjDays: 8, newRA: 3640, shouldBe: 4930, patrol: 5005, finalAdj: 75 }
]);

// PROBI DATA - NEW EXACT DATA FROM IMAGE
const probiRows = ref([
  {
    name: '1 Juan Paulo Bancolita', 
    gross: 30000.00, 
    sss: 550.00, 
    phic: 275.00, 
    hdmf: 200.00, 
    absences: 0.00, 
    totalDeduct: 1025.00, 
    net: 28975.00
  }
]);

// SUMMARY SHEET PROBI DATA (FROM IMAGE 2 - EXACT VALUES)
const summarySheetProbiData = ref([
  {
    name: 'Juan Paulo Bancolita',
    ot: 12.5,
    rd: 9.0
  }
]);

const currentDateTime = computed(() => timestamp.value.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase());

onMounted(() => {
  setTimeout(() => isLoading.value = false, 600);
});
</script>

<style scoped>
::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #d4d4d4; border-radius: 10px; }
.isuzu-font { font-family: 'IsuzuFont', sans-serif; }
</style>