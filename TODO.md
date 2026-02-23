# Excel Export, Import & Pagination - Inventory 🔄 IN PROGRESS

## Tasks:
- [x] Create reusable composable `useExcelExport.js`
- [x] Add Export button with dropdown menu to Inventory.vue
- [x] Implement export functionality with filter integration
- [x] Add both "Export Filtered" and "Export All" options
- [x] Add Excel Import functionality for bulk item addition
- [x] Implement validation for imported data (same as manual add)
- [x] Add Import button and file upload handling
- [x] Create preview/confirmation modal for bulk import
- [x] Add pagination to inventory table
- [x] Add items per page selector
- [x] Add page navigation controls




## Files Edited:
1. `src/composables/useExcelExport.js` - Reusable composable with `exportInventory()` function
2. `src/Pages/Admin/Inventory.vue` - Export dropdown with filter integration

## Features Implemented:

### Export Dropdown Menu
- **Export Filtered (X items)** - Exports only the filtered results based on current filters:
  - Search query (part name, number, control no, category)
  - Category selection
  - Quantity range (min/max)
  - Price range (min/max)
- **Export All (X items)** - Exports complete inventory ignoring all filters

### Excel Export Details
- Format: `.xlsx` (Excel)
- Columns: Control No., Category, Part Name, Part No., Model, Description, Quantity, Unit Price (₱), Total Value (₱)
- Currency formatting for price columns
- Dynamic filenames:
  - Filtered: `Inventory_Filtered_Export_YYYY-MM-DD.xlsx`
  - All: `Inventory_All_Export_YYYY-MM-DD.xlsx`
- Toast notifications showing count of exported items

### UI Features
- Green dropdown button with FileDown + ChevronDown icons
- Shows live item counts in dropdown options
- Disabled state when no inventory data exists
- Click outside to close dropdown menu
- Dark mode compatible styling

## Features Implemented (Excel Import):

### Import Functionality
- **Blue "Import Excel" button** in action bar
- **File upload** with drag-and-drop support (.xlsx, .xls formats)
- **Preview modal** showing validation results before import

### Validation (Same as Manual Add)
- Category (required)
- Part Name (required)
- Part No. (required)
- Model (required)
- Quantity (required, must be ≥ 0)
- Unit Price (required, must be ≥ 0)
- Description (optional)

### Import Process
- Auto-calculates Total Value (Quantity × Unit Price)
- Auto-generates Control Numbers (ISZ-XXX-YYYY format)
- Saves new categories automatically
- Shows summary: Valid items count + Invalid items count
- Detailed error reporting per row
- Batch import with progress indication
- Toast notifications with import results

### UI Features
- Summary cards showing valid/invalid counts
- Preview table of valid items (first 10 + "more" indicator)
- Error table for invalid items with row numbers and error messages
- "Select Different File" button to reset
- "Import X Items" button to confirm
- Dark mode compatible styling
