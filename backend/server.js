const express = require('express');
const cors = require('cors');
const { getSummary } = require('./summarizer');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/summarize', async (req, res) => {
  try {
    const { text, language } = req.body;
    const summary = await getSummary(text, language);
    res.json({ summary });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));