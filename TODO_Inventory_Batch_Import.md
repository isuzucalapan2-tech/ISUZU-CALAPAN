# TODO: Inventory Batch Import Enhancement

## Task: Enhance Inventory batch import with duplicate validation based on Part No

### Information Gathered:
- Current Inventory Import: Basic file upload, simple validation, no duplicate checking
- TransactionIn/TransactionOut Pattern: Enhanced UI with info tooltip, download template, preview table
- Validation needed: Required fields, numeric validation, DUPLICATE Part No check

### Plan:

#### 1. Update src/composables/useExcelExport.js
- [ ] Add `validateInventoryImportItem(item, existingPartNos)` - Enhanced validation with duplicate checking
- [ ] Add `processInventoryImportItems(items, existingInventory)` - Process items with duplicate detection
- [ ] Add `downloadInventoryTemplate()` - Generate template Excel file
- [ ] Export new functions in return object

#### 2. Update src/Pages/Admin/Inventory.vue
- [ ] Enhance import modal UI:
  - [ ] Add info icon with tooltip showing validation requirements
  - [ ] Add "Download Template" button
  - [ ] Add detailed preview table with valid/invalid items
  - [ ] Add summary header with valid/invalid counts
- [ ] Update import logic:
  - [ ] Pass current inventory to validation function
  - [ ] Show duplicate error when Part No exists

### Dependent Files:
- src/composables/useExcelExport.js
- src/Pages/Admin/Inventory.vue

### Follow-up Steps:
1. Test the enhanced import modal
2. Verify duplicate validation works correctly
3. Ensure template download works properly

