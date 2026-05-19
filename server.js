import express from "express";
import Anthropic from "@anthropic-ai/sdk";
import cors from "cors";
 
const app = express();
 
app.use(cors({ origin: "*" }));
app.use(express.json());
 
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});
 
app.get("/test", (req, res) => {
  res.json({ status: "ok", message: "AI Speaking Coach running!" });
});
 
app.post("/chat", async (req, res) => {
  try {
    const { messages, system } = req.body;
 
    const msg = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 800,
      system: system || "You are a helpful English speaking coach.",
      messages: messages,
    });
 
    res.json({
      content: [{ text: msg.content[0].text }]
    });
 
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});
 
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
