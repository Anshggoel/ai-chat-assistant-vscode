import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
dotenv.config();
console.log("🔑 OpenAI Key Loaded:", process.env.OPENAI_API_KEY);
const app = express();
app.use(cors());
app.use(express.json());
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: 'https://openrouter.ai/api/v1',
    defaultHeaders: {
        // Optional: These help your app appear on OpenRouter leaderboards
        "HTTP-Referer": "http://localhost:3000", // or your deployed site
        "X-Title": "My Chat App"
    }
});
app.post('/chat', async (req, res) => {
    const { message } = req.body;
    console.log("📩 Received message:", message);
    if (!message)
        return res.status(400).json({ error: 'Message required' });
    try {
        const response = await openai.chat.completions.create({
            model: 'openai/gpt-4o',
            messages: [{ role: 'user', content: message }],
            max_tokens: 100, // <-- Add this line to fit within your quota
        });
        const aiReply = response.choices[0].message.content;
        res.json({ reply: aiReply });
    }
    catch (err) {
        console.error("❌ OpenAI API error:", err?.response?.data || err.message || err);
        res.status(500).json({ error: 'AI request failed' });
    }
});
app.listen(3000, () => {
    console.log('🚀 Server running on http://localhost:3000');
});
