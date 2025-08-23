import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Dummy data
const dummyMetrics = {
    pm2_5: 45,
    pm10: 78,
    nox: 12,
    co: 3,
    ozone: 65,
    so2: 5
};

const dummyProjections = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
        {
            label: 'Carbon Density (tons/km²)',
            data: [300, 310, 320, 330, 340, 350],
            borderColor: '#7dd956',
            backgroundColor: 'rgba(125, 217, 86, 0.2)',
            fill: true,
        },
    ],
};

const geminiApiKey = process.env.GEMINI_API_KEY;
if (!geminiApiKey) {
    console.error("GEMINI_API_KEY is not set in the environment variables.");
    process.exit(1);
}
const genAI = new GoogleGenerativeAI(geminiApiKey);

// API Routes
app.get('/api/metrics', (req, res) => {
    res.json(dummyMetrics);
});

app.get('/api/projections', (req, res) => {
    res.json(dummyProjections);
});

app.get('/api/policies', async (req, res) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = "Generate 5 concise policy recommendations for urban carbon management. Each recommendation should be a single sentence.";
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        // Split the text into an array of policies, assuming each policy is on a new line or separated by a number.
        const policies = text.split(/\d+\.\s*/).filter((p: string) => p.trim() !== '').map((p: string) => p.trim());
        res.json(policies);
    } catch (error) {
        console.error("Error generating policies from Gemini API:", error);
        res.status(500).json({ error: "Failed to generate policies." });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});