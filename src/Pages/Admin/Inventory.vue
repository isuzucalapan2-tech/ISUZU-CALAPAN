<template>
  <!-- 🔧 LOADING -->
  <div v-if="isLoading" class="min-h-screen flex items-center justify-center">
    <Loaders />
  </div>

  <!-- MAIN CONTENT -->
  <div v-else :class="themeClass" :style="themeStyle" class="min-h-screen flex flex-col">
    <main class="flex-1 p-4 sm:p-6">

      <!-- Action Bar -->
      <div :class="cardClass" :style="cardStyle" class="shadow rounded-lg p-4 mb-4 sm:mb-6 border-l-2 border-red-600 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
         <!-- Page Title -->
      <h1 :class="textClass" class="text-2xl sm:text-2xl font-bold mb-4 sm:mb-6 border-l-4 border-red-600 pl-3 sm:pl-4 flex items-center gap-2">
        <Boxes class="w-6 h-6 sm:w-7 sm:h-7 text-red-600" />
        Inventory Management
      </h1>
        <div class="flex flex-col gap-3 flex-1">
          <!-- Search and Category Row -->
          <div class="flex flex-col sm:flex-row gap-3">
            <!-- Search -->
            <div class="relative flex-1 max-w-md">
              <Search class="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" /> 
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search by part name, number, control no, category..."
                :class="inputClass"
                class="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 transition-all duration-200"
              />
            </div>
            
            <!-- Category Filter -->
            <select
              v-model="selectedCategory"
              :class="inputClass"
              class="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 transition-all duration-200"
            >
              <option value="">All Categories</option>
              <option v-for="cat in availableCategories" :key="cat" :value="cat">{{ cat.toUpperCase() }}</option>
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
          </div>

          <!-- Advanced Filters Row -->
          <div class="flex flex-col sm:flex-row gap-3 items-center flex-wrap">
            <!-- Quantity Range -->
            <div class="flex items-center gap-2">
              <span :class="subTextClass" class="text-sm font-medium">Qty:</span>
              <input
                v-model="minQty"
                type="number"
                min="0"
                placeholder="Min"
                :class="inputClass"
                class="w-20 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-red-600"
              />
              <span :class="subTextClass">-</span>
              <input
                v-model="maxQty"
                type="number"
                min="0"
                placeholder="Max"
                :class="inputClass"
                class="w-20 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-red-600"
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
                class="w-24 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-red-600"
              />
              <span :class="subTextClass">-</span>
              <input
                v-model="maxPrice"
                type="number"
                min="0"
                step="0.01"
                placeholder="Max"
                :class="inputClass"
                class="w-24 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>

            <!-- Result Count Badge -->
            <div class="ml-auto">
              <span class="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                {{ resultCount }} item{{ resultCount !== 1 ? 's' : '' }} found
              </span>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col gap-2">
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
              :disabled="inventoryItems.length === 0"
              :class="{ 'opacity-50 cursor-not-allowed': inventoryItems.length === 0 }"
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
                :disabled="filteredInventory.length === 0"
              >
                <Filter class="w-4 h-4 text-green-600" />
                Export Filtered ({{ filteredInventory.length }})
              </button>
              <div class="border-t" :class="borderClass"></div>
              <button
                @click="exportAllData"
                class="w-full text-left px-4 py-2 text-sm hover:bg-green-50 dark:hover:bg-green-900 transition-colors flex items-center gap-2"
                :class="textClass"
              >
                <Database class="w-4 h-4 text-blue-600" />
                Export All ({{ inventoryItems.length }})
              </button>
            </div>
          </div>

          <!-- Print Button with Dropdown -->
          <div class="relative">
            <button
              @click="togglePrintMenu"
              class="flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 w-full"
              :disabled="inventoryItems.length === 0"
              :class="{ 'opacity-50 cursor-not-allowed': inventoryItems.length === 0 }"
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
                :disabled="filteredInventory.length === 0"
              >
                <Filter class="w-4 h-4 text-purple-600" />
                Print Filtered ({{ filteredInventory.length }})
              </button>
              <div class="border-t" :class="borderClass"></div>
              <button
                @click="printAllData"
                class="w-full text-left px-4 py-2 text-sm hover:bg-purple-50 dark:hover:bg-purple-900 transition-colors flex items-center gap-2"
                :class="textClass"
              >
                <Database class="w-4 h-4 text-blue-600" />
                Print All ({{ inventoryItems.length }})
              </button>
            </div>
          </div>

          <!-- Add Button -->
          <button
            @click="openAddModal"
            class="flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
          >
            <Plus class="w-5 h-5" />
            Add Item
          </button>
        </div>



      </div>

      <!-- Inventory Table -->
      <div :class="cardClass" :style="cardStyle" class="shadow rounded-lg border-l-2 border-red-600 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y border-t-2 border-red-600">
            <thead :class="tableHeaderClass" class="border-b-2 border-red-600">
              <tr>
                <th class="px-4 py-3 text-left text-sm font-medium">Control No.</th>
                <th class="px-4 py-3 text-left text-sm font-medium">Category</th>
                <th class="px-4 py-3 text-left text-sm font-medium">Part Name</th>
                <th class="px-4 py-3 text-left text-sm font-medium">Part No.</th>
                <th class="px-4 py-3 text-left text-sm font-medium">Model</th>
                <th class="px-4 py-3 text-left text-sm font-medium">Description</th>
                <th class="px-4 py-3 text-left text-sm font-medium">Quantity</th>
                <th class="px-4 py-3 text-left text-sm font-medium">Unit Price</th>
                <th class="px-4 py-3 text-left text-sm font-medium">Total Value</th>
                <th class="px-4 py-3 text-left text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in paginatedInventory"
                :key="item.id"
                :class="tableRowClass"
                class="transition duration-200 hover:shadow-md"
              >

                <td :class="textClass" class="px-4 py-3 text-sm font-mono">{{ item.controlNo }}</td>
                <td :class="textClass" class="px-4 py-3 text-sm">
                  <span class="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800 uppercase">
                    {{ item.category }}
                  </span>
                </td>
                <td :class="textClass" class="px-4 py-3 text-sm font-medium uppercase">{{ item.partName }}</td>
                <td :class="textClass" class="px-4 py-3 text-sm uppercase">{{ item.partNo }}</td>
                <td :class="textClass" class="px-4 py-3 text-sm uppercase">{{ item.model }}</td>
                <td :class="textClass" class="px-4 py-3 text-sm max-w-xs truncate uppercase">{{ item.description }}</td>
                <td :class="textClass" class="px-4 py-3 text-sm font-medium text-center">
                  {{ item.quantity || 0 }}
                </td>
                <td :class="textClass" class="px-4 py-3 text-sm font-medium">
                  ₱{{ formatPrice(item.unitPrice) }}
                </td>
                <td :class="textClass" class="px-4 py-3 text-sm font-medium text-green-600">
                  ₱{{ formatPrice(item.totalValue) }}
                </td>
                <td class="px-4 py-3 text-sm">
                  <div class="flex gap-2">
                    <button
                      @click="editItem(item)"
                      class="flex items-center gap-1 bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 hover:shadow-lg transition-all duration-200"
                    >
                      <Edit class="w-4 h-4" />
                    </button>
                    <button
                      @click="deleteItem(item)"
                      class="flex items-center gap-1 bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 hover:shadow-lg transition-all duration-200"
                    >
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="paginatedInventory.length === 0">
                <td colspan="10" :class="subTextClass" class="text-center py-8">
                  <div class="flex justify-center items-center gap-2">
                    <PackageX class="w-5 h-5" />
                    No inventory items found
                  </div>
                </td>
              </tr>

            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="filteredInventory.length > 0" class="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-3">
          <!-- Items info -->
          <div :class="subTextClass" class="text-sm">
            Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to {{ Math.min(currentPage * itemsPerPage, filteredInventory.length) }} of {{ filteredInventory.length }} items
          </div>

          <!-- Pagination controls -->
          <div class="flex items-center gap-2">
            <!-- Items per page selector -->
            <select
              v-model="itemsPerPage"
              :class="inputClass"
              class="px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-red-600"
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
                    ? 'bg-red-600 text-white'
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


    <!-- Add/Edit Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-opacity-100 backdrop-blur-sm flex items-center justify-center z-50 p-4">

      <div :class="cardClass" :style="cardStyle" class="rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b-2 border-red-600 flex justify-between items-center">
          <h2 :class="textClass" class="text-xl font-bold flex items-center gap-2">
            <Package class="w-6 h-6 text-red-600" />
            {{ isEditing ? 'Edit Item' : 'Add NEW Item' }}
          </h2>
          <button @click="closeModal" class="text-gray-500 hover:text-gray-700 transition-colors">
            <X class="w-6 h-6" />
          </button>
        </div>

        <form @submit.prevent="saveItem" class="p-6 space-y-4">
          <!-- Category -->
          <div>
            <label :class="textClass" class="block text-sm font-medium mb-1">Category *</label>
            <div class="flex gap-2">
              <select
                v-model="form.category"
                :class="inputClass"
                class="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 transition-all duration-200"
                required
              >
                <option value="">Select or type new category</option>
                <option v-for="cat in availableCategories" :key="cat" :value="cat">{{ cat.toUpperCase() }}</option>
              </select>
              <input
                v-model="newCategory"
                type="text"
                placeholder="New category"
                :class="inputClass"
                class="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 transition-all duration-200 w-40"
              />
              <button
                type="button"
                @click="addNewCategory"
                class="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-all duration-200"
              >
                <Plus class="w-5 h-5" />
              </button>
            </div>
          </div>

          <!-- Part Name & Part No -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label :class="textClass" class="block text-sm font-medium mb-1">Part Name *</label>
              <input
                v-model="form.partName"
                @input="form.partName = form.partName.toUpperCase()"
                type="text"
                placeholder="ENTER PART NAME"
                :class="inputClass"
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 transition-all duration-200"
                required
              />
            </div>
            <div>
              <label :class="textClass" class="block text-sm font-medium mb-1">Part Number *</label>
              <input
                v-model="form.partNo"
                @input="form.partNo = form.partNo.toUpperCase()"
                type="text"
                placeholder="ENTER PART NUMBER"
                :class="inputClass"
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 transition-all duration-200"
                required
              />
            </div>
          </div>

          <!-- Model, Quantity & Unit Price -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label :class="textClass" class="block text-sm font-medium mb-1">Model *</label>
              <input
                v-model="form.model"
                @input="form.model = form.model.toUpperCase()"
                type="text"
                placeholder="ENTER MODEL"
                :class="inputClass"
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 transition-all duration-200"
                required
              />
            </div>
            <div>
              <label :class="textClass" class="block text-sm font-medium mb-1">Quantity *</label>
              <input
                v-model="form.quantity"
                type="number"
                min="0"
                placeholder="0"
                :class="inputClass"
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 transition-all duration-200"
                required
              />
            </div>
            <div>
              <label :class="textClass" class="block text-sm font-medium mb-1">Unit Price (₱) *</label>
              <input
                v-model="form.unitPrice"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                :class="inputClass"
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 transition-all duration-200"
                required
              />
            </div>
          </div>

          <!-- Total Value (Auto-calculated) -->
          <div v-if="!isEditing">
            <label :class="textClass" class="block text-sm font-medium mb-1">Total Value (Auto-calculated)</label>
            <div class="px-4 py-2 border rounded-lg bg-green-50 font-mono text-sm text-green-700 font-medium" :class="textClass">
              ₱{{ formatPrice(calculatedTotalValue) }}
            </div>
          </div>

          <!-- Description -->
          <div>
            <label :class="textClass" class="block text-sm font-medium mb-1">Description</label>
            <textarea
              v-model="form.description"
              rows="3"
              placeholder="Enter Description (optional)"
              :class="inputClass"
              class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 transition-all duration-200 resize-none"
            ></textarea>
          </div>


          <!-- Control Number Preview (Read-only) -->
          <div v-if="!isEditing">
            <label :class="textClass" class="block text-sm font-medium mb-1">Control Number (Auto-generated)</label>
            <div class="px-4 py-2 border rounded-lg bg-gray-100 font-mono text-sm" :class="textClass">
              {{ previewControlNo || 'Will be generated on save' }}
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex justify-end gap-3 pt-4 border-t" :class="borderClass">
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="isSaving"
              class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isSaving ? "Saving..." : "Save Item" }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Import Modal -->
    <div v-if="showImportModal" class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div :class="cardClass" :style="cardStyle" class="rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b-2 border-blue-600 flex justify-between items-center">
          <h2 :class="textClass" class="text-xl font-bold flex items-center gap-2">
            <FileSpreadsheet class="w-6 h-6 text-blue-600" />
            Import Inventory from Excel
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
                  <li>Part Name (required)</li>
                  <li>Part No. (required)</li>
                  <li>Model (required)</li>
                  <li>Quantity (required, number)</li>
                  <li>Unit Price (required, number)</li>
                  <li>Description (optional)</li>
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
                      <th class="px-3 py-2 text-left text-xs font-medium">Part Name</th>
                      <th class="px-3 py-2 text-left text-xs font-medium">Part No.</th>
                      <th class="px-3 py-2 text-left text-xs font-medium">Model</th>
                      <th class="px-3 py-2 text-left text-xs font-medium">Qty</th>
                      <th class="px-3 py-2 text-left text-xs font-medium">Unit Price</th>
                      <th class="px-3 py-2 text-left text-xs font-medium">Total Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, index) in importPreview.validItems.slice(0, 10)" :key="index" :class="tableRowClass">
                      <td :class="textClass" class="px-3 py-2 text-xs uppercase">{{ item.category }}</td>
                      <td :class="textClass" class="px-3 py-2 text-xs uppercase">{{ item.partName }}</td>
                      <td :class="textClass" class="px-3 py-2 text-xs uppercase">{{ item.partNo }}</td>
                      <td :class="textClass" class="px-3 py-2 text-xs uppercase">{{ item.model }}</td>
                      <td :class="textClass" class="px-3 py-2 text-xs">{{ item.quantity }}</td>
                      <td :class="textClass" class="px-3 py-2 text-xs">₱{{ formatPrice(item.unitPrice) }}</td>
                      <td :class="textClass" class="px-3 py-2 text-xs text-green-600">₱{{ formatPrice(item.totalValue) }}</td>
                    </tr>
                    <tr v-if="importPreview.validItems.length > 10">
                      <td :class="subTextClass" class="px-3 py-2 text-xs text-center" colspan="7">
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
                      <th class="px-3 py-2 text-left text-xs font-medium text-red-700 dark:text-red-300">Part Name</th>
                      <th class="px-3 py-2 text-left text-xs font-medium text-red-700 dark:text-red-300">Errors</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, index) in importPreview.invalidItems" :key="index" class="bg-red-50/50 dark:bg-red-900/50">
                      <td class="px-3 py-2 text-xs text-red-600">{{ item.rowNumber }}</td>
                      <td :class="textClass" class="px-3 py-2 text-xs">{{ item.partName || 'N/A' }}</td>
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
  Printer
} from "lucide-vue-next";








/* =====================
   STATE
===================== */
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
const { exportInventory, parseExcelFile, processImportItems } = useExcelExport();



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
  if (!form.value.category || !form.value.partName || !form.value.partNo || !form.value.model) {
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
        .header {
          text-align: center;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 2px solid #dc2626;
        }
        .logo {
          max-height: 50px;
          margin-bottom: 8px;
        }
        .company-name {
          font-size: 18pt;
          font-weight: bold;
          color: #dc2626;
          margin-bottom: 3px;
        }
        .company-address {
          font-size: 9pt;
          color: #666;
          margin-bottom: 8px;
        }
        .report-title {
          font-size: 14pt;
          font-weight: bold;
          margin-bottom: 5px;
        }
        .report-meta {
          font-size: 9pt;
          color: #666;
          margin-bottom: 10px;
        }
        .summary {
          display: flex;
          justify-content: space-between;
          margin-bottom: 15px;
          padding: 10px;
          background: #f3f4f6;
          border-radius: 5px;
        }
        .summary-item {
          text-align: center;
        }
        .summary-label {
          font-size: 8pt;
          color: #666;
          text-transform: uppercase;
        }
        .summary-value {
          font-size: 14pt;
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
          font-size: 9pt;
          font-weight: bold;
          border: 1px solid #dc2626;
        }
        td {
          padding: 6px;
          border: 1px solid #d1d5db;
          font-size: 9pt;
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
        .category-badge {
          background: #fee2e2;
          color: #991b1b;
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 8pt;
          font-weight: bold;
          text-transform: uppercase;
        }
        .total-value {
          color: #059669;
          font-weight: bold;
        }
        .footer {
          margin-top: 15px;
          padding-top: 10px;
          border-top: 1px solid #d1d5db;
          font-size: 8pt;
          color: #666;
          text-align: center;
        }
        .page-break {
          page-break-after: always;
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
        <div class="company-address">Inventory Management System</div>
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
            <th>Category</th>
            <th>Part Name</th>
            <th>Part No.</th>
            <th>Model</th>
            <th>Description</th>
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
    
    // Process and validate items
    const { validItems, invalidItems } = processImportItems(items);
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
</style>
