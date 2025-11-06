import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import { router as apiRouter } from './server-api.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 8080;
const allowedOrigin = process.env.ALLOWED_ORIGIN || '*';

// Enable CORS for the frontend (restrict by setting ALLOWED_ORIGIN in Cloud Run)
app.use(cors({ origin: allowedOrigin }));
app.use(express.json());

// Mount API routes for server-side Gemini proxy
app.use('/api', apiRouter);

// Serve static frontend
app.use(express.static(path.join(__dirname, 'dist')));

// Always serve index.html for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
