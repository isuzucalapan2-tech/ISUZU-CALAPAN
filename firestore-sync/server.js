import express from 'express';
import cors from 'cors';
import { exec } from 'child_process';
import cron from 'node-cron';

const app = express();
const PORT = 3001;

// Allow requests from your frontend (localhost:5173)
app.use(cors({
  origin: 'http://localhost:5173'
}));

app.post('/api/sync', (req, res) => {
  exec('node syncFirestoreToMySQL.js', { cwd: process.cwd() }, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ success: false, error: stderr || error.message });
    }
    res.json({ success: true, output: stdout });
  });
});

// 🔄 Schedule sync every Sunday at midnight
cron.schedule('0 0 * * 0', () => {
  console.log('Weekly sync started...');
  exec('node syncFirestoreToMySQL.js', { cwd: process.cwd() }, (error, stdout, stderr) => {
    if (error) {
      console.error('Weekly sync failed:', stderr || error.message);
    } else {
      console.log('Weekly sync complete!');
    }
  });
});

app.listen(PORT, () => {
  console.log(`Sync API server running on http://localhost:${PORT}`);
});