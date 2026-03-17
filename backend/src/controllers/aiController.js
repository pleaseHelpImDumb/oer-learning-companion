// THIS DOES NOT BELONG HERE AND IS ONLY TO TEST AI RESPONSE
require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const chat = async (req, res, next) => {
  try {
    const { message } = req.body;
    const userId = req.user.id; // get from auth middleware
    const user = await prisma.user.findUnique({
      where: { email: email },
    });
    const model = genAI.getTutorModel(user);
    const result = await model.generateContent(message);
    const aiResponse = result.response.text();

    res.json({ response: aiResponse });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "AI request failed" });
  }
};
// -----------------------------------------------

const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function getTutorModel(user) {
  return genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: `
      You are an AI tutor for a university student.
      Student's major: ${user.major}
      Student's year: ${user.yearLevel}
      Tailor all explanations and examples to be relevant to their field of study.
      Be concise, encouraging, and academically rigorous.
    `,
  });
}
