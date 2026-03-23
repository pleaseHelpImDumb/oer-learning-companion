require("dotenv").config();
const { StatusCodes } = require("http-status-codes"); // Status codes
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Database setup
const { PrismaClient } = require("@prisma/client");
let opts;
if (!process.env.NODE_ENV || process.env.NODE_ENV == "development") {
  opts = { log: ["query"] };
} else {
  opts = {};
}
const prisma = new PrismaClient(opts);

function getTutorModel(user) {
  return genAI.getGenerativeModel({
    model: "gemini-2.5-flash", // <-- MODEL SELECT HERE (see google ai studio)
    systemInstruction: `
      You are an AI tutor for a university student.
      Student's major: ${user.major || "not specified"}
      Student's year: ${user.yearLevel || "not specified"}
      Tailor all explanations and examples to be relevant to their field of study.
      Be concise, encouraging, and academically rigorous.
      Limit all explanations to 3 simple lines.
    `,
  });
}

const chat = async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Valid message is required" });
    }

    const userId = req.user.id;

    // find active session
    const session = await prisma.studySession.findFirst({
      where: {
        userId: userId,
        status: { in: ["ACTIVE", "PAUSED"] }, // where chat can happen
      },
    });
    if (!session) {
      return res.status(StatusCodes.FORBIDDEN).json({
        error: "No active study session found. Start a session to use AI chat.",
      });
    }
    // find user
    const user = await prisma.user.findUnique({
      where: { userId: userId },
    });

    // generate AI response
    const model = getTutorModel(user);
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: message }],
        },
      ],
    });
    const aiResponse = result.response.text();

    // store user message and AI message
    await prisma.$transaction(async (tx) => {
      // user
      await tx.AIInteraction.create({
        data: {
          sessionId: session.sessionId,
          role: "USER",
          message: message,
        },
      });

      // ai
      await tx.AIInteraction.create({
        data: {
          sessionId: session.sessionId,
          role: "AI",
          message: aiResponse,
        },
      });
    });

    res.json({ response: aiResponse });
  } catch (error) {
    console.error("FULL ERROR:", error);
    res.status(500).json({ error: "AI request failed" });
  }
};

module.exports = { chat };
