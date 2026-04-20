import { ref } from 'vue';
import * as XLSX from 'xlsx';

/**
 * Composable for Isuzu DTR (Daily Time Record) functionality
 * Handles attendance Excel processing, validation, and DTR generation
 * @returns {Object} - DTR processing functions and state
 */
export function useIsuzuDTR() {
  const isProcessing = ref(false);
  const processingProgress = ref(0);
  const processingMessage = ref('');

  /**
   * Parse attendance Excel file
   * Supports both legacy format and new DTR.xls format
   * New DTR.xls format: Department, Name, No., Date/Time, Location ID, ID Number, CardNo
   * @param {File} file - Excel file to parse
   * @returns {Promise<Array>} - Array of raw attendance records
   */
  const parseAttendanceExcel = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Process all sheets (tabs)
          const allRecords = [];
          
          workbook.SheetNames.forEach(sheetName => {
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            if (jsonData.length < 2) return; // Skip empty sheets
            
            // Extract headers (first row)
            const headers = jsonData[0].map(h => h?.toString().trim() || '');
            
            // Check if this is the new DTR.xls format
            const isNewFormat = headers.some(h => h.toLowerCase().includes('location id')) || 
                               headers.some(h => h.toLowerCase() === 'no.') ||
                               headers.some(h => h.toLowerCase().includes('date/time'));
            
            if (isNewFormat) {
              // Parse new DTR.xls format
              const newFormatRecords = parseNewDTRFormat(jsonData, headers, sheetName);
              allRecords.push(...newFormatRecords);
            } else {
              // Parse legacy format
              const legacyRecords = parseLegacyFormat(jsonData, headers, sheetName);
              allRecords.push(...legacyRecords);
            }
          });
          
          resolve(allRecords);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  };

  /**
   * Parse new DTR.xls format
   * Columns: Department, Name, No., Date/Time, Location ID, ID Number, CardNo
   * Name format: "LASTNAME, Firstname"
   * Date/Time format: "2/2/2026 7:35:52 AM"
   */
  const parseNewDTRFormat = (jsonData, headers, sheetName) => {
    const records = [];
    
    // Map column indices for new format
    const columnMap = {
      department: headers.findIndex(h => h.toLowerCase().includes('department')),
      name: headers.findIndex(h => h.toLowerCase().includes('name')),
      employeeNo: headers.findIndex(h => h.toLowerCase() === 'no.' || h.toLowerCase() === 'no'),
      dateTime: headers.findIndex(h => h.toLowerCase().includes('date/time') || h.toLowerCase().includes('datetime')),
      locationId: headers.findIndex(h => h.toLowerCase().includes('location id')),
      idNumber: headers.findIndex(h => h.toLowerCase().includes('id number')),
      cardNo: headers.findIndex(h => h.toLowerCase().includes('cardno') || h.toLowerCase().includes('card no')),
    };
    
    // Parse data rows
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i];
      if (!row || row.length === 0) continue; // Skip empty rows
      
      const rawDateTime = columnMap.dateTime >= 0 ? row[columnMap.dateTime] : null;
      const parsedDateTime = parseNewFormatDateTime(rawDateTime);
      
      // Parse name format "LASTNAME, Firstname"
      const rawName = columnMap.name >= 0 ? String(row[columnMap.name] || '').trim() : '';
      const parsedName = parseNameFormat(rawName);
      
      const record = {
        sheetName: sheetName,
        employeeNo: columnMap.employeeNo >= 0 ? String(row[columnMap.employeeNo] || '').trim() : '',
        department: columnMap.department >= 0 ? String(row[columnMap.department] || '').trim() : '',
        name: parsedName,
        rawName: rawName,
        dateTime: parsedDateTime,
        rawDateTime: rawDateTime,
        locationId: columnMap.locationId >= 0 ? String(row[columnMap.locationId] || '').trim() : '',
        idNumber: columnMap.idNumber >= 0 ? String(row[columnMap.idNumber] || '').trim() : '',
        cardNo: columnMap.cardNo >= 0 ? String(row[columnMap.cardNo] || '').trim() : '',
        rowNumber: i + 1,
        format: 'new'
      };
      
      // Only add records with valid datetime
      if (record.dateTime && !isNaN(record.dateTime.getTime())) {
        records.push(record);
      }
    }
    
    return records;
  };

  /**
   * Parse legacy format (original format)
   */
  const parseLegacyFormat = (jsonData, headers, sheetName) => {
    const records = [];
    
    // Map column indices - flexible matching
    const columnMap = {
      employeeNo: headers.findIndex(h => h.toLowerCase().includes('employee no') || h.toLowerCase().includes('emp no') || h.toLowerCase().includes('id')),
      department: headers.findIndex(h => h.toLowerCase().includes('department') || h.toLowerCase().includes('dept')),
      name: headers.findIndex(h => h.toLowerCase().includes('name') || h.toLowerCase().includes('employee')),
      dateTime: headers.findIndex(h => h.toLowerCase().includes('date') || h.toLowerCase().includes('time') || h.toLowerCase().includes('datetime')),
    };
    
    const hasStandardColumns = columnMap.name >= 0 || columnMap.dateTime >= 0;
    
    // Parse data rows
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i];
      if (!row || row.length === 0) continue;
      
      let record;
      
      if (hasStandardColumns) {
        record = {
          sheetName: sheetName,
          employeeNo: columnMap.employeeNo >= 0 ? String(row[columnMap.employeeNo] || '').trim() : '',
          department: columnMap.department >= 0 ? String(row[columnMap.department] || '').trim() : '',
          name: columnMap.name >= 0 ? String(row[columnMap.name] || '').trim() : sheetName,
          dateTime: columnMap.dateTime >= 0 ? parseDateTime(row[columnMap.dateTime]) : null,
          rawDateTime: columnMap.dateTime >= 0 ? row[columnMap.dateTime] : null,
          rowNumber: i + 1,
          format: 'legacy'
        };
      } else {
        // Infer format: assume first column is name/identifier, second is datetime
        record = {
          sheetName: sheetName,
          employeeNo: '',
          department: '',
          name: String(row[0] || sheetName).trim(),
          dateTime: row.length > 1 ? parseDateTime(row[1]) : null,
          rawDateTime: row.length > 1 ? row[1] : null,
          rowNumber: i + 1,
          format: 'legacy'
        };
      }
      
      if (record.dateTime && !isNaN(record.dateTime.getTime())) {
        records.push(record);
      }
    }
    
    return records;
  };

  /**
   * Parse name format "LASTNAME, Firstname" to "Firstname LASTNAME"
   */
  const parseNameFormat = (rawName) => rawName;

  /**
   * Parse Date/Time from new format (e.g., "2/2/2026 7:35:52 AM")
   */
  const parseNewFormatDateTime = (value) => {
    if (!value) return null;
    
    // If it's already a Date object
    if (value instanceof Date) return value;
    
    // If it's a number (Excel serial date)
    if (typeof value === 'number') {
      const excelEpoch = new Date(1899, 11, 30);
      const days = Math.floor(value);
      const fraction = value - days;
      const milliseconds = days * 24 * 60 * 60 * 1000 + fraction * 24 * 60 * 60 * 1000;
      return new Date(excelEpoch.getTime() + milliseconds);
    }
    
    // If it's a string (e.g., "2/2/2026 7:35:52 AM")
    if (typeof value === 'string') {
      // Try parsing with native Date
      const parsed = new Date(value);
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
      
      // Try manual parsing for formats like "M/d/yyyy h:mm:ss AM/PM"
      const manualParsed = parseManualDateTime(value);
      if (manualParsed) return manualParsed;
    }
    
    return null;
  };

  /**
   * Manually parse datetime strings like "2/2/2026 7:35:52 AM"
   */
  const parseManualDateTime = (value) => {
    // Pattern: M/d/yyyy h:mm:ss AM/PM or MM/dd/yyyy hh:mm:ss AM/PM
    const pattern = /^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})\s*(AM|PM)?$/i;
    const match = value.match(pattern);
    
    if (match) {
      const month = parseInt(match[1]) - 1; // 0-based month
      const day = parseInt(match[2]);
      const year = parseInt(match[3]);
      let hours = parseInt(match[4]);
      const minutes = parseInt(match[5]);
      const seconds = parseInt(match[6]);
      const ampm = match[7];
      
      // Convert to 24-hour format if AM/PM specified
      if (ampm) {
        if (ampm.toUpperCase() === 'PM' && hours !== 12) {
          hours += 12;
        } else if (ampm.toUpperCase() === 'AM' && hours === 12) {
          hours = 0;
        }
      }
      
      return new Date(year, month, day, hours, minutes, seconds);
    }
    
    return null;
  };

  /**
   * Parse various date/time formats
   * @param {*} value - Raw date/time value
   * @returns {Date|null} - Parsed Date object or null
   */
  const parseDateTime = (value) => {
    if (!value) return null;
    
    // If it's already a Date object
    if (value instanceof Date) return value;
    
    // If it's a number (Excel serial date)
    if (typeof value === 'number') {
      // Excel dates are serial numbers where 1 = 1900-01-01
      const excelEpoch = new Date(1899, 11, 30);
      const days = Math.floor(value);
      const fraction = value - days;
      const milliseconds = days * 24 * 60 * 60 * 1000 + fraction * 24 * 60 * 60 * 1000;
      return new Date(excelEpoch.getTime() + milliseconds);
    }
    
    // If it's a string
    if (typeof value === 'string') {
      // Try various formats
      const formats = [
        // ISO format
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,
        // Standard datetime
        /^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}(:\d{2})?/,
        // Date with slashes
        /^\d{1,2}\/\d{1,2}\/\d{4}\s+\d{1,2}:\d{2}(:\d{2})?\s*(AM|PM)?/i,
        // Date with dashes
        /^\d{1,2}-\d{1,2}-\d{4}\s+\d{1,2}:\d{2}(:\d{2})?\s*(AM|PM)?/i,
      ];
      
      // Try parsing with native Date
      const parsed = new Date(value);
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
    }
    
    return null;
  };

  /**
   * Group attendance records by employee and date
   * @param {Array} records - Raw attendance records
   * @returns {Object} - Grouped records { employeeName: { date: [records] } }
   */
  const groupByEmployeeAndDate = (records) => {
    const grouped = {};
    
    records.forEach(record => {
      const employeeName = record.name || 'Unknown';
      const date = record.dateTime ? formatDateKey(record.dateTime) : 'Unknown';
      
      if (!grouped[employeeName]) {
        grouped[employeeName] = {};
      }
      
      if (!grouped[employeeName][date]) {
        grouped[employeeName][date] = [];
      }
      
      grouped[employeeName][date].push(record);
    });
    
    return grouped;
  };

  /**
   * Format date as YYYY-MM-DD for grouping
   * @param {Date} date - Date object
   * @returns {String} - Formatted date string
   */
  const formatDateKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  /**
   * Classify time as Morning or Afternoon
   * Morning: Before 8:00 AM → 12:00 PM
   * Afternoon: 12:01 PM → onwards
   * @param {Date} dateTime - Date object
   * @returns {String} - 'morning' or 'afternoon'
   */
  const classifyTimeSegment = (dateTime) => {
    const hours = dateTime.getHours();
    const minutes = dateTime.getMinutes();
    const timeValue = hours * 60 + minutes; // Convert to minutes for easy comparison
    
    // Morning: 00:00 - 12:00 (720 minutes)
    // Afternoon: 12:01 - 23:59 (721+ minutes)
    const noonBoundary = 12 * 60; // 720 minutes = 12:00 PM
    
    return timeValue <= noonBoundary ? 'morning' : 'afternoon';
  };

  /**
   * Classify time status based on rules
   * @param {Date} dateTime - Date object
   * @param {String} type - 'in' or 'out'
   * @returns {String} - Status classification
   */
  const classifyTimeStatus = (dateTime, type) => {
    const hours = dateTime.getHours();
    const minutes = dateTime.getMinutes();
    const timeValue = hours * 60 + minutes;
    
    const eightAM = 8 * 60; // 480 minutes = 8:00 AM
    const twelvePM = 12 * 60; // 720 minutes = 12:00 PM
    const fivePM = 17 * 60; // 1020 minutes = 5:00 PM
    
    if (type === 'in') {
      // Time In classification
      if (timeValue < eightAM) {
        return 'Early';
      } else if (timeValue >= eightAM && timeValue <= twelvePM) {
        return 'Late';
      } else {
        return 'Afternoon In';
      }
    } else {
      // Time Out classification
      if (timeValue < twelvePM) {
        return 'Undertime';
      } else if (timeValue < fivePM) {
        return 'Undertime';
      } else {
        return 'Regular';
      }
    }
  };

  /**
   * Process daily attendance logs for an employee
   * Validates and assigns Time In/Out for Morning and Afternoon
   * @param {Array} dayRecords - All records for one employee on one day
   * @returns {Object} - Processed DTR entry with validation
   */
  const processDailyLogs = (dayRecords) => {
    // Sort by time
    const sortedRecords = [...dayRecords].sort((a, b) => 
      a.dateTime.getTime() - b.dateTime.getTime()
    );
    
    const totalLogs = sortedRecords.length;
    const validation = {
      isValid: true,
      errors: [],
      warnings: []
    };
    
    // Validate total log count (2-4 logs per day)
    if (totalLogs < 2) {
      validation.isValid = false;
      validation.errors.push(`Insufficient logs: Only ${totalLogs} log(s) found (minimum 2 required)`);
    } else if (totalLogs > 4) {
      validation.isValid = false;
      validation.errors.push(`Excessive logs: ${totalLogs} logs found (maximum 4 allowed)`);
    }
    
    // Separate into morning and afternoon
    const morningLogs = [];
    const afternoonLogs = [];
    
    sortedRecords.forEach(record => {
      const segment = classifyTimeSegment(record.dateTime);
      if (segment === 'morning') {
        morningLogs.push(record);
      } else {
        afternoonLogs.push(record);
      }
    });
    
    // Validate segment distribution
    if (morningLogs.length > 2) {
      validation.warnings.push(`Morning logs exceed maximum: ${morningLogs.length} logs (max 2)`);
    }
    if (afternoonLogs.length > 2) {
      validation.warnings.push(`Afternoon logs exceed maximum: ${afternoonLogs.length} logs (max 2)`);
    }
    
    // Assign Time In/Out based on log count
    const morning = assignTimeInOut(morningLogs, 'morning');
    const afternoon = assignTimeInOut(afternoonLogs, 'afternoon');
    
    // Calculate hours worked
    const hoursWorked = calculateHoursWorked(morning, afternoon);
    
    // Generate remarks
    const remarks = generateRemarks(morning, afternoon, validation, hoursWorked);
    
    return {
      date: sortedRecords[0]?.dateTime || null,
      morning,
      afternoon,
      hoursWorked,
      validation,
      rawLogs: sortedRecords
    };
  };

  /**
   * Assign Time In/Out for a time segment
   * @param {Array} logs - Logs for the segment (morning or afternoon)
   * @param {String} segment - 'morning' or 'afternoon'
   * @returns {Object} - { timeIn, timeOut, statusIn, statusOut }
   */
  const assignTimeInOut = (logs, segment) => {
    if (logs.length === 0) {
      return {
        timeIn: null,
        timeOut: null,
        statusIn: 'Missing',
        statusOut: 'Missing'
      };
    }
    
    if (logs.length === 1) {
      // Single log - could be Time In or Time Out depending on context
      const log = logs[0];
      const isBeforeMidSegment = isBeforeSegmentMidpoint(log.dateTime, segment);
      
      return {
        timeIn: isBeforeMidSegment ? log.dateTime : null,
        timeOut: isBeforeMidSegment ? null : log.dateTime,
        statusIn: isBeforeMidSegment ? classifyTimeStatus(log.dateTime, 'in') : 'Missing',
        statusOut: isBeforeMidSegment ? 'Missing' : classifyTimeStatus(log.dateTime, 'out')
      };
    }
    
    // Two logs - first is Time In, second is Time Out
    const [firstLog, secondLog] = logs;
    
    return {
      timeIn: firstLog.dateTime,
      timeOut: secondLog.dateTime,
      statusIn: classifyTimeStatus(firstLog.dateTime, 'in'),
      statusOut: classifyTimeStatus(secondLog.dateTime, 'out')
    };
  };

  /**
   * Check if time is before the midpoint of a segment
   * Used to determine if a single log should be Time In or Time Out
   * @param {Date} dateTime - Date object
   * @param {String} segment - 'morning' or 'afternoon'
   * @returns {Boolean} - True if before midpoint
   */
  const isBeforeSegmentMidpoint = (dateTime, segment) => {
    const hours = dateTime.getHours();
    const minutes = dateTime.getMinutes();
    const timeValue = hours * 60 + minutes;
    
    if (segment === 'morning') {
      // Morning: 6:00 AM - 12:00 PM, midpoint is 9:00 AM (540 minutes)
      const midpoint = 9 * 60; // 9:00 AM
      return timeValue < midpoint;
    } else {
      // Afternoon: 12:01 PM - 11:59 PM, midpoint is 4:00 PM (960 minutes)
      const midpoint = 16 * 60; // 4:00 PM
      return timeValue < midpoint;
    }
  };

  /**
   * Calculate hours worked based on Time In and Time Out
   * @param {Object} morning - Morning time data
   * @param {Object} afternoon - Afternoon time data
   * @returns {Number} - Hours worked
   */
  const calculateHoursWorked = (morning, afternoon) => {
    let totalMinutes = 0;
    
    // Calculate morning hours
    if (morning.timeIn && morning.timeOut) {
      const morningMinutes = (morning.timeOut - morning.timeIn) / (1000 * 60);
      totalMinutes += Math.max(0, morningMinutes);
    }
    
    // Calculate afternoon hours
    if (afternoon.timeIn && afternoon.timeOut) {
      const afternoonMinutes = (afternoon.timeOut - afternoon.timeIn) / (1000 * 60);
      totalMinutes += Math.max(0, afternoonMinutes);
    }
    
    // Convert to hours with 2 decimal places
    return Math.round((totalMinutes / 60) * 100) / 100;
  };

  /**
   * Generate remarks based on attendance data
   * @param {Object} morning - Morning time data
   * @param {Object} afternoon - Afternoon time data
   * @param {Object} validation - Validation results
   * @param {Number} hoursWorked - Hours worked
   * @returns {String} - Remarks
   */
  const generateRemarks = (morning, afternoon, validation, hoursWorked) => {
    const remarks = [];
    
    // Add validation errors/warnings
    if (validation.errors.length > 0) {
      remarks.push(`ERROR: ${validation.errors.join(', ')}`);
    }
    if (validation.warnings.length > 0) {
      remarks.push(`WARNING: ${validation.warnings.join(', ')}`);
    }
    
    // Add time status remarks
    if (morning.statusIn === 'Late') {
      remarks.push('Late (Morning)');
    }
    if (morning.statusOut === 'Undertime') {
      remarks.push('Undertime (Morning)');
    }
    if (afternoon.statusIn === 'Late' || afternoon.statusIn === 'Afternoon In') {
      remarks.push('Late/Absent (Morning)');
    }
    if (afternoon.statusOut === 'Undertime') {
      remarks.push('Undertime (Afternoon)');
    }
    
    // Add hours worked summary
    if (hoursWorked < 8) {
      remarks.push(`Incomplete (${hoursWorked} hrs)`);
    } else {
      remarks.push(`Complete (${hoursWorked} hrs)`);
    }
    
    return remarks.join('; ') || 'OK';
  };

  /**
   * Generate DTR data from attendance records
   * @param {Array} records - Raw attendance records from Excel
   * @returns {Array} - Processed DTR entries
   */
  const generateDTR = (records) => {
    isProcessing.value = true;
    processingMessage.value = 'Grouping records...';
    processingProgress.value = 10;
    
    // Group by employee and date
    const grouped = groupByEmployeeAndDate(records);
    
    const dtrEntries = [];
    const employees = Object.keys(grouped);
    
    employees.forEach((employeeName, empIndex) => {
      processingMessage.value = `Processing ${employeeName}...`;
      processingProgress.value = 10 + ((empIndex / employees.length) * 80);
      
      const employeeData = grouped[employeeName];
      const dates = Object.keys(employeeData).sort();
      
      // Get employee info from first record
      const firstRecord = employeeData[dates[0]]?.[0] || {};
      
      dates.forEach(date => {
        const dayRecords = employeeData[date];
        const processedDay = processDailyLogs(dayRecords);
        
        // Get the first record with new format fields
        const firstRecordWithExtras = dayRecords[0] || {};
        
        dtrEntries.push({
          employeeNo: firstRecord.employeeNo || '',
          department: firstRecord.department || '',
          name: employeeName,
          date: processedDay.date,
          dateFormatted: formatDateDisplay(processedDay.date),
          locationId: firstRecordWithExtras.locationId || '',
          idNumber: firstRecordWithExtras.idNumber || '',
          cardNo: firstRecordWithExtras.cardNo || '',
          morning: {
            in: formatTimeDisplay(processedDay.morning.timeIn),
            out: formatTimeDisplay(processedDay.morning.timeOut),
            statusIn: processedDay.morning.statusIn,
            statusOut: processedDay.morning.statusOut
          },
          afternoon: {
            in: formatTimeDisplay(processedDay.afternoon.timeIn),
            out: formatTimeDisplay(processedDay.afternoon.timeOut),
            statusIn: processedDay.afternoon.statusIn,
            statusOut: processedDay.afternoon.statusOut
          },
          hoursWorked: processedDay.hoursWorked,
          remarks: processedDay.remarks,
          validation: processedDay.validation,
          isValid: processedDay.validation.isValid
        });
      });
    });
    
    processingProgress.value = 100;
    processingMessage.value = 'Complete';
    isProcessing.value = false;
    
    // Sort by date (newest first) then by name
    return dtrEntries.sort((a, b) => {
      const dateCompare = new Date(b.date) - new Date(a.date);
      if (dateCompare !== 0) return dateCompare;
      return a.name.localeCompare(b.name);
    });
  };

  /**
   * Format date for display
   * @param {Date} date - Date object
   * @returns {String} - Formatted date string
   */
  const formatDateDisplay = (date) => {
    if (!date) return '-';
    return date.toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });
  };

  /**
   * Format time for display
   * @param {Date} date - Date object
   * @returns {String} - Formatted time string
   */
  const formatTimeDisplay = (date) => {
    if (!date) return '-';
    return date.toLocaleTimeString('en-PH', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  /**
   * Export DTR to Excel
   * @param {Array} dtrData - Processed DTR entries
   * @param {String} filename - Output filename
   */
  const exportDTRToExcel = (dtrData, filename = 'DTR_Export') => {
    if (!dtrData || dtrData.length === 0) {
      console.warn('No DTR data to export');
      return;
    }

    // Transform data for export to match table columns exactly
    const exportData = dtrData.map((item, index) => ({
      '#': index + 1,
      'Employee No.': item.employeeNo || '',
      'Department': item.department || '',
      'Name': item.rawName || item.name || '',
      'Card No.': item.cardNo || '',
      'Location ID': item.locationId || '',
      'ID Number': item.idNumber || '',
      'Date': item.dateFormatted,
      'Morning IN': item.morning.in,
      'Morning OUT': item.morning.out,
      'Afternoon IN': item.afternoon.in,
      'Afternoon OUT': item.afternoon.out,
      'Hours Worked': item.hoursWorked,
      'Remarks': item.remarks,
      'Status': item.isValid ? 'Valid' : 'Invalid'
    }));

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Set column widths to match new structure
    worksheet['!cols'] = [
      { wch: 4 },   // #
      { wch: 12 },  // Employee No.
      { wch: 15 },  // Department
      { wch: 25 },  // Name
      { wch: 12 },  // Card No.
      { wch: 12 },  // Location ID
      { wch: 12 },  // ID Number
      { wch: 12 },  // Date
      { wch: 13 },  // Morning IN
      { wch: 13 },  // Morning OUT
      { wch: 13 },  // Afternoon IN
      { wch: 13 },  // Afternoon OUT
      { wch: 12 },  // Hours Worked
      { wch: 30 },  // Remarks
      { wch: 10 }   // Status
    ];

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'DTR');

    // Add summary sheet
    const summaryData = generateSummaryData(dtrData);
    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    summarySheet['!cols'] = [{ wch: 30 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const fullFilename = `${filename}_${timestamp}.xlsx`;

    // Download file
    XLSX.writeFile(workbook, fullFilename);
  };

  /**
   * Generate summary data for export
   * @param {Array} dtrData - DTR entries
   * @returns {Array} - Summary data
   */
  const generateSummaryData = (dtrData) => {
    const summary = [];
    
    // Overall statistics
    const totalRecords = dtrData.length;
    const validRecords = dtrData.filter(d => d.isValid).length;
    const invalidRecords = totalRecords - validRecords;
    const totalHours = dtrData.reduce((sum, d) => sum + (d.hoursWorked || 0), 0);
    
    summary.push({ 'Metric': 'Total Records', 'Value': totalRecords });
    summary.push({ 'Metric': 'Valid Records', 'Value': validRecords });
    summary.push({ 'Metric': 'Invalid Records', 'Value': invalidRecords });
    summary.push({ 'Metric': 'Total Hours Worked', 'Value': totalHours.toFixed(2) });
    summary.push({ 'Metric': '', 'Value': '' });
    
    // Per employee summary
    const employeeGroups = {};
    dtrData.forEach(d => {
      if (!employeeGroups[d.name]) {
        employeeGroups[d.name] = {
          days: 0,
          hours: 0,
          lateCount: 0,
          undertimeCount: 0
        };
      }
      employeeGroups[d.name].days++;
      employeeGroups[d.name].hours += d.hoursWorked || 0;
      if (d.remarks.includes('Late')) employeeGroups[d.name].lateCount++;
      if (d.remarks.includes('Undertime')) employeeGroups[d.name].undertimeCount++;
    });
    
    summary.push({ 'Metric': 'EMPLOYEE SUMMARY', 'Value': '' });
    Object.entries(employeeGroups).forEach(([name, stats]) => {
      summary.push({ 'Metric': `${name} - Days`, 'Value': stats.days });
      summary.push({ 'Metric': `${name} - Hours`, 'Value': stats.hours.toFixed(2) });
      summary.push({ 'Metric': `${name} - Late`, 'Value': stats.lateCount });
      summary.push({ 'Metric': `${name} - Undertime`, 'Value': stats.undertimeCount });
      summary.push({ 'Metric': '', 'Value': '' });
    });
    
    return summary;
  };

  /**
   * Download DTR template - Updated for new DTR.xls format
   * Columns: Department, Name, No., Date/Time, Location ID, ID Number, CardNo
   */
  const downloadDTRTemplate = () => {
    const templateData = [
      {
        'Department': 'Sales',
        'Name': 'DELA CRUZ, Juan',
        'No.': 'EMP001',
        'Date/Time': '2/2/2026 7:35:52 AM',
        'Location ID': 'LOC001',
        'ID Number': 'ID001',
        'CardNo': 'CARD001'
      },
      {
        'Department': '',
        'Name': '',
        'No.': '',
        'Date/Time': '2/2/2026 12:05:15 PM',
        'Location ID': '',
        'ID Number': '',
        'CardNo': ''
      },
      {
        'Department': '',
        'Name': '',
        'No.': '',
        'Date/Time': '2/2/2026 1:00:30 PM',
        'Location ID': '',
        'ID Number': '',
        'CardNo': ''
      },
      {
        'Department': '',
        'Name': '',
        'No.': '',
        'Date/Time': '2/2/2026 5:30:45 PM',
        'Location ID': '',
        'ID Number': '',
        'CardNo': ''
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    worksheet['!cols'] = [
      { wch: 20 },  // Department
      { wch: 25 },  // Name
      { wch: 15 },  // No.
      { wch: 25 },  // Date/Time
      { wch: 15 },  // Location ID
      { wch: 15 },  // ID Number
      { wch: 15 }   // CardNo
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'DTR Template');

    // Add instructions sheet
    const instructionData = [
      { 'INSTRUCTIONS': 'DTR ATTENDANCE IMPORT TEMPLATE (NEW FORMAT)' },
      { 'INSTRUCTIONS': '' },
      { 'INSTRUCTIONS': 'COLUMN DESCRIPTIONS:' },
      { 'INSTRUCTIONS': '• Department - Employee department' },
      { 'INSTRUCTIONS': '• Name - Employee name in "LASTNAME, Firstname" format' },
      { 'INSTRUCTIONS': '• No. - Employee ID number' },
      { 'INSTRUCTIONS': '• Date/Time - Date and time in format: M/d/yyyy h:mm:ss AM/PM' },
      { 'INSTRUCTIONS': '• Location ID - Location identifier (optional)' },
      { 'INSTRUCTIONS': '• ID Number - Additional ID field (optional)' },
      { 'INSTRUCTIONS': '• CardNo - Card number (optional)' },
      { 'INSTRUCTIONS': '' },
      { 'INSTRUCTIONS': 'ATTENDANCE LOGGING RULES:' },
      { 'INSTRUCTIONS': '• Minimum 2 logs per day (Time In and Time Out)' },
      { 'INSTRUCTIONS': '• Maximum 4 logs per day (2 Morning + 2 Afternoon)' },
      { 'INSTRUCTIONS': '• Morning: Before 12:00 PM' },
      { 'INSTRUCTIONS': '• Afternoon: 12:01 PM onwards' },
      { 'INSTRUCTIONS': '' },
      { 'INSTRUCTIONS': 'TIME CLASSIFICATION:' },
      { 'INSTRUCTIONS': '• Before 8:00 AM: Early/On-time' },
      { 'INSTRUCTIONS': '• 8:00 AM - 12:00 PM: Late' },
      { 'INSTRUCTIONS': '• Out before 5:00 PM: Undertime' },
      { 'INSTRUCTIONS': '' },
      { 'INSTRUCTIONS': 'NAME FORMAT:' },
      { 'INSTRUCTIONS': '• Use "LASTNAME, Firstname" format (e.g., "AURE, Janrey")' },
      { 'INSTRUCTIONS': '• System will automatically convert to "Firstname LASTNAME"' },
      { 'INSTRUCTIONS': '' },
      { 'INSTRUCTIONS': 'DATE/TIME FORMAT:' },
      { 'INSTRUCTIONS': '• Use format: M/d/yyyy h:mm:ss AM/PM' },
      { 'INSTRUCTIONS': '• Example: 2/2/2026 7:35:52 AM' },
      { 'INSTRUCTIONS': '• Or use Excel date/time format' },
      { 'INSTRUCTIONS': '' },
      { 'INSTRUCTIONS': 'COMPATIBILITY:' },
      { 'INSTRUCTIONS': '• This template matches the new DTR.xls format' },
      { 'INSTRUCTIONS': '• System also supports legacy format for backward compatibility' }
    ];

    const instructionSheet = XLSX.utils.json_to_sheet(instructionData);
    instructionSheet['!cols'] = [{ wch: 80 }];
    XLSX.utils.book_append_sheet(workbook, instructionSheet, 'Instructions');

    XLSX.writeFile(workbook, 'DTR_Attendance_Template.xlsx');
  };

  return {
    isProcessing,
    processingProgress,
    processingMessage,
    parseAttendanceExcel,
    generateDTR,
    exportDTRToExcel,
    downloadDTRTemplate,
    formatDateDisplay,
    formatTimeDisplay,
    classifyTimeSegment,
    classifyTimeStatus
  };
}
