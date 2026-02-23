# Transaction System Alignment with Inventory - TODO

## Tasks:

### 1. Update `useControlNumber.js` ✅ COMPLETED
- [x] Add function to lookup inventory item by partNo
- [x] Add function to get inventory controlNo by partNo
- [x] Add function to generate unique transactionID

### 2. Update `Transaction.vue` ✅ COMPLETED
- [x] Change collection from `Transaction` to `Transactions`
- [x] Update document path to use `partNo` as parent document ID
- [x] Update subcollection document ID format to `TransactionIN&{partNo}&{datetime}`
- [x] Add inventory item selector (dropdown/search) with autocomplete
- [x] Auto-populate fields from selected inventory item (partName, partNo, controlNo, unitPrice)
- [x] Add auto-calculation for totalPrice (quantity × unitPrice)
- [x] Add unique `transactionID` field to transaction data
- [x] Update `loadTransactionIn()` to query new structure
- [x] Update `saveTransactionIn()` to save to new structure with all required fields

### 3. UI Improvements ✅ COMPLETED
- [x] Inventory item search/selector with autocomplete (includes category and model)
- [x] Display inventory details when item selected
- [x] Show controlNo from inventory in form
- [x] Auto-calculate and display total price
- [x] Added Category and Model columns to transaction table


### 4. Bug Fixes ✅ COMPLETED
- [x] Fixed: Filter out old "Transaction" collection data, only show "Transactions" collection
- [x] Fixed: Display actual transactionID field instead of document ID in the table

### 5. Transaction Approval Workflow ✅ COMPLETED
- [x] Added `statusIN` field with default value "To Review"
- [x] Added "Stock IN" button to approve transactions
- [x] Added "Stock OUT" button to reject transactions
- [x] Added validation against current inventory data (controlNo, category, partNo, partName, model, unitPrice)
- [x] Inventory quantity updates automatically on Stock IN approval
- [x] Total value recalculated after quantity update
- [x] Toast notifications for user feedback
- [x] Status badges showing "To Review", "Stock IN", or "Stock OUT"
- [x] Processing state management for individual items

### 6. Testing & Validation ⏳ PENDING
- [ ] Test transaction creation with new structure
- [ ] Verify Firestore data structure matches requirements
- [ ] Test loading transactions from new structure
- [ ] Validate all fields are properly stored
- [ ] Test Stock IN approval workflow
- [ ] Test Stock OUT rejection workflow
- [ ] Test inventory quantity updates




## Database Structure:
```
Transactions (collection)
  └── {partNo} (document - part number from inventory)
      └── Transaction_IN (subcollection)
          └── TransactionIN&{partNo}&{datetime} (document)
              ├── transactionID: string (unique)
              ├── createdAt: timestamp
              ├── note: string
              ├── partName: string
              ├── partNo: string
              ├── partNo: string
              ├── controlNo: string (from inventory)
              ├── quantity: number
              ├── receivedAt: timestamp
              ├── source: string
              ├── totalPrice: number
              └── unitPrice: number
