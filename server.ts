import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // Initialize Gemini API client if key is available
  let genAI: GoogleGenAI | null = null;
  if (process.env.GEMINI_API_KEY) {
    try {
      genAI = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    } catch (e) {
      console.warn('Failed to initialize GoogleGenAI client:', e);
    }
  }

  // Health check endpoint for FastAPI / External integration testing
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'operational',
      service: 'CityPulse AI Control Server',
      city: 'Greater Noida, Uttar Pradesh, India',
      aiEngine: genAI ? 'Gemini 3.8 Flash' : 'Simulated Rule-Based Municipal Expert System',
      timestamp: new Date().toISOString(),
    });
  });

  // AI Recommendation Live Bridge Endpoint
  app.post('/api/ai/recommend', async (req: Request, res: Response) => {
    const { incident } = req.body;
    if (!incident) {
      return res.status(400).json({ error: 'Incident data required' });
    }

    if (!genAI) {
      return res.status(503).json({ error: 'Gemini API not configured, using local expert engine' });
    }

    try {
      const prompt = `You are CityPulse AI, the tactical municipal incident dispatch assistant for Greater Noida City Authority, Uttar Pradesh, India.
Analyze the following urban incident and return a tactical response recommendation in JSON format.

Incident Details:
- Title: ${incident.title}
- Category: ${incident.category}
- Severity: ${incident.severity}
- Address: ${incident.location?.address}
- Sector: ${incident.location?.sector}
- Description: ${incident.description}
- Assigned Department: ${incident.department}

Provide realistic tactical actions suited to Greater Noida municipal administration (e.g. GNIDA, NPCL, Traffic Police, UPPCB).`;

      const response = await genAI.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              priorityAnalysis: { type: Type.STRING },
              recommendedDepartment: { type: Type.STRING },
              primaryActions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              secondaryActions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              estimatedResolutionHours: { type: Type.NUMBER },
              urgencyRating: { type: Type.STRING },
              citizenAdvisory: { type: Type.STRING },
            },
            required: [
              'summary',
              'priorityAnalysis',
              'recommendedDepartment',
              'primaryActions',
              'secondaryActions',
              'estimatedResolutionHours',
              'urgencyRating',
              'citizenAdvisory',
            ],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({
        ...parsed,
        incidentId: incident.id,
      });
    } catch (err: any) {
      console.error('Gemini live generation error:', err);
      return res.status(500).json({ error: 'Live AI generation failed', details: err.message });
    }
  });

  // In development, hook Vite middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve dist folder
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CityPulse AI Command Center server running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
