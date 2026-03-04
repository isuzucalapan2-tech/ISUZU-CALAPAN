# ISUZU Inventory Management System - Complete Setup Guide

A comprehensive inventory management system with Firebase backend and MySQL sync capabilities.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Running the Application](#running-the-application)
6. [Network Hosting](#network-hosting)
7. [Auto-Start Setup](#auto-start-setup)
8. [File Descriptions](#file-descriptions)
9. [Troubleshooting](#troubleshooting)

---

## Project Overview

### What is ISUZU Inventory Management System?

This is a Vue.js-based inventory management system designed for automotive parts management with the following features:

- **Firebase Firestore** as the primary database
- **MySQL** for backup and reporting
- **Network access** for multiple users
- **Auto-start** on system boot using PM2

### Architecture

```
Client PCs ─────> Host PC (Vite + Node) ─────> MySQL Server (Local)
                              │
                       Firebase Firestore
```

- **Frontend**: Vue.js + Vite (Port 5173)
- **Backend**: Express.js API Server (Port 3001)
- **Database**: Firebase Firestore (Primary), MySQL (Backup)
- **Process Manager**: PM2

---

## Prerequisites

### Software Requirements

| Software | Version | Purpose |
|----------|---------|---------|
| Node.js | v18 or higher | Runtime environment |
| npm | Comes with Node.js | Package manager |
| MySQL Server | v8.0 or higher | Local database backup |
| Git | Latest | Version control |

### For Network Hosting (Windows)

- Windows 10/11
- Administrator privileges (for firewall rules)

### Check Your Installations

```
bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check MySQL installation
mysql --version
```

---

## Installation

### Step 1: Clone the Repository

```
bash
git clone <repository-url>
cd ISUZU-CALAPAN
```

### Step 2: Install Dependencies

```
bash
npm install
```

This will install all required packages including:
- Vue.js 3.x
- Vite
- Firebase & Firebase Admin
- Express.js
- MySQL2
- PM2

### Step 3: Install PM2 (Globally)

PM2 is required for process management and auto-start functionality.

```
bash
npm install -g pm2
```

---

## Configuration

### 1. Firebase Configuration

The project requires a Firebase service account key file. This file should be named according to your Firebase project:

```
isuzu-inventory-firebase-adminsdk-fbsvc-eeeef3cb44.json
```

Place this file in the project root directory.

> **Note**: If you need to create a new Firebase project, go to [Firebase Console](https://console.firebase.google.com/), create a project, and download the service account key from Project Settings > Service Accounts.

### 2. MySQL Configuration

Edit `firestore-sync/syncFirestoreToMySQL.js` to update database credentials:

```
javascript
const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'YOUR_PASSWORD',      // Your MySQL password
  database: 'isuzu_inventory_backup'
});
```

### 3. Create the MySQL Database

Open MySQL and create the backup database:

```
sql
CREATE DATABASE IF NOT EXISTS isuzu_inventory_backup;
```

Or via command line:

```
bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS isuzu_inventory_backup;"
```

---

## Running the Application

### Option 1: Manual Start (Development)

This is useful for development and debugging.

**Terminal 1 - Frontend:**
```
bash
npm run dev
```
- Runs on: http://localhost:5173

**Terminal 2 - Backend:**
```
bash
node firestore-sync/server.js
```
- Runs on: http://localhost:3001

### Option 2: PM2 Auto-Start (Recommended for Network Hosting)

This is the recommended method for production/network hosting.

Simply run:
```
bash
start.bat
```

This will:
1. Start the frontend (Vite) on port 5173
2. Start the backend (Express) on port 3001
3. Save the PM2 process list for auto-restart

### PM2 Commands

| Command | Description |
|---------|-------------|
| `pm2 status` | View running processes |
| `pm2 logs` | View logs |
| `pm2 stop all` | Stop all processes |
| `pm2 restart all` | Restart all processes |
| `pm2 save` | Save process list for restart |

---

## Network Hosting

### Step 1: Find Your IP Address

Open Command Prompt and run:

```
bash
ipconfig
```

Look for **IPv4 Address** (e.g., `192.168.1.100`)

### Step 2: Access the Application

Other computers on the network can access:

| Service | Local URL | Network URL |
|---------|-----------|-------------|
| Frontend | http://localhost:5173 | http://192.168.x.x:5173 |
| Backend API | http://localhost:3001 | http://192.168.x.x:3001 |
| Sync Endpoint | http://localhost:5173/api/sync | http://192.168.x.x:5173/api/sync |

### Step 3: Configure Firewall (Windows)

**Important**: Run as Administrator

```
bash
setup-firewall.bat
```

This will:
- Allow incoming connections on port 5173 (Frontend)
- Allow incoming connections on port 3001 (Backend API)

### Manual Firewall Configuration

If the script doesn't work, manually add rules:

```
bash
netsh advfirewall firewall add rule name="ISUZU Frontend" dir=in action=allow protocol=tcp localport=5173
netsh advfirewall firewall add rule name="ISUZU Backend" dir=in action=allow protocol=tcp localport=3001
```

---

## Auto-Start Setup

### Option 1: Using start-with-autostart.bat (Recommended)

Simply run:
```
bash
start-with-autostart.bat
```

This will:
1. Start PM2 services
2. Save the process list
3. Create a Windows startup shortcut

### Option 2: Manual PM2 Setup

**Step 1: Generate the startup script**
```
bash
pm2 startup
```

**Step 2: Copy and run the output command**
Run the command shown (requires Administrator privileges)

**Step 3: Save the process list**
```
bash
pm2 save
```

### Verify Auto-Start

After setup, restart your computer. The application should start automatically.

---

## File Descriptions

### Setup Files

| File | Purpose |
|------|---------|
| `ecosystem.config.cjs` | PM2 configuration for managing both frontend and backend processes |
| `start.bat` | Batch script to start both services with PM2 |
| `start-with-autostart.bat` | Batch script with auto-start on boot setup |
| `setup-firewall.bat` | Windows Firewall rules for network access |

### Configuration Files

| File | Purpose |
|------|---------|
| `vite.config.js` | Vite configuration with network access and API proxy |
| `package.json` | Project dependencies and scripts |
| `firestore-sync/server.js` | Express backend server (port 3001) |
| `firestore-sync/syncFirestoreToMySQL.js` | Firebase to MySQL sync script |

### PM2 Process Configuration (ecosystem.config.cjs)

```
javascript
module.exports = {
  apps: [
    {
      name: 'isuzu-frontend',
      script: 'node',
      args: 'node_modules/vite/bin/vite.js dev',
      // Frontend on port 5173
    },
    {
      name: 'isuzu-backend',
      script: 'firestore-sync/server.js',
      // Backend on port 3001
    }
  ]
};
```

### Log Files

PM2 log files are stored in the `logs/` directory:
- `logs/frontend-error.log` - Frontend errors
- `logs/frontend-out.log` - Frontend output
- `logs/backend-error.log` - Backend errors
- `logs/backend-out.log` - Backend output

---

## Troubleshooting

### Port Already in Use

```
bash
pm2 stop all
pm2 delete all
# Then restart with start.bat
```

### Cannot Access from Network

1. **Check firewall rules:**
   
```
bash
   netsh advfirewall firewall show rule name=all | findstr "ISUZU"
   
```

2. **Verify services are running:**
   
```
bash
   pm2 status
   
```

3. **Check your IP address:**
   
```
bash
   ipconfig
   
```

### MySQL Connection Failed

1. **Verify MySQL is running:**
   
```
bash
   mysql -u root -p
   
```

2. **Check credentials** in `firestore-sync/syncFirestoreToMySQL.js`

3. **Ensure database exists:**
   
```
sql
   SHOW DATABASES;
   
```

### Sync Not Working from Network

The frontend proxy handles this automatically:
- All `/api` requests are forwarded to the backend
- Only the host computer runs the sync

### Common Issues and Solutions

| Issue | Solution |
|-------|----------|
| Frontend not loading | Check if port 5173 is available |
| Backend API not responding | Check if port 3001 is available |
| Firebase connection error | Verify service account key file exists |
| MySQL sync fails | Check MySQL credentials and database |
| Network access denied | Run setup-firewall.bat as Administrator |

---

## Access Information

### Default Ports

| Service | Port | Protocol |
|---------|------|----------|
| Frontend | 5173 | HTTP |
| Backend API | 3001 | HTTP |

### Testing the Setup

1. **Local Access:**
   - Open browser: http://localhost:5173

2. **Network Access:**
   - Open browser: http://YOUR_IP_ADDRESS:5173

3. **Test API:**
   - http://YOUR_IP_ADDRESS:3001/api/sync

---

## Support and Maintenance

### Regular Maintenance

- **Check logs regularly:** `pm2 logs`
- **Monitor PM2 status:** `pm2 status`
- **Backup MySQL database regularly**

### Updating the Application

```
bash
# Pull latest changes
git pull

# Restart PM2
pm2 restart all
```

---

*Guide created for ISUZU Inventory Management System*
