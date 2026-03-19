import express from 'express';
import cors from 'cors';
import { exec } from 'child_process';
import cron from 'node-cron';

const app = express();
const PORT = 3001;

// Allow requests from your frontend (localhost and network)
app.use(cors({
  origin: '*'
}));

app.post('/api/sync', (req, res) => {
  exec('node firestore-sync/syncFirestoreToMySQL.js', { cwd: process.cwd() }, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ success: false, error: stderr || error.message });
    }
    res.json({ success: true, output: stdout });
  });
});

// Log when cron job is scheduled (FALLBACK - Task Scheduler primary)
console.log('Scheduling Saturday backup fallback: every Saturday at 4:30 PM');

const logBackup = (msg) => {
  const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0];
  console.log(`[BACKUP ${timestamp}] ${msg}`);
};

// 🔄 Schedule backup every Saturday at 4:30 PM (fallback)
cron.schedule('30 16 * * 6', () => {
  logBackup('Fallback cron backup started...');
  exec('node firestore-sync/syncFirestoreToMySQL.js', { cwd: process.cwd() }, (error, stdout, stderr) => {
    if (error) {
      logBackup('Fallback backup FAILED: ' + (stderr || error.message));
    } else {
      logBackup('Fallback backup SUCCESS: ' + stdout);
    }
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Sync API server running on http://0.0.0.0:${PORT}`);
});
