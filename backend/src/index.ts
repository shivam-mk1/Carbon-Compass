import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios'; // Added axios import

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Dummy data
const dummyMetrics = {
    co2_emissions: 100 // Only CO2 emissions for dummy data
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
app.get('/api/metrics', async (req, res) => { // Made async
    const { lat, lng } = req.query;
    if (lat && lng) {
        try {
            const currentDate = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
            const externalApiUrl = `https://carbon-compass.onrender.com/api/projections?latitude=${lat}&longitude=${lng}&date=${currentDate}`;
            const response = await axios.get(externalApiUrl);

            // Extract predicted_co2_ppm from the response
            const co2Emissions = response.data?.predicted_co2_ppm;

            if (co2Emissions !== undefined && co2Emissions !== null) {
                res.json({ co2_emissions: co2Emissions });
            } else {
                console.warn("External API did not return predicted_co2_ppm. Sending dummy data.");
                res.json(dummyMetrics);
            }
        } catch (error) {
            console.error("Error fetching data from external API:", error);
            res.json(dummyMetrics); // Send dummy data on error
        }
    } else {
        res.json(dummyMetrics);
    }
});

app.get('/api/projections', (req, res) => {
    const { lat, lng } = req.query;
    if (lat && lng) {
        res.json({ message: `Projections for latitude: ${lat}, longitude: ${lng} (data generation not implemented yet)` });
    } else {
        res.json(dummyProjections);
    }
});

app.get('/api/policies', async (req, res) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        let prompt = "";
        const co2Level = parseFloat(req.query.co2_level as string);

        if (!isNaN(co2Level)) {
            if (co2Level >= 350 && co2Level <= 400) {
                prompt = "The current CO2 levels are within a safe range (350-400ppm). Generate a positive message acknowledging this and briefly explain why these levels are considered good for urban carbon management.";
            } else {
                prompt = `The current CO2 level is ${co2Level}ppm. Generate 5 concise policy recommendations for urban carbon management to address this level. Each recommendation should be a single sentence.`;
            }
        } else {
            prompt = "Generate 5 concise policy recommendations for urban carbon management. Each recommendation should be a single sentence.";
        }

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