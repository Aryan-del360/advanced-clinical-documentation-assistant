import express from 'express';
import { generateSoapNote } from './services/geminiService.js';

const router = express.Router();

// POST /api/generate - body: { transcript: string }
router.post('/generate', async (req, res) => {
  try {
    const { transcript } = req.body;
    if (!transcript) return res.status(400).json({ error: 'transcript is required' });

    const note = await generateSoapNote(transcript);
    res.json({ note });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: 'Failed to generate SOAP note' });
  }
});

export { router };
