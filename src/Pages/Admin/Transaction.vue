<template>
  <div v-if="!isLoading" :class="themeClass" :style="themeStyle" class="min-h-screen flex flex-col">
    <!-- Main Content -->
    <main class="flex-1 p-6">
      <h1 :class="textClass" class="text-3xl font-bold mb-6 border-l-4 border-green-600 pl-4 flex items-center gap-2">
        <ArrowDownCircle class="w-7 h-7 text-green-600" />
        Transaction In
      </h1>

      <!-- Add New Record Button -->
      <div :class="cardClass" :style="cardStyle" class="shadow-lg rounded-lg p-6 mb-6 border-l-2 border-green-600">
        <div class="flex justify-between items-center">
          <div>
            <h2 class="text-xl font-bold flex items-center gap-2 text-green-600">
              <ArrowDownCircle class="w-6 h-6" />
              Incoming Parts / Stock In Records
            </h2>
            <p :class="subTextClass" class="mt-2">Records of parts received from outside sources</p>
          </div>
          <button
            @click="openTransactionInModal"
            class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-medium flex items-center gap-2"
          >
            <Plus class="w-5 h-5" />
            Add New Record
          </button>
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
                v-for="item in transactionInItems"
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
                    <!-- Show Stock OUT button only for Stock IN status (to reverse/return) -->
                    <button
                      v-if="item.statusIN === 'Stock IN'"
                      @click="processStockOut(item)"
                      :disabled="processingItems[item.id]"
                      class="flex items-center gap-1 bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700 transition-all duration-200 disabled:opacity-50"
                    >
                      <X class="w-3 h-3" />
                      {{ processingItems[item.id] ? 'Processing...' : 'Stock OUT' }}
                    </button>
                    <span
                      v-if="item.statusIN === 'Stock OUT'"
                      class="text-red-600 font-medium text-xs flex items-center gap-1"
                    >
                      <XCircle class="w-4 h-4" />
                      Retrieved
                    </span>
                  </div>
                </td>

              </tr>
              <tr v-if="transactionInItems.length === 0">
                <td colspan="14" :class="subTextClass" class="text-center p-8">
                  <div class="flex justify-center items-center gap-2">
                    <ArrowDownCircle class="w-5 h-5" />
                    No incoming transaction records found
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
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
                v-model="searchQuery"
                type="text"
                :class="inputClass"
                class="w-full border rounded px-4 py-2 pl-10"
                placeholder="Search by part number, name, or model..."
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
import Loaders from '../../components/Loaders.vue';
import { Plus, ArrowDownCircle, Search, Check, X, CheckCircle, XCircle } from 'lucide-vue-next';

// Toast notification
const toast = useToast();

// Loading state
const isLoading = ref(true);

// Transaction data
const transactionInItems = ref([]);

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
const searchQuery = ref('');
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

// Watch search query
watch(searchQuery, (newValue) => {
  debouncedSearchInventory(newValue);
});

// Select inventory item
const selectInventoryItem = (item) => {
  selectedInventoryItem.value = item;
  transactionInForm.value.partNo = item.partNo || '';
  transactionInForm.value.partName = item.partName || '';
  transactionInForm.value.unitPrice = item.unitPrice || 0;
  transactionInForm.value.controlNo = item.controlNo || '';
  searchQuery.value = `${item.partNo} - ${item.partName}`;
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
  searchQuery.value = '';
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
});

// Close dropdown when clicking outside
const closeDropdown = (event) => {
  if (!event.target.closest('.inventory-selector')) {
    showInventoryDropdown.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', closeDropdown);
});
</script>
