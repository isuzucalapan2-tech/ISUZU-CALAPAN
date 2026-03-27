<template>
  <div v-if="isLoading" class="min-h-screen flex items-center justify-center bg-white">
    <div class="flex flex-col items-center gap-4">
      <div class="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent"></div>
      <p class="isuzu-font text-xs font-black uppercase tracking-[0.3em] text-gray-500">Syncing Inventory...</p>
    </div>
  </div>

  <div v-else :class="themeClass" :style="themeStyle" class="min-h-screen flex flex-col font-sans relative overflow-hidden">
    
    <div class="absolute top-0 left-0 w-full z-0 opacity-10 pointer-events-none">
      <svg viewBox="0 0 500 60" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full">
        <path d="M0 15 H280 L330 45 H500" stroke="#cc0000" stroke-width="2" />
      </svg>
    </div>

    <header class="relative z-10 px-8 py-6 flex justify-between items-center backdrop-blur-none">
      <div class="flex items-center gap-4">
        <div class="bg-red-600 p-2 rounded-lg">
          <Boxes class="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 class="text-2xl font-black isuzu-font uppercase tracking-widest text-neutral-800">
            Inventory <span class="text-red-600">Management</span>
          </h1>
          <p class="text-[10px] text-gray-500 uppercase tracking-[0.3em]">Parts & Logistics Console</p>
        </div>
      </div>

      <div class="hidden md:flex items-center gap-4">
        <div class="bg-neutral-100 px-4 py-2 rounded-full border border-neutral-200">
          <span class="text-[10px] font-black uppercase tracking-widest text-neutral-600">
            Total Items: <span class="text-red-600 text-sm ml-1">{{ inventoryItems.length }}</span>
          </span>
        </div>
      </div>
    </header>

    <main class="flex-1 relative z-10 overflow-auto">
      <div class="max-w-[1600px] mx-auto p-6 space-y-0">
        
        <div class=" backdrop-blur-none rounded-3xl p-6 animate-in fade-in slide-in-from-top-4 duration-500">
          <div class="flex flex-col xl:flex-row gap-6">
            
            <div class="flex-1 space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <div class="lg:col-span-2 relative border border-neutral-300 rounded-xl">
                  <Search class="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="SEARCH PART NAME, NUMBER, OR CONTROL NO..."
                    class="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold uppercase tracking-widest focus:ring-2 focus:ring-red-500 outline-none transition-all"
                  />
                </div>
                
                <select v-model="selectedCategory" class="bg-gray-50 border border-neutral-200 rounded-xl px-4 py-3 text-[10px] text-neutral-500 uppercase tracking-widest outline-none focus:ring-2 focus:ring-red-500">
                  <option value="">ALL CATEGORIES</option>
                  <option v-for="cat in availableCategories" :key="cat" :value="cat">{{ cat.toUpperCase() }}</option>
                </select>
              </div>

              <div class="flex flex-wrap items-center gap-6 pt-2 border-t border-gray-100 mt-2">
                <div class="flex items-center gap-3">
                  <span class="text-[10px] font-black uppercase tracking-widest text-gray-400">Qty Range:</span>
                  <input v-model="minQty" type="number" placeholder="MIN" class="w-20 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold outline-none" />
                  <span class="text-gray-300">-</span>
                  <input v-model="maxQty" type="number" placeholder="MAX" class="w-20 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold outline-none" />
                </div>
                
                <div class="flex items-center gap-3 border-l pl-6 border-gray-200">
                  <span class="text-[10px] font-black uppercase tracking-widest text-gray-400">Price Range (₱):</span>
                  <input v-model="minPrice" type="number" placeholder="MIN" class="w-24 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold outline-none" />
                  <span class="text-gray-300">-</span>
                  <input v-model="maxPrice" type="number" placeholder="MAX" class="w-24 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold outline-none" />
                </div>

                <button v-if="hasActiveFilters" @click="clearAllFilters" class="text-[10px] font-black text-red-600 uppercase tracking-widest hover:underline flex items-center gap-1">
                  <X class="w-3 h-3" /> Clear Filters
                </button>
              </div>
            </div>

            <div class="grid grid-cols-2 md:grid-cols-4 xl:flex xl:flex-col gap-2 min-w-[200px]">
              <button @click="openAddModal" class="group flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-neutral-800 transition-all hover:shadow-red-200">
                <Plus class="w-4 h-4" /> Add Item
              </button>
              
              <button @click="openImportModal" class="flex items-center justify-center gap-2 bg-neutral-800 border border-white text-white px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-md">
                <Upload class="w-4 h-4" /> Import Excel
              </button>

              <div class="relative group/export">
                <button @click="toggleExportMenu" class="w-full flex items-center justify-center gap-2 bg-neutral-100 text-neutral-800 border border-neutral-600/40 px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-green-600 hover:text-white transition-all ">
                  <FileDown class="w-4 h-4" /> Export <ChevronDown class="w-3 h-3" />
                </button>
                <div v-if="showExportMenu" class="absolute right-0 mt-2 w-48 bg-white border border-gray-100 shadow-2xl rounded-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <button @click="exportFilteredData" class="w-full text-left px-4 py-3 text-[10px] font-black uppercase hover:bg-gray-50 text-neutral-600 flex items-center gap-2">
                    <Filter class="w-3 h-3" /> Filtered ({{ filteredInventory.length }})
                  </button>
                  <button @click="exportAllData" class="w-full text-left px-4 py-3 text-[10px] font-black uppercase hover:bg-gray-50 text-neutral-600 border-t border-gray-50 flex items-center gap-2">
                    <Database class="w-3 h-3" /> All ({{ inventoryItems.length }})
                  </button>
                </div>
              </div>

              <div class="relative group/print">
                <button @click="togglePrintMenu" class="w-full flex items-center justify-center gap-2 bg-neutral-100 text-neutral-800 border border-neutral-600/40 px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-purple-600 hover:text-white transition-all">
                  <Printer class="w-4 h-4" /> Print <ChevronDown class="w-3 h-3" />
                </button>
                <div v-if="showPrintMenu" class="absolute right-0 mt-2 w-48 bg-white border border-gray-100 shadow-2xl rounded-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <button @click="printFilteredData" class="w-full text-left px-4 py-3 text-[10px] font-black uppercase hover:bg-gray-50 text-neutral-600 flex items-center gap-2">
                    <Filter class="w-3 h-3" /> Filtered ({{ filteredInventory.length }})
                  </button>
                  <button @click="printAllData" class="w-full text-left px-4 py-3 text-[10px] font-black uppercase hover:bg-gray-50 text-neutral-600 border-t border-gray-50 flex items-center gap-2">
                    <Database class="w-3 h-3" /> All ({{ inventoryItems.length }})
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl border border-neutral-300 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-neutral-900/90 text-white text-[10px] uppercase tracking-[0.2em] isuzu-font">
                  <th class="px-6 py-5 font-black">Control No.</th>
                  <th class="px-6 py-5 font-black">Part Specification</th>
                  <th class="px-6 py-5 font-black">Description</th>
                  <th class="px-6 py-5 font-black text-center">Stock</th>
                  <th class="px-6 py-5 font-black">Price Info</th>
                  <th class="px-6 py-5 font-black">Total Value</th>
                  <th class="px-6 py-5 font-black text-center">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-neutral-100">
                <tr v-for="item in paginatedInventory" :key="item.id" class="hover:bg-red-50/50 transition-colors group">
                  <td class="px-6 py-2">
                    <div class="flex flex-col">
                      <span class="text-sm font-mono font-black text-red-600">{{ item.controlNo }}</span>
                      <span class="text-[9px] font-black bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded mt-1 w-fit uppercase">{{ item.category }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-2">
                    <div class="flex flex-col">
                      <span class="text-[12px] font-black text-neutral-800 uppercase tracking-tight">{{ item.partName }}</span>
                      <span class="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">PN: {{ item.partNo }} | MODEL: {{ item.model }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-2">
                    <span class="text-xs text-gray-500">{{ item.description || '-' }}</span>
                  </td>
                  <td class="px-6 py-2 text-center">
                    <span :class="item.quantity < 5 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'" 
                          class="px-3 py-1 rounded-full text-xs font-black">
                      {{ item.quantity || 0 }}
                    </span>
                  </td>
                  <td class="px-6 py-2">
                    <span class="text-sm font-bold text-neutral-700">₱{{ formatPrice(item.unitPrice) }}</span>
                  </td>
                  <td class="px-6 py-2">
                    <span class="text-sm font-black text-green-600">₱{{ formatPrice(item.totalValue) }}</span>
                  </td>
                  <td class="px-6 py-2 text-center">
                    <div class="flex items-center justify-center gap-2">
                      <button @click="editItem(item)" class="bg-neutral-100 hover:bg-blue-600 hover:text-white text-neutral-500 p-2 rounded-lg transition-all">
                        <Edit class="w-4 h-4" />
                      </button>
                      <button @click="deleteItem(item)" class="bg-neutral-100 hover:bg-red-600 hover:text-white text-neutral-500 p-2 rounded-lg transition-all">
                        <Trash2 class="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>

                <tr v-if="paginatedInventory.length === 0">
                  <td colspan="7" class="px-6 py-24 text-center">
                    <div class="flex flex-col items-center opacity-20">
                      <PackageX class="w-20 h-20 mb-4" />
                      <p class="text-xl font-black isuzu-font uppercase tracking-widest">No Items Found</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="px-8 py-5 bg-gray-50 flex flex-col md:flex-row items-center justify-between gap-4">
            <div class="flex items-center gap-4">
              <select v-model="itemsPerPage" class="bg-white border border-gray-200 rounded-lg px-2 py-1 text-[10px] font-black uppercase outline-none">
                <option v-for="option in itemsPerPageOptions" :key="option" :value="option">{{ option }} PER PAGE</option>
              </select>
              <div class="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Showing {{ (currentPage - 1) * itemsPerPage + 1 }} - {{ Math.min(currentPage * itemsPerPage, filteredInventory.length) }} of {{ filteredInventory.length }}
              </div>
            </div>
            
            <div class="flex items-center gap-2">
              <button @click="currentPage--" :disabled="currentPage === 1" class="p-2 rounded-lg bg-white border border-gray-200 disabled:opacity-30 hover:text-red-600 transition-colors">
                <ChevronLeft class="w-4 h-4" />
              </button>
              <div class="flex gap-1">
                <button v-for="page in displayedPages" :key="page" @click="currentPage = page" 
                  :class="currentPage === page ? 'bg-red-600 text-white shadow-lg' : 'bg-white text-neutral-600 hover:bg-gray-100'"
                  class="w-8 h-8 rounded-lg text-xs font-bold transition-all">
                  {{ page }}
                </button>
              </div>
              <button @click="currentPage++" :disabled="currentPage === totalPages" class="p-2 rounded-lg bg-white border border-gray-200 disabled:opacity-30 hover:text-red-600 transition-colors">
                <ChevronRight class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <Transition name="fade">
      <div v-if="showModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-neutral-900/60 backdrop-blur-none" @click="closeModal"></div>
        <div class="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300">
          <div class="bg-neutral-800 p-6 flex justify-between items-center border-b-4 border-red-600">
            <h2 class="text-white isuzu-font font-black uppercase tracking-widest flex items-center gap-3">
              <Package class="w-5 h-5 text-red-600" />
              {{ isEditing ? 'Edit Item' : 'New Part Registration' }}
            </h2>
            <button @click="closeModal" class="text-gray-400 hover:text-white transition-colors">
              <X class="w-6 h-6" />
            </button>
          </div>

          <form @submit.prevent="saveItem" class="p-8 overflow-y-auto max-h-[calc(90vh-100px)] space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2 md:col-span-2">
                <label class="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Category Select/Add</label>
                <div class="flex gap-2">
                  <select v-model="form.category" class="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-red-500 uppercase">
                    <option value="">Select Existing</option>
                    <option v-for="cat in availableCategories" :key="cat" :value="cat">{{ cat }}</option>
                  </select>
                  <input v-model="newCategory" type="text" placeholder="OR TYPE NEW..." class="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-red-500 uppercase" />
                  <button type="button" @click="addNewCategory" class="bg-red-600 text-white p-3 rounded-xl hover:bg-neutral-800 transition-all">
                    <Plus class="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div class="space-y-2">
                <label class="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Part Name</label>
                <input v-model="form.partName" type="text" class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-red-500 uppercase" required />
              </div>

              <div class="space-y-2">
                <label class="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Part Number</label>
                <input v-model="form.partNo" type="text" class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-red-500 uppercase" required />
              </div>

              <div class="space-y-2">
                <label class="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Model</label>
                <input v-model="form.model" type="text" class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-red-500 uppercase" required />
              </div>

              <div class="space-y-2">
                <label class="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Description</label>
                <input v-model="form.description" type="text" class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-red-500 uppercase" placeholder="OPTIONAL NOTES/REMARKS" />
              </div>

              <div class="space-y-2">
                <label class="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Quantity</label>
                <input v-model="form.quantity" type="number" class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-red-500" required />
              </div>

              <div class="space-y-2">
                <label class="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Unit Price (₱)</label>
                <input v-model="form.unitPrice" type="number" step="0.01" class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-red-500" required />
              </div>
            </div>

            <div class="bg-gray-50 p-4 rounded-2xl border border-dashed border-gray-200">
                 <div class="flex justify-between items-center text-[11px] font-black uppercase tracking-widest">
                  <span class="text-gray-400">Total Valuation Preview:</span>
                  <span class="text-green-600 text-lg">₱{{ formatPrice(calculatedTotalValue) }}</span>
               </div>
            </div>

            <div class="flex justify-end gap-3 pt-4">
              <button type="button" @click="closeModal" class="px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-500 hover:bg-gray-100 border border-neutral-600/40 transition-all">Cancel</button>
              <button type="submit" :disabled="isSaving" class="bg-red-600 text-white px-10 py-3 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-neutral-800 transition-all shadow-xl shadow-red-100 disabled:opacity-50">
                {{ isSaving ? 'Syncing...' : 'Confirm' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <Transition name="fade">
      <div v-if="showImportModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-neutral-900/60 backdrop-blur-none" @click="closeImportModal"></div>

        <div class="relative bg-white rounded-2xl shadow-2xl max-w-5xl w-full p-8 animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-hidden flex flex-col">
          
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-4">
              <div class="bg-blue-600 p-3 rounded-2xl text-white shadow-lg">
                <FileSpreadsheet class="w-8 h-8" />
              </div>
              <div>
                <div class="flex items-center gap-3">
                  <h3 class="text-2xl font-black uppercase tracking-tighter text-neutral-800 flex items-center gap-2">
                    Batch <span class="text-blue-600">Import</span>
                  </h3>

                  <div class="relative group">
                    <button type="button" class="w-6 h-6 bg-neutral-200 hover:bg-neutral-300 rounded-full flex items-center justify-center transition-all">
                      <Info class="w-4 h-4 text-neutral-600" />
                    </button>

                    <div class="absolute left-0 top-full mt-0 w-80 bg-neutral-900 text-white p-5 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none max-h-[400px] overflow-y-auto">
                      
                      <header class="border-b border-neutral-700 pb-2 mb-3">
                        <h4 class="text-[11px] font-black uppercase tracking-widest text-blue-400 flex items-center gap-2">
                          📋 Import Validation Requirements
                        </h4>
                      </header>

                      <div class="space-y-4 text-[11px] leading-relaxed font-sans">
                        <section>
                          <h5 class="font-bold text-green-400 mb-1 uppercase text-[10px]">✓ Required Fields (All)</h5>
                          <ul class="space-y-0.5 text-neutral-300">
                            <li><b class="text-white">Category</b> — Product category</li>
                            <li><b class="text-white">Part Name</b> — Full part name</li>
                            <li><b class="text-white">Part No.</b> — Unique part number</li>
                            <li><b class="text-white">Model</b> — Vehicle compatibility</li>
                            <li><b class="text-white">Quantity</b> — Stock (0 or greater)</li>
                            <li><b class="text-white">Unit Price</b> — Price (0 or greater)</li>
                          </ul>
                        </section>

                        <section>
                          <h5 class="font-bold text-red-400 mb-1 uppercase text-[10px]">✗ Duplicate Check</h5>
                          <ul class="space-y-0.5 text-neutral-300">
                            <li>Part No. must be unique to inventory</li>
                            <li>No duplicates within the upload file</li>
                          </ul>
                        </section>

                        <section>
                          <h5 class="font-bold text-blue-400 mb-1 uppercase text-[10px]">✓ Optional</h5>
                          <p class="text-neutral-300"><b class="text-white">Description</b> — Optional notes/remarks</p>
                        </section>
                      </div>

                      <div class="absolute -top-1.5 left-2 w-3 h-3 bg-neutral-900 rotate-45"></div>
                    </div>
                  </div>
                </div>
                <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Inventory Data Excel Integration</p>
              </div>
            </div>
            <button @click="downloadTemplate" class="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-[10px] font-black uppercase tracking-widest">
              <Download class="w-4 h-4" /> Download Template
            </button>
          </div>

          <div v-if="importPreview.validItems.length === 0 && importPreview.invalidItems.length === 0" class="border-4 border-dashed border-gray-100 rounded-3xl p-12 text-center hover:border-blue-100 transition-all group flex-1 flex flex-col justify-center">
            <input type="file" ref="fileInput" @change="handleFileSelect" accept=".xlsx,.xls" class="hidden" />
            <Upload class="w-16 h-16 text-gray-200 mx-auto mb-4 group-hover:text-blue-400 transition-colors" />
            <p class="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6">Drop Excel File Here or Click to Browse</p>
            <button @click="$refs.fileInput.click()" class="bg-blue-600 text-white px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest hover:bg-neutral-800 transition-all shadow-lg shadow-blue-100 mx-auto">Select Spreadsheet</button>
          </div>

          <div v-else class="space-y-4 flex-1 overflow-hidden flex flex-col">
            <div class="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <div class="text-xs font-black uppercase tracking-widest flex items-center gap-4">
                <span class="text-green-600">✓ {{ importPreview.validItems.length }} Valid</span>
                <span v-if="importPreview.invalidItems.length > 0" class="text-red-600">✗ {{ importPreview.invalidItems.length }} Errors</span>
                <span v-if="totalImportValue > 0" class="text-blue-600 ml-4">Total Value: ₱{{ totalImportValue.toLocaleString('en-PH', { minimumFractionDigits: 2 }) }}</span>
              </div>
              <div class="flex gap-2">
                <button @click="resetImport" class="px-6 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-gray-100 rounded-full transition-all">Cancel</button>
                <button @click="confirmImport" :disabled="isImporting || importPreview.validItems.length === 0" class="bg-blue-600 text-white px-8 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-100 disabled:opacity-50 hover:bg-blue-700 transition-all flex items-center gap-2">
                  <Loader2 v-if="isImporting" class="w-4 h-4 animate-spin" />
                  {{ isImporting ? 'Importing...' : 'Import ' + importPreview.validItems.length + ' Items' }}
                </button>
              </div>
            </div>

            <div class="flex-1 overflow-auto border border-gray-200 rounded-xl">
              <table class="w-full text-[10px]">
                <thead class="bg-neutral-800 text-white sticky top-0">
                  <tr>
                    <th class="p-3 text-left font-black uppercase">Status</th>
                    <th class="p-3 text-left font-black uppercase">Row</th>
                    <th class="p-3 text-left font-black uppercase">Category</th>
                    <th class="p-3 text-left font-black uppercase">Part No.</th>
                    <th class="p-3 text-left font-black uppercase">Part Name</th>
                    <th class="p-3 text-left font-black uppercase">Model</th>
                    <th class="p-3 text-right font-black uppercase">Qty</th>
                    <th class="p-3 text-right font-black uppercase">Unit Price</th>
                    <th class="p-3 text-right font-black uppercase">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, idx) in importPreview.validItems" :key="'valid-' + idx" class="border-b border-green-100 bg-green-50/30">
                    <td class="p-3"><span class="px-2 py-1 bg-green-100 text-green-700 rounded text-[9px] font-black uppercase">Valid</span></td>
                    <td class="p-3 text-gray-400">{{ item.rowNumber }}</td>
                    <td class="p-3 font-bold">{{ item.category }}</td>
                    <td class="p-3 font-bold">{{ item.partNo }}</td>
                    <td class="p-3 text-neutral-600">{{ item.partName }}</td>
                    <td class="p-3 text-neutral-500">{{ item.model }}</td>
                    <td class="p-3 text-right font-black">{{ item.quantity }}</td>
                    <td class="p-3 text-right">₱{{ item.unitPrice?.toLocaleString() }}</td>
                    <td class="p-3 text-right font-black text-green-600">₱{{ item.totalValue?.toLocaleString() }}</td>
                  </tr>
                  
                  <tr v-for="(item, idx) in importPreview.invalidItems" :key="'invalid-' + idx" class="border-b border-red-100 bg-red-50/30">
                    <td class="p-3"><span class="px-2 py-1 bg-red-100 text-red-700 rounded text-[9px] font-black uppercase">Invalid</span></td>
                    <td class="p-3 text-gray-400">{{ item.rowNumber }}</td>
                    <td class="p-3 font-bold">{{ item.category || '-' }}</td>
                    <td class="p-3 font-bold">{{ item.partNo || '-' }}</td>
                    <td class="p-3 text-neutral-600">{{ item.partName || '-' }}</td>
                    <td class="p-3 text-neutral-500">{{ item.model || '-' }}</td>
                    <td class="p-3 text-right">{{ item.quantity || 0 }}</td>
                    <td class="p-3 text-right">₱{{ item.unitPrice?.toLocaleString() || 0 }}</td>
                    <td class="p-3">
                      <div class="text-red-500 text-[9px]">
                        <div v-for="(err, eIdx) in item.errors.slice(0, 2)" :key="eIdx">{{ err }}</div>
                        <div v-if="item.errors.length > 2" class="text-red-400">+{{ item.errors.length - 2 }} more</div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <div class="absolute bottom-0 left-0 w-full z-0 opacity-10 pointer-events-none transform rotate-180">
      <svg viewBox="0 0 500 60" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full">
        <path d="M0 45 H170 L220 15 H500" stroke="#cc0000" stroke-width="2" />
      </svg>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick, onUnmounted } from "vue";

import { db } from "../../Firebase/Firebase";

import {
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  deleteField,
  query,
  orderBy,
  getDoc,
  onSnapshot
} from "firebase/firestore";


import Loaders from "../../components/Loaders.vue";
import { useToast } from "../../composables/useToast";
import { useExcelExport } from "../../composables/useExcelExport";


/* ICONS */
import {
  Boxes,
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  Package,
  Save,
  Loader2,
  PackageX,
  FileDown,
  ChevronDown,
  Filter,
  Database,
  Upload,
  FileSpreadsheet,
  CheckCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Printer,
  Info,
  Download
} from "lucide-vue-next";

/*  STATE*/
const isLoading = ref(true);
const isSaving = ref(false);
const showModal = ref(false);
const isEditing = ref(false);
const searchQuery = ref("");
const debouncedSearchQuery = ref("");
const selectedCategory = ref("");
const newCategory = ref("");
const showExportMenu = ref(false);
const showPrintMenu = ref(false);
const showImportModal = ref(false);
const importFile = ref(null);
const importPreview = ref({ validItems: [], invalidItems: [] });
const isImporting = ref(false);
const isPrinting = ref(false);

// Pagination state
const currentPage = ref(1);
const itemsPerPage = ref(10);
const itemsPerPageOptions = [10, 25, 50, 100];

// Range filter states
const minQty = ref("");
const maxQty = ref("");
const minPrice = ref("");
const maxPrice = ref("");

// Real-time listeners
const inventoryListeners = ref([]);

const inventoryItems = ref([]);
const availableCategories = ref([]);

const form = ref({
  id: null,
  category: "",
  partName: "",
  partNo: "",
  model: "",
  description: "",
  quantity: 0,
  unitPrice: 0
});

/* =====================
   THEME
===================== */
const isDarkMode = computed(() =>
  document.documentElement.classList.contains("dark")
);

const themeClass = computed(() =>
  isDarkMode.value ? "text-white" : "bg-gray-100 text-gray-900"
);

const themeStyle = computed(() =>
  isDarkMode.value ? { backgroundColor: "#232323" } : {}
);

const cardClass = computed(() =>
  isDarkMode.value ? "text-white" : "bg-white text-gray-900"
);

const cardStyle = computed(() =>
  isDarkMode.value ? { backgroundColor: "#2a2a2a" } : {}
);

const textClass = computed(() =>
  isDarkMode.value ? "text-white" : "text-gray-900"
);

const subTextClass = computed(() =>
  isDarkMode.value ? "text-gray-300" : "text-gray-500"
);

const tableHeaderClass = computed(() =>
  isDarkMode.value ? "bg-gray-700 text-white" : "bg-gray-50 text-gray-900"
);

const tableRowClass = computed(() =>
  isDarkMode.value ? "hover:bg-gray-700" : "hover:bg-gray-100"
);

const inputClass = computed(() =>
  isDarkMode.value 
    ? "bg-gray-800 text-white border-gray-600 placeholder-gray-400" 
    : "bg-white text-gray-900 border-gray-300 placeholder-gray-400"
);

const borderClass = computed(() =>
  isDarkMode.value ? "border-gray-700" : "border-gray-200"
);

/* =====================
   DEBOUNCE UTILITY
===================== */
let debounceTimeout = null;
const debounceSearch = (value, delay = 300) => {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    debouncedSearchQuery.value = value;
  }, delay);
};


// Watch searchQuery and debounce it
watch(searchQuery, (newValue) => {
  debounceSearch(newValue);
});

// Reset to first page when filters change
watch([selectedCategory, debouncedSearchQuery, minQty, maxQty, minPrice, maxPrice], () => {
  currentPage.value = 1;
});


/* =====================
   COMPUTED
===================== */
const filteredInventory = computed(() => {
  let filtered = inventoryItems.value;

  // Category filter
  if (selectedCategory.value) {
    filtered = filtered.filter(item => item.category === selectedCategory.value);
  }

  // Text search (debounced) - covers all text fields
  if (debouncedSearchQuery.value) {
    const query = debouncedSearchQuery.value.toLowerCase().trim();
    filtered = filtered.filter(item =>
      item.partName?.toLowerCase().includes(query) ||
      item.partNo?.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query) ||
      item.model?.toLowerCase().includes(query) ||
      item.controlNo?.toLowerCase().includes(query) ||
      item.category?.toLowerCase().includes(query)
    );
  }

  // Quantity range filter
  const minQ = parseInt(minQty.value);
  const maxQ = parseInt(maxQty.value);
  if (!isNaN(minQ)) {
    filtered = filtered.filter(item => (item.quantity || 0) >= minQ);
  }
  if (!isNaN(maxQ)) {
    filtered = filtered.filter(item => (item.quantity || 0) <= maxQ);
  }

  // Price range filter (unitPrice)
  const minP = parseFloat(minPrice.value);
  const maxP = parseFloat(maxPrice.value);
  if (!isNaN(minP)) {
    filtered = filtered.filter(item => (item.unitPrice || 0) >= minP);
  }
  if (!isNaN(maxP)) {
    filtered = filtered.filter(item => (item.unitPrice || 0) <= maxP);
  }

  return filtered.sort((a, b) => a.controlNo.localeCompare(b.controlNo));
});

// Result count
const resultCount = computed(() => filteredInventory.value.length);

// Paginated inventory
const paginatedInventory = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredInventory.value.slice(start, end);
});

// Total pages
const totalPages = computed(() => {
  return Math.ceil(filteredInventory.value.length / itemsPerPage.value) || 1;
});

// Page numbers to display
const displayedPages = computed(() => {
  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages.value, start + maxVisible - 1);
  
  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1);
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  return pages;
});


// Check if any filters are active
const hasActiveFilters = computed(() => 
  selectedCategory.value ||
  searchQuery.value ||
  minQty.value ||
  maxQty.value ||
  minPrice.value ||
  maxPrice.value
);


const previewControlNo = computed(() => {
  if (!form.value.category) return "";
  return "Will be generated (ISZ-XXX-YYYY format)";
});

const calculatedTotalValue = computed(() => {
  const qty = parseInt(form.value.quantity) || 0;
  const price = parseFloat(form.value.unitPrice) || 0;
  return qty * price;
});

// Total import value for preview
const totalImportValue = computed(() => {
  return importPreview.value.validItems.reduce((sum, item) => {
    return sum + (item.totalValue || 0);
  }, 0);
});

/* =====================
   COLLECTION HELPERS
===================== */
const getInventoryDocRef = (category) => {
  // Document ID format: isuzu11&calapan16&inventory2019&{category} (lowercase)
  const lowerCategory = category.toLowerCase();
  return doc(db, "Inventory", `isuzu11&calapan16&inventory2019&${lowerCategory}`);
};

const getCategoryDocRef = () => {
  return doc(db, "Category", "categories");
};

const getMetadataDocRef = () => {
  return doc(db, "Inventory_Metadata", "category_counters");
};

/* =====================
   LOAD CATEGORIES
===================== */
const loadCategories = async () => {
  try {
    const categoryDoc = await getDoc(getCategoryDocRef());
    if (categoryDoc.exists()) {
      const data = categoryDoc.data();
      const categoryList = data.list || [];
      availableCategories.value = categoryList.sort();
    } else {
      availableCategories.value = [];
    }
  } catch (error) {
    console.error("Error loading categories:", error);
    availableCategories.value = [];
  }
};

/* =====================
   SAVE CATEGORY
===================== */
const saveCategory = async (category) => {
  const lowerCategory = category.toLowerCase();
  const categoryRef = getCategoryDocRef();
  
  try {
    const docSnap = await getDoc(categoryRef);
    let categoryList = [];
    
    if (docSnap.exists()) {
      categoryList = docSnap.data().list || [];
    }
    
    if (!categoryList.includes(lowerCategory)) {
      categoryList.push(lowerCategory);
      await setDoc(categoryRef, { list: categoryList.sort() });
    }
  } catch (error) {
    console.error("Error saving category:", error);
  }
};

/* =====================
   REAL-TIME INVENTORY LISTENERS
===================== */
const setupInventoryListeners = async () => {
  // Clean up existing listeners first
  cleanupInventoryListeners();
  
  try {
    // Load categories first
    await loadCategories();
    
    // Set up real-time listeners for each category
    for (const category of availableCategories.value) {
      const docRef = getInventoryDocRef(category);
      
      const unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          
          // Build new items array for this category
          const categoryItems = [];
          Object.keys(data).forEach(controlNo => {
            if (controlNo.startsWith('ISZ-')) {
              categoryItems.push({
                id: controlNo,
                controlNo,
                category, // stored as lowercase
                ...data[controlNo]
              });
            }
          });
          
          // Replace entire array to ensure reactivity
          inventoryItems.value = [
            ...inventoryItems.value.filter(item => item.category !== category),
            ...categoryItems
          ];
          
          console.log(`Real-time update: ${category} - ${categoryItems.length} items, total: ${inventoryItems.value.length}`);
        }
      }, (error) => {

        console.warn(`Error in real-time listener for ${category}:`, error);
      });
      
      // Store unsubscribe function
      inventoryListeners.value.push(unsubscribe);
    }
    
    console.log(`Set up ${inventoryListeners.value} real-time listeners`);
  } catch (error) {
    console.error("Error setting up inventory listeners:", error);
  }
};

const cleanupInventoryListeners = () => {
  // Unsubscribe all existing listeners
  inventoryListeners.value.forEach(unsubscribe => {
    if (typeof unsubscribe === 'function') {
      unsubscribe();
    }
  });
  inventoryListeners.value = [];
  console.log('Cleaned up inventory listeners');
};

// Legacy function - kept for manual refresh if needed
const loadInventory = async () => {
  try {
    const allItems = [];
    
    // Load categories first
    await loadCategories();

    // Load from each category document in Inventory collection
    for (const category of availableCategories.value) {
      const docRef = getInventoryDocRef(category);
      
      try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          // Each field in the document is a control number map
          Object.keys(data).forEach(controlNo => {
            if (controlNo.startsWith('ISZ-')) {
              allItems.push({
                id: controlNo,
                controlNo,
                category, // stored as lowercase
                ...data[controlNo]
              });
            }
          });
        }
      } catch (err) {
        console.warn(`Error loading category ${category}:`, err);
      }
    }

    inventoryItems.value = allItems;
  } catch (error) {
    console.error("Error loading inventory:", error);
  }
};


/* =====================
   CONTROL NUMBER GENERATION
===================== */
const generateControlNo = async (category) => {
  const metadataRef = getMetadataDocRef();
  const metadataDoc = await getDoc(metadataRef);
  
  let categoryNum = 1;
  let itemNum = 1;

  if (metadataDoc.exists()) {
    const data = metadataDoc.data();
    const categories = data.categories || {};
    
    if (categories[category]) {
      // Existing category - increment item number
      categoryNum = categories[category].categoryNum;
      itemNum = (categories[category].lastItemNum || 0) + 1;
    } else {
      // New category - find next category number
      categoryNum = Object.keys(categories).length + 1;
      itemNum = 1;
    }
  }

  // Format: ISZ-XXX-YYYY
  const formattedCategory = categoryNum.toString().padStart(3, '0');
  const formattedItem = itemNum.toString().padStart(4, '0');
  
  return {
    controlNo: `ISZ-${formattedCategory}-${formattedItem}`,
    categoryNum,
    itemNum
  };
};

const updateMetadata = async (category, categoryNum, itemNum) => {
  const metadataRef = getMetadataDocRef();
  const metadataDoc = await getDoc(metadataRef);
  
  let categories = {};
  if (metadataDoc.exists()) {
    categories = metadataDoc.data().categories || {};
  }

  categories[category] = {
    categoryNum,
    lastItemNum: itemNum,
    updatedAt: new Date()
  };

  await setDoc(metadataRef, { categories }, { merge: true });
};

/* =====================
   MODAL ACTIONS
===================== */
const openAddModal = () => {
  isEditing.value = false;
  form.value = {
    id: null,
    category: "",
    partName: "",
    partNo: "",
    model: "",
    description: "",
    quantity: 0,
    unitPrice: 0
  };
  newCategory.value = "";
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  isEditing.value = false;
};

const toast = useToast();
const { exportInventory, parseExcelFile, processImportItems, processInventoryImportItems, downloadInventoryTemplate } = useExcelExport();



const addNewCategory = async () => {
  if (!newCategory.value.trim()) return;
  
  const category = newCategory.value.trim();
  const lowerCategory = category.toLowerCase();
  
  // Check if category already exists (case-insensitive)
  const categoryExists = availableCategories.value.some(
    cat => cat.toLowerCase() === lowerCategory
  );
  
  if (categoryExists) {
    toast.warning(`Category "${category}" already exists!`, 'Duplicate Category');
    newCategory.value = "";
    return;
  }
  
  try {
    // Save to database first
    await saveCategory(lowerCategory);
    
    // Add to local state
    form.value.category = lowerCategory;
    availableCategories.value.push(lowerCategory);
    availableCategories.value.sort();
    
    toast.success(`Category "${category}" added successfully!`, 'New Category');
    newCategory.value = "";
  } catch (error) {
    console.error("Error adding category:", error);
    toast.error("Failed to add category. Please try again.", 'Error');
  }
};


const editItem = (item) => {
  isEditing.value = true;
  // Explicitly set each form field to ensure proper pre-filling
  form.value = {
    id: item.id || item.controlNo,
    category: item.category || "",
    partName: item.partName || "",
    partNo: item.partNo || "",
    model: item.model || "",
    description: item.description || "",
    quantity: item.quantity || 0,
    unitPrice: item.unitPrice || 0,
    createdAt: item.createdAt || null,
    updatedAt: item.updatedAt || null
  };
  newCategory.value = "";
  showModal.value = true;
};


/* =====================
   CRUD OPERATIONS
===================== */
const saveItem = async () => {
  if (!form.value.category || !form.value.partName || !form.value.partNo) {
    alert("Please fill in all required fields");
    return;
  }

  isSaving.value = true;

  try {
    const docRef = getInventoryDocRef(form.value.category);
    const now = new Date();

    if (isEditing.value) {
      // Update existing item - update the map field within the document
      // Store category in lowercase, partName/model/description in UPPERCASE
      const qty = parseInt(form.value.quantity) || 0;
      const price = parseFloat(form.value.unitPrice) || 0;
      const totalVal = qty * price;
      
      const updateData = {};
      updateData[form.value.id] = {
        category: form.value.category.toLowerCase(),
        partName: form.value.partName.toUpperCase(),
        partNo: form.value.partNo.toUpperCase(),
        model: form.value.model.toUpperCase(),
        description: (form.value.description || "").toUpperCase(),
        quantity: qty,
        unitPrice: price,
        totalValue: totalVal,
        createdAt: form.value.createdAt || now,
        updatedAt: now
      };
      await updateDoc(docRef, updateData);
    } else {
      // Create new item with auto-generated control number
      const { controlNo, categoryNum, itemNum } = await generateControlNo(form.value.category);
      
      // Save category to Category collection
      await saveCategory(form.value.category);
      
      // Create or update the document with the new control number as a map field
      // Store category in lowercase, partName/model/description in UPPERCASE
      const qty = parseInt(form.value.quantity) || 0;
      const price = parseFloat(form.value.unitPrice) || 0;
      const totalVal = qty * price;
      
      const itemData = {
        category: form.value.category.toLowerCase(),
        partName: form.value.partName.toUpperCase(),
        partNo: form.value.partNo.toUpperCase(),
        model: form.value.model.toUpperCase(),
        description: (form.value.description || "").toUpperCase(),
        quantity: qty,
        unitPrice: price,
        totalValue: totalVal,
        createdAt: now,
        updatedAt: now
      };
      
      // Use setDoc with merge to create document if it doesn't exist
      const updateData = {};
      updateData[controlNo] = itemData;
      await setDoc(docRef, updateData, { merge: true });

      // Update metadata
      await updateMetadata(form.value.category, categoryNum, itemNum);
      
      // Add category to available list if new
      if (!availableCategories.value.includes(form.value.category)) {
        availableCategories.value.push(form.value.category);
        availableCategories.value.sort();
      }
    }

    await loadInventory();
    closeModal();
  } catch (error) {
    console.error("Error saving item:", error);
    alert("Failed to save item. Please try again.");
  } finally {
    isSaving.value = false;
  }
};

const deleteItem = async (item) => {
  if (!confirm(`Are you sure you want to delete ${item.partName} (${item.controlNo})?`)) {
    return;
  }

  try {
    const docRef = getInventoryDocRef(item.category);
    // Use deleteField to remove the map field from the document
    const updateData = {};
    updateData[item.id] = deleteField();
    await updateDoc(docRef, updateData);
    await loadInventory();
  } catch (error) {
    console.error("Error deleting item:", error);
    alert("Failed to delete item. Please try again.");
  }
};

/* =====================
   FILTER ACTIONS
===================== */

const clearAllFilters = () => {
  searchQuery.value = "";
  debouncedSearchQuery.value = "";
  selectedCategory.value = "";
  minQty.value = "";
  maxQty.value = "";
  minPrice.value = "";
  maxPrice.value = "";
};


/* =====================
   HELPERS
===================== */
const formatPrice = (price) => {

  return parseFloat(price || 0).toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

/* =====================
   EXCEL EXPORT
===================== */
const toggleExportMenu = () => {
  showExportMenu.value = !showExportMenu.value;
};

// Close export menu when clicking outside
const closeExportMenu = (event) => {
  if (!event.target.closest('.relative')) {
    showExportMenu.value = false;
  }
};

/* =====================
   PRINT FUNCTIONS
===================== */
const togglePrintMenu = () => {
  showPrintMenu.value = !showPrintMenu.value;
};

// Close print menu when clicking outside
const closePrintMenu = (event) => {
  if (!event.target.closest('.relative')) {
    showPrintMenu.value = false;
  }
};

const printFilteredData = () => {
  if (filteredInventory.value.length === 0) {
    toast.warning('No filtered data to print', 'Print');
    return;
  }
  
  showPrintMenu.value = false;
  printInventory(filteredInventory.value, 'Filtered Inventory Report');
};

const printAllData = () => {
  if (inventoryItems.value.length === 0) {
    toast.warning('No data to print', 'Print');
    return;
  }
  
  showPrintMenu.value = false;
  printInventory(inventoryItems.value, 'Complete Inventory Report');
};

const printInventory = (data, title) => {
  isPrinting.value = true;
  
  // Calculate totals
  const totalItems = data.length;
  const totalValue = data.reduce((sum, item) => sum + (item.totalValue || 0), 0);
  const totalQuantity = data.reduce((sum, item) => sum + (item.quantity || 0), 0);
  
  // Get current date and time
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-PH', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const timeStr = now.toLocaleTimeString('en-PH', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  
  // Create print window content
  const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title} - ISUZU Calapan</title>
      <style>
        @page {
          size: landscape;
          margin: 10mm;
        }
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: Arial, sans-serif;
          font-size: 10pt;
          line-height: 1.4;
          color: #000;
          background: #fff;
        }

        /* NEW HEADER STYLES */
        .header-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 10px;
          margin-bottom: 15px;
          border-bottom: 3px solid #dc2626; /* The red line from the image */
        }
        .header-left {
          flex: 1;
        }
        .header-center {
          flex: 1;
          text-align: center;
        }
        .header-right {
          flex: 2;
          text-align: left;
          padding-left: 20px;
        }
        .header-logo-isuzu {
          height: 60px;
          object-fit: contain;
        }
        .header-logo-mdo {
          height: 60px;
          object-fit: contain;
        }
        .comp-name-bold {
          font-size: 14pt;
          font-weight: bold;
          color: #000;
          display: block;
          margin-bottom: 2px;
        }
        .comp-details {
          font-size: 10pt;
          color: #000;
          line-height: 1.2;
        }

        /* REPORT TITLE SECTION */
        .report-info {
          text-align: center;
          margin-bottom: 15px;
        }
        .report-title {
          font-size: 16pt;
          font-weight: bold;
          text-transform: uppercase;
          margin-bottom: 4px;
        }
        .report-meta {
          font-size: 9pt;
          color: #666;
        }

        .summary {
          display: flex;
          justify-content: space-around;
          margin-bottom: 15px;
          padding: 12px;
          background: #f8f9fa;
          border: 1px solid #e5e7eb;
          border-radius: 4px;
        }
        .summary-item {
          text-align: center;
        }
        .summary-label {
          font-size: 8pt;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .summary-value {
          font-size: 13pt;
          font-weight: bold;
          color: #dc2626;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }
        th {
          background: #dc2626;
          color: white;
          padding: 8px 6px;
          text-align: left;
          font-size: 8.5pt;
          font-weight: bold;
          border: 1px solid #dc2626;
          text-transform: uppercase;
        }
        td {
          padding: 6px;
          border: 1px solid #d1d5db;
          font-size: 8.5pt;
          vertical-align: middle;
        }
        tr:nth-child(even) {
          background: #f9fafb;
        }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        
        .category-badge {
          background: #fee2e2;
          color: #991b1b;
          padding: 2px 5px;
          border-radius: 3px;
          font-size: 7.5pt;
          font-weight: bold;
        }
        .total-value {
          color: #059669;
          font-weight: bold;
        }
        .footer {
          margin-top: 20px;
          padding-top: 10px;
          border-top: 1px solid #eeeeee;
          font-size: 8pt;
          color: #999;
          text-align: center;
        }
        @media print {
          .no-print { display: none; }
          body { -webkit-print-color-adjust: exact; }
        }
      </style>
    </head>
    <body>
      <div class="header-container">
        <div class="header-left">
          <img src="/isuzucalapanHeader.png" alt="ISUZU Calapan City" class="header-logo-isuzu">
        </div>
        <div class="header-center">
          <img src="/mdoLogo.png" alt="MDO Motors" class="header-logo-mdo">
        </div>
        <div class="header-right">
          <span class="comp-name-bold">MINA DE ORO MOTORS INCORPORATED</span>
          <div class="comp-details">
            Km. 9 Nautical Highway, Puting Tubig, Calapan City,<br>
            Oriental Mindoro, 5200
          </div>
        </div>
      </div>

      <div class="report-info">
        <div class="report-title">${title}</div>
        <div class="report-meta">Generated on ${dateStr} at ${timeStr}</div>
      </div>
      
      <div class="summary">
        <div class="summary-item">
          <div class="summary-label">Total Line Items</div>
          <div class="summary-value">${totalItems.toLocaleString()}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">Total Stock Quantity</div>
          <div class="summary-value">${totalQuantity.toLocaleString()}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">Total Inventory Value</div>
          <div class="summary-value">₱${totalValue.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
      </div>
      
      <table>
        <thead>
          <tr>
            <th width="8%">Control No.</th>
            <th width="10%">Category</th>
            <th>Part Name</th>
            <th>Part No.</th>
            <th>Model</th>
            <th width="15%">Description</th>
            <th class="text-center">Qty</th>
            <th class="text-right">Unit Price</th>
            <th class="text-right">Total Value</th>
          </tr>
        </thead>
        <tbody>
          ${data.map(item => `
            <tr>
              <td>${item.controlNo || '-'}</td>
              <td><span class="category-badge">${(item.category || '-').toUpperCase()}</span></td>
              <td>${(item.partName || '-').toUpperCase()}</td>
              <td>${(item.partNo || '-').toUpperCase()}</td>
              <td>${(item.model || '-').toUpperCase()}</td>
              <td>${(item.description || '-').toUpperCase()}</td>
              <td class="text-center">${item.quantity || 0}</td>
              <td class="text-right">₱${(item.unitPrice || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td class="text-right total-value">₱${(item.totalValue || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="footer">
        <p>ISUZU Calapan Inventory Management System &copy; ${now.getFullYear()}</p>
        <p>System Generated Report | Confidental</p>
      </div>
      
      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
            window.close();
          }, 700);
        };
      <\/script>
    </body>
    </html>
  `;
  
  const printWindow = window.open('', '_blank', 'width=1200,height=800');
  if (printWindow) {
    printWindow.document.write(printContent);
    printWindow.document.close();
  } else {
    alert('Please disable your popup blocker to print the report.');
  }
  
  isPrinting.value = false;
};


const exportFilteredData = () => {
  if (filteredInventory.value.length === 0) {
    toast.warning('No filtered data to export', 'Export');
    return;
  }
  
  showExportMenu.value = false;
  // Export the filtered inventory data
  exportInventory(filteredInventory.value, 'Inventory_Filtered_Export');
  toast.success(`Exported ${filteredInventory.value.length} filtered items successfully!`, 'Export Complete');
};

const exportAllData = () => {
  if (inventoryItems.value.length === 0) {
    toast.warning('No data to export', 'Export');
    return;
  }
  
  showExportMenu.value = false;
  // Export all inventory data (ignores filters)
  exportInventory(inventoryItems.value, 'Inventory_All_Export');
  toast.success(`Exported all ${inventoryItems.value.length} items successfully!`, 'Export Complete');
};

/* =====================
   EXCEL IMPORT
===================== */
const openImportModal = () => {
  showImportModal.value = true;
  resetImport();
};

const closeImportModal = () => {
  showImportModal.value = false;
  resetImport();
};

const resetImport = () => {
  importFile.value = null;
  importPreview.value = { validItems: [], invalidItems: [] };
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

const fileInput = ref(null);

// Download template function
const downloadTemplate = () => {
  downloadInventoryTemplate();
  toast.info('Template downloaded!', 'Template');
};

const handleFileSelect = async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  
  // Validate file type
  const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
  if (!validTypes.includes(file.type) && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
    toast.error('Please select a valid Excel file (.xlsx or .xls)', 'Invalid File');
    return;
  }
  
  try {
    toast.info('Reading file...', 'Processing');
    const items = await parseExcelFile(file);
    
    if (items.length === 0) {
      toast.warning('No data found in file', 'Empty File');
      return;
    }
    
    // Process and validate items with duplicate checking against current inventory
    const { validItems, invalidItems } = processInventoryImportItems(items, inventoryItems.value);
    importPreview.value = { validItems, invalidItems };
    
    if (validItems.length === 0) {
      toast.error(`All ${items.length} items have validation errors`, 'Validation Failed');
    } else if (invalidItems.length > 0) {
      toast.warning(`${validItems.length} valid, ${invalidItems.length} invalid items found`, 'Partially Valid');
    } else {
      toast.success(`All ${validItems.length} items are valid and ready to import`, 'Validation Passed');
    }
  } catch (error) {
    console.error('Error parsing file:', error);
    toast.error('Failed to read Excel file. Please check the format.', 'Parse Error');
  }
};

const confirmImport = async () => {
  const validItems = importPreview.value.validItems;
  if (validItems.length === 0) return;
  
  isImporting.value = true;
  let successCount = 0;
  let errorCount = 0;
  
  try {
    toast.info(`Importing ${validItems.length} items...`, 'Importing');
    
    for (const item of validItems) {
      try {
        // Generate control number
        const { controlNo, categoryNum, itemNum } = await generateControlNo(item.category);
        
        // Save category
        await saveCategory(item.category);
        
        // Prepare item data
        const itemData = {
          category: item.category.toLowerCase(),
          partName: item.partName.toUpperCase(),
          partNo: item.partNo.toUpperCase(),
          model: item.model.toUpperCase(),
          description: (item.description || '').toUpperCase(),
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalValue: item.totalValue,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        // Save to Firestore
        const docRef = getInventoryDocRef(item.category);
        const updateData = {};
        updateData[controlNo] = itemData;
        await setDoc(docRef, updateData, { merge: true });
        
        // Update metadata
        await updateMetadata(item.category, categoryNum, itemNum);
        
        successCount++;
      } catch (err) {
        console.error('Error importing item:', err);
        errorCount++;
      }
    }
    
    // Reload inventory
    await loadInventory();
    
    // Show result
    if (errorCount === 0) {
      toast.success(`Successfully imported all ${successCount} items!`, 'Import Complete');
    } else {
      toast.warning(`Imported ${successCount} items, ${errorCount} failed`, 'Import Partial');
    }
    
    closeImportModal();
  } catch (error) {
    console.error('Import error:', error);
    toast.error('Import failed. Please try again.', 'Import Error');
  } finally {
    isImporting.value = false;
  }
};

/* =====================
   LIFECYCLE
===================== */
onMounted(async () => {
  // Set up real-time listeners instead of one-time load
  await setupInventoryListeners();
  isLoading.value = false;
  document.addEventListener('click', closeExportMenu);
  document.addEventListener('click', closePrintMenu);
});

onUnmounted(() => {
  // Clean up all listeners when component is destroyed
  cleanupInventoryListeners();
  document.removeEventListener('click', closeExportMenu);
  document.removeEventListener('click', closePrintMenu);
});
</script>

<style scoped>
/* Custom scrollbar for modal */
.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background-color: rgba(156, 163, 175, 0.7);
}
.isuzu-font {
  font-family: 'IsuzuFont', sans-serif;
}
</style>