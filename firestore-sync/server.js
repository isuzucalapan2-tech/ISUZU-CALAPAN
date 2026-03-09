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

// Log when cron job is scheduled
console.log('Scheduling weekly sync: every Monday at 8:30 AM');

// 🔄 Schedule sync every Monday at 8:30 AM
cron.schedule('30 8 * * 1', () => {
  console.log('Weekly sync started...');
  exec('node firestore-sync/syncFirestoreToMySQL.js', { cwd: process.cwd() }, (error, stdout, stderr) => {
    if (error) {
      console.error('Weekly sync failed:', stderr || error.message);
    } else {
      console.log('Weekly sync complete! Output:', stdout);
    }
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Sync API server running on http://0.0.0.0:${PORT}`);
});
