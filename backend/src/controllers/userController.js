const { StatusCodes } = require("http-status-codes"); // Status codes

// Validation
const Joi = require("joi");
const { registerSchema, loginSchema } = require("../validation/userSchema");

// Database
const { PrismaClient } = require("@prisma/client");
let opts;
if (!process.env.NODE_ENV || process.env.NODE_ENV == "development") {
  opts = { log: ["query"] };
} else {
  opts = {};
}
const prisma = new PrismaClient(opts);

// Password hashing
const bcrypt = require("bcrypt");

// Security
const jwt = require("jsonwebtoken");
const { generateCSRFToken } = require("../utils/csrf");

// Functions
// LOGIN
const login = async (req, res, next) => {
  try {
    // Validation - Name OR email and password
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: error.details[0].message,
      });
    }
    const { identity, password } = value;

    // Find user by email OR name
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identity }, { name: identity }],
      },
    });
    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        error: "Invalid credentials",
      });
    }

    // Password check! Compare req.password with hashed pass in database
    const pass = await bcrypt.compare(password, user.password);

    if (!pass) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        error: "Invalid password",
      });
    }

    // Security
    const csrfToken = generateCSRFToken();
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        csrfToken: csrfToken,
      },
      process.env.JWT_SECRET,
      { expiresIn: "3h" },
    );

    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3 * 60 * 60 * 1000,
    });

    res.json({
      message: "Log-in success!",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      csrfToken: csrfToken,
    });
  } catch (err) {
    next(err);
  }
};
// REGISTER
const register = async (req, res, next) => {
  try {
    // Validation
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: error.details[0].message,
      });
    }

    const { name, email, password } = value;

    // Check if already registered?
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser)
      return res
        .status(StatusCodes.CONFLICT)
        .json({ error: "User already exists!" });

    // If not, create the new user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    // Security CSRF & JWT:
    const csrfToken = generateCSRFToken();
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        csrfToken: csrfToken,
      },
      process.env.JWT_SECRET,
      { expiresIn: "3h" },
    );

    // Set httpOnly cookie
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3 * 60 * 60 * 1000, // 7 days
    });
    // Return success (without password)
    // Add jwt/csrf security later
    res.status(StatusCodes.CREATED).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      csrfToken: csrfToken,
      message: `Welcome, ${user.name}! Your account has been registered.`,
    });
  } catch (err) {
    next(err);
  }
};

const logout = (req, res) => {
  res.clearCookie("jwt");
  res.json({ message: "Logged out" });
};

// THIS DOES NOT BELONG HERE AND IS ONLY TO TEST AI RESPONSR
require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const chat = async (req, res, next) => {
  try {
    const { message } = req.body;

    const model = genAI.getGenerativeModel({ model: "gemma-3-12b-it" });
    const result = await model.generateContent(message);
    const aiResponse = result.response.text();

    res.json({ response: aiResponse });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "AI request failed" });
  }
};
// -----------------------------------------------

module.exports = { login, register, chat, logout };
