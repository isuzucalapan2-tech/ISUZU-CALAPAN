<template>
  <div v-if="!isLoading" :class="themeClass" :style="themeStyle" class="min-h-screen flex flex-col">
    <!-- Main Content -->
    <main class="flex-1 p-6">
      <h1 :class="textClass" class="text-3xl font-bold mb-6 border-l-4 border-green-600 pl-4 flex items-center gap-2">
        <ArrowDownCircle class="w-7 h-7 text-green-600" />
        Transaction In
      </h1>

      <!-- Action Bar -->
      <div :class="cardClass" :style="cardStyle" class="shadow-lg rounded-lg p-4 mb-6 border-l-2 border-green-600">
        <div class="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
          <!-- Title Section -->
          <div>
            <h2 class="text-xl font-bold flex items-center gap-2 text-green-600">
              <ArrowDownCircle class="w-6 h-6" />
              Incoming Parts / Stock In Records
            </h2>
            <p :class="subTextClass" class="mt-1 text-sm">Records of parts received from outside sources</p>
          </div>

          <!-- Filters Section -->
          <div class="flex flex-col sm:flex-row gap-3 flex-1 max-w-4xl">
            <!-- Search -->
            <div class="relative flex-1">
              <Search class="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search by control no, transaction ID, part no, name, source..."
                :class="inputClass"
                class="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 transition-all duration-200"
              />
            </div>
            
            <!-- Category Filter -->
            <select
              v-model="selectedCategory"
              :class="inputClass"
              class="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 transition-all duration-200"
            >
              <option value="">All Categories</option>
              <option v-for="cat in availableCategories" :key="cat" :value="cat">{{ cat.toUpperCase() }}</option>
            </select>

            <!-- Status Filter -->
            <select
              v-model="selectedStatus"
              :class="inputClass"
              class="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 transition-all duration-200"
            >
              <option value="">All Statuses</option>
              <option v-for="status in availableStatuses" :key="status" :value="status">{{ status }}</option>
            </select>

            <!-- Clear Filters -->
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
            <div class="relative export-menu-container">
              <button
                @click="toggleExportMenu"
                class="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 w-full"
                :disabled="transactionInItems.length === 0"
                :class="{ 'opacity-50 cursor-not-allowed': transactionInItems.length === 0 }"
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
                  :disabled="filteredTransactions.length === 0"
                >
                  <Filter class="w-4 h-4 text-green-600" />
                  Export Filtered ({{ filteredTransactions.length }})
                </button>
                <div class="border-t" :class="borderClass"></div>
                <button
                  @click="exportAllData"
                  class="w-full text-left px-4 py-2 text-sm hover:bg-green-50 dark:hover:bg-green-900 transition-colors flex items-center gap-2"
                  :class="textClass"
                >
                  <Database class="w-4 h-4 text-blue-600" />
                  Export All ({{ transactionInItems.length }})
                </button>
              </div>
            </div>

            <!-- Print Button with Dropdown -->
            <div class="relative print-menu-container">
              <button
                @click="togglePrintMenu"
                class="flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 w-full"
                :disabled="transactionInItems.length === 0"
                :class="{ 'opacity-50 cursor-not-allowed': transactionInItems.length === 0 }"
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
                  :disabled="filteredTransactions.length === 0"
                >
                  <Filter class="w-4 h-4 text-purple-600" />
                  Print Filtered ({{ filteredTransactions.length }})
                </button>
                <div class="border-t" :class="borderClass"></div>
                <button
                  @click="printAllData"
                  class="w-full text-left px-4 py-2 text-sm hover:bg-purple-50 dark:hover:bg-purple-900 transition-colors flex items-center gap-2"
                  :class="textClass"
                >
                  <Database class="w-4 h-4 text-blue-600" />
                  Print All ({{ transactionInItems.length }})
                </button>
              </div>
            </div>

            <!-- Add Button -->
            <button
              @click="openTransactionInModal"
              class="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
            >
              <Plus class="w-5 h-5" />
              Add New Record
            </button>
          </div>
        </div>

        <!-- Advanced Filters Row -->
        <div class="flex flex-col sm:flex-row gap-3 items-center flex-wrap mt-4 pt-4 border-t" :class="borderClass">
          <!-- Quantity Range -->
          <div class="flex items-center gap-2">
            <span :class="subTextClass" class="text-sm font-medium">Qty:</span>
            <input
              v-model="minQty"
              type="number"
              min="0"
              placeholder="Min"
              :class="inputClass"
              class="w-20 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-green-600"
            />
            <span :class="subTextClass">-</span>
            <input
              v-model="maxQty"
              type="number"
              min="0"
              placeholder="Max"
              :class="inputClass"
              class="w-20 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>

          <!-- Price Range -->
          <div class="flex items-center gap-2">
            <span :class="subTextClass" class="text-sm font-medium">Price ₱:</span>
            <input
              v-model="minPrice"
              type="number"
              min="0"
              step="0.01"
              placeholder="Min"
              :class="inputClass"
              class="w-24 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-green-600"
            />
            <span :class="subTextClass">-</span>
            <input
              v-model="maxPrice"
              type="number"
              min="0"
              step="0.01"
              placeholder="Max"
              :class="inputClass"
              class="w-24 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>

          <!-- Date Range -->
          <div class="flex items-center gap-2">
            <span :class="subTextClass" class="text-sm font-medium">Date:</span>
            <input
              v-model="startDate"
              type="date"
              :class="inputClass"
              class="px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-green-600"
            />
            <span :class="subTextClass">-</span>
            <input
              v-model="endDate"
              type="date"
              :class="inputClass"
              class="px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>

          <!-- Result Count Badge -->
          <div class="ml-auto">
            <span class="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              {{ resultCount }} item{{ resultCount !== 1 ? 's' : '' }} found
            </span>
          </div>
        </div>
      </div>


      <!-- Transaction In Table -->
      <div :class="cardClass" :style="cardStyle" class="shadow-lg rounded-lg overflow-hidden border-t-2 border-green-600">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead :class="tableHeaderClass" class="border-b-2 border-green-600">
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
                <th class="p-4 text-left">Source</th>
                <th class="p-4 text-left">Note</th>
                <th class="p-4 text-left">Received At</th>
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

                <td :class="textClass" class="p-4 font-medium text-green-600">{{ item.controlNo }}</td>
                <td :class="textClass" class="p-4 font-medium">{{ item.transactionID }}</td>
                <td :class="textClass" class="p-4">
                  <span class="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800 uppercase">
                    {{ item.category }}
                  </span>
                </td>
                <td :class="textClass" class="p-4 font-medium">{{ item.partNo }}</td>
                <td :class="textClass" class="p-4">{{ item.partName }}</td>
                <td :class="textClass" class="p-4">{{ item.model }}</td>
                <td :class="textClass" class="p-4">{{ item.quantity }}</td>
                <td :class="textClass" class="p-4">₱{{ item.unitPrice?.toLocaleString() }}</td>
                <td :class="textClass" class="p-4">₱{{ item.totalPrice?.toLocaleString() }}</td>
                <td :class="textClass" class="p-4">{{ item.source }}</td>
                <td :class="textClass" class="p-4">{{ item.note }}</td>
                <td :class="textClass" class="p-4">{{ formatDate(item.receivedAt) }}</td>
                <td :class="textClass" class="p-4">
                  <span :class="getStatusBadgeClass(item.statusIN)" class="px-2 py-1 rounded text-xs font-medium uppercase">
                    {{ item.statusIN || 'To Review' }}
                  </span>
                </td>
                <td :class="textClass" class="p-4">
                  <div class="flex gap-2">
                    <!-- Show Stock IN button only for To Review status -->
                    <button
                      v-if="item.statusIN === 'To Review' || !item.statusIN"
                      @click="processStockIn(item)"
                      :disabled="processingItems[item.id]"
                      class="flex items-center gap-1 bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700 transition-all duration-200 disabled:opacity-50"
                    >
                      <Check class="w-3 h-3" />
                      {{ processingItems[item.id] ? 'Processing...' : 'Stock IN' }}
                    </button>
                    <!-- Show Stock OUT button only for Stock IN status (to reverse/return) and within 3 days -->
                    <button
                      v-if="item.statusIN === 'Stock IN' && isStockOutButtonEnabled(item)"
                      @click="processStockOut(item)"
                      :disabled="processingItems[item.id]"
                      class="flex items-center gap-1 bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700 transition-all duration-200 disabled:opacity-50"
                    >
                      <X class="w-3 h-3" />
                      {{ processingItems[item.id] ? 'Processing...' : 'Stock OUT' }}
                      <span class="ml-1 text-[10px] opacity-75">({{ getStockOutExpirationText(item) }})</span>
                    </button>
                    <!-- Show expired message if Stock OUT button is disabled due to 3-day expiration -->
                    <span
                      v-if="item.statusIN === 'Stock IN' && !isStockOutButtonEnabled(item)"
                      class="text-gray-500 text-xs flex items-center gap-1"
                      title="Stock OUT action expired after 3 days"
                    >
                      <Lock class="w-3 h-3" />
                      Stock OUT Expired
                    </span>

                    <span
                      v-if="item.statusIN === 'Stock OUT'"
                      class="text-red-600 font-medium text-xs flex items-center gap-1"
                    >
                      <XCircle class="w-4 h-4" />
                      Returned
                    </span>
                  </div>
                </td>
              </tr>
              <tr v-if="paginatedTransactions.length === 0">
                <td colspan="14" :class="subTextClass" class="text-center p-8">
                  <div class="flex justify-center items-center gap-2">
                    <ArrowDownCircle class="w-5 h-5" />
                    {{ transactionInItems.length === 0 ? 'No incoming transaction records found' : 'No records match your filters' }}
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
            Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to {{ Math.min(currentPage * itemsPerPage, filteredTransactions.length) }} of {{ filteredTransactions.length }} items
          </div>

          <!-- Pagination controls -->
          <div class="flex items-center gap-2">
            <!-- Items per page selector -->
            <select
              v-model="itemsPerPage"
              :class="inputClass"
              class="px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-green-600"
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
                    ? 'bg-green-600 text-white'
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


    <!-- Transaction IN Modal -->
    <div v-if="showTransactionInModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div :class="modalClass" :style="modalStyle" class="rounded-lg shadow-xl p-6 w-full max-w-lg">
        <h2 :class="textClass" class="text-2xl font-bold mb-4 flex items-center gap-2">
          <ArrowDownCircle class="w-6 h-6 text-green-600" />
          Add Incoming Record
        </h2>

        <div class="space-y-4">
          <!-- Inventory Item Search -->
          <div class="inventory-selector relative">
            <label :class="subTextClass" class="block mb-1 font-medium">Search Inventory Item *</label>
            <div class="relative">
              <Search class="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                v-model="inventorySearchQuery"
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
                class="p-3 cursor-pointer hover:bg-green-50 dark:hover:bg-green-900 border-b border-gray-200 dark:border-gray-700 last:border-0"
              >
                <div class="flex justify-between items-start">
                  <div>
                    <div :class="textClass" class="font-medium">{{ item.partNo }}</div>
                    <div :class="subTextClass" class="text-sm">{{ item.partName }}</div>
                    <div :class="subTextClass" class="text-xs mt-1">
                      <span class="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 uppercase">{{ item.category }}</span>
                      <span class="ml-1">Model: {{ item.model }}</span>
                      <span class="ml-1">| Qty: {{ item.quantity }}</span>
                    </div>
                  </div>
                  <div class="text-right">
                    <div :class="subTextClass" class="text-xs font-mono">{{ item.controlNo }}</div>
                    <div class="text-green-600 font-medium text-sm">₱{{ item.unitPrice?.toLocaleString() }}</div>
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
          <div v-if="selectedInventoryItem" :class="cardClass" :style="cardStyle" class="p-3 rounded-lg border border-green-200 dark:border-green-800">
            <div class="flex items-center gap-2 text-green-600 mb-2">
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
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label :class="subTextClass" class="block mb-1 font-medium">Quantity *</label>
              <input
                v-model.number="transactionInForm.quantity"
                type="number"
                min="1"
                :class="inputClass"
                class="w-full border rounded px-4 py-2"
                placeholder="0"
                required
              />
            </div>

            <div>
              <label :class="subTextClass" class="block mb-1 font-medium">Unit Price (₱)</label>
              <input
                v-model.number="transactionInForm.unitPrice"
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
              v-model.number="transactionInForm.totalPrice"
              type="number"
              :class="inputClass"
              class="w-full border rounded px-4 py-2 bg-green-50 dark:bg-green-900 font-medium text-green-700 dark:text-green-300"
              placeholder="0.00"
              readonly
            />
          </div>

          <div>
            <label :class="subTextClass" class="block mb-1 font-medium">Source *</label>
            <input
              v-model="transactionInForm.source"
              type="text"
              :class="inputClass"
              class="w-full border rounded px-4 py-2"
              placeholder="e.g., Supplier Name"
              required
            />
          </div>

          <div>
            <label :class="subTextClass" class="block mb-1">Note</label>
            <textarea
              v-model="transactionInForm.note"
              :class="inputClass"
              class="w-full border rounded px-4 py-2"
              rows="2"
              placeholder="Enter notes..."
            ></textarea>
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-6">
          <button
            @click="closeTransactionInModal"
            class="px-4 py-2 border rounded hover:bg-gray-100 hover:shadow-md transition-all duration-200"
            :class="isDarkMode ? 'border-gray-600 hover:bg-gray-800 text-white' : 'border-gray-300'"
          >
            Cancel
          </button>
          <button
            @click="saveTransactionIn"
            class="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
          >
            Add Record
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Loading Screen -->
  <div v-else class="min-h-screen flex items-center justify-center">
    <Loaders />
  </div>

  <!-- Import Modal -->
  <div v-if="showImportModal" class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div :class="cardClass" :style="cardStyle" class="rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      <div class="p-6 border-b-2 border-blue-600 flex justify-between items-center">
        <h2 :class="textClass" class="text-xl font-bold flex items-center gap-2">
          <FileSpreadsheet class="w-6 h-6 text-blue-600" />
          Import Transaction In from Excel
        </h2>
        <button @click="closeImportModal" class="text-gray-500 hover:text-gray-700 transition-colors">
          <X class="w-6 h-6" />
        </button>
      </div>

      <div class="p-6 space-y-4">
        <!-- File Upload -->
        <div v-if="importPreview.validItems.length === 0 && importPreview.invalidItems.length === 0">
          <div class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
            <input
              type="file"
              ref="fileInput"
              @change="handleFileSelect"
              accept=".xlsx,.xls"
              class="hidden"
            />
            <FileSpreadsheet class="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p :class="textClass" class="text-lg font-medium mb-2">Upload Excel File</p>
            <p :class="subTextClass" class="text-sm mb-4">Supported formats: .xlsx, .xls</p>
            <button
              @click="$refs.fileInput.click()"
              class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Select File
            </button>
            <div class="mt-4 text-left" :class="subTextClass">
              <p class="text-sm font-medium mb-2">Required columns:</p>
              <ul class="text-xs space-y-1 list-disc list-inside">
                <li>Category (required)</li>
                <li>Part No. (required)</li>
                <li>Quantity (required, number)</li>
                <li>Unit Price (required, number)</li>
                <li>Source (required)</li>
                <li>Part Name (optional)</li>
                <li>Model (optional)</li>
                <li>Note (optional)</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Preview Results -->
        <div v-else>
          <!-- Summary -->
          <div class="flex gap-4 mb-4">
            <div class="flex-1 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg p-4">
              <div class="flex items-center gap-2 text-green-700 dark:text-green-300">
                <CheckCircle class="w-5 h-5" />
                <span class="font-medium">{{ importPreview.validItems.length }} Valid Items</span>
              </div>
            </div>
            <div v-if="importPreview.invalidItems.length > 0" class="flex-1 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4">
              <div class="flex items-center gap-2 text-red-700 dark:text-red-300">
                <AlertTriangle class="w-5 h-5" />
                <span class="font-medium">{{ importPreview.invalidItems.length }} Invalid Items</span>
              </div>
            </div>
          </div>

          <!-- Valid Items Table -->
          <div v-if="importPreview.validItems.length > 0" class="mb-4">
            <h3 :class="textClass" class="font-medium mb-2">Valid Items (Ready to Import)</h3>
            <div class="overflow-x-auto max-h-60">
              <table class="min-w-full divide-y border">
                <thead :class="tableHeaderClass">
                  <tr>
                    <th class="px-3 py-2 text-left text-xs font-medium">Category</th>
                    <th class="px-3 py-2 text-left text-xs font-medium">Part No.</th>
                    <th class="px-3 py-2 text-left text-xs font-medium">Part Name</th>
                    <th class="px-3 py-2 text-left text-xs font-medium">Model</th>
                    <th class="px-3 py-2 text-left text-xs font-medium">Qty</th>
                    <th class="px-3 py-2 text-left text-xs font-medium">Unit Price</th>
                    <th class="px-3 py-2 text-left text-xs font-medium">Total Price</th>
                    <th class="px-3 py-2 text-left text-xs font-medium">Source</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in importPreview.validItems.slice(0, 10)" :key="index" :class="tableRowClass">
                    <td :class="textClass" class="px-3 py-2 text-xs uppercase">{{ item.category }}</td>
                    <td :class="textClass" class="px-3 py-2 text-xs uppercase">{{ item.partNo }}</td>
                    <td :class="textClass" class="px-3 py-2 text-xs uppercase">{{ item.partName || '-' }}</td>
                    <td :class="textClass" class="px-3 py-2 text-xs uppercase">{{ item.model || '-' }}</td>
                    <td :class="textClass" class="px-3 py-2 text-xs">{{ item.quantity }}</td>
                    <td :class="textClass" class="px-3 py-2 text-xs">₱{{ item.unitPrice.toLocaleString() }}</td>
                    <td :class="textClass" class="px-3 py-2 text-xs text-green-600">₱{{ item.totalPrice.toLocaleString() }}</td>
                    <td :class="textClass" class="px-3 py-2 text-xs uppercase">{{ item.source }}</td>
                  </tr>
                  <tr v-if="importPreview.validItems.length > 10">
                    <td :class="subTextClass" class="px-3 py-2 text-xs text-center" colspan="8">
                      ... and {{ importPreview.validItems.length - 10 }} more items
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Invalid Items Table -->
          <div v-if="importPreview.invalidItems.length > 0" class="mb-4">
            <h3 :class="textClass" class="font-medium mb-2 text-red-600">Invalid Items (Will be Skipped)</h3>
            <div class="overflow-x-auto max-h-40">
              <table class="min-w-full divide-y border border-red-200">
                <thead class="bg-red-50 dark:bg-red-900">
                  <tr>
                    <th class="px-3 py-2 text-left text-xs font-medium text-red-700 dark:text-red-300">Row</th>
                    <th class="px-3 py-2 text-left text-xs font-medium text-red-700 dark:text-red-300">Part No.</th>
                    <th class="px-3 py-2 text-left text-xs font-medium text-red-700 dark:text-red-300">Errors</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in importPreview.invalidItems" :key="index" class="bg-red-50/50 dark:bg-red-900/50">
                    <td class="px-3 py-2 text-xs text-red-600">{{ item.rowNumber }}</td>
                    <td :class="textClass" class="px-3 py-2 text-xs uppercase">{{ item.partNo || 'N/A' }}</td>
                    <td class="px-3 py-2 text-xs text-red-600">{{ item.errors.join(', ') }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex justify-end gap-3 pt-4 border-t" :class="borderClass">
            <button
              @click="resetImport"
              class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Select Different File
            </button>
            <button
              v-if="importPreview.validItems.length > 0"
              @click="confirmImport"
              :disabled="isImporting"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {{ isImporting ? 'Importing...' : `Import ${importPreview.validItems.length} Items` }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { db } from '../../Firebase/Firebase';
import { collection, getDocs, doc, setDoc, getDoc, collectionGroup, updateDoc } from 'firebase/firestore';
import { 
  getNextControlNumber, 
  loadAllInventoryItems, 
  getInventoryItemByPartNo, 
  getControlNoByPartNo,
  generateTransactionID,
  searchInventoryItems 
} from '../../composables/useControlNumber';
import { useToast } from '../../composables/useToast';
import { useExcelExport } from '../../composables/useExcelExport';
import Loaders from '../../components/Loaders.vue';

import { 
  Plus, 
  ArrowDownCircle, 
  Search, 
  Check, 
  X, 
  CheckCircle, 
  XCircle, 
  Lock,
  Upload,
  FileDown,
  ChevronDown,
  Filter,
  Database,
  Printer,
  FileSpreadsheet,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-vue-next';


// Toast notification
const toast = useToast();
const { exportTransactionIn, parseTransactionInExcelFile, processTransactionInImportItems } = useExcelExport();


// Loading state
const isLoading = ref(true);

// Transaction data
const transactionInItems = ref([]);

// Search and filter states
const searchQuery = ref('');
const debouncedSearchQuery = ref('');
const selectedCategory = ref('');
const selectedStatus = ref('');
const minQty = ref('');
const maxQty = ref('');
const minPrice = ref('');
const maxPrice = ref('');
const startDate = ref('');
const endDate = ref('');

// Pagination states
const currentPage = ref(1);
const itemsPerPage = ref(10);
const itemsPerPageOptions = [10, 25, 50, 100];

// Export/Print/Import menu states
const showExportMenu = ref(false);
const showPrintMenu = ref(false);
const showImportModal = ref(false);
const importFile = ref(null);
const importPreview = ref({ validItems: [], invalidItems: [] });
const isImporting = ref(false);
const isPrinting = ref(false);
const fileInput = ref(null);


// Processing state for individual items
const processingItems = ref({});

// Transaction modal state
const showTransactionInModal = ref(false);

// Transaction form
const transactionInForm = ref({
  partNo: '',
  partName: '',
  quantity: 0,
  unitPrice: 0,
  totalPrice: 0,
  source: '',
  note: '',
  controlNo: '',
  transactionID: ''
});

// Collection path constants - Updated to match requirements
const TRANSACTION_COLLECTION = 'Transactions';
const TRANSACTION_IN_SUBCOLLECTION = 'Transaction_IN';

// Inventory items for selector
const inventoryItems = ref([]);
const inventorySearchQuery = ref('');
const showInventoryDropdown = ref(false);
const selectedInventoryItem = ref(null);

// Debounce timer for search
let searchDebounceTimer = null;


// Theme
const isDarkMode = computed(() => document.documentElement.classList.contains('dark'));

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

const borderClass = computed(() =>
  isDarkMode.value ? 'border-gray-700' : 'border-gray-200'
);

// Debounce utility
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
watch([selectedCategory, selectedStatus, debouncedSearchQuery, minQty, maxQty, minPrice, maxPrice, startDate, endDate], () => {
  currentPage.value = 1;
});


// Status badge class helper
const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'Stock IN':
      return 'bg-green-100 text-green-800';
    case 'Stock OUT':
      return 'bg-red-100 text-red-800';
    case 'To Review':
    default:
      return 'bg-yellow-100 text-yellow-800';
  }
};

// Available categories from transaction data
const availableCategories = computed(() => {
  const categories = new Set(transactionInItems.value.map(item => item.category).filter(Boolean));
  return Array.from(categories).sort();
});

// Available statuses
const availableStatuses = ['To Review', 'Stock IN', 'Stock OUT'];

// Filtered transactions
const filteredTransactions = computed(() => {
  let filtered = [...transactionInItems.value];

  // Category filter
  if (selectedCategory.value) {
    filtered = filtered.filter(item => item.category === selectedCategory.value);
  }

  // Status filter
  if (selectedStatus.value) {
    filtered = filtered.filter(item => (item.statusIN || 'To Review') === selectedStatus.value);
  }

  // Text search (debounced)
  if (debouncedSearchQuery.value) {
    const query = debouncedSearchQuery.value.toLowerCase().trim();
    filtered = filtered.filter(item =>
      item.controlNo?.toLowerCase().includes(query) ||
      item.transactionID?.toLowerCase().includes(query) ||
      item.partNo?.toLowerCase().includes(query) ||
      item.partName?.toLowerCase().includes(query) ||
      item.source?.toLowerCase().includes(query) ||
      item.model?.toLowerCase().includes(query)
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

  // Date range filter
  if (startDate.value) {
    const start = new Date(startDate.value);
    start.setHours(0, 0, 0, 0);
    filtered = filtered.filter(item => {
      if (!item.receivedAt) return false;
      const itemDate = item.receivedAt.toDate ? item.receivedAt.toDate() : new Date(item.receivedAt);
      return itemDate >= start;
    });
  }
  if (endDate.value) {
    const end = new Date(endDate.value);
    end.setHours(23, 59, 59, 999);
    filtered = filtered.filter(item => {
      if (!item.receivedAt) return false;
      const itemDate = item.receivedAt.toDate ? item.receivedAt.toDate() : new Date(item.receivedAt);
      return itemDate <= end;
    });
  }

  return filtered.sort((a, b) => {
    const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
    const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
    return dateB - dateA;
  });
});

// Result count
const resultCount = computed(() => filteredTransactions.value.length);

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

// Check if any filters are active
const hasActiveFilters = computed(() => 
  selectedCategory.value ||
  selectedStatus.value ||
  searchQuery.value ||
  minQty.value ||
  maxQty.value ||
  minPrice.value ||
  maxPrice.value ||
  startDate.value ||
  endDate.value
);

// Clear all filters
const clearAllFilters = () => {
  searchQuery.value = '';
  debouncedSearchQuery.value = '';
  selectedCategory.value = '';
  selectedStatus.value = '';
  minQty.value = '';
  maxQty.value = '';
  minPrice.value = '';
  maxPrice.value = '';
  startDate.value = '';
  endDate.value = '';
};


// Check if Stock OUT button is enabled (within 3 days of creation)
const isStockOutButtonEnabled = (transaction) => {
  if (!transaction.createdAt) return false;
  
  const createdDate = transaction.createdAt.toDate ? transaction.createdAt.toDate() : new Date(transaction.createdAt);
  const now = new Date();
  const diffTime = now - createdDate;
  const diffDays = diffTime / (1000 * 60 * 60 * 24); // Convert to days
  
  return diffDays <= 3; // Button enabled only within 3 days
};

// Get Stock OUT expiration text
const getStockOutExpirationText = (transaction) => {
  if (!transaction.createdAt) return '';
  
  const createdDate = transaction.createdAt.toDate ? transaction.createdAt.toDate() : new Date(transaction.createdAt);
  const now = new Date();
  const diffTime = now - createdDate;
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


// Format date helper
const formatDate = (timestamp) => {
  if (!timestamp) return '-';
  if (timestamp.toDate) {
    return timestamp.toDate().toLocaleString();
  }
  return new Date(timestamp).toLocaleString();
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

// Watch inventory search query
watch(inventorySearchQuery, (newValue) => {
  debouncedSearchInventory(newValue);
});

// Select inventory item
const selectInventoryItem = (item) => {
  selectedInventoryItem.value = item;
  transactionInForm.value.partNo = item.partNo || '';
  transactionInForm.value.partName = item.partName || '';
  transactionInForm.value.unitPrice = item.unitPrice || 0;
  transactionInForm.value.controlNo = item.controlNo || '';
  inventorySearchQuery.value = `${item.partNo} - ${item.partName}`;
  showInventoryDropdown.value = false;
  
  calculateTotalPrice();
};


// Calculate total price
const calculateTotalPrice = () => {
  const qty = parseInt(transactionInForm.value.quantity) || 0;
  const price = parseFloat(transactionInForm.value.unitPrice) || 0;
  transactionInForm.value.totalPrice = qty * price;
};

// Watch quantity changes to auto-calculate total
watch(() => transactionInForm.value.quantity, () => {
  calculateTotalPrice();
});

// Load Transaction IN data
const loadTransactionIn = async () => {
  try {
    transactionInItems.value = [];
    
    console.log('Loading Transaction IN data...');
    
    const transactionInQuery = collectionGroup(db, TRANSACTION_IN_SUBCOLLECTION);
    const snapshot = await getDocs(transactionInQuery);
    
    console.log('Total Transaction_IN documents found:', snapshot.docs.length);
    
    for (const transDoc of snapshot.docs) {
      const transData = transDoc.data();
      
      const pathParts = transDoc.ref.path.split('/');
      const collectionName = pathParts.length >= 1 ? pathParts[0] : '';
      const partNo = pathParts.length >= 2 ? pathParts[1] : 'Unknown';
      
      if (collectionName !== TRANSACTION_COLLECTION) {
        console.log('Skipping document from old collection:', transDoc.ref.path);
        continue;
      }
      
      transactionInItems.value.push({
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
        source: transData.source || '',
        note: transData.note || '',
        statusIN: transData.statusIN || 'To Review',
        receivedAt: transData.receivedAt || null,
        createdAt: transData.createdAt || null
      });
    }
    
    transactionInItems.value.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
      return dateB - dateA;
    });
    
    console.log('Total Transaction IN items loaded:', transactionInItems.value.length);
  } catch (error) {
    console.error('Error loading transaction in:', error);
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
const updateInventoryStock = async (inventoryItem, quantityToAdd) => {
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
    const newQty = currentQty + parseInt(quantityToAdd);
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
      addedQty: quantityToAdd
    };
  } catch (error) {
    console.error('Error updating inventory:', error);
    throw error;
  }
};

// Process Stock IN
const processStockIn = async (transaction) => {
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
    
    // Update inventory
    const updateResult = await updateInventoryStock(validation.inventoryItem, transaction.quantity);
    
    // Update transaction status
    const pathParts = transaction.id.split('&');
    const partNo = pathParts[1] || transaction.partNo;
    const cleanPartNo = partNo.replace(/[\/\.\#\$\[\]\&]/g, '-');
    
    const transactionRef = doc(db, TRANSACTION_COLLECTION, cleanPartNo, TRANSACTION_IN_SUBCOLLECTION, transaction.id);
    await updateDoc(transactionRef, {
      statusIN: 'Stock IN',
      processedAt: new Date(),
      previousInventoryQty: updateResult.previousQty,
      newInventoryQty: updateResult.newQty
    });
    
    toast.success(
      `Stock IN successful! Added ${updateResult.addedQty} units. Inventory updated from ${updateResult.previousQty} to ${updateResult.newQty}.`,
      'Stock IN Complete'
    );
    
    // Refresh the list
    await loadTransactionIn();
  } catch (error) {
    console.error('Error processing Stock IN:', error);
    toast.error('Failed to process Stock IN: ' + error.message, 'Error');
  } finally {
    processingItems.value[transaction.id] = false;
  }
};

// Process Stock OUT (return/subtract from inventory)
const processStockOut = async (transaction) => {
  // Set processing state
  processingItems.value[transaction.id] = true;
  
  try {
    // Check if within 3-day window
    if (!isStockOutButtonEnabled(transaction)) {
      toast.error('Stock OUT button has expired. Transaction is locked after 3 days.', 'Transaction Locked');
      processingItems.value[transaction.id] = false;
      return;
    }
    
    toast.info('Validating transaction against inventory...', 'Validation');
    
    // Validate transaction against current inventory
    const validation = await validateTransactionAgainstInventory(transaction);
    
    if (!validation.valid) {
      toast.error(validation.message, 'Validation Failed');
      processingItems.value[transaction.id] = false;
      return;
    }
    
    toast.info('Updating inventory stock (subtracting quantity)...', 'Processing');
    
    // Update inventory by SUBTRACTING the quantity (negative value)
    const updateResult = await updateInventoryStock(validation.inventoryItem, -transaction.quantity);
    
    // Update transaction status to Stock OUT
    const pathParts = transaction.id.split('&');
    const partNo = pathParts[1] || transaction.partNo;
    const cleanPartNo = partNo.replace(/[\/\.\#\$\[\]\&]/g, '-');
    
    const transactionRef = doc(db, TRANSACTION_COLLECTION, cleanPartNo, TRANSACTION_IN_SUBCOLLECTION, transaction.id);
    await updateDoc(transactionRef, {
      statusIN: 'Stock OUT',
      processedAt: new Date(),
      previousInventoryQty: updateResult.previousQty,
      newInventoryQty: updateResult.newQty
    });
    
    toast.success(
      `Stock OUT successful! Removed ${transaction.quantity} units. Inventory updated from ${updateResult.previousQty} to ${updateResult.newQty}.`,
      'Stock OUT Complete'
    );
    
    // Refresh the list
    await loadTransactionIn();
  } catch (error) {
    console.error('Error processing Stock OUT:', error);
    toast.error('Failed to process Stock OUT: ' + error.message, 'Error');
  } finally {
    processingItems.value[transaction.id] = false;
  }
};

// Open Transaction IN modal
const openTransactionInModal = async () => {
  transactionInForm.value = {
    partNo: '',
    partName: '',
    quantity: 0,
    unitPrice: 0,
    totalPrice: 0,
    source: '',
    note: '',
    controlNo: '',
    transactionID: ''
  };
  inventorySearchQuery.value = '';
  selectedInventoryItem.value = null;
  showInventoryDropdown.value = false;
  
  await loadInventoryItems();
  showTransactionInModal.value = true;
};


// Close Transaction IN modal
const closeTransactionInModal = () => {
  showTransactionInModal.value = false;
};

// Save Transaction IN
const saveTransactionIn = async () => {
  try {
    if (!transactionInForm.value.partNo) {
      alert('Please select an inventory item');
      return;
    }
    
    if (!transactionInForm.value.quantity || transactionInForm.value.quantity <= 0) {
      alert('Please enter a valid quantity');
      return;
    }
    
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
    const dateTimeStr = `${dateStr}_${timeStr}`;
    
    const partNo = transactionInForm.value.partNo || 'UNKNOWN';
    const cleanPartNo = partNo.replace(/[\/\.\#\$\[\]\&]/g, '-');
    
    const documentId = `TransactionIN&${cleanPartNo}&${dateTimeStr}`;
    const transactionID = generateTransactionID();
    
    const transactionData = {
      transactionID: transactionID,
      partNo: transactionInForm.value.partNo,
      partName: transactionInForm.value.partName,
      controlNo: transactionInForm.value.controlNo,
      category: selectedInventoryItem.value?.category || '',
      model: selectedInventoryItem.value?.model || '',
      quantity: parseInt(transactionInForm.value.quantity) || 0,
      unitPrice: parseFloat(transactionInForm.value.unitPrice) || 0,
      totalPrice: parseFloat(transactionInForm.value.totalPrice) || 0,
      source: transactionInForm.value.source || '',
      note: transactionInForm.value.note || '',
      statusIN: 'To Review', // Default status
      receivedAt: now,
      createdAt: now
    };
    
    await setDoc(
      doc(db, TRANSACTION_COLLECTION, cleanPartNo, TRANSACTION_IN_SUBCOLLECTION, documentId),
      transactionData
    );
    
    toast.success('Transaction created successfully! Status: To Review', 'Transaction Created');
    
    await loadTransactionIn();
    closeTransactionInModal();
  } catch (error) {
    console.error('Error saving transaction in:', error);
    toast.error('Failed to save transaction. Please try again.', 'Error');
  }
};

// Watch for data changes
watch(transactionInItems, (newVal) => {
  console.log('transactionInItems updated:', newVal.length, 'items');
}, { deep: true, immediate: true });

// Initialize
onMounted(async () => {
  await nextTick();
  console.log('Transaction component mounted');
  await loadTransactionIn();
  console.log('Transaction data loaded, items count:', transactionInItems.value.length);
  isLoading.value = false;
  document.addEventListener('click', closeExportMenu);
  document.addEventListener('click', closePrintMenu);
  document.addEventListener('click', closeDropdown);
});

// Close dropdown when clicking outside
const closeDropdown = (event) => {
  if (!event.target.closest('.inventory-selector')) {
    showInventoryDropdown.value = false;
  }
};

const closeExportMenu = (event) => {
  if (!event.target.closest('.export-menu-container')) {
    showExportMenu.value = false;
  }
};

const closePrintMenu = (event) => {
  if (!event.target.closest('.print-menu-container')) {
    showPrintMenu.value = false;
  }
};

// Toggle export menu
const toggleExportMenu = () => {
  showExportMenu.value = !showExportMenu.value;
};

// Toggle print menu
const togglePrintMenu = () => {
  showPrintMenu.value = !showPrintMenu.value;
};

// Export functions
const exportFilteredData = () => {
  if (filteredTransactions.value.length === 0) {
    toast.warning('No filtered data to export', 'Export');
    return;
  }
  
  showExportMenu.value = false;
  exportTransactionIn(filteredTransactions.value, 'TransactionIn_Filtered_Export');
  toast.success(`Exported ${filteredTransactions.value.length} filtered items successfully!`, 'Export Complete');
};

const exportAllData = () => {
  if (transactionInItems.value.length === 0) {
    toast.warning('No data to export', 'Export');
    return;
  }
  
  showExportMenu.value = false;
  exportTransactionIn(transactionInItems.value, 'TransactionIn_All_Export');
  toast.success(`Exported all ${transactionInItems.value.length} items successfully!`, 'Export Complete');
};

// Print functions
const printFilteredData = () => {
  if (filteredTransactions.value.length === 0) {
    toast.warning('No filtered data to print', 'Print');
    return;
  }
  
  showPrintMenu.value = false;
  printTransactions(filteredTransactions.value, 'Filtered Transaction In Report');
};

const printAllData = () => {
  if (transactionInItems.value.length === 0) {
    toast.warning('No data to print', 'Print');
    return;
  }
  
  showPrintMenu.value = false;
  printTransactions(transactionInItems.value, 'Complete Transaction In Report');
};

const printTransactions = (data, title) => {
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
          border-bottom: 2px solid #16a34a;
        }
        .company-name {
          font-size: 16pt;
          font-weight: bold;
          color: #16a34a;
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
          background: #f0fdf4;
          border-radius: 4px;
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
          color: #16a34a;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 8px;
          font-size: 8pt;
        }
        th {
          background: #16a34a;
          color: white;
          padding: 6px 4px;
          text-align: left;
          font-size: 8pt;
          font-weight: bold;
          border: 1px solid #16a34a;
        }
        td {
          padding: 4px;
          border: 1px solid #d1d5db;
          vertical-align: top;
        }
        tr:nth-child(even) {
          background: #f9fafb;
        }
        .text-right {
          text-align: right;
        }
        .text-center {
          text-align: center;
        }
        .status-badge {
          padding: 1px 4px;
          border-radius: 3px;
          font-size: 7pt;
          font-weight: bold;
          text-transform: uppercase;
        }
        .status-to-review {
          background: #fef3c7;
          color: #92400e;
        }
        .status-stock-in {
          background: #d1fae5;
          color: #065f46;
        }
        .status-stock-out {
          background: #fee2e2;
          color: #991b1b;
        }
        .total-value {
          color: #059669;
          font-weight: bold;
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
        <div class="company-address">Transaction In Management System</div>
        <div class="report-title">${title}</div>
        <div class="report-meta">Generated on ${dateStr} at ${timeStr}</div>
      </div>
      
      <div class="summary">
        <div class="summary-item">
          <div class="summary-label">Total Items</div>
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
            <th>Trans. ID</th>
            <th>Category</th>
            <th>Part No.</th>
            <th>Part Name</th>
            <th>Model</th>
            <th class="text-center">Qty</th>
            <th class="text-right">Unit Price</th>
            <th class="text-right">Total Price</th>
            <th>Source</th>
            <th>Status</th>
            <th>Received At</th>
          </tr>
        </thead>
        <tbody>
          ${data.map(item => {
            const statusClass = item.statusIN === 'Stock IN' ? 'status-stock-in' : 
                               item.statusIN === 'Stock OUT' ? 'status-stock-out' : 'status-to-review';
            const receivedDate = item.receivedAt ? 
              (item.receivedAt.toDate ? item.receivedAt.toDate().toLocaleDateString() : new Date(item.receivedAt).toLocaleDateString()) 
              : '-';
            return `
            <tr>
              <td>${item.controlNo || '-'}</td>
              <td>${item.transactionID || '-'}</td>
              <td>${(item.category || '-').toUpperCase()}</td>
              <td>${(item.partNo || '-').toUpperCase()}</td>
              <td>${(item.partName || '-').toUpperCase()}</td>
              <td>${(item.model || '-').toUpperCase()}</td>
              <td class="text-center">${item.quantity || 0}</td>
              <td class="text-right">₱${(item.unitPrice || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td class="text-right total-value">₱${(item.totalPrice || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td>${(item.source || '-').toUpperCase()}</td>
              <td><span class="status-badge ${statusClass}">${item.statusIN || 'To Review'}</span></td>
              <td>${receivedDate}</td>
            </tr>
          `}).join('')}
        </tbody>
      </table>
      
      <div class="footer">
        <p>ISUZU Calapan Transaction In Management System &copy; ${now.getFullYear()}</p>
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
  if (fileInput.value) {
    fileInput.value.value = '';
  }
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
    const items = await parseTransactionInExcelFile(file);
    
    if (items.length === 0) {
      toast.warning('No data found in file', 'Empty File');
      return;
    }
    
    // Process and validate items
    const { validItems, invalidItems } = processTransactionInImportItems(items);
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
        // Get inventory item by part number to get control number and other details
        const inventoryItem = await getInventoryItemByPartNo(item.partNo);
        
        if (!inventoryItem) {
          console.warn(`Inventory item not found for part number: ${item.partNo}`);
          errorCount++;
          continue;
        }
        
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
        const dateTimeStr = `${dateStr}_${timeStr}`;
        
        const cleanPartNo = item.partNo.replace(/[\/\.\#\$\[\]\&]/g, '-');
        const documentId = `TransactionIN&${cleanPartNo}&${dateTimeStr}`;
        const transactionID = generateTransactionID();
        
        const transactionData = {
          transactionID: transactionID,
          partNo: item.partNo.toUpperCase(),
          partName: (item.partName || inventoryItem.partName || '').toUpperCase(),
          controlNo: inventoryItem.controlNo || '',
          category: item.category.toLowerCase(),
          model: (item.model || inventoryItem.model || '').toUpperCase(),
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          source: item.source.toUpperCase(),
          note: (item.note || '').toUpperCase(),
          statusIN: 'To Review',
          receivedAt: now,
          createdAt: now
        };
        
        await setDoc(
          doc(db, TRANSACTION_COLLECTION, cleanPartNo, TRANSACTION_IN_SUBCOLLECTION, documentId),
          transactionData
        );
        
        successCount++;
      } catch (err) {
        console.error('Error importing item:', err);
        errorCount++;
      }
    }
    
    // Reload transactions
    await loadTransactionIn();
    
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

</script>
