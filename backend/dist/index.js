"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const generative_ai_1 = require("@google/generative-ai");
const axios_1 = __importDefault(require("axios"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 5000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Dummy data fallback
const dummyMetrics = {
    co2_emissions: 100
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
const genAI = new generative_ai_1.GoogleGenerativeAI(geminiApiKey);
// API Routes
app.get('/api/metrics', async (req, res) => {
    const { lat, lng } = req.query;
    console.log(`Received coordinates: lat=${lat}, lng=${lng}`); // Debug log
    if (lat && lng) {
        try {
            const currentDate = new Date().toISOString().slice(0, 10);
            const externalApiUrl = `https://carbon-compass.onrender.com/api/projections?latitude=${lat}&longitude=${lng}&date=${currentDate}`;
            console.log(`Calling Flask API: ${externalApiUrl}`); // Debug log
            const response = await axios_1.default.get(externalApiUrl);
            console.log('Flask API Response:', response.data); // Debug log
            const co2Emissions = response.data.predicted_co2_ppm;
            if (co2Emissions !== undefined && co2Emissions !== null) {
                console.log(`Returning CO2: ${co2Emissions}`); // Debug log
                res.json({
                    co2_emissions: co2Emissions,
                    coordinates: { lat: parseFloat(lat), lng: parseFloat(lng) },
                    date: currentDate,
                    source: 'flask_api'
                });
            }
            else {
                console.warn("External API did not return predicted_co2_ppm. Sending dummy data.");
                res.json({
                    ...dummyMetrics,
                    source: 'dummy_no_co2_data'
                });
            }
        }
        catch (error) {
            console.error("Error fetching data from external API:", error);
            res.json({
                ...dummyMetrics,
                source: 'dummy_api_error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    else {
        console.log("No coordinates provided, sending dummy data");
        res.json({
            ...dummyMetrics,
            source: 'dummy_no_coordinates'
        });
    }
});
app.get('/api/projections', async (req, res) => {
    const { lat, lng } = req.query;
    if (lat && lng) {
        try {
            const currentDate = new Date().toISOString().slice(0, 10);
            const externalApiUrl = `https://carbon-compass.onrender.com/api/projections?latitude=${lat}&longitude=${lng}&date=${currentDate}`;
            const response = await axios_1.default.get(externalApiUrl);
            // Return the full Flask API response
            res.json({
                flask_data: response.data,
                coordinates: { lat: parseFloat(lat), lng: parseFloat(lng) },
                message: `Projections for latitude: ${lat}, longitude: ${lng}`
            });
        }
        catch (error) {
            console.error("Error fetching projections from Flask API:", error);
            res.json({
                ...dummyProjections,
                error: "Failed to fetch from Flask API",
                coordinates: { lat: parseFloat(lat), lng: parseFloat(lng) }
            });
        }
    }
    else {
        res.json(dummyProjections);
    }
});
app.get('/api/policies', async (req, res) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        let prompt = "";
        const co2Level = parseFloat(req.query.co2_level);
        if (!isNaN(co2Level)) {
            if (co2Level >= 350 && co2Level <= 400) {
                prompt = "The current CO2 levels are within a safe range (350-400ppm). Generate a positive message acknowledging this and briefly explain why these levels are considered good for urban carbon management.";
            }
            else {
                prompt = `The current CO2 level is ${co2Level}ppm. Generate 5 concise policy recommendations for urban carbon management to address this level. Each recommendation should be a single sentence.`;
            }
        }
        else {
            prompt = "Generate 5 concise policy recommendations for urban carbon management. Each recommendation should be a single sentence.";
        }
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const policies = text.split(/\d+\.\s*/).filter((p) => p.trim() !== '').map((p) => p.trim());
        res.json(policies);
    }
    catch (error) {
        console.error("Error generating policies from Gemini API:", error);
        res.status(500).json({ error: "Failed to generate policies." });
    }
});
// Debug endpoint to test Flask API directly
app.get('/debug/flask', async (req, res) => {
    const { lat, lng } = req.query;
    const latitude = lat || 28.7041;
    const longitude = lng || 77.1025;
    try {
        const currentDate = new Date().toISOString().slice(0, 10);
        const externalApiUrl = `https://carbon-compass.onrender.com/api/projections?latitude=${latitude}&longitude=${longitude}&date=${currentDate}`;
        console.log(`Debug: Calling ${externalApiUrl}`);
        const response = await axios_1.default.get(externalApiUrl);
        res.json({
            request_url: externalApiUrl,
            flask_response: response.data,
            status: response.status
        });
    }
    catch (error) {
        res.json({
            error: error instanceof Error ? error.message : 'Unknown error',
            request_coordinates: { latitude, longitude }
        });
    }
});
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
