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

function getTutorModel(user, supportLevel) {
  let systemInstruction = `
      You are an AI tutor for a university student.
      Student's major: ${user.major || "not specified"}
      Student's year: ${user.yearLevel || "not specified"}
      Tailor all explanations and examples to be relevant to their field of study.
      Be concise, encouraging, and academically rigorous.

      NEVER provide the direction solution.
    `;
  switch (supportLevel) {
    case 1:
      systemInstruction += `
      
      Provide 3 simple lines of explanation in this format: 1) Simple sentence explanation 2) Formula if applicable 3) Guiding hint
      Each line should be no more than 20 words.
      `;
      break;
    case 2:
      systemInstruction += `
      
      Provide 4 simple lines of explanation in this format: 1) Simple sentence explanation 2) Formula if applicable 3) Guiding hint 4) Another example
      Each line should be no more than 40 words.
      `;
      break;
    case 3:
      systemInstruction += `
      
      Provide a paragraph guiding and teaching the user. Assume a support level of 3/3. The user really needs help.
      `;
      break;
  }
  //console.log("This is the system instructions:\n", systemInstruction);
  return genAI.getGenerativeModel({
    model: "gemini-2.5-flash", // <-- MODEL SELECT HERE (see google ai studio)
    systemInstruction: systemInstruction,
  });
}

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
    // find user
    const user = await prisma.user.findUnique({
      where: { userId: userId },
    });

    // generate AI response
    const model = getTutorModel(user, supportLevel);
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
