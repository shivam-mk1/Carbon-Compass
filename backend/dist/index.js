"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const generative_ai_1 = require("@google/generative-ai");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 5000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Dummy data for now
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
// Initialize Gemini API
const geminiApiKey = process.env.GEMINI_API_KEY;
if (!geminiApiKey) {
    console.error("GEMINI_API_KEY is not set in the environment variables.");
    process.exit(1);
}
const genAI = new generative_ai_1.GoogleGenerativeAI(geminiApiKey);
// API Routes
app.get('/api/metrics', (req, res) => {
    res.json(dummyMetrics);
});
app.get('/api/projections', (req, res) => {
    res.json(dummyProjections);
});
app.get('/api/policies', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const prompt = "Generate 5 concise policy recommendations for urban carbon management. Each recommendation should be a single sentence.";
        const result = yield model.generateContent(prompt);
        const response = yield result.response;
        const text = response.text();
        // Split the text into an array of policies, assuming each policy is on a new line or separated by a number.
        const policies = text.split(/\d+\.\s*/).filter((p) => p.trim() !== '').map((p) => p.trim());
        res.json(policies);
    }
    catch (error) {
        console.error("Error generating policies from Gemini API:", error);
        res.status(500).json({ error: "Failed to generate policies." });
    }
}));
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
