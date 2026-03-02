import admin from 'firebase-admin';
import mysql from 'mysql2/promise';
import { readFileSync } from 'fs';

// Load Firebase service account
const serviceAccount = JSON.parse(readFileSync('./isuzu-inventory-firebase-adminsdk-fbsvc-eeeef3cb44.json', 'utf8'));

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

// Connect to MySQL
const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // your MySQL password
  database: 'isuzu_inventory_backup'
});

// Create Administrator table
await connection.query(`
  CREATE TABLE IF NOT EXISTS Administrator (
    UID VARCHAR(128) PRIMARY KEY,
    accountStatus VARCHAR(32),
    age INT,
    birthday VARCHAR(32),
    contact VARCHAR(32),
    createdAt VARCHAR(64),
    email VARCHAR(128),
    emailVerified TINYINT(1),
    firstName VARCHAR(64),
    gender VARCHAR(16),
    lastLogin VARCHAR(64),
    lastName VARCHAR(64),
    middleInitial VARCHAR(8),
    termsAgreed TINYINT(1),
    termsAgreedAt VARCHAR(64),
    username VARCHAR(64),
    role VARCHAR(64)
  )
`);

// Create Roles subcollection table
await connection.query(`
  CREATE TABLE IF NOT EXISTS Administrator_Roles (
    UID VARCHAR(128) PRIMARY KEY,
    parentUID VARCHAR(128),
    Default_Roles VARCHAR(128),
    permission VARCHAR(128),
    position VARCHAR(128),
    role VARCHAR(128),
    setAt VARCHAR(64),
    updateAt VARCHAR(64),
    FOREIGN KEY (parentUID) REFERENCES Administrator(UID)
  )
`);

// Backup Administrator documents
const adminSnapshot = await db.collection('Administrator').get();
for (const doc of adminSnapshot.docs) {
  const d = doc.data();
  await connection.query(`
    REPLACE INTO Administrator (UID, accountStatus, age, birthday, contact, createdAt, email, emailVerified, firstName, gender, lastLogin, lastName, middleInitial, termsAgreed, termsAgreedAt, username, role)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    doc.id,
    fixField(d.accountStatus),
    fixField(d.age),
    fixField(d.birthday),
    fixField(d.contact),
    fixField(d.createdAt),
    fixField(d.email),
    fixField(d.emailVerified),
    fixField(d.firstName),
    fixField(d.gender),
    fixField(d.lastLogin),
    fixField(d.lastName),
    fixField(d.middleInitial),
    fixField(d.termsAgreed),
    fixField(d.termsAgreedAt),
    fixField(d.username),
    fixField(d.role)
  ]);

  // Backup Roles subcollection for each Administrator
  const rolesCol = await doc.ref.collection('Roles').get();
  for (const roleDoc of rolesCol.docs) {
    const r = roleDoc.data();
    await connection.query(`
      REPLACE INTO Administrator_Roles (UID, parentUID, Default_Roles, permission, position, role, setAt, updateAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      roleDoc.id,
      doc.id,
      fixField(r.Default_Roles),
      fixField(r.permission),
      fixField(r.position),
      fixField(r.role),
      fixField(r.setAt),
      fixField(r.updateAt)
    ]);
  }
}

// Create Category table
await connection.query(`
  CREATE TABLE IF NOT EXISTS Category (
    UID VARCHAR(128) PRIMARY KEY,
    list JSON
  )
`);

// Backup Category documents
const catSnapshot = await db.collection('Category').get();
for (const doc of catSnapshot.docs) {
  const d = doc.data();
  await connection.query(`
    REPLACE INTO Category (UID, list)
    VALUES (?, ?)
  `, [
    doc.id,
    JSON.stringify(fixField(d.list)) // Store array as JSON string (MySQL JSON column)
  ]);
}

// Create Counters table
await connection.query(`
  CREATE TABLE IF NOT EXISTS Counters (
    UID VARCHAR(128) PRIMARY KEY,
    lastNumber INT
  )
`);

// Backup Counters documents
const countersSnapshot = await db.collection('Counters').get();
for (const doc of countersSnapshot.docs) {
  const d = doc.data();
  await connection.query(`
    REPLACE INTO Counters (UID, lastNumber)
    VALUES (?, ?)
  `, [
    doc.id,
    fixField(d.lastNumber)
  ]);
}

// Create Inventory table
await connection.query(`
  CREATE TABLE IF NOT EXISTS Inventory (
    UID VARCHAR(128),
    Name VARCHAR(64),
    category VARCHAR(64),
    createdAt VARCHAR(64),
    description VARCHAR(255),
    model VARCHAR(64),
    partName VARCHAR(128),
    partNo VARCHAR(64),
    quantity INT,
    totalValue DOUBLE,
    unitPrice DOUBLE,
    updatedAt VARCHAR(64),
    PRIMARY KEY (UID, Name)
  )
`);

// Create Inventory_Metadata table
await connection.query(`
  CREATE TABLE IF NOT EXISTS Inventory_Metadata (
    UID VARCHAR(128) PRIMARY KEY,
    categories JSON
  )
`);

// Backup Inventory documents
const inventorySnapshot = await db.collection('Inventory').get();
for (const doc of inventorySnapshot.docs) {
  const parentUID = doc.id;
  const data = doc.data();
  // Each field in the document is an inventory item (map)
  for (const itemName in data) {
    const item = data[itemName];
    if (typeof item === 'object' && item !== null) {
      await connection.query(`
        REPLACE INTO Inventory (UID, Name, category, createdAt, description, model, partName, partNo, quantity, totalValue, unitPrice, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        parentUID,
        itemName,
        fixField(item.category),
        fixField(item.createdAt),
        fixField(item.description),
        fixField(item.model),
        fixField(item.partName),
        fixField(item.partNo),
        fixField(item.quantity),
        fixField(item.totalValue),
        fixField(item.unitPrice),
        fixField(item.updatedAt)
      ]);
    }
  }
}

// Backup Inventory_Metadata documents
const metaSnapshot = await db.collection('Inventory_Metadata').get();
for (const doc of metaSnapshot.docs) {
  const d = doc.data();
  await connection.query(`
    REPLACE INTO Inventory_Metadata (UID, categories)
    VALUES (?, ?)
  `, [
    doc.id,
    JSON.stringify(fixField(d.categories)) // Store map as JSON
  ]);
}

// Create PR_Order table
await connection.query(`
  CREATE TABLE IF NOT EXISTS PR_Order (
    UID VARCHAR(128) PRIMARY KEY,
    pro1 VARCHAR(128),
    pro3 VARCHAR(128),
    pro4 VARCHAR(128),
    pro5 VARCHAR(128),
    pro6 VARCHAR(128),
    pro7 VARCHAR(128),
    pro8 VARCHAR(128),
    pro9 VARCHAR(128)
  )
`);

// Backup PR_Order documents
const prOrderSnapshot = await db.collection('PR_Order').get();
for (const doc of prOrderSnapshot.docs) {
  const d = doc.data();
  await connection.query(`
    REPLACE INTO PR_Order (UID, pro1, pro3, pro4, pro5, pro6, pro7, pro8, pro9)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    doc.id,
    fixField(d.pro1),
    fixField(d.pro3),
    fixField(d.pro4),
    fixField(d.pro5),
    fixField(d.pro6),
    fixField(d.pro7),
    fixField(d.pro8),
    fixField(d.pro9)
  ]);
}

// Create Page_Control table
await connection.query(`
  CREATE TABLE IF NOT EXISTS Page_Control (
    UID VARCHAR(128) PRIMARY KEY,
    allowedPositions JSON,
    allowedRoles JSON,
    features JSON,
    pageName VARCHAR(128),
    updatedAt VARCHAR(64),
    updatedBy VARCHAR(128)
  )
`);

// Backup Page_Control documents
const pageControlSnapshot = await db.collection('Page_Control').get();
for (const doc of pageControlSnapshot.docs) {
  const d = doc.data();
  await connection.query(`
    REPLACE INTO Page_Control (UID, allowedPositions, allowedRoles, features, pageName, updatedAt, updatedBy)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [
    doc.id,
    JSON.stringify(fixField(d.allowedPositions)),
    JSON.stringify(fixField(d.allowedRoles)),
    JSON.stringify(fixField(d.features)),
    fixField(d.pageName),
    fixField(d.updatedAt),
    fixField(d.updatedBy)
  ]);
}

// Create Permission_Access table
await connection.query(`
  CREATE TABLE IF NOT EXISTS Permission_Access (
    UID VARCHAR(128) PRIMARY KEY,
    canCreate TINYINT(1),
    canDelete TINYINT(1),
    canEdit TINYINT(1),
    canView TINYINT(1),
    permission VARCHAR(64)
  )
`);

// Backup Permission_Access documents
const permissionAccessSnapshot = await db.collection('Permission_Access').get();
for (const doc of permissionAccessSnapshot.docs) {
  const d = doc.data();
  await connection.query(`
    REPLACE INTO Permission_Access (UID, canCreate, canDelete, canEdit, canView, permission)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [
    doc.id,
    fixField(d.canCreate),
    fixField(d.canDelete),
    fixField(d.canEdit),
    fixField(d.canView),
    fixField(d.permission)
  ]);
}

// Create Position_Access table
await connection.query(`
  CREATE TABLE IF NOT EXISTS Position_Access (
    UID VARCHAR(128) PRIMARY KEY,
    position VARCHAR(64),
    updatedAt VARCHAR(64)
  )
`);

// Backup Position_Access documents
const positionAccessSnapshot = await db.collection('Position_Access').get();
for (const doc of positionAccessSnapshot.docs) {
  const d = doc.data();
  await connection.query(`
    REPLACE INTO Position_Access (UID, position, updatedAt)
    VALUES (?, ?, ?)
  `, [
    doc.id,
    fixField(d.position),
    fixField(d.updatedAt)
  ]);
}

// Create Role_Access table
await connection.query(`
  CREATE TABLE IF NOT EXISTS Role_Access (
    UID VARCHAR(128) PRIMARY KEY,
    roleName VARCHAR(64),
    updatedAt VARCHAR(64)
  )
`);

// Backup Role_Access documents
const roleAccessSnapshot = await db.collection('Role_Access').get();
for (const doc of roleAccessSnapshot.docs) {
  const d = doc.data();
  await connection.query(`
    REPLACE INTO Role_Access (UID, roleName, updatedAt)
    VALUES (?, ?, ?)
  `, [
    doc.id,
    fixField(d.roleName),
    fixField(d.updatedAt)
  ]);
}

// Create SA_Assignment table
await connection.query(`
  CREATE TABLE IF NOT EXISTS SA_Assignment (
    UID VARCHAR(128) PRIMARY KEY,
    assignments JSON
  )
`);

// Backup SA_Assignment documents
const saAssignmentSnapshot = await db.collection('SA_Assignment').get();
for (const doc of saAssignmentSnapshot.docs) {
  const d = doc.data();
  await connection.query(`
    REPLACE INTO SA_Assignment (UID, assignments)
    VALUES (?, ?)
  `, [
    doc.id,
    JSON.stringify(fixField(d)) // Store the whole assignments map as JSON
  ]);
}

// Create Service_Advisor table
await connection.query(`
  CREATE TABLE IF NOT EXISTS Service_Advisor (
    UID VARCHAR(128) PRIMARY KEY,
    advisors JSON
  )
`);

// Backup Service_Advisor documents
const serviceAdvisorSnapshot = await db.collection('Service_Advisor').get();
for (const doc of serviceAdvisorSnapshot.docs) {
  const d = doc.data();
  await connection.query(`
    REPLACE INTO Service_Advisor (UID, advisors)
    VALUES (?, ?)
  `, [
    doc.id,
    JSON.stringify(fixField(d)) // Store the whole advisors map as JSON
  ]);
}

// Create Transactions table (only UID)
await connection.query(`
  CREATE TABLE IF NOT EXISTS transactions (
    UID VARCHAR(128) PRIMARY KEY
  )
`);

// Create Transaction_IN table
await connection.query(`
  CREATE TABLE IF NOT EXISTS transaction_IN (
    UID VARCHAR(128) PRIMARY KEY,
    category VARCHAR(64),
    controlNo VARCHAR(64),
    createdAt VARCHAR(64),
    model VARCHAR(64),
    newInventoryQty INT,
    note TEXT,
    partName VARCHAR(128),
    partNo VARCHAR(128),
    previousInventoryQty INT,
    processesAt VARCHAR(64),
    quantity INT,
    receivedAt VARCHAR(64),
    source VARCHAR(128),
    statusIn VARCHAR(32),
    totalPrice DOUBLE,
    transactionID VARCHAR(128),
    unitPrice DOUBLE,
    FOREIGN KEY (partNo) REFERENCES transactions(UID)
  )
`);

// Create Transaction_OUT table
await connection.query(`
  CREATE TABLE IF NOT EXISTS transaction_OUT (
    UID VARCHAR(128) PRIMARY KEY,
    category VARCHAR(64),
    client VARCHAR(128),
    controlNo VARCHAR(64),
    createdAt VARCHAR(64),
    model VARCHAR(64),
    newInventoryQty INT,
    note TEXT,
    partName VARCHAR(128),
    partNo VARCHAR(128),
    previousInventoryQty INT,
    processesAt VARCHAR(64),
    quantity INT,
    soldAt VARCHAR(64),
    statusOUT VARCHAR(32),
    totalPrice DOUBLE,
    transactionID VARCHAR(128),
    unitPrice DOUBLE,
    FOREIGN KEY (partNo) REFERENCES transactions(UID)
  )
`);

// Backup Transactions documents and subcollections
const transactionRefs = await db.collection('Transactions').listDocuments();
console.log('Transaction doc refs:', transactionRefs.map(ref => ref.id));
for (const docRef of transactionRefs) {
  await connection.query('REPLACE INTO transactions (UID) VALUES (?)', [docRef.id]);
  // Transaction_IN
  const inCol = await docRef.collection('Transaction_IN').get();
  for (const inDoc of inCol.docs) {
    const d = inDoc.data();
    await connection.query(
      `REPLACE INTO transaction_IN (
        UID, category, controlNo, createdAt, model, newInventoryQty, note, partName, partNo, previousInventoryQty, processesAt, quantity, receivedAt, source, statusIn, totalPrice, transactionID, unitPrice
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        inDoc.id,
        fixField(d.category),
        fixField(d.controlNo),
        fixField(d.createdAt),
        fixField(d.model),
        fixField(d.newInventoryQty),
        fixField(d.note),
        fixField(d.partName),
        docRef.id, // partNo (foreign key)
        fixField(d.previousInventoryQty),
        fixField(d.processesAt),
        fixField(d.quantity),
        fixField(d.receivedAt),
        fixField(d.source),
        fixField(d.statusIn),
        fixField(d.totalPrice),
        fixField(d.transactionID),
        fixField(d.unitPrice)
      ]
    );
    console.log('Saving transaction:', docRef.id);
    console.log('Saving transaction_IN:', inDoc.id, d);
  }
  // Transaction_OUT
  const outCol = await docRef.collection('Transaction_OUT').get();
  for (const outDoc of outCol.docs) {
    const d = outDoc.data();
    await connection.query(
      `REPLACE INTO transaction_OUT (
        UID, category, client, controlNo, createdAt, model, newInventoryQty, note, partName, partNo, previousInventoryQty, processesAt, quantity, soldAt, statusOUT, totalPrice, transactionID, unitPrice
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        outDoc.id,
        fixField(d.category),
        fixField(d.client),
        fixField(d.controlNo),
        fixField(d.createdAt),
        fixField(d.model),
        fixField(d.newInventoryQty),
        fixField(d.note),
        fixField(d.partName),
        docRef.id, // partNo (foreign key)
        fixField(d.previousInventoryQty),
        fixField(d.processesAt),
        fixField(d.quantity),
        fixField(d.soldAt),
        fixField(d.statusOUT),
        fixField(d.totalPrice),
        fixField(d.transactionID),
        fixField(d.unitPrice)
      ]
    );
    console.log('Saving transaction:', docRef.id);
    console.log('Saving transaction_OUT:', outDoc.id, d);
  }
}

await connection.end();

console.log('Backup complete!');

function fixField(val) {
  if (val && typeof val === 'object' && typeof val.toDate === 'function') {
    return val.toDate().toISOString();
  }
  if (typeof val === 'boolean') {
    return val ? 1 : 0;
  }
  if (val && typeof val === 'object') {
    return JSON.stringify(val); // Store maps as JSON
  }
  return val;
}

try {
  // 2. Check Firestore docs count
  const transactions = await db.collection('Transactions').get();
  console.log('Transactions found:', transactions.docs.length);

  for (const doc of transactions.docs) {
    const parentId = doc.id;
    console.log('Saving transaction:', parentId);

    // 1. Insert parent UID and check result
    await connection.query('REPLACE INTO transactions (UID) VALUES (?)', [parentId]);
    console.log('Inserted transaction:', parentId);

    // Backup Transaction_IN subcollection
    const inCol = await doc.ref.collection('Transaction_IN').get();
    console.log('Transaction_IN docs found:', inCol.docs.length);
    for (const inDoc of inCol.docs) {
      const d = inDoc.data();
      try {
        await connection.query(
          `REPLACE INTO transaction_IN (
            UID, category, controlNo, createdAt, model, newInventoryQty, note, partName, partNo, previousInventoryQty, processesAt, quantity, receivedAt, source, statusIn, totalPrice, transactionID, unitPrice
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            inDoc.id,
            fixField(d.category),
            fixField(d.controlNo),
            fixField(d.createdAt),
            fixField(d.model),
            fixField(d.newInventoryQty),
            fixField(d.note),
            fixField(d.partName),
            parentId, // partNo (foreign key)
            fixField(d.previousInventoryQty),
            fixField(d.processesAt),
            fixField(d.quantity),
            fixField(d.receivedAt),
            fixField(d.source),
            fixField(d.statusIn),
            fixField(d.totalPrice),
            fixField(d.transactionID),
            fixField(d.unitPrice)
          ]
        );
        console.log('Saved transaction_IN:', inDoc.id);
      } catch (err) {
        // 3. Catch and log errors for transaction_IN
        console.error('Error saving transaction_IN:', inDoc.id, err);
      }
    }

    // Backup Transaction_OUT subcollection
    const outCol = await doc.ref.collection('Transaction_OUT').get();
    console.log('Transaction_OUT docs found:', outCol.docs.length);
    for (const outDoc of outCol.docs) {
      const d = outDoc.data();
      try {
        await connection.query(
          `REPLACE INTO transaction_OUT (
            UID, category, client, controlNo, createdAt, model, newInventoryQty, note, partName, partNo, previousInventoryQty, processesAt, quantity, soldAt, statusOUT, totalPrice, transactionID, unitPrice
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            outDoc.id,
            fixField(d.category),
            fixField(d.client),
            fixField(d.controlNo),
            fixField(d.createdAt),
            fixField(d.model),
            fixField(d.newInventoryQty),
            fixField(d.note),
            fixField(d.partName),
            parentId, // partNo (foreign key)
            fixField(d.previousInventoryQty),
            fixField(d.processesAt),
            fixField(d.quantity),
            fixField(d.soldAt),
            fixField(d.statusOUT),
            fixField(d.totalPrice),
            fixField(d.transactionID),
            fixField(d.unitPrice)
          ]
        );
        console.log('Saved transaction_OUT:', outDoc.id);
      } catch (err) {
        // 3. Catch and log errors for transaction_OUT
        console.error('Error saving transaction_OUT:', outDoc.id, err);
      }
    }
  }
} catch (err) {
  // 3. Catch and log any top-level errors
  console.error('Sync error:', err);
}

await connection.end();
console.log('Backup complete!');