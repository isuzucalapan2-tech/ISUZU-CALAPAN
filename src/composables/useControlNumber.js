import { db } from '../Firebase/Firebase';
import { doc, getDoc, setDoc, runTransaction, collection, getDocs } from 'firebase/firestore';

const COUNTER_DOC_ID = 'transactionControlNo';
const COUNTER_COLLECTION = 'Counters';
const PREFIX = 'CTRL';

// Inventory collection reference helper
const getInventoryDocRef = (category) => {
  const lowerCategory = category.toLowerCase();
  return doc(db, "Inventory", `isuzu11&calapan16&inventory2019&${lowerCategory}`);
};

const getCategoryDocRef = () => {
  return doc(db, "Category", "categories");
};



/**
 * Get the next auto-incremented Control Number
 * Format: ISZ-0001, ISZ-0002, etc.
 * Uses Firestore transaction to handle concurrent access safely
 */
export const getNextControlNumber = async () => {
  const counterRef = doc(db, COUNTER_COLLECTION, COUNTER_DOC_ID);
  
  try {
    const newControlNumber = await runTransaction(db, async (transaction) => {
      const counterDoc = await transaction.get(counterRef);
      
      let lastNumber = 0;
      
      if (counterDoc.exists()) {
        lastNumber = counterDoc.data().lastNumber || 0;
      }
      
      const nextNumber = lastNumber + 1;
      const formattedNumber = String(nextNumber).padStart(4, '0');
      const controlNumber = `${PREFIX}-${formattedNumber}`;
      
      // Update the counter
      transaction.set(counterRef, { lastNumber: nextNumber }, { merge: true });
      
      return controlNumber;
    });
    
    return newControlNumber;
  } catch (error) {
    console.error('Error generating control number:', error);
    throw new Error('Failed to generate control number');
  }
};

/**
 * Initialize the counter document if it doesn't exist
 * Call this once when setting up the system
 */
export const initializeControlNumberCounter = async () => {
  const counterRef = doc(db, COUNTER_COLLECTION, COUNTER_DOC_ID);
  
  try {
    const counterDoc = await getDoc(counterRef);
    
    if (!counterDoc.exists()) {
      await setDoc(counterRef, { lastNumber: 0 });
      console.log('Control number counter initialized');
    }
  } catch (error) {
    console.error('Error initializing counter:', error);
  }
};

/**
 * Get current counter value without incrementing
 * Useful for display purposes
 */
export const getCurrentControlNumber = async () => {
  const counterRef = doc(db, COUNTER_COLLECTION, COUNTER_DOC_ID);
  
  try {
    const counterDoc = await getDoc(counterRef);
    
    if (counterDoc.exists()) {
      const lastNumber = counterDoc.data().lastNumber || 0;
      const formattedNumber = String(lastNumber).padStart(4, '0');
      return `${PREFIX}-${formattedNumber}`;
    }
    
    return `${PREFIX}-0000`;
  } catch (error) {
    console.error('Error getting current control number:', error);
    return `${PREFIX}-0000`;
  }
};

/**
 * Load all inventory items from all categories
 * Returns array of inventory items with controlNo, partNo, partName, model, category, etc.
 */
export const loadAllInventoryItems = async () => {
  try {
    // First get all categories
    const categoryDoc = await getDoc(getCategoryDocRef());
    if (!categoryDoc.exists()) {
      return [];
    }
    
    const categories = categoryDoc.data().list || [];
    const allItems = [];
    
    // Load from each category document
    for (const category of categories) {
      const docRef = getInventoryDocRef(category);
      try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          // Each field in the document is a control number map
          Object.keys(data).forEach(controlNo => {
            if (controlNo.startsWith('ISZ-')) {
              const itemData = data[controlNo];
              allItems.push({
                id: controlNo,
                controlNo: controlNo,
                category: category, // Explicitly set category from the document
                partNo: itemData.partNo || '',
                partName: itemData.partName || '',
                model: itemData.model || '',
                description: itemData.description || '',
                quantity: itemData.quantity || 0,
                unitPrice: itemData.unitPrice || 0,
                totalValue: itemData.totalValue || 0,
                createdAt: itemData.createdAt || null,
                updatedAt: itemData.updatedAt || null
              });
            }
          });
        }
      } catch (err) {
        console.warn(`Error loading category ${category}:`, err);
      }
    }
    
    return allItems;
  } catch (error) {
    console.error('Error loading all inventory items:', error);
    return [];
  }
};


/**
 * Get inventory item by part number
 * Returns the inventory item with controlNo or null if not found
 */
export const getInventoryItemByPartNo = async (partNo) => {
  try {
    const allItems = await loadAllInventoryItems();
    const item = allItems.find(item => item.partNo?.toUpperCase() === partNo.toUpperCase());
    return item || null;
  } catch (error) {
    console.error('Error getting inventory item by partNo:', error);
    return null;
  }
};

/**
 * Get control number from inventory by part number
 * Returns the controlNo string or null if not found
 */
export const getControlNoByPartNo = async (partNo) => {
  const item = await getInventoryItemByPartNo(partNo);
  return item ? item.controlNo : null;
};

/**
 * Generate a unique transaction ID
 * Format: TXN-{timestamp}-{random}
 * Example: TXN-20250221-143052-ABC123
 */
export const generateTransactionID = () => {
  const now = new Date();
  const dateStr = now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0');
  const timeStr = String(now.getHours()).padStart(2, '0') +
    String(now.getMinutes()).padStart(2, '0') +
    String(now.getSeconds()).padStart(2, '0');
  const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  return `TXN-${dateStr}-${timeStr}-${randomStr}`;
};

/**
 * Search inventory items by query string
 * Searches in partNo, partName, model, and description
 */
export const searchInventoryItems = async (query) => {
  try {
    const allItems = await loadAllInventoryItems();
    if (!query || query.trim() === '') {
      return allItems;
    }
    
    const searchTerm = query.toLowerCase().trim();
    return allItems.filter(item => 
      item.partNo?.toLowerCase().includes(searchTerm) ||
      item.partName?.toLowerCase().includes(searchTerm) ||
      item.model?.toLowerCase().includes(searchTerm) ||
      item.description?.toLowerCase().includes(searchTerm) ||
      item.controlNo?.toLowerCase().includes(searchTerm)
    );
  } catch (error) {
    console.error('Error searching inventory items:', error);
    return [];
  }
};
