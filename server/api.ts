import { Router, Request, Response } from "express";
import * as db from "./db";
import { invokeLLM } from "./_core/llm";

const router = Router();

// Middleware to verify API Key
async function verifyApiKey(req: Request, res: Response, next: Function) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid API key" });
  }

  const key = authHeader.substring(7);
  const apiKey = await db.verifyApiKey(key);
  
  if (!apiKey || !apiKey.isActive) {
    return res.status(401).json({ error: "Invalid API key" });
  }

  // Attach user info to request
  (req as any).userId = apiKey.userId;
  (req as any).apiKeyId = apiKey.id;
  
  next();
}

// POST /api/agent/ask - Ask the agent a question
router.post("/agent/ask", verifyApiKey, async (req: Request, res: Response) => {
  try {
    const { question } = req.body;
    const userId = (req as any).userId;

    if (!question || typeof question !== "string") {
      return res.status(400).json({ error: "Question is required and must be a string" });
    }

    // Check user coins
    const userCoins = await db.getUserCoins(userId);
    if (userCoins < 10) {
      return res.status(402).json({ error: "Insufficient coins. Minimum 10 coins required." });
    }

    // Estimate cost
    const costEstimate = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are a cost estimator. Analyze the user's request and estimate the cost in coins (10-500). Consider complexity, time, and resources needed. Respond with ONLY a JSON object: {\"estimatedCoins\": number}",
        },
        {
          role: "user",
          content: question,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "cost_estimate",
          strict: true,
          schema: {
            type: "object",
            properties: {
              estimatedCoins: { type: "number", description: "Estimated cost in coins" },
            },
            required: ["estimatedCoins"],
            additionalProperties: false,
          },
        },
      },
    });

    let coinsCost = 50;
    try {
      const content = (costEstimate.choices[0]?.message.content as string) || "{}";
      const parsed = JSON.parse(content);
      coinsCost = Math.min(Math.max(parsed.estimatedCoins || 50, 10), 500);
    } catch (e) {
      // Use default if parsing fails
    }

    // Check if user has enough coins
    if (userCoins < coinsCost) {
      return res.status(402).json({ 
        error: "Insufficient coins", 
        required: coinsCost, 
        available: userCoins 
      });
    }

    // Get answer from LLM
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are OmniAgent - a highly capable AI assistant that can help with any task. Provide clear, detailed, and actionable responses. Be professional and helpful.",
        },
        {
          role: "user",
          content: question,
        },
      ],
    });

    const answer = response.choices[0]?.message.content || "Unable to generate response";

    // Deduct coins
    await db.addCoins(userId, coinsCost, "spend", `API Request: ${question.substring(0, 50)}`);

    // Create task record
    await db.createAgentTask(userId, "api_request", question, coinsCost);

    // Return response
    res.json({
      success: true,
      answer,
      coinsCost,
      coinsRemaining: userCoins - coinsCost,
    });
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/agent/balance - Get user balance
router.get("/agent/balance", verifyApiKey, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const coins = await db.getUserCoins(userId);
    res.json({ coins });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/agent/add-coins - Add coins (admin only)
router.post("/agent/add-coins", verifyApiKey, async (req: Request, res: Response) => {
  try {
    const { amount, reason } = req.body;
    const userId = (req as any).userId;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Valid amount is required" });
    }

    await db.addCoins(userId, amount, "earn", reason || "API credit");
    const newBalance = await db.getUserCoins(userId);

    res.json({ success: true, newBalance });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
