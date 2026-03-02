<template>
  <div v-if="!isLoading" :class="themeClass" :style="themeStyle" class="min-h-screen flex flex-col">
    <!-- Main Content -->
    <main class="flex-1 p-6">
      <h1 :class="textClass" class="text-3xl font-bold mb-6 border-l-4 border-orange-600 pl-4 flex items-center gap-2">
        <ArrowUpCircle class="w-7 h-7 text-orange-600" />
        Transaction Out / Sales
      </h1>

      <!-- Action Bar -->
      <div :class="cardClass" :style="cardStyle" class="shadow-lg rounded-lg p-6 mb-6 border-l-2 border-orange-600">
        <div class="flex flex-col gap-4">
          <!-- Title Row -->
          <div class="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
            <div>
              <h2 class="text-xl font-bold flex items-center gap-2 text-orange-600">
                <ArrowUpCircle class="w-6 h-6" />
                Outgoing Parts / Sales Records
              </h2>
              <p :class="subTextClass" class="mt-2">Records of parts sold to clients</p>
            </div>

          
          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row gap-2">
            <!-- Import Button -->
            <button
              @click="openImportModal"
              class="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
            >
              <Upload class="w-5 h-5" />
              Import Excel
            </button>

            <!-- Export Button with Dropdown -->
            <div class="relative">
              <button
                @click="toggleExportMenu"
                class="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 w-full"
                :disabled="transactionOutItems.length === 0"
                :class="{ 'opacity-50 cursor-not-allowed': transactionOutItems.length === 0 }"
              >
                <FileDown class="w-5 h-5" />
                Export Excel
                <ChevronDown class="w-4 h-4" />
              </button>
              
              <!-- Export Dropdown Menu -->
              <div
                v-if="showExportMenu"
                :class="cardClass"
                :style="cardStyle"
                class="absolute right-0 mt-1 w-48 rounded-lg shadow-lg border z-50 overflow-hidden"
              >
                <button
                  @click="exportFilteredData"
                  class="w-full text-left px-4 py-2 text-sm hover:bg-green-50 dark:hover:bg-green-900 transition-colors flex items-center gap-2"
                  :class="textClass"
                >
                  <Filter class="w-4 h-4 text-green-600" />
                  Export Filtered ({{ filteredTransactions.length }})
                </button>
                <button
                  @click="exportAllData"
                  class="w-full text-left px-4 py-2 text-sm hover:bg-green-50 dark:hover:bg-green-900 transition-colors flex items-center gap-2"
                  :class="textClass"
                >
                  <Database class="w-4 h-4 text-blue-600" />
                  Export All ({{ transactionOutItems.length }})
                </button>
              </div>

            </div>

            <!-- Print Button with Dropdown -->
            <div class="relative">
              <button
                @click="togglePrintMenu"
                class="flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 w-full"
                :disabled="transactionOutItems.length === 0"
                :class="{ 'opacity-50 cursor-not-allowed': transactionOutItems.length === 0 }"
              >
                <Printer class="w-5 h-5" />
                Print
                <ChevronDown class="w-4 h-4" />
              </button>
              
              <!-- Print Dropdown Menu -->
              <div
                v-if="showPrintMenu"
                :class="cardClass"
                :style="cardStyle"
                class="absolute right-0 mt-1 w-48 rounded-lg shadow-lg border z-50 overflow-hidden"
              >
                <button
                  @click="printFilteredData"
                  class="w-full text-left px-4 py-2 text-sm hover:bg-purple-50 dark:hover:bg-purple-900 transition-colors flex items-center gap-2"
                  :class="textClass"
                >
                  <Filter class="w-4 h-4 text-purple-600" />
                  Print Filtered ({{ filteredTransactions.length }})
                </button>
                <button
                  @click="printAllData"
                  class="w-full text-left px-4 py-2 text-sm hover:bg-purple-50 dark:hover:bg-purple-900 transition-colors flex items-center gap-2"
                  :class="textClass"
                >
                  <Database class="w-4 h-4 text-blue-600" />
                  Print All ({{ transactionOutItems.length }})
                </button>
              </div>

            </div>

            <!-- Add Button -->
            <button
              @click="openTransactionOutModal"
              class="flex items-center justify-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
            >
              <Plus class="w-5 h-5" />
              Add New Sale
            </button>
          </div>
        </div>
      </div>

      <!-- Search and Filter Row -->

        <div class="flex flex-col sm:flex-row gap-3 mt-4 pt-4 border-t" :class="borderClass">
          <!-- Search -->
          <div class="relative flex-1 max-w-md">
            <Search class="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              v-model="tableSearchQuery"
              type="text"
              placeholder="Search by part name, number, control no, client..."
              :class="inputClass"
              class="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 transition-all duration-200"
            />
          </div>
          
          <!-- Category Filter -->
          <select
            v-model="selectedCategory"
            :class="inputClass"
            class="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 transition-all duration-200"
          >
            <option value="">All Categories</option>
            <option v-for="cat in availableCategories" :key="cat" :value="cat">{{ cat.toUpperCase() }}</option>
          </select>

          <!-- Status Filter -->
          <select
            v-model="selectedStatus"
            :class="inputClass"
            class="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 transition-all duration-200"
          >
            <option value="">All Statuses</option>
            <option v-for="status in availableStatuses" :key="status" :value="status">{{ status }}</option>
          </select>

          <!-- Clear All Filters Button -->
          <button
            v-if="hasActiveFilters"
            @click="clearAllFilters"
            class="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-all duration-200 text-sm"
            :class="textClass"
            title="Clear all filters"
          >
            <X class="w-4 h-4" />
            Clear
          </button>

          <!-- Result Count -->
          <div class="ml-auto flex items-center">
            <span class="px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
              {{ resultCount }} record{{ resultCount !== 1 ? 's' : '' }} found
            </span>
          </div>
        </div>

        <!-- Advanced Filters Row -->
        <div class="flex flex-col sm:flex-row gap-3 mt-3 items-center flex-wrap">
          <!-- Quantity Range -->
          <div class="flex items-center gap-2">
            <span :class="subTextClass" class="text-sm font-medium">Qty:</span>
            <input
              v-model="minQty"
              type="number"
              min="0"
              placeholder="Min"
              :class="inputClass"
              class="w-20 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-orange-600"
            />
            <span :class="subTextClass">-</span>
            <input
              v-model="maxQty"
              type="number"
              min="0"
              placeholder="Max"
              :class="inputClass"
              class="w-20 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-orange-600"
            />
          </div>

          <!-- Price Range -->
          <div class="flex items-center gap-2">
            <span :class="subTextClass" class="text-sm font-medium">Total Price ₱:</span>
            <input
              v-model="minPrice"
              type="number"
              min="0"
              step="0.01"
              placeholder="Min"
              :class="inputClass"
              class="w-24 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-orange-600"
            />
            <span :class="subTextClass">-</span>
            <input
              v-model="maxPrice"
              type="number"
              min="0"
              step="0.01"
              placeholder="Max"
              :class="inputClass"
              class="w-24 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-orange-600"
            />
          </div>
        </div>
      </div>



      <!-- Transaction Out Table -->
      <div :class="cardClass" :style="cardStyle" class="shadow-lg rounded-lg overflow-hidden border-t-2 border-orange-600">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead :class="tableHeaderClass" class="border-b-2 border-orange-600">
              <tr>
                <th class="p-4 text-left">Control No.</th>
                <th class="p-4 text-left">Transaction ID</th>
                <th class="p-4 text-left">Category</th>
                <th class="p-4 text-left">Part No.</th>
                <th class="p-4 text-left">Part Name</th>
                <th class="p-4 text-left">Model</th>
                <th class="p-4 text-left">Quantity</th>
                <th class="p-4 text-left">Unit Price</th>
                <th class="p-4 text-left">Total Price</th>
                <th class="p-4 text-left">Client</th>
                <th class="p-4 text-left">Note</th>
                <th class="p-4 text-left">Sold At</th>
                <th class="p-4 text-left">Status</th>
                <th class="p-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in paginatedTransactions"
                :key="item.id"

                :class="tableRowClass"
                class="border-b border-gray-300 transition duration-200 hover:shadow-md"
              >
                <td :class="textClass" class="p-4 font-medium text-orange-600">{{ item.controlNo }}</td>
                <td :class="textClass" class="p-4 font-medium">{{ item.transactionID }}</td>
                <td :class="textClass" class="p-4">
                  <span class="px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-800 uppercase">
                    {{ item.category }}
                  </span>
                </td>
                <td :class="textClass" class="p-4 font-medium">{{ item.partNo }}</td>
                <td :class="textClass" class="p-4">{{ item.partName }}</td>
                <td :class="textClass" class="p-4">{{ item.model }}</td>
                <td :class="textClass" class="p-4">{{ item.quantity }}</td>
                <td :class="textClass" class="p-4">₱{{ item.unitPrice?.toLocaleString() }}</td>
                <td :class="textClass" class="p-4">₱{{ item.totalPrice?.toLocaleString() }}</td>
                <td :class="textClass" class="p-4 font-medium">{{ item.client }}</td>
                <td :class="textClass" class="p-4">{{ item.note }}</td>
                <td :class="textClass" class="p-4">{{ formatDate(item.soldAt) }}</td>
                <td :class="textClass" class="p-4">
                  <span :class="getStatusBadgeClass(item.statusOUT)" class="px-2 py-1 rounded text-xs font-medium uppercase">
                    {{ item.statusOUT || 'Pending' }}
                  </span>
                </td>
                <td :class="textClass" class="p-4">
                  <div class="flex gap-2">
                    <!-- Show Process Sale button only for Pending status -->
                    <button
                      v-if="item.statusOUT === 'Pending' || !item.statusOUT"
                      @click="processSale(item)"
                      :disabled="processingItems[item.id]"
                      class="flex items-center gap-1 bg-orange-600 text-white px-2 py-1 rounded text-xs hover:bg-orange-700 transition-all duration-200 disabled:opacity-50"
                    >
                      <Check class="w-3 h-3" />
                      {{ processingItems[item.id] ? 'Processing...' : 'Process Sale' }}
                    </button>
                    <!-- Show Cancel button only for Completed status and within 3 days -->
                    <button
                      v-if="item.statusOUT === 'Completed' && isCancelAvailable(item)"
                      @click="cancelSale(item)"
                      :disabled="processingItems[item.id]"
                      class="flex items-center gap-1 bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700 transition-all duration-200 disabled:opacity-50"
                    >
                      <X class="w-3 h-3" />
                      {{ processingItems[item.id] ? 'Processing...' : 'Cancel' }}
                      <span class="ml-1 text-[10px] opacity-75">({{ getCancelExpirationText(item) }})</span>
                    </button>
                    <!-- Show expired message when cancel is no longer available -->
                    <span
                      v-if="item.statusOUT === 'Completed' && !isCancelAvailable(item)"
                      class="text-gray-500 text-xs flex items-center gap-1"
                      title="Cancel action expired after 3 days"
                    >
                      <XCircle class="w-3 h-3" />
                      Cancel Expired
                    </span>

                    <span
                      v-if="item.statusOUT === 'Cancelled'"
                      class="text-red-600 font-medium text-xs flex items-center gap-1"
                    >
                      <XCircle class="w-4 h-4" />
                      Cancelled
                    </span>
                  </div>
                </td>
              </tr>
              <tr v-if="paginatedTransactions.length === 0">
                <td colspan="14" :class="subTextClass" class="text-center p-8">
                  <div class="flex justify-center items-center gap-2">
                    <ArrowUpCircle class="w-5 h-5" />
                    No sales records found
                  </div>
                </td>
              </tr>

            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="filteredTransactions.length > 0" class="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-3">
          <!-- Items info -->
          <div :class="subTextClass" class="text-sm">
            Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to {{ Math.min(currentPage * itemsPerPage, filteredTransactions.length) }} of {{ filteredTransactions.length }} records
          </div>

          <!-- Pagination controls -->
          <div class="flex items-center gap-2">
            <!-- Items per page selector -->
            <select
              v-model="itemsPerPage"
              :class="inputClass"
              class="px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-orange-600"
            >
              <option v-for="option in itemsPerPageOptions" :key="option" :value="option">{{ option }}/page</option>
            </select>

            <!-- First page -->
            <button
              @click="currentPage = 1"
              :disabled="currentPage === 1"
              class="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              :class="textClass"
              title="First page"
            >
              <ChevronsLeft class="w-5 h-5" />
            </button>

            <!-- Previous page -->
            <button
              @click="currentPage--"
              :disabled="currentPage === 1"
              class="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              :class="textClass"
              title="Previous page"
            >
              <ChevronLeft class="w-5 h-5" />
            </button>

            <!-- Page numbers -->
            <div class="flex items-center gap-1">
              <button
                v-for="page in displayedPages"
                :key="page"
                @click="currentPage = page"
                :class="[
                  'px-3 py-1 text-sm rounded transition-colors',
                  currentPage === page
                    ? 'bg-orange-600 text-white'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 ' + textClass
                ]"
              >
                {{ page }}
              </button>
            </div>

            <!-- Next page -->
            <button
              @click="currentPage++"
              :disabled="currentPage === totalPages"
              class="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              :class="textClass"
              title="Next page"
            >
              <ChevronRight class="w-5 h-5" />
            </button>

            <!-- Last page -->
            <button
              @click="currentPage = totalPages"
              :disabled="currentPage === totalPages"
              class="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              :class="textClass"
              title="Last page"
            >
              <ChevronsRight class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </main>


    <!-- Transaction OUT Modal -->
    <div v-if="showTransactionOutModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div :class="modalClass" :style="modalStyle" class="rounded-lg shadow-xl p-6 w-full max-w-lg">
        <h2 :class="textClass" class="text-2xl font-bold mb-4 flex items-center gap-2">
          <ArrowUpCircle class="w-6 h-6 text-orange-600" />
          Record Sale
        </h2>

        <div class="space-y-4">
          <!-- Inventory Item Search -->
          <div class="inventory-selector relative">
            <label :class="subTextClass" class="block mb-1 font-medium">Search Inventory Item *</label>
            <div class="relative">
              <Search class="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                v-model="searchQuery"
                type="text"
                :class="inputClass"
                class="w-full border rounded px-4 py-2 pl-10"
                placeholder="Search by part number, name, model, or category..."
                @focus="showInventoryDropdown = true"
              />
            </div>
            
            <!-- Inventory Dropdown -->
            <div 
              v-if="showInventoryDropdown && inventoryItems.length > 0" 
              :class="cardClass"
              :style="cardStyle"
              class="absolute z-50 w-full mt-1 border rounded-lg shadow-lg max-h-60 overflow-y-auto"
            >
              <div
                v-for="item in inventoryItems"
                :key="item.controlNo"
                @click="selectInventoryItem(item)"
                class="p-3 cursor-pointer hover:bg-orange-50 dark:hover:bg-orange-900 border-b border-gray-200 dark:border-gray-700 last:border-0"
              >
                <div class="flex justify-between items-start">
                  <div>
                    <div :class="textClass" class="font-medium">{{ item.partNo }}</div>
                    <div :class="subTextClass" class="text-sm">{{ item.partName }}</div>
                    <div :class="subTextClass" class="text-xs mt-1">
                      <span class="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 uppercase">{{ item.category }}</span>
                      <span class="ml-1">Model: {{ item.model }}</span>
                      <span class="ml-1">| Stock: {{ item.quantity }}</span>
                    </div>
                  </div>
                  <div class="text-right">
                    <div :class="subTextClass" class="text-xs font-mono">{{ item.controlNo }}</div>
                    <div class="text-orange-600 font-medium text-sm">₱{{ item.unitPrice?.toLocaleString() }}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- No Results -->
            <div 
              v-if="showInventoryDropdown && inventoryItems.length === 0" 
              :class="cardClass"
              class="absolute z-50 w-full mt-1 border rounded-lg shadow-lg p-4 text-center"
            >
              <p :class="subTextClass">No inventory items found</p>
            </div>
          </div>

          <!-- Selected Item Info -->
          <div v-if="selectedInventoryItem" :class="cardClass" :style="cardStyle" class="p-3 rounded-lg border border-orange-200 dark:border-orange-800">
            <div class="flex items-center gap-2 text-orange-600 mb-2">
              <Check class="w-4 h-4" />
              <span class="font-medium text-sm">Selected Item</span>
            </div>
            <div class="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span :class="subTextClass">Control No:</span>
                <span :class="textClass" class="font-mono ml-1">{{ selectedInventoryItem.controlNo }}</span>
              </div>
              <div>
                <span :class="subTextClass">Part No:</span>
                <span :class="textClass" class="font-medium ml-1">{{ selectedInventoryItem.partNo }}</span>
              </div>
              <div class="col-span-2">
                <span :class="subTextClass">Part Name:</span>
                <span :class="textClass" class="font-medium ml-1">{{ selectedInventoryItem.partName }}</span>
              </div>
              <div class="col-span-2">
                <span :class="subTextClass">Available Stock:</span>
                <span :class="textClass" class="font-medium ml-1 text-orange-600">{{ selectedInventoryItem.quantity }} units</span>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label :class="subTextClass" class="block mb-1 font-medium">Quantity *</label>
              <input
                v-model.number="transactionOutForm.quantity"
                type="number"
                min="1"
                :max="selectedInventoryItem?.quantity || 999999"
                :class="inputClass"
                class="w-full border rounded px-4 py-2"
                placeholder="0"
                required
              />
              <p v-if="selectedInventoryItem" :class="subTextClass" class="text-xs mt-1">
                Max: {{ selectedInventoryItem.quantity }} units
              </p>
            </div>

            <div>
              <label :class="subTextClass" class="block mb-1 font-medium">Unit Price (₱)</label>
              <input
                v-model.number="transactionOutForm.unitPrice"
                type="number"
                :class="inputClass"
                class="w-full border rounded px-4 py-2 bg-gray-100 dark:bg-gray-700"
                placeholder="0.00"
                readonly
              />
            </div>
          </div>

          <div>
            <label :class="subTextClass" class="block mb-1 font-medium">Total Price (₱) <span class="text-xs font-normal">(Auto-calculated)</span></label>
            <input
              v-model.number="transactionOutForm.totalPrice"
              type="number"
              :class="inputClass"
              class="w-full border rounded px-4 py-2 bg-orange-50 dark:bg-orange-900 font-medium text-orange-700 dark:text-orange-300"
              placeholder="0.00"
              readonly
            />
          </div>

          <div>
            <label :class="subTextClass" class="block mb-1 font-medium">Client Name *</label>
            <input
              v-model="transactionOutForm.client"
              type="text"
              :class="inputClass"
              class="w-full border rounded px-4 py-2"
              placeholder="e.g., Client Name or Company"
              required
            />
          </div>

          <div>
            <label :class="subTextClass" class="block mb-1">Note</label>
            <textarea
              v-model="transactionOutForm.note"
              :class="inputClass"
              class="w-full border rounded px-4 py-2"
              rows="2"
              placeholder="Enter notes..."
            ></textarea>
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-6">
          <button
            @click="closeTransactionOutModal"
            class="px-4 py-2 border rounded hover:bg-gray-100 hover:shadow-md transition-all duration-200"
            :class="isDarkMode ? 'border-gray-600 hover:bg-gray-800 text-white' : 'border-gray-300'"
          >
            Cancel
          </button>
          <button
            @click="saveTransactionOut"
            class="bg-orange-600 text-white px-6 py-2 rounded hover:bg-orange-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
          >
            Record Sale
          </button>
        </div>
      </div>
    </div>

    <!-- Import Modal -->
    <div v-if="showImportModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div :class="modalClass" :style="modalStyle" class="rounded-lg shadow-xl p-6 w-full max-w-lg">
        <h2 :class="textClass" class="text-2xl font-bold mb-4 flex items-center gap-2">
          <FileSpreadsheet class="w-6 h-6 text-blue-600" />
          Import Sales from Excel
        </h2>

        <div class="space-y-4">
          <!-- Info Alert -->
          <div class="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
            <div class="flex items-start gap-2">
              <AlertTriangle class="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p :class="textClass" class="font-medium text-sm">Important Information</p>
                <p :class="subTextClass" class="text-sm mt-1">
                  Import feature requires inventory validation for each item. 
                  Please ensure all parts exist in inventory with sufficient stock before importing.
                  For now, please add sales manually using the "Add New Sale" button.
                </p>
              </div>
            </div>
          </div>

          <!-- File Upload -->
          <div>
            <label :class="subTextClass" class="block mb-2 font-medium">Select Excel File</label>
            <div class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
              <input
                ref="fileInput"
                type="file"
                accept=".xlsx,.xls"
                class="hidden"
                @change="handleFileSelect"
              />
              <button
                @click="$refs.fileInput.click()"
                class="flex items-center justify-center gap-2 mx-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                <Upload class="w-5 h-5" />
                Choose File
              </button>
              <p :class="subTextClass" class="text-sm mt-2">
                Supported formats: .xlsx, .xls
              </p>
            </div>
          </div>

          <!-- Required Columns Info -->
          <div :class="cardClass" :style="cardStyle" class="rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <p :class="textClass" class="font-medium text-sm mb-2">Required Columns:</p>
            <ul :class="subTextClass" class="text-sm space-y-1">
              <li>• Control No.</li>
              <li>• Part No.</li>
              <li>• Part Name</li>
              <li>• Category</li>
              <li>• Model</li>
              <li>• Quantity</li>
              <li>• Unit Price</li>
              <li>• Client</li>
              <li>• Note (optional)</li>
            </ul>
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-6">
          <button
            @click="closeImportModal"
            class="px-4 py-2 border rounded hover:bg-gray-100 hover:shadow-md transition-all duration-200"
            :class="isDarkMode ? 'border-gray-600 hover:bg-gray-800 text-white' : 'border-gray-300'"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Loading Screen -->

  <div v-else class="min-h-screen flex items-center justify-center">
    <Loaders />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick, onUnmounted } from 'vue';
import { db } from '../../Firebase/Firebase';
import { collection, getDocs, doc, setDoc, getDoc, collectionGroup, updateDoc } from 'firebase/firestore';
import { 
  loadAllInventoryItems, 
  getInventoryItemByPartNo,
  generateTransactionID,
  searchInventoryItems 
} from '../../composables/useControlNumber';
import { useToast } from '../../composables/useToast';
import { useExcelExport } from '../../composables/useExcelExport';
import Loaders from '../../components/Loaders.vue';
import { Plus, ArrowUpCircle, Search, Check, X, CheckCircle, XCircle, FileDown, ChevronDown, Filter, Database, Upload, FileSpreadsheet, Printer, AlertTriangle, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-vue-next';


// Toast notification
const toast = useToast();

// Loading state
const isLoading = ref(true);

// Transaction data
const transactionOutItems = ref([]);

// Processing state for individual items
const processingItems = ref({});

// Transaction modal state
const showTransactionOutModal = ref(false);

// Transaction form
const transactionOutForm = ref({
  partNo: '',
  partName: '',
  quantity: 0,
  unitPrice: 0,
  totalPrice: 0,
  client: '',
  note: '',
  controlNo: '',
  transactionID: ''
});

// Collection path constants
const TRANSACTION_COLLECTION = 'Transactions';
const TRANSACTION_OUT_SUBCOLLECTION = 'Transaction_OUT';

// Inventory items for selector
const inventoryItems = ref([]);
const searchQuery = ref('');
const showInventoryDropdown = ref(false);
const selectedInventoryItem = ref(null);

// Export, Import, Print state
const showExportMenu = ref(false);
const showPrintMenu = ref(false);
const showImportModal = ref(false);
const importFile = ref(null);
const importPreview = ref({ validItems: [], invalidItems: [] });
const isImporting = ref(false);
const isPrinting = ref(false);

// Search and Filter state
const tableSearchQuery = ref('');
const debouncedSearchQuery = ref('');

const selectedCategory = ref('');
const selectedStatus = ref('');
const minQty = ref('');
const maxQty = ref('');
const minPrice = ref('');
const maxPrice = ref('');

// Pagination state
const currentPage = ref(1);
const itemsPerPage = ref(10);
const itemsPerPageOptions = [10, 25, 50, 100];

// Debounce timer for search
let searchDebounceTimer = null;
let debounceTimeout = null;


// Theme
const isDarkMode = computed(() => document.documentElement.classList.contains('dark'));

const borderClass = computed(() =>
  isDarkMode.value ? 'border-gray-700' : 'border-gray-200'
);

// Debounce search
const debounceSearch = (value, delay = 300) => {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    debouncedSearchQuery.value = value;
  }, delay);
};

// Watch tableSearchQuery and debounce it
watch(tableSearchQuery, (newValue) => {
  debounceSearch(newValue);
});


// Reset to first page when filters change
watch([debouncedSearchQuery, selectedCategory, selectedStatus, minQty, maxQty, minPrice, maxPrice], () => {
  currentPage.value = 1;
});

// Available categories from data
const availableCategories = computed(() => {
  const categories = new Set(transactionOutItems.value.map(item => item.category).filter(Boolean));
  return Array.from(categories).sort();
});

// Available statuses
const availableStatuses = ['Pending', 'Completed', 'Cancelled'];

// Filtered transactions
const filteredTransactions = computed(() => {
  let filtered = transactionOutItems.value;

  // Category filter
  if (selectedCategory.value) {
    filtered = filtered.filter(item => item.category === selectedCategory.value);
  }

  // Status filter
  if (selectedStatus.value) {
    filtered = filtered.filter(item => (item.statusOUT || 'Pending') === selectedStatus.value);
  }

  // Text search (debounced)
  if (debouncedSearchQuery.value) {
    const query = debouncedSearchQuery.value.toLowerCase().trim();
    filtered = filtered.filter(item =>
      item.partName?.toLowerCase().includes(query) ||
      item.partNo?.toLowerCase().includes(query) ||
      item.controlNo?.toLowerCase().includes(query) ||
      item.transactionID?.toLowerCase().includes(query) ||
      item.client?.toLowerCase().includes(query) ||
      item.model?.toLowerCase().includes(query) ||
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

  // Price range filter (totalPrice)
  const minP = parseFloat(minPrice.value);
  const maxP = parseFloat(maxPrice.value);
  if (!isNaN(minP)) {
    filtered = filtered.filter(item => (item.totalPrice || 0) >= minP);
  }
  if (!isNaN(maxP)) {
    filtered = filtered.filter(item => (item.totalPrice || 0) <= maxP);
  }

  return filtered.sort((a, b) => {
    const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
    const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
    return dateB - dateA;
  });
});

// Result count
const resultCount = computed(() => filteredTransactions.value.length);

// Check if any filters are active
const hasActiveFilters = computed(() => 
  selectedCategory.value ||
  selectedStatus.value ||
  tableSearchQuery.value ||
  minQty.value ||
  maxQty.value ||
  minPrice.value ||
  maxPrice.value
);

// Clear all filters
const clearAllFilters = () => {
  tableSearchQuery.value = '';
  debouncedSearchQuery.value = '';
  selectedCategory.value = '';
  selectedStatus.value = '';
  minQty.value = '';
  maxQty.value = '';
  minPrice.value = '';
  maxPrice.value = '';
  currentPage.value = 1;
};



// Paginated transactions
const paginatedTransactions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredTransactions.value.slice(start, end);
});

// Total pages
const totalPages = computed(() => {
  return Math.ceil(filteredTransactions.value.length / itemsPerPage.value) || 1;
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


const themeClass = computed(() =>
  isDarkMode.value ? 'text-white' : 'bg-gray-100 text-gray-900'
);

const themeStyle = computed(() =>
  isDarkMode.value ? { backgroundColor: '#232323' } : {}
);

const cardClass = computed(() =>
  isDarkMode.value ? 'text-white' : 'bg-white text-gray-900'
);

const cardStyle = computed(() =>
  isDarkMode.value ? { backgroundColor: '#2a2a2a' } : {}
);

const textClass = computed(() =>
  isDarkMode.value ? 'text-white' : 'text-gray-900'
);

const subTextClass = computed(() =>
  isDarkMode.value ? 'text-gray-300' : 'text-gray-600'
);

const tableHeaderClass = computed(() =>
  isDarkMode.value ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900'
);

const tableRowClass = computed(() =>
  isDarkMode.value ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
);

const inputClass = computed(() =>
  isDarkMode.value
    ? 'bg-gray-800 text-white border-gray-600 placeholder-gray-400'
    : 'bg-white text-gray-900 border-gray-300'
);

const modalClass = computed(() =>
  isDarkMode.value ? 'bg-gray-800 text-white' : 'bg-white'
);

const modalStyle = computed(() =>
  isDarkMode.value ? { backgroundColor: '#2a2a2a' } : {}
);

// Status badge class helper
const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'Completed':
      return 'bg-green-100 text-green-800';
    case 'Cancelled':
      return 'bg-red-100 text-red-800';
    case 'Pending':
    default:
      return 'bg-yellow-100 text-yellow-800';
  }
};

// Format date helper
const formatDate = (timestamp) => {
  if (!timestamp) return '-';
  if (timestamp.toDate) {
    return timestamp.toDate().toLocaleString();
  }
  return new Date(timestamp).toLocaleString();
};

// Check if cancel is available (within 3 days of sale)
const isCancelAvailable = (item) => {
  if (!item.soldAt) return false;
  
  const soldDate = item.soldAt.toDate ? item.soldAt.toDate() : new Date(item.soldAt);
  const now = new Date();
  const diffTime = now - soldDate;
  const diffDays = diffTime / (1000 * 60 * 60 * 24); // Convert to days
  
  return diffDays <= 3;
};

// Get cancel expiration text
const getCancelExpirationText = (item) => {
  if (!item.soldAt) return '';
  
  const soldDate = item.soldAt.toDate ? item.soldAt.toDate() : new Date(item.soldAt);
  const now = new Date();
  const diffTime = now - soldDate;
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  const remainingDays = Math.max(0, 3 - Math.floor(diffDays));
  
  if (remainingDays === 0) {
    const remainingHours = Math.max(0, 72 - Math.floor(diffTime / (1000 * 60 * 60)));
    if (remainingHours > 0) {
      return `${remainingHours}h left`;
    }
    return 'Expired';
  }
  
  return `${remainingDays}d left`;
};


// Load inventory items for selector
const loadInventoryItems = async () => {
  try {
    inventoryItems.value = await loadAllInventoryItems();
    console.log('Loaded inventory items:', inventoryItems.value.length);
  } catch (error) {
    console.error('Error loading inventory items:', error);
  }
};

// Search inventory items with debounce
const debouncedSearchInventory = (query) => {
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(async () => {
    if (query.trim()) {
      const results = await searchInventoryItems(query);
      inventoryItems.value = results;
      showInventoryDropdown.value = true;
    } else {
      await loadInventoryItems();
      showInventoryDropdown.value = false;
    }
  }, 300);
};

// Watch search query
watch(searchQuery, (newValue) => {
  debouncedSearchInventory(newValue);
});

// Select inventory item
const selectInventoryItem = (item) => {
  selectedInventoryItem.value = item;
  transactionOutForm.value.partNo = item.partNo || '';
  transactionOutForm.value.partName = item.partName || '';
  transactionOutForm.value.unitPrice = item.unitPrice || 0;
  transactionOutForm.value.controlNo = item.controlNo || '';
  searchQuery.value = `${item.partNo} - ${item.partName}`;
  showInventoryDropdown.value = false;
  
  calculateTotalPrice();
};

// Calculate total price
const calculateTotalPrice = () => {
  const qty = parseInt(transactionOutForm.value.quantity) || 0;
  const price = parseFloat(transactionOutForm.value.unitPrice) || 0;
  transactionOutForm.value.totalPrice = qty * price;
};

// Watch quantity changes to auto-calculate total
watch(() => transactionOutForm.value.quantity, () => {
  calculateTotalPrice();
});

// Load Transaction OUT data
const loadTransactionOut = async () => {
  try {
    transactionOutItems.value = [];
    
    console.log('Loading Transaction OUT data...');
    
    const transactionOutQuery = collectionGroup(db, TRANSACTION_OUT_SUBCOLLECTION);
    const snapshot = await getDocs(transactionOutQuery);
    
    console.log('Total Transaction_OUT documents found:', snapshot.docs.length);
    
    for (const transDoc of snapshot.docs) {
      const transData = transDoc.data();
      
      const pathParts = transDoc.ref.path.split('/');
      const collectionName = pathParts.length >= 1 ? pathParts[0] : '';
      const partNo = pathParts.length >= 2 ? pathParts[1] : 'Unknown';
      
      if (collectionName !== TRANSACTION_COLLECTION) {
        console.log('Skipping document from old collection:', transDoc.ref.path);
        continue;
      }
      
      transactionOutItems.value.push({
        id: transDoc.id,
        transactionID: transData.transactionID || '',
        controlNo: transData.controlNo || '',
        category: transData.category || '',
        partNo: transData.partNo || partNo,
        partName: transData.partName || '',
        model: transData.model || '',
        quantity: transData.quantity || 0,
        unitPrice: transData.unitPrice || 0,
        totalPrice: transData.totalPrice || 0,
        client: transData.client || '',
        note: transData.note || '',
        statusOUT: transData.statusOUT || 'Pending',
        soldAt: transData.soldAt || null,
        createdAt: transData.createdAt || null
      });
    }
    
    transactionOutItems.value.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
      return dateB - dateA;
    });
    
    console.log('Total Transaction OUT items loaded:', transactionOutItems.value.length);
  } catch (error) {
    console.error('Error loading transaction out:', error);
  }
};

// Validate transaction against current inventory
const validateTransactionAgainstInventory = async (transaction) => {
  try {
    // Get current inventory item by partNo
    const currentInventoryItem = await getInventoryItemByPartNo(transaction.partNo);
    
    if (!currentInventoryItem) {
      return {
        valid: false,
        message: `Inventory item with Part No. ${transaction.partNo} not found`
      };
    }
    
    // Check if enough stock is available
    if (currentInventoryItem.quantity < transaction.quantity) {
      return {
        valid: false,
        message: `Insufficient stock. Available: ${currentInventoryItem.quantity}, Requested: ${transaction.quantity}`
      };
    }
    
    // Validate each field
    const mismatches = [];
    
    if (currentInventoryItem.controlNo !== transaction.controlNo) {
      mismatches.push(`Control No: expected "${currentInventoryItem.controlNo}", found "${transaction.controlNo}"`);
    }
    
    if (currentInventoryItem.category?.toLowerCase() !== transaction.category?.toLowerCase()) {
      mismatches.push(`Category: expected "${currentInventoryItem.category}", found "${transaction.category}"`);
    }
    
    if (currentInventoryItem.partNo?.toUpperCase() !== transaction.partNo?.toUpperCase()) {
      mismatches.push(`Part No: expected "${currentInventoryItem.partNo}", found "${transaction.partNo}"`);
    }
    
    if (currentInventoryItem.partName?.toUpperCase() !== transaction.partName?.toUpperCase()) {
      mismatches.push(`Part Name: expected "${currentInventoryItem.partName}", found "${transaction.partName}"`);
    }
    
    if (currentInventoryItem.model?.toUpperCase() !== transaction.model?.toUpperCase()) {
      mismatches.push(`Model: expected "${currentInventoryItem.model}", found "${transaction.model}"`);
    }
    
    if (parseFloat(currentInventoryItem.unitPrice) !== parseFloat(transaction.unitPrice)) {
      mismatches.push(`Unit Price: expected "${currentInventoryItem.unitPrice}", found "${transaction.unitPrice}"`);
    }
    
    if (mismatches.length > 0) {
      return {
        valid: false,
        message: 'Data mismatch with current inventory:\n• ' + mismatches.join('\n• '),
        inventoryItem: currentInventoryItem
      };
    }
    
    return {
      valid: true,
      inventoryItem: currentInventoryItem
    };
  } catch (error) {
    console.error('Error validating transaction:', error);
    return {
      valid: false,
      message: 'Error validating against inventory: ' + error.message
    };
  }
};

// Update inventory quantity and total value
const updateInventoryStock = async (inventoryItem, quantityToSubtract) => {
  try {
    const docRef = doc(db, "Inventory", `isuzu11&calapan16&inventory2019&${inventoryItem.category.toLowerCase()}`);
    
    // Get current data
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      throw new Error('Inventory document not found');
    }
    
    const currentData = docSnap.data();
    const currentItemData = currentData[inventoryItem.controlNo];
    
    if (!currentItemData) {
      throw new Error('Inventory item not found in document');
    }
    
    // Calculate new values
    const currentQty = parseInt(currentItemData.quantity) || 0;
    const newQty = currentQty - parseInt(quantityToSubtract);
    
    if (newQty < 0) {
      throw new Error('Cannot subtract more than available stock');
    }
    
    const unitPrice = parseFloat(currentItemData.unitPrice) || 0;
    const newTotalValue = newQty * unitPrice;
    
    // Update the specific control number map field
    const updateData = {};
    updateData[`${inventoryItem.controlNo}.quantity`] = newQty;
    updateData[`${inventoryItem.controlNo}.totalValue`] = newTotalValue;
    updateData[`${inventoryItem.controlNo}.updatedAt`] = new Date();
    
    await updateDoc(docRef, updateData);
    
    return {
      success: true,
      previousQty: currentQty,
      newQty: newQty,
      subtractedQty: quantityToSubtract
    };
  } catch (error) {
    console.error('Error updating inventory:', error);
    throw error;
  }
};

// Process Sale (subtract from inventory)
const processSale = async (transaction) => {
  // Set processing state
  processingItems.value[transaction.id] = true;
  
  try {
    toast.info('Validating transaction against inventory...', 'Validation');
    
    // Validate transaction
    const validation = await validateTransactionAgainstInventory(transaction);
    
    if (!validation.valid) {
      toast.error(validation.message, 'Validation Failed');
      processingItems.value[transaction.id] = false;
      return;
    }
    
    toast.info('Updating inventory stock...', 'Processing');
    
    // Update inventory (subtract quantity)
    const updateResult = await updateInventoryStock(validation.inventoryItem, transaction.quantity);
    
    // Update transaction status
    const pathParts = transaction.id.split('&');
    const partNo = pathParts[1] || transaction.partNo;
    const cleanPartNo = partNo.replace(/[\/\.\#\$\[\]\&]/g, '-');
    
    const transactionRef = doc(db, TRANSACTION_COLLECTION, cleanPartNo, TRANSACTION_OUT_SUBCOLLECTION, transaction.id);
    await updateDoc(transactionRef, {
      statusOUT: 'Completed',
      processedAt: new Date(),
      previousInventoryQty: updateResult.previousQty,
      newInventoryQty: updateResult.newQty
    });
    
    toast.success(
      `Sale completed! Removed ${updateResult.subtractedQty} units. Inventory updated from ${updateResult.previousQty} to ${updateResult.newQty}.`,
      'Sale Complete'
    );
    
    // Refresh the list
    await loadTransactionOut();
  } catch (error) {
    console.error('Error processing sale:', error);
    toast.error('Failed to process sale: ' + error.message, 'Error');
  } finally {
    processingItems.value[transaction.id] = false;
  }
};

// Cancel Sale (add back to inventory)
const cancelSale = async (transaction) => {
  // Check if cancel is still available (within 3 days)
  if (!isCancelAvailable(transaction)) {
    toast.error('Cancel action has expired. Sales can only be cancelled within 3 days of the transaction date.', 'Cancel Expired');
    return;
  }
  
  // Set processing state
  processingItems.value[transaction.id] = true;
  
  try {
    toast.info('Cancelling sale and restoring inventory...', 'Processing');

    
    // Get current inventory item
    const currentInventoryItem = await getInventoryItemByPartNo(transaction.partNo);
    
    if (!currentInventoryItem) {
      toast.error('Inventory item not found', 'Error');
      processingItems.value[transaction.id] = false;
      return;
    }
    
    // Add quantity back to inventory
    const docRef = doc(db, "Inventory", `isuzu11&calapan16&inventory2019&${currentInventoryItem.category.toLowerCase()}`);
    
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      throw new Error('Inventory document not found');
    }
    
    const currentData = docSnap.data();
    const currentItemData = currentData[currentInventoryItem.controlNo];
    
    const currentQty = parseInt(currentItemData.quantity) || 0;
    const newQty = currentQty + parseInt(transaction.quantity);
    const unitPrice = parseFloat(currentItemData.unitPrice) || 0;
    const newTotalValue = newQty * unitPrice;
    
    const updateData = {};
    updateData[`${currentInventoryItem.controlNo}.quantity`] = newQty;
    updateData[`${currentInventoryItem.controlNo}.totalValue`] = newTotalValue;
    updateData[`${currentInventoryItem.controlNo}.updatedAt`] = new Date();
    
    await updateDoc(docRef, updateData);
    
    // Update transaction status to Cancelled
    const pathParts = transaction.id.split('&');
    const partNo = pathParts[1] || transaction.partNo;
    const cleanPartNo = partNo.replace(/[\/\.\#\$\[\]\&]/g, '-');
    
    const transactionRef = doc(db, TRANSACTION_COLLECTION, cleanPartNo, TRANSACTION_OUT_SUBCOLLECTION, transaction.id);
    await updateDoc(transactionRef, {
      statusOUT: 'Cancelled',
      processedAt: new Date(),
      restoredInventoryQty: newQty
    });
    
    toast.success(
      `Sale cancelled! Restored ${transaction.quantity} units. Inventory updated from ${currentQty} to ${newQty}.`,
      'Sale Cancelled'
    );
    
    // Refresh the list
    await loadTransactionOut();
  } catch (error) {
    console.error('Error cancelling sale:', error);
    toast.error('Failed to cancel sale: ' + error.message, 'Error');
  } finally {
    processingItems.value[transaction.id] = false;
  }
};

// Open Transaction OUT modal
const openTransactionOutModal = async () => {
  transactionOutForm.value = {
    partNo: '',
    partName: '',
    quantity: 0,
    unitPrice: 0,
    totalPrice: 0,
    client: '',
    note: '',
    controlNo: '',
    transactionID: ''
  };
  searchQuery.value = '';
  selectedInventoryItem.value = null;
  showInventoryDropdown.value = false;
  
  await loadInventoryItems();
  showTransactionOutModal.value = true;
};

// Close Transaction OUT modal
const closeTransactionOutModal = () => {
  showTransactionOutModal.value = false;
};

// Save Transaction OUT
const saveTransactionOut = async () => {
  try {
    if (!transactionOutForm.value.partNo) {
      alert('Please select an inventory item');
      return;
    }
    
    if (!transactionOutForm.value.quantity || transactionOutForm.value.quantity <= 0) {
      alert('Please enter a valid quantity');
      return;
    }
    
    if (!transactionOutForm.value.client) {
      alert('Please enter client name');
      return;
    }
    
    // Check if quantity exceeds available stock
    if (selectedInventoryItem.value && transactionOutForm.value.quantity > selectedInventoryItem.value.quantity) {
      alert(`Cannot sell more than available stock. Available: ${selectedInventoryItem.value.quantity}`);
      return;
    }
    
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
    const dateTimeStr = `${dateStr}_${timeStr}`;
    
    const partNo = transactionOutForm.value.partNo || 'UNKNOWN';
    const cleanPartNo = partNo.replace(/[\/\.\#\$\[\]\&]/g, '-');
    
    const documentId = `TransactionOUT&${cleanPartNo}&${dateTimeStr}`;
    const transactionID = generateTransactionID();
    
    const transactionData = {
      transactionID: transactionID,
      partNo: transactionOutForm.value.partNo,
      partName: transactionOutForm.value.partName,
      controlNo: transactionOutForm.value.controlNo,
      category: selectedInventoryItem.value?.category || '',
      model: selectedInventoryItem.value?.model || '',
      quantity: parseInt(transactionOutForm.value.quantity) || 0,
      unitPrice: parseFloat(transactionOutForm.value.unitPrice) || 0,
      totalPrice: parseFloat(transactionOutForm.value.totalPrice) || 0,
      client: transactionOutForm.value.client || '',
      note: transactionOutForm.value.note || '',
      statusOUT: 'Pending', // Default status
      soldAt: now,
      createdAt: now
    };
    
    await setDoc(
      doc(db, TRANSACTION_COLLECTION, cleanPartNo, TRANSACTION_OUT_SUBCOLLECTION, documentId),
      transactionData
    );
    
    toast.success('Sale recorded successfully! Status: Pending', 'Sale Created');
    
    await loadTransactionOut();
    closeTransactionOutModal();
  } catch (error) {
    console.error('Error saving transaction out:', error);
    toast.error('Failed to save sale. Please try again.', 'Error');
  }
};

// Excel Export functions
const { exportTransactionOut } = useExcelExport();

const toggleExportMenu = () => {
  showExportMenu.value = !showExportMenu.value;
};

// Close export menu when clicking outside
const closeExportMenu = (event) => {
  if (!event.target.closest('.relative')) {
    showExportMenu.value = false;
  }
};

const exportFilteredData = () => {
  if (filteredTransactions.value.length === 0) {
    toast.warning('No filtered data to export', 'Export');
    return;
  }
  
  showExportMenu.value = false;
  exportTransactionOut(filteredTransactions.value, 'TransactionOut_Filtered_Export');
  toast.success(`Exported ${filteredTransactions.value.length} filtered items successfully!`, 'Export Complete');
};

const exportAllData = () => {
  if (transactionOutItems.value.length === 0) {
    toast.warning('No data to export', 'Export');
    return;
  }
  
  showExportMenu.value = false;
  exportTransactionOut(transactionOutItems.value, 'TransactionOut_All_Export');
  toast.success(`Exported all ${transactionOutItems.value.length} items successfully!`, 'Export Complete');
};


// Print functions
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
  if (filteredTransactions.value.length === 0) {
    toast.warning('No filtered data to print', 'Print');
    return;
  }
  
  showPrintMenu.value = false;
  printTransactionOut(filteredTransactions.value, 'Transaction Out / Sales Report (Filtered)');
};

const printAllData = () => {
  if (transactionOutItems.value.length === 0) {
    toast.warning('No data to print', 'Print');
    return;
  }
  
  showPrintMenu.value = false;
  printTransactionOut(transactionOutItems.value, 'Transaction Out / Sales Report (All)');
};


const printTransactionOut = (data, title) => {
  isPrinting.value = true;
  
  // Calculate totals
  const totalItems = data.length;
  const totalQuantity = data.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const totalValue = data.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
  
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
          font-size: 9pt;
          line-height: 1.3;
          color: #000;
          background: #fff;
        }
        .header {
          text-align: center;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 2px solid #ea580c;
        }
        .company-name {
          font-size: 16pt;
          font-weight: bold;
          color: #ea580c;
          margin-bottom: 3px;
        }
        .company-address {
          font-size: 8pt;
          color: #666;
          margin-bottom: 6px;
        }
        .report-title {
          font-size: 12pt;
          font-weight: bold;
          margin-bottom: 4px;
        }
        .report-meta {
          font-size: 8pt;
          color: #666;
          margin-bottom: 8px;
        }
        .summary {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
          padding: 8px;
          background: #fff7ed;
          border-radius: 4px;
          border: 1px solid #fed7aa;
        }
        .summary-item {
          text-align: center;
        }
        .summary-label {
          font-size: 7pt;
          color: #666;
          text-transform: uppercase;
        }
        .summary-value {
          font-size: 12pt;
          font-weight: bold;
          color: #ea580c;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 8px;
        }
        th {
          background: #ea580c;
          color: white;
          padding: 6px 4px;
          text-align: left;
          font-size: 8pt;
          font-weight: bold;
          border: 1px solid #ea580c;
        }
        td {
          padding: 4px;
          border: 1px solid #d1d5db;
          font-size: 8pt;
          vertical-align: top;
        }
        tr:nth-child(even) {
          background: #fff7ed;
        }
        .text-right {
          text-align: right;
        }
        .text-center {
          text-align: center;
        }
        .category-badge {
          background: #fed7aa;
          color: #9a3412;
          padding: 1px 4px;
          border-radius: 3px;
          font-size: 7pt;
          font-weight: bold;
          text-transform: uppercase;
        }
        .status-badge {
          padding: 1px 4px;
          border-radius: 3px;
          font-size: 7pt;
          font-weight: bold;
          text-transform: uppercase;
        }
        .status-pending {
          background: #fef3c7;
          color: #92400e;
        }
        .status-completed {
          background: #d1fae5;
          color: #065f46;
        }
        .status-cancelled {
          background: #fee2e2;
          color: #991b1b;
        }
        .footer {
          margin-top: 12px;
          padding-top: 8px;
          border-top: 1px solid #d1d5db;
          font-size: 7pt;
          color: #666;
          text-align: center;
        }
        @media print {
          .no-print {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-name">ISUZU CALAPAN</div>
        <div class="company-address">Transaction Out / Sales Management System</div>
        <div class="report-title">${title}</div>
        <div class="report-meta">Generated on ${dateStr} at ${timeStr}</div>
      </div>
      
      <div class="summary">
        <div class="summary-item">
          <div class="summary-label">Total Transactions</div>
          <div class="summary-value">${totalItems.toLocaleString()}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">Total Quantity</div>
          <div class="summary-value">${totalQuantity.toLocaleString()}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">Total Value</div>
          <div class="summary-value">₱${totalValue.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Control No.</th>
            <th>Transaction ID</th>
            <th>Category</th>
            <th>Part No.</th>
            <th>Part Name</th>
            <th>Model</th>
            <th class="text-center">Qty</th>
            <th class="text-right">Unit Price</th>
            <th class="text-right">Total Price</th>
            <th>Client</th>
            <th>Note</th>
            <th>Sold At</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${data.map(item => {
            const statusClass = item.statusOUT === 'Completed' ? 'status-completed' : 
                               item.statusOUT === 'Cancelled' ? 'status-cancelled' : 'status-pending';
            const statusText = item.statusOUT || 'Pending';
            const soldAt = item.soldAt ? new Date(item.soldAt.toDate ? item.soldAt.toDate() : item.soldAt).toLocaleString() : '-';
            return `
            <tr>
              <td>${item.controlNo || '-'}</td>
              <td>${item.transactionID || '-'}</td>
              <td><span class="category-badge">${(item.category || '-').toUpperCase()}</span></td>
              <td>${(item.partNo || '-').toUpperCase()}</td>
              <td>${(item.partName || '-').toUpperCase()}</td>
              <td>${(item.model || '-').toUpperCase()}</td>
              <td class="text-center">${item.quantity || 0}</td>
              <td class="text-right">₱${(item.unitPrice || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td class="text-right">₱${(item.totalPrice || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td>${(item.client || '-').toUpperCase()}</td>
              <td>${(item.note || '-').toUpperCase()}</td>
              <td>${soldAt}</td>
              <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            </tr>
          `}).join('')}
        </tbody>
      </table>
      
      <div class="footer">
        <p>ISUZU Calapan Transaction Out Management System &copy; ${now.getFullYear()}</p>
        <p>This is a computer-generated report. No signature required.</p>
      </div>
      
      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
            window.close();
          }, 500);
        };
      <\/script>
    </body>
    </html>
  `;
  
  // Open print window
  const printWindow = window.open('', '_blank', 'width=1200,height=800');
  if (printWindow) {
    printWindow.document.write(printContent);
    printWindow.document.close();
  } else {
    toast.error('Unable to open print window. Please check your popup blocker settings.', 'Print Error');
  }
  
  isPrinting.value = false;
};

// Import functions
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
};

const fileInput = ref(null);

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
    // For now, we'll just show a message that import is not fully implemented
    // as it requires inventory lookup for each item
    toast.info('Import feature requires inventory validation. Please add sales manually for now.', 'Import Info');
    closeImportModal();
  } catch (error) {
    console.error('Error parsing file:', error);
    toast.error('Failed to read Excel file. Please check the format.', 'Parse Error');
  }
};

// Watch for data changes
watch(transactionOutItems, (newVal) => {
  console.log('transactionOutItems updated:', newVal.length, 'items');
}, { deep: true, immediate: true });

// Initialize
onMounted(async () => {

  await nextTick();
  console.log('TransactionOut component mounted');
  await loadTransactionOut();
  console.log('TransactionOut data loaded, items count:', transactionOutItems.value.length);
  isLoading.value = false;
});

// Close dropdown when clicking outside
const closeDropdown = (event) => {
  if (!event.target.closest('.inventory-selector')) {
    showInventoryDropdown.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', closeDropdown);
  document.addEventListener('click', closeExportMenu);
  document.addEventListener('click', closePrintMenu);
});

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown);
  document.removeEventListener('click', closeExportMenu);
  document.removeEventListener('click', closePrintMenu);
});
</script>
