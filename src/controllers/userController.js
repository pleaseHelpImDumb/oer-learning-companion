const express = require("express");
const { StatusCodes } = require("http-status-codes");

const logon = (req, res, next) => {
  res.status(StatusCodes.OK).json({ message: "logging on!" });
};

const register = (req, res, next) => {
  // use JOI validate req.body
  // database? local storage?

  const name = req.body.name;
  const email = req.body.email;

  res.status(StatusCodes.CREATED).json({
    name: name,
    email: email,
    message: "registered!",
  });
};

// THIS DOES NOT BELONG HERE AND IS ONLY TO TEST!
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

module.exports = { logon, register, chat };
