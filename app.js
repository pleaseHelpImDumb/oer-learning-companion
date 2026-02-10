const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const { StatusCodes } = require("http-status-codes");

app.use(express.json());

// GLOBAL
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});
app.use(express.static("public"));

// ROUTES
app.get("/health", (req, res) => {
  res.status(StatusCodes.OK).json({ status: "test health" });
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
