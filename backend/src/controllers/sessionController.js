const { StatusCodes } = require("http-status-codes"); // Status codes

// Database
const { PrismaClient } = require("@prisma/client");
let opts;
if (!process.env.NODE_ENV || process.env.NODE_ENV == "development") {
  opts = { log: ["query"] };
} else {
  opts = {};
}
const prisma = new PrismaClient(opts);

// Start Session
const startSession = async (req, res, next) => {
  try {
    const userId = req.user.id; // get from auth middleware

    // check for active session
    const activeSession = await prisma.studySession.findFirst({
      where: {
        userId: userId,
        status: { in: ["ACTIVE", "PAUSED"] },
      },
    });
    if (activeSession) {
      return res.status(StatusCodes.CONFLICT).json({
        error: "You already have an active session. Please end it first.",
      });
    }

    // create session
    const session = await prisma.studySession.create({
      data: {
        userId: userId,
        status: "ACTIVE",
      },
    });

    res
      .status(StatusCodes.CREATED)
      .json({ message: "Study session started!", session });
  } catch (err) {
    next(err);
  }
};

module.exports = { startSession };
