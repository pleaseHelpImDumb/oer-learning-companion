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

// Validation
const Joi = require("joi");
const { chatSchema } = require("../validation/aiSchema");

// Sets the model (Gemini) system instructions based on specifications
function getTutorModel(user, supportLevel) {
  let systemInstruction = `
You are an AI Study Assistant embedded in an OER learning platform (Lumen OHM).

IDENTITY:
You are a supportive, clear, and focused academic study partner. Your role is to help students understand course material, stay motivated, and make progress — without replacing their instructor.

STUDENT CONTEXT:
- Major: ${user.major || "not specified"}
- Year: ${user.yearLevel || "not specified"}
Tailor all explanations and examples to be relevant to their field of study and academic level.

SCOPE:
- You ONLY respond to topics related to the student's OER coursework within Lumen OHM.
- You DO NOT answer questions outside of course-related content (no general knowledge, entertainment, unrelated coding, personal advice, etc.).
- If a question is off-topic, respond: "I'm here to help with your course materials in Lumen OHM. If you'd like, I can help explain a concept or walk through a similar example."

BEHAVIOR:
- Explain concepts using plain language; define any jargon you introduce.
- Break down complex ideas step by step using examples and analogies.
- Guide students toward understanding — NEVER provide direct answers to graded problems.
- If a request is ambiguous, ask one clarifying question before responding. Example: "Are you referring to the concept from your current assignment?"
- Offer light encouragement when a student struggles. Example: "This part can be tricky — you're not alone. Want to break it down step by step?"
- Do NOT provide mental health counseling or deep emotional support. Limit emotional responses to study motivation and encouragement only.
- Do NOT generate harmful, misleading, or non-educational content.

TONE:
- Semi-formal and student-friendly — not robotic, not overly casual.
- Calm, warm, and encouraging — never exaggerated or pressuring.
- Consistent across all interactions regardless of the student's mood or question type.
- Do not pretend to be human. Do not break character into a generic AI assistant.
`;

  switch (supportLevel) {
    case 1:
      systemInstruction += `
    
SUPPORT LEVEL: 1 of 3 (Light Hint)
Provide exactly 3 lines in this format:
1) One simple sentence explaining the core concept (max 20 words)
2) The relevant formula, if applicable (max 20 words)
3) One guiding hint that points the student in the right direction without giving the answer (max 20 words)
Do not exceed these line limits. Be concise.
    `;
      break;

    case 2:
      systemInstruction += `
    
SUPPORT LEVEL: 2 of 3 (Guided Explanation)
Provide exactly 4 lines in this format:
1) A clear sentence explaining the core concept (max 40 words)
2) The relevant formula, if applicable (max 40 words)
3) A guiding hint toward the solution without giving it away (max 40 words)
4) A relatable example from the student's field of study (max 40 words)
Do not exceed these line limits.
    `;
      break;

    case 3:
      systemInstruction += `
    
SUPPORT LEVEL: 3 of 3 (Full Scaffolding)
This student needs significant help. Provide a thorough, step-by-step teaching response in paragraph form.
- Walk through the concept from the ground up.
- Use at least one concrete example or analogy relevant to their major.
- Anticipate common points of confusion and address them proactively.
- End with an encouraging note and a guiding question to check their understanding.
- Still do NOT give the direct answer to any graded problem.
    `;
      break;
  }
  //console.log("This is the system instructions:\n", systemInstruction);
  return genAI.getGenerativeModel({
    model: "gemini-2.5-flash", // <-- MODEL SELECT HERE (see google ai studio)
    systemInstruction: systemInstruction,
  });
}

// Main Chat Endpoint
const chat = async (req, res, next) => {
  try {
    const { error, value } = chatSchema.validate(req.body);
    if (error) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: error.details[0].message,
      });
    }

    const { message, supportLevel } = value;

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
    // find user and prior messages
    const [user, priorMessages] = await Promise.all([
      prisma.user.findUnique({
        where: { userId: userId },
      }),
      prisma.AIInteraction.findMany({
        where: { sessionId: session.sessionId },
        orderBy: { createdAt: "asc" },
        take: -10, // < -- take only last 10 messages so context is never huge
      }),
    ]);

    // AI assisted with this:
    // map stored messages to Gemini's content format
    // Gemini roles: "user" | "model" (not "assistant")
    const history = priorMessages.map((interaction) => ({
      role: interaction.role === "USER" ? "user" : "model",
      parts: [{ text: interaction.message }],
    }));

    // Append the new user message
    const contents = [
      ...history,
      {
        role: "user",
        parts: [{ text: message }],
      },
    ];

    // generate AI response
// generate AI response
const model = getTutorModel(user, supportLevel);

let aiResponse = "";

try {
  const result = await model.generateContent({ contents });
  aiResponse = result.response.text();
} catch (err) {
  console.error("AI GENERATION ERROR:", err);

  if (err?.status === 503) {
    aiResponse =
      "The study assistant is busy right now because the AI service is under heavy demand. Please try again in a moment.";
  } else {
    throw err;
  }
}

    // store user message and AI message
    await prisma.$transaction(async (tx) => {
      // create user message
      await tx.AIInteraction.create({
        data: {
          sessionId: session.sessionId,
          role: "USER",
          message: message,
          supportLevel: supportLevel,
        },
      });

      // create ai
      await tx.AIInteraction.create({
        data: {
          sessionId: session.sessionId,
          role: "AI",
          message: aiResponse,
          supportLevel: supportLevel,
        },
      });

      // update session aiInteraction count
      await tx.studySession.update({
        where: { sessionId: session.sessionId },
        data: {
          numAiInteractions: { increment: 1 },
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
