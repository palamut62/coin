import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

// XAI API Key endpoints
app.get('/api/settings/xai-key', async (req, res) => {
  try {
    const setting = await prisma.settings.findUnique({
      where: {
        key: 'xai_api_key',
      },
    });
    res.json({ value: setting?.value || '' });
  } catch (error) {
    console.error('Error fetching XAI API key:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/settings/xai-key', async (req, res) => {
  try {
    const { value } = req.body;
    const result = await prisma.settings.upsert({
      where: {
        key: 'xai_api_key',
      },
      update: {
        value,
      },
      create: {
        key: 'xai_api_key',
        value,
      },
    });
    res.json(result);
  } catch (error) {
    console.error('Error saving XAI API key:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 