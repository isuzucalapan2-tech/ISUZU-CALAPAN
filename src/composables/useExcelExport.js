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
          value = new Date(value).toLocaleDateString();
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
   * Validate inventory item
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

  return {
    exportToExcel,
    exportInventory,
    parseExcelFile,
    validateInventoryItem,
    processImportItems
  };
}
