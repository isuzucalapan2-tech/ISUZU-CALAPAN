import * as XLSX from 'xlsx';

/**
 * Composable for Excel export and import functionality
 * @returns {Object} - Export and import functions
 */
export function useExcelExport() {

  /**
   * Export data to Excel file
   * @param {Array} data - Array of objects to export
   * @param {Array} columns - Array of column definitions [{ key: 'fieldName', header: 'Column Header', format?: 'currency'|'number'|'date' }]
   * @param {String} filename - Name of the file (without extension)
   */
  const exportToExcel = (data, columns, filename = 'export') => {
    if (!data || data.length === 0) {
      console.warn('No data to export');
      return;
    }

    // Transform data based on column definitions
    const exportData = data.map((item, index) => {
      const row = {};
      columns.forEach(col => {
        let value = item[col.key];
        
        // Handle nested properties (e.g., 'user.name')
        if (col.key.includes('.')) {
          const keys = col.key.split('.');
          value = keys.reduce((obj, key) => obj?.[key], item);
        }
        
        // Apply formatting
        if (col.format === 'currency' && typeof value === 'number') {
          value = value.toFixed(2);
        } else if (col.format === 'number' && typeof value === 'number') {
          value = value;
        } else if (col.format === 'date' && value) {
          // Handle Firestore Timestamp (has toDate method)
          if (value.toDate && typeof value.toDate === 'function') {
            value = value.toDate().toLocaleString();
          } else {
            value = new Date(value).toLocaleString();
          }
        }


        
        row[col.header] = value ?? '';
      });
      return row;
    });

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    
    // Set column widths
    const colWidths = columns.map(col => ({
      wch: Math.max(col.header.length, 15) // Minimum width of 15
    }));
    worksheet['!cols'] = colWidths;

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const fullFilename = `${filename}_${timestamp}.xlsx`;
    
    // Download file
    XLSX.writeFile(workbook, fullFilename);
  };

  /**
   * Export inventory data specifically
   * @param {Array} inventoryItems - Array of inventory items
   * @param {String} filename - Optional custom filename
   */
  const exportInventory = (inventoryItems, filename = 'Inventory_Export') => {
    const columns = [
      { key: 'controlNo', header: 'Control No.' },
      { key: 'category', header: 'Category' },
      { key: 'partName', header: 'Part Name' },
      { key: 'partNo', header: 'Part No.' },
      { key: 'model', header: 'Model' },
      { key: 'description', header: 'Description' },
      { key: 'quantity', header: 'Quantity', format: 'number' },
      { key: 'unitPrice', header: 'Unit Price (₱)', format: 'currency' },
      { key: 'totalValue', header: 'Total Value (₱)', format: 'currency' }
    ];
    
    exportToExcel(inventoryItems, columns, filename);
  };

  /**
   * Parse Excel file for import
   * @param {File} file - Excel file to parse
   * @returns {Promise<Array>} - Array of parsed items
   */
  const parseExcelFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
          
          if (jsonData.length < 2) {
            resolve([]);
            return;
          }
          
          // Extract headers (first row)
          const headers = jsonData[0].map(h => h.toString().trim());
          
          // Map column indices
          const columnMap = {
            category: headers.findIndex(h => h.toLowerCase().includes('category')),
            partName: headers.findIndex(h => h.toLowerCase().includes('part name')),
            partNo: headers.findIndex(h => h.toLowerCase().includes('part no')),
            model: headers.findIndex(h => h.toLowerCase().includes('model')),
            description: headers.findIndex(h => h.toLowerCase().includes('description')),
            quantity: headers.findIndex(h => h.toLowerCase().includes('quantity')),
            unitPrice: headers.findIndex(h => h.toLowerCase().includes('unit price') || h.toLowerCase().includes('price')),
          };
          
          // Parse data rows
          const items = [];
          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (row.length === 0) continue; // Skip empty rows
            
            const item = {
              category: columnMap.category >= 0 ? String(row[columnMap.category] || '').trim() : '',
              partName: columnMap.partName >= 0 ? String(row[columnMap.partName] || '').trim() : '',
              partNo: columnMap.partNo >= 0 ? String(row[columnMap.partNo] || '').trim() : '',
              model: columnMap.model >= 0 ? String(row[columnMap.model] || '').trim() : '',
              description: columnMap.description >= 0 ? String(row[columnMap.description] || '').trim() : '',
              quantity: columnMap.quantity >= 0 ? parseInt(row[columnMap.quantity]) || 0 : 0,
              unitPrice: columnMap.unitPrice >= 0 ? parseFloat(row[columnMap.unitPrice]) || 0 : 0,
              rowNumber: i + 1 // For error reporting
            };
            
            items.push(item);
          }
          
          resolve(items);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  };

  /**
   * Validate inventory item (legacy function - used for manual add validation)
   * @param {Object} item - Item to validate
   * @returns {Object} - Validation result { isValid: boolean, errors: string[] }
   */
  const validateInventoryItem = (item) => {
    const errors = [];
    
    // Required fields validation (same as manual add)
    if (!item.category || item.category.trim() === '') {
      errors.push('Category is required');
    }
    
    if (!item.partName || item.partName.trim() === '') {
      errors.push('Part Name is required');
    }
    
    if (!item.partNo || item.partNo.trim() === '') {
      errors.push('Part Number is required');
    }
    
    if (!item.model || item.model.trim() === '') {
      errors.push('Model is required');
    }
    
    // Quantity validation
    if (item.quantity === undefined || item.quantity === null || isNaN(item.quantity)) {
      errors.push('Quantity is required');
    } else if (item.quantity < 0) {
      errors.push('Quantity must be 0 or greater');
    }
    
    // Unit Price validation
    if (item.unitPrice === undefined || item.unitPrice === null || isNaN(item.unitPrice)) {
      errors.push('Unit Price is required');
    } else if (item.unitPrice < 0) {
      errors.push('Unit Price must be 0 or greater');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };

  /**
   * Validate inventory item for batch import with duplicate Part No checking
   * @param {Object} item - Item to validate
   * @param {Array} existingInventory - Array of existing inventory items for duplicate check
   * @returns {Object} - Validation result { isValid: boolean, errors: string[], warnings: string[], existingItem: Object|null }
   */
  const validateInventoryImportItem = (item, existingInventory = []) => {
    const errors = [];
    const warnings = [];
    let existingItem = null;
    
    // Create inventory map for fast lookup (by Part No - case insensitive)
    const inventoryMap = {};
    existingInventory.forEach(inv => {
      const key = inv.partNo?.toUpperCase();
      if (key) {
        inventoryMap[key] = inv;
      }
    });
    
    // Required fields validation
    if (!item.category || item.category.trim() === '') {
      errors.push('Category is required');
    }
    
    if (!item.partName || item.partName.trim() === '') {
      errors.push('Part Name is required');
    }
    
    if (!item.partNo || item.partNo.trim() === '') {
      errors.push('Part Number is required');
    }
    
    if (!item.model || item.model.trim() === '') {
      errors.push('Model is required');
    }
    
    // Quantity validation
    if (item.quantity === undefined || item.quantity === null || isNaN(item.quantity)) {
      errors.push('Quantity is required');
    } else if (item.quantity < 0) {
      errors.push('Quantity must be 0 or greater');
    }
    
    // Unit Price validation
    if (item.unitPrice === undefined || item.unitPrice === null || isNaN(item.unitPrice)) {
      errors.push('Unit Price is required');
    } else if (item.unitPrice < 0) {
      errors.push('Unit Price must be 0 or greater');
    }
    
    // DUPLICATE CHECK - Part No must not exist in current inventory
    if (item.partNo && item.partNo.trim() !== '') {
      const partNoKey = item.partNo.toUpperCase();
      if (inventoryMap[partNoKey]) {
        existingItem = inventoryMap[partNoKey];
        errors.push(`Part No "${item.partNo}" already exists in inventory (Control No: ${existingItem.controlNo})`);
      }
    }
    
    // Check for duplicates within the same import file
    if (item.partNo && item.partNo.trim() !== '') {
      // This will be handled in processInventoryImportItems
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      existingItem
    };
  };

  /**
   * Process items for import with validation
   * @param {Array} items - Parsed items from Excel
   * @returns {Object} - { validItems: Array, invalidItems: Array }
   */
  const processImportItems = (items) => {
    const validItems = [];
    const invalidItems = [];
    
    items.forEach((item, index) => {
      const validation = validateInventoryItem(item);
      
      if (validation.isValid) {
        // Calculate total value
        const qty = parseInt(item.quantity) || 0;
        const price = parseFloat(item.unitPrice) || 0;
        
        validItems.push({
          ...item,
          quantity: qty,
          unitPrice: price,
          totalValue: qty * price,
          // These will be set during actual save
          category: item.category.toLowerCase(),
          partName: item.partName.toUpperCase(),
          partNo: item.partNo.toUpperCase(),
          model: item.model.toUpperCase(),
          description: (item.description || '').toUpperCase()
        });
      } else {
        invalidItems.push({
          ...item,
          rowNumber: item.rowNumber || index + 2,
          errors: validation.errors
        });
      }
    });
    
    return { validItems, invalidItems };
  };

  /**
   * Export Transaction In data specifically
   * @param {Array} transactionItems - Array of transaction in items
   * @param {String} filename - Optional custom filename
   */
  const exportTransactionIn = (transactionItems, filename = 'TransactionIn_Export') => {
    const columns = [
      { key: 'controlNo', header: 'Control No.' },
      { key: 'transactionID', header: 'Transaction ID' },
      { key: 'category', header: 'Category' },
      { key: 'partNo', header: 'Part No.' },
      { key: 'partName', header: 'Part Name' },
      { key: 'model', header: 'Model' },
      { key: 'quantity', header: 'Quantity', format: 'number' },
      { key: 'unitPrice', header: 'Unit Price (₱)', format: 'currency' },
      { key: 'totalPrice', header: 'Total Price (₱)', format: 'currency' },
      { key: 'source', header: 'Source' },
      { key: 'note', header: 'Note' },
      { key: 'statusIN', header: 'Status' },
      { key: 'receivedAt', header: 'Received At', format: 'date' }
    ];
    
    exportToExcel(transactionItems, columns, filename);
  };

  /**
   * Export Transaction Out data specifically
   * @param {Array} transactionItems - Array of transaction out items
   * @param {String} filename - Optional custom filename
   */
  const exportTransactionOut = (transactionItems, filename = 'TransactionOut_Export') => {
    const columns = [
      { key: 'controlNo', header: 'Control No.' },
      { key: 'transactionID', header: 'Transaction ID' },
      { key: 'category', header: 'Category' },
      { key: 'partNo', header: 'Part No.' },
      { key: 'partName', header: 'Part Name' },
      { key: 'model', header: 'Model' },
      { key: 'quantity', header: 'Quantity', format: 'number' },
      { key: 'unitPrice', header: 'Unit Price (₱)', format: 'currency' },
      { key: 'totalPrice', header: 'Total Price (₱)', format: 'currency' },
      { key: 'client', header: 'Client' },
      { key: 'note', header: 'Note' },
      { key: 'statusOUT', header: 'Status' },
      { key: 'soldAt', header: 'Sold At', format: 'date' }
    ];
    
    exportToExcel(transactionItems, columns, filename);
  };

  /**
   * Parse Excel file for Transaction In import
   * @param {File} file - Excel file to parse
   * @returns {Promise<Array>} - Array of parsed items
   */
  const parseTransactionInExcelFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
          
          if (jsonData.length < 2) {
            resolve([]);
            return;
          }
          
          // Extract headers (first row)
          const headers = jsonData[0].map(h => h.toString().trim());
          
          // Map column indices
          const columnMap = {
            category: headers.findIndex(h => h.toLowerCase().includes('category')),
            partNo: headers.findIndex(h => h.toLowerCase().includes('part no')),
            partName: headers.findIndex(h => h.toLowerCase().includes('part name')),
            model: headers.findIndex(h => h.toLowerCase().includes('model')),
            quantity: headers.findIndex(h => h.toLowerCase().includes('quantity')),
            unitPrice: headers.findIndex(h => h.toLowerCase().includes('unit price') || h.toLowerCase().includes('price')),
            source: headers.findIndex(h => h.toLowerCase().includes('source')),
            note: headers.findIndex(h => h.toLowerCase().includes('note')),
          };
          
          // Parse data rows
          const items = [];
          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (row.length === 0) continue; // Skip empty rows
            
            const item = {
              category: columnMap.category >= 0 ? String(row[columnMap.category] || '').trim() : '',
              partNo: columnMap.partNo >= 0 ? String(row[columnMap.partNo] || '').trim() : '',
              partName: columnMap.partName >= 0 ? String(row[columnMap.partName] || '').trim() : '',
              model: columnMap.model >= 0 ? String(row[columnMap.model] || '').trim() : '',
              quantity: columnMap.quantity >= 0 ? parseInt(row[columnMap.quantity]) || 0 : 0,
              unitPrice: columnMap.unitPrice >= 0 ? parseFloat(row[columnMap.unitPrice]) || 0 : 0,
              source: columnMap.source >= 0 ? String(row[columnMap.source] || '').trim() : '',
              note: columnMap.note >= 0 ? String(row[columnMap.note] || '').trim() : '',
              rowNumber: i + 1 // For error reporting
            };
            
            items.push(item);
          }
          
          resolve(items);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  };

  /**
   * Validate Transaction In item
   * @param {Object} item - Item to validate
   * @returns {Object} - Validation result { isValid: boolean, errors: string[] }
   */
  const validateTransactionInItem = (item) => {
    const errors = [];
    
    // Required fields validation
    if (!item.category || item.category.trim() === '') {
      errors.push('Category is required');
    }
    
    if (!item.partNo || item.partNo.trim() === '') {
      errors.push('Part Number is required');
    }
    
    // Quantity validation
    if (item.quantity === undefined || item.quantity === null || isNaN(item.quantity)) {
      errors.push('Quantity is required');
    } else if (item.quantity <= 0) {
      errors.push('Quantity must be greater than 0');
    }
    
    // Unit Price validation
    if (item.unitPrice === undefined || item.unitPrice === null || isNaN(item.unitPrice)) {
      errors.push('Unit Price is required');
    } else if (item.unitPrice < 0) {
      errors.push('Unit Price must be 0 or greater');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };

  /**
   * Process Transaction In items for import with validation
   * @param {Array} items - Parsed items from Excel
   * @returns {Object} - { validItems: Array, invalidItems: Array }
   */
  const processTransactionInImportItems = (items) => {
    const validItems = [];
    const invalidItems = [];
    
    items.forEach((item, index) => {
      const validation = validateTransactionInItem(item);
      
      if (validation.isValid) {
        // Calculate total price
        const qty = parseInt(item.quantity) || 0;
        const price = parseFloat(item.unitPrice) || 0;
        
        validItems.push({
          ...item,
          quantity: qty,
          unitPrice: price,
          totalPrice: qty * price,
          // These will be set during actual save
          category: item.category.toLowerCase(),
          partNo: item.partNo.toUpperCase(),
          partName: (item.partName || '').toUpperCase(),
          model: (item.model || '').toUpperCase(),
          note: (item.note || '').toUpperCase(),
          source: (item.source || 'N/A').toUpperCase()
        });
      } else {
        invalidItems.push({
          ...item,
          rowNumber: item.rowNumber || index + 2,
          errors: validation.errors
        });
      }
    });
    
    return { validItems, invalidItems };
  };

  /**
   * Parse Excel file for Transaction Out import (Batch Sales)
   * Handles both simple format (Part No, Quantity, Client, Note) and full format (all columns pre-filled)
   * @param {File} file - Excel file to parse
   * @returns {Promise<Array>} - Array of parsed items
   */
  const parseTransactionOutExcelFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
          
          if (jsonData.length < 2) {
            resolve([]);
            return;
          }
          
          // Extract headers (first row)
          const headers = jsonData[0].map(h => h.toString().trim());
          
          // Map column indices - flexible matching for both formats
          const columnMap = {
            controlNo: headers.findIndex(h => h.toLowerCase().includes('control no')),
            transactionID: headers.findIndex(h => h.toLowerCase().includes('transaction id')),
            category: headers.findIndex(h => h.toLowerCase().includes('category')),
            partNo: headers.findIndex(h => h.toLowerCase().includes('part no') || h.toLowerCase().includes('partno') || h.toLowerCase() === 'part number'),
            partName: headers.findIndex(h => h.toLowerCase().includes('part name')),
            model: headers.findIndex(h => h.toLowerCase().includes('model')),
            quantity: headers.findIndex(h => h.toLowerCase().includes('quantity') || h.toLowerCase().includes('qty')),
            unitPrice: headers.findIndex(h => h.toLowerCase().includes('unit price') || h.toLowerCase().includes('price')),
            totalPrice: headers.findIndex(h => h.toLowerCase().includes('total price')),
            client: headers.findIndex(h => h.toLowerCase().includes('client') || h.toLowerCase().includes('customer') || h.toLowerCase().includes('buyer')),
            note: headers.findIndex(h => h.toLowerCase().includes('note') || h.toLowerCase().includes('remarks') || h.toLowerCase().includes('description')),
            status: headers.findIndex(h => h.toLowerCase().includes('status')),
            soldAt: headers.findIndex(h => h.toLowerCase().includes('sold at') || h.toLowerCase().includes('soldat')),
          };
          
          // Check if required columns exist
          if (columnMap.partNo < 0) {
            reject(new Error('Excel file must contain a "Part No" column'));
            return;
          }
          
          // Check if this is the full format (has Control No column) or simple format
          const isFullFormat = columnMap.controlNo >= 0 && columnMap.category >= 0;
          
          // Parse data rows
          const items = [];
          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (!row || row.length === 0) continue; // Skip empty rows
            
            let item;
            
            if (isFullFormat) {
              // Full format: read from pre-filled columns
              item = {
                partNo: columnMap.partNo >= 0 ? String(row[columnMap.partNo] || '').trim() : '',
                quantity: columnMap.quantity >= 0 ? parseInt(row[columnMap.quantity]) || 0 : 0,
                client: columnMap.client >= 0 ? String(row[columnMap.client] || '').trim() : '',
                note: columnMap.note >= 0 ? String(row[columnMap.note] || '').trim() : '',
                // Full inventory data from template
                controlNo: columnMap.controlNo >= 0 ? String(row[columnMap.controlNo] || '').trim() : '',
                category: columnMap.category >= 0 ? String(row[columnMap.category] || '').trim() : '',
                partName: columnMap.partName >= 0 ? String(row[columnMap.partName] || '').trim() : '',
                model: columnMap.model >= 0 ? String(row[columnMap.model] || '').trim() : '',
                unitPrice: columnMap.unitPrice >= 0 ? parseFloat(row[columnMap.unitPrice]) || 0 : 0,
                rowNumber: i + 1
              };
            } else {
              // Simple format: only Part No, Quantity, Client, Note
              item = {
                partNo: columnMap.partNo >= 0 ? String(row[columnMap.partNo] || '').trim() : '',
                quantity: columnMap.quantity >= 0 ? parseInt(row[columnMap.quantity]) || 0 : 0,
                client: columnMap.client >= 0 ? String(row[columnMap.client] || '').trim() : '',
                note: columnMap.note >= 0 ? String(row[columnMap.note] || '').trim() : '',
                rowNumber: i + 1
              };
            }
            
            // Skip rows with empty partNo
            if (item.partNo) {
              items.push(item);
            }
          }
          
          resolve(items);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  };

  /**
   * Validate Transaction Out item against inventory
   * All fields in Excel are REQUIRED (not auto-filled)
   * @param {Object} item - Item to validate
   * @param {Object} inventoryItem - Matching inventory item from database (for stock check)
   * @returns {Object} - Validation result { isValid: boolean, errors: string[], warnings: string[] }
   */
  const validateTransactionOutItem = (item, inventoryItem) => {
    const errors = [];
    const warnings = [];
    
    // Control No validation - REQUIRED
    if (!item.controlNo || item.controlNo.trim() === '') {
      errors.push('Control No. is required');
    }
    
    // Part No validation - REQUIRED
    if (!item.partNo || item.partNo.trim() === '') {
      errors.push('Part No. is required');
    }
    
    // Category validation - REQUIRED
    if (!item.category || item.category.trim() === '') {
      errors.push('Category is required');
    }
    
    // Part Name validation - REQUIRED
    if (!item.partName || item.partName.trim() === '') {
      errors.push('Part Name is required');
    }
    
    // Model validation - REQUIRED
    if (!item.model || item.model.trim() === '') {
      errors.push('Model is required');
    }
    
    // Quantity validation - REQUIRED and must be > 0
    if (item.quantity === undefined || item.quantity === null || isNaN(item.quantity)) {
      errors.push('Quantity is required');
    } else if (item.quantity <= 0) {
      errors.push('Quantity must be greater than 0');
    }
    
    // Stock validation - only if inventory item found
    if (inventoryItem && item.quantity > inventoryItem.quantity) {
      errors.push(`Insufficient stock. Available: ${inventoryItem.quantity}, Requested: ${item.quantity}`);
    }
    
    // Client validation - REQUIRED
    if (!item.client || item.client.trim() === '') {
      errors.push('Client Name is required');
    }
    
    // Note is optional - no validation needed
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      inventoryItem
    };
  };

  /**
   * Process Transaction Out items for import with validation against inventory
   * @param {Array} items - Parsed items from Excel
   * @param {Array} inventoryItems - All inventory items for lookup
   * @returns {Object} - { validItems: Array, invalidItems: Array }
   */
  const processTransactionOutImportItems = (items, inventoryItems) => {
    const validItems = [];
    const invalidItems = [];
    
    // Create a map for fast inventory lookup by partNo
    const inventoryMap = {};
    inventoryItems.forEach(inv => {
      const key = inv.partNo?.toUpperCase();
      if (key) {
        inventoryMap[key] = inv;
      }
    });
    
    items.forEach((item, index) => {
      // Find matching inventory item
      const inventoryItem = inventoryMap[item.partNo?.toUpperCase()] || null;
      
      // Validate
      const validation = validateTransactionOutItem(item, inventoryItem);
      
      if (validation.isValid) {
        // Calculate total price
        const qty = parseInt(item.quantity) || 0;
        const price = parseFloat(inventoryItem.unitPrice) || 0;
        
        validItems.push({
          ...item,
          quantity: qty,
          partNo: item.partNo.toUpperCase(),
          client: item.client.toUpperCase(),
          note: (item.note || '').toUpperCase(),
          // From inventory
          partName: inventoryItem.partName || '',
          controlNo: inventoryItem.controlNo || '',
          category: inventoryItem.category || '',
          model: inventoryItem.model || '',
          unitPrice: price,
          totalPrice: qty * price,
          // For display
          availableStock: inventoryItem.quantity || 0
        });
      } else {
        invalidItems.push({
          ...item,
          rowNumber: item.rowNumber || index + 2,
          errors: validation.errors,
          warnings: validation.warnings,
          availableStock: inventoryItem?.quantity || 0
        });
      }
    });
    
    return { validItems, invalidItems };
  };

  /**
   * Generate a pre-filled template Excel file for Transaction Out import
   * Pre-fills all inventory data, user only edits Quantity, Client, Note
   * @param {Array} inventoryItems - Array of inventory items to include in template
   * @returns {void} - Downloads a template file
   */
  const downloadTransactionOutTemplate = (inventoryItems = []) => {
    // If no inventory items provided, use sample data
    const templateData = inventoryItems.length > 0 
      ? inventoryItems.slice(0, 50).map(item => ({
          'Control No.': item.controlNo || '',
          'Transaction ID': '', // Auto-generated on import
          'Category': item.category || '',
          'Part No.': item.partNo || '',
          'Part Name': item.partName || '',
          'Model': item.model || '',
          'Quantity': '', // User fills this - EDITABLE
          'Unit Price (₱)': item.unitPrice || 0,
          'Total Price (₱)': '', // Auto-calculated on import
          'Client': '', // User fills this - EDITABLE
          'Note': '', // User fills this - EDITABLE
          'Status': '', // Auto-filled as 'Pending'
          'Sold At': '' // Auto-filled with timestamp
        }))
      : [
          {
            'Control No.': 'ISZ-0001',
            'Transaction ID': '',
            'Category': 'Engine',
            'Part No.': 'PART-001',
            'Part Name': 'SAMPLE PART NAME',
            'Model': 'MODEL-X',
            'Quantity': '',
            'Unit Price (₱)': 1000,
            'Total Price (₱)': '',
            'Client': '',
            'Note': '',
            'Status': '',
            'Sold At': ''
          }
        ];
    
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    
    // Set column widths for better readability
    worksheet['!cols'] = [
      { wch: 12 }, // Control No.
      { wch: 18 }, // Transaction ID
      { wch: 12 }, // Category
      { wch: 15 }, // Part No.
      { wch: 25 }, // Part Name
      { wch: 12 }, // Model
      { wch: 10 }, // Quantity - EDITABLE
      { wch: 15 }, // Unit Price
      { wch: 15 }, // Total Price
      { wch: 20 }, // Client - EDITABLE
      { wch: 25 }, // Note - EDITABLE
      { wch: 10 }, // Status
      { wch: 18 }  // Sold At
    ];
    
    // Create a workbook with the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sales Import Template');
    
    // Add a second sheet with instructions
    const instructionData = [
      { 'INSTRUCTIONS': 'SALES IMPORT TEMPLATE GUIDE' },
      { 'INSTRUCTIONS': '' },
      { 'INSTRUCTIONS': 'COLUMNS (Auto-filled from Inventory - DO NOT EDIT):' },
      { 'INSTRUCTIONS': '• Control No. - Auto-filled from inventory' },
      { 'INSTRUCTIONS': '• Transaction ID - Auto-generated on import' },
      { 'INSTRUCTIONS': '• Category - Auto-filled from inventory' },
      { 'INSTRUCTIONS': '• Part No. - Auto-filled from inventory' },
      { 'INSTRUCTIONS': '• Part Name - Auto-filled from inventory' },
      { 'INSTRUCTIONS': '• Model - Auto-filled from inventory' },
      { 'INSTRUCTIONS': '• Unit Price (₱) - Auto-filled from inventory' },
      { 'INSTRUCTIONS': '' },
      { 'INSTRUCTIONS': 'EDITABLE COLUMNS (Fill these before import):' },
      { 'INSTRUCTIONS': '• Quantity - Enter quantity to sell (must be > 0)' },
      { 'INSTRUCTIONS': '• Client - Enter client name (required)' },
      { 'INSTRUCTIONS': '• Note - Optional notes/remarks' },
      { 'INSTRUCTIONS': '' },
      { 'INSTRUCTIONS': 'AUTO-GENERATED ON IMPORT:' },
      { 'INSTRUCTIONS': '• Total Price (₱) - Calculated from Quantity × Unit Price' },
      { 'INSTRUCTIONS': '• Status - Set to "Pending"' },
      { 'INSTRUCTIONS': '• Sold At - Timestamp of import' },
      { 'INSTRUCTIONS': '' },
      { 'INSTRUCTIONS': 'VALIDATION RULES:' },
      { 'INSTRUCTIONS': '• Part No. must exist in current inventory' },
      { 'INSTRUCTIONS': '• Quantity must not exceed available stock' },
      { 'INSTRUCTIONS': '• Client name is required' }
    ];
    
    const instructionSheet = XLSX.utils.json_to_sheet(instructionData);
    instructionSheet['!cols'] = [{ wch: 60 }];
    XLSX.utils.book_append_sheet(workbook, instructionSheet, 'Instructions');
    
    XLSX.writeFile(workbook, 'Sales_Import_Template.xlsx');
  };

  /**
   * Generate a pre-filled template Excel file for Transaction In import
   * Pre-fills all inventory data, user only edits Quantity, Source, Note
   * @param {Array} inventoryItems - Array of inventory items to include in template
   * @returns {void} - Downloads a template file
   */
  const downloadTransactionInTemplate = (inventoryItems = []) => {
    // If no inventory items provided, use sample data
    const templateData = inventoryItems.length > 0 
      ? inventoryItems.slice(0, 50).map(item => ({
          'Control No.': item.controlNo || '',
          'Transaction ID': '', // Auto-generated on import
          'Category': item.category || '',
          'Part No.': item.partNo || '',
          'Part Name': item.partName || '',
          'Model': item.model || '',
          'Quantity': '', // User fills this - EDITABLE
          'Unit Price (₱)': item.unitPrice || 0,
          'Total Price (₱)': '', // Auto-calculated on import
          'Source': '', // User fills this - EDITABLE (required)
          'Note': '', // User fills this - EDITABLE
          'Status': '', // Auto-filled as 'To Review'
          'Received At': '' // Auto-filled with timestamp
        }))
      : [
          {
            'Control No.': 'ISZ-0001',
            'Transaction ID': '',
            'Category': 'Engine',
            'Part No.': 'PART-001',
            'Part Name': 'SAMPLE PART NAME',
            'Model': 'MODEL-X',
            'Quantity': '',
            'Unit Price (₱)': 1000,
            'Total Price (₱)': '',
            'Source': '',
            'Note': '',
            'Status': '',
            'Received At': ''
          }
        ];
    
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    
    // Set column widths for better readability
    worksheet['!cols'] = [
      { wch: 12 }, // Control No.
      { wch: 18 }, // Transaction ID
      { wch: 12 }, // Category
      { wch: 15 }, // Part No.
      { wch: 25 }, // Part Name
      { wch: 12 }, // Model
      { wch: 10 }, // Quantity - EDITABLE
      { wch: 15 }, // Unit Price
      { wch: 15 }, // Total Price
      { wch: 20 }, // Source - EDITABLE
      { wch: 25 }, // Note - EDITABLE
      { wch: 10 }, // Status
      { wch: 18 }  // Received At
    ];
    
    // Create a workbook with the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Stock In Import Template');
    
    // Add a second sheet with instructions
    const instructionData = [
      { 'INSTRUCTIONS': 'STOCK IN IMPORT TEMPLATE GUIDE' },
      { 'INSTRUCTIONS': '' },
      { 'INSTRUCTIONS': 'COLUMNS (Auto-filled from Inventory - DO NOT EDIT):' },
      { 'INSTRUCTIONS': '• Control No. - Auto-filled from inventory' },
      { 'INSTRUCTIONS': '• Transaction ID - Auto-generated on import' },
      { 'INSTRUCTIONS': '• Category - Auto-filled from inventory' },
      { 'INSTRUCTIONS': '• Part No. - Auto-filled from inventory' },
      { 'INSTRUCTIONS': '• Part Name - Auto-filled from inventory' },
      { 'INSTRUCTIONS': '• Model - Auto-filled from inventory' },
      { 'INSTRUCTIONS': '• Unit Price (₱) - Auto-filled from inventory' },
      { 'INSTRUCTIONS': '' },
      { 'INSTRUCTIONS': 'EDITABLE COLUMNS (Fill these before import):' },
      { 'INSTRUCTIONS': '• Quantity - Enter quantity to add (must be > 0)' },
      { 'INSTRUCTIONS': '• Source - Enter source/supplier name (required)' },
      { 'INSTRUCTIONS': '• Note - Optional notes/remarks' },
      { 'INSTRUCTIONS': '' },
      { 'INSTRUCTIONS': 'AUTO-GENERATED ON IMPORT:' },
      { 'INSTRUCTIONS': '• Total Price (₱) - Calculated from Quantity × Unit Price' },
      { 'INSTRUCTIONS': '• Status - Set to "To Review"' },
      { 'INSTRUCTIONS': '• Received At - Timestamp of import' },
      { 'INSTRUCTIONS': '' },
      { 'INSTRUCTIONS': 'VALIDATION RULES:' },
      { 'INSTRUCTIONS': '• Part No. must exist in current inventory' },
      { 'INSTRUCTIONS': '• Quantity must be greater than 0' },
      { 'INSTRUCTIONS': '• After import, click "Stock IN" to add to inventory' }
    ];
    
    const instructionSheet = XLSX.utils.json_to_sheet(instructionData);
    instructionSheet['!cols'] = [{ wch: 60 }];
    XLSX.utils.book_append_sheet(workbook, instructionSheet, 'Instructions');
    
    XLSX.writeFile(workbook, 'StockIn_Import_Template.xlsx');
  };

  return {
    exportToExcel,
    exportInventory,
    exportTransactionIn,
    exportTransactionOut,
    parseExcelFile,
    parseTransactionInExcelFile,
    parseTransactionOutExcelFile,
    validateInventoryItem,
    validateTransactionInItem,
    validateTransactionOutItem,
    processImportItems,
    processTransactionInImportItems,
    processTransactionOutImportItems,
    downloadTransactionOutTemplate,
    downloadTransactionInTemplate
  };
}
