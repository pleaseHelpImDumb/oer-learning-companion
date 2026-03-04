const express = require("express");
const { StatusCodes } = require("http-status-codes");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// SECURITY
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const { xss } = require("express-xss-sanitizer");
const rateLimiter = require("express-rate-limit");
app.set("trust proxy", 1);
// limit each IP to 100 requests per 15 minutes
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 100,
  }),
);
app.use(helmet()); // Security headers
app.use(cookieParser());
app.use(xss()); // Sanitize user input

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// GLOBAL
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// ROUTES
app.get("/health", (req, res) => {
  res.status(StatusCodes.OK).json({ status: "Health okay!" });
});

// ROUTES / ROUTERS
const userRouter = require("./src/routes/userRouter.js");
app.use("/users", userRouter);

// NOT FOUND
app.use((req, res) => {
  res.status(StatusCodes.NOT_FOUND).json({ error: "Page not found!" });
});
//
app.use((err, req, res, next) => {
  console.log(err.stack);
  res
    .status(StatusCodes.INTERNAL_SERVER_ERROR)
    .json({ error: "Something broke!" });
});

// SERVER
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
