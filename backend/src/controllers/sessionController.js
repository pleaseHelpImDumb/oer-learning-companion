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

// Get Active Session
const getActiveSession = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const session = await prisma.studySession.findFirst({
      where: {
        userId: userId,
        status: { in: ["ACTIVE", "PAUSED"] },
      },
    });

    if (!session) {
      return res.json({ session: null });
    }

    // Check if session is abandoned (older than 12 hours)
    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);

    if (new Date(session.startTime) < twelveHoursAgo) {
      // Auto-end abandoned session
      const totalMinutes = Math.floor(
        (new Date() - new Date(session.startTime)) / 1000 / 60,
      );

      await prisma.studySession.update({
        where: { id: session.id },
        data: {
          status: "CANCELLED",
          endTime: new Date(),
          durationMinutes: totalMinutes - session.totalPausedMinutes,
        },
      });

      return res.json({
        session: null,
        message: "Previous session was automatically ended due to inactivity",
      });
    }

    // Calculate current elapsed time
    const now = new Date();
    const totalElapsed = Math.floor(
      (now - new Date(session.startTime)) / 1000 / 60,
    );

    let currentPauseDuration = 0;
    if (session.status === "PAUSED" && session.lastPauseTime) {
      currentPauseDuration = Math.floor(
        (now - new Date(session.lastPauseTime)) / 1000 / 60,
      );
    }

    const studyMinutes =
      totalElapsed - session.totalPausedMinutes - currentPauseDuration;

    res.json({
      session: {
        id: session.id,
        status: session.status,
        startTime: session.startTime,
        lastPauseTime: session.lastPauseTime,
        totalPausedMinutes: session.totalPausedMinutes,
        currentStudyMinutes: studyMinutes,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Pause Session
const pauseSession = async (req, res, next) => {
  try {
    const sessionId = parseInt(req.params.id);
    const userId = req.user.id;

    const session = await prisma.studySession.findFirst({
      where: {
        id: sessionId,
        userId: userId,
      },
    });

    if (!session) {
      return res.status(StatusCodes.NOT_FOUND).json({
        error: "Session not found",
      });
    }

    if (session.status !== "ACTIVE") {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: "Session is not active",
      });
    }

    const updated = await prisma.studySession.update({
      where: { id: sessionId },
      data: {
        status: "PAUSED",
        lastPauseTime: new Date(),
      },
    });

    res.json({
      message: "Session paused",
      session: {
        id: updated.id,
        status: updated.status,
        lastPauseTime: updated.lastPauseTime,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Resume Session
const resumeSession = async (req, res, next) => {
  try {
    const sessionId = parseInt(req.params.id);
    const userId = req.user.id;

    const session = await prisma.studySession.findFirst({
      where: {
        id: sessionId,
        userId: userId,
      },
    });

    if (!session) {
      return res.status(StatusCodes.NOT_FOUND).json({
        error: "Session not found",
      });
    }

    // Idempotent - already active? Just return
    if (session.status === "ACTIVE") {
      return res.json({
        message: "Session already active",
        session: {
          id: session.id,
          status: session.status,
          totalPausedMinutes: session.totalPausedMinutes,
        },
      });
    }

    if (session.status === "COMPLETED" || session.status === "CANCELLED") {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: "Cannot resume completed or cancelled session",
      });
    }

    // Calculate pause duration
    const pauseDuration = Math.floor(
      (new Date() - new Date(session.lastPauseTime)) / 1000 / 60,
    );

    const updated = await prisma.studySession.update({
      where: { id: sessionId },
      data: {
        status: "ACTIVE",
        totalPausedMinutes: session.totalPausedMinutes + pauseDuration,
        lastPauseTime: null,
      },
    });

    res.json({
      message: "Session resumed",
      session: {
        id: updated.id,
        status: updated.status,
        totalPausedMinutes: updated.totalPausedMinutes,
      },
    });
  } catch (err) {
    next(err);
  }
};
// calculateTokens - helper function for some calculation on determining token amount
// CURRENT CALCULATION: 1 token / 5 minutes studied
function calculateTokens(studyMinutes) {
  return Math.floor(studyMinutes / 5);
}

// Complete Session - User Finishes Session (Awards Tokens)
const completeSession = async (req, res, next) => {
  try {
    const sessionId = parseInt(req.params.id);
    const userId = req.user.id;
    const session = await prisma.studySession.findFirst({
      where: {
        id: sessionId,
        userId: userId,
      },
    });
    if (!session) {
      return res.status(StatusCodes.NOT_FOUND).json({
        error: "Session not found",
      });
    }

    // validate session is active
    if (session.status === "COMPLETED" || session.status === "CANCELLED") {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: "Session already ended",
      });
    }

    // time calculations
    const endTime = new Date();
    let finalPausedMinutes = session.totalPausedMinutes;
    if (session.status === "PAUSED" && session.lastPauseTime) {
      const lastPauseDuration = Math.floor(
        (endTime - new Date(session.lastPauseTime)) / 1000 / 60,
      );
      finalPausedMinutes += lastPauseDuration;
    }
    const totalMinutes = Math.floor(
      (endTime - new Date(session.startTime)) / 1000 / 60,
    );
    const studyMinutes = totalMinutes - finalPausedMinutes;

    // token calculations
    const tokensEarned = calculateTokens(studyMinutes);

    const result = await prisma.$transaction(async (tx) => {
      const updatedSession = await tx.studySession.update({
        where: { id: sessionId },
        data: {
          status: "COMPLETED",
          endTime: endTime,
          durationMinutes: studyMinutes,
          totalPausedMinutes: finalPausedMinutes,
        },
      });

      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { tokenBalance: { increment: tokensEarned } },
      });

      // badges WIP
      // await checkAndAwardBadges(tx, userId);

      return { updatedSession, updatedUser };
    });

    res.json({
      message: "Session completed!",
      session: {
        id: result.updatedSession.id,
        startTime: result.updatedSession.startTime,
        endTime: result.updatedSession.endTime,
        durationMinutes: result.updatedSession.durationMinutes,
        totalPausedMinutes: result.updatedSession.totalPausedMinutes,
      },
      rewards: {
        tokensEarned: tokensEarned,
        totalTokens: result.updatedUser.tokens,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Cancel Session - App cancels the session
const cancelSession = async (req, res, next) => {
  try {
    const sessionId = parseInt(req.params.id);
    const userId = req.user.id;
    const session = await prisma.studySession.findFirst({
      where: {
        id: sessionId,
        userId: userId,
      },
    });
    if (!session) {
      return res.status(StatusCodes.NOT_FOUND).json({
        error: "Session not found",
      });
    }

    // validate session is active
    if (session.status === "COMPLETED" || session.status === "CANCELLED") {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: "Session already ended",
      });
    }

    // time calculations
    const endTime = new Date();
    let finalPausedMinutes = session.totalPausedMinutes;
    if (session.status === "PAUSED" && session.lastPauseTime) {
      const lastPauseDuration = Math.floor(
        (endTime - new Date(session.lastPauseTime)) / 1000 / 60,
      );
      finalPausedMinutes += lastPauseDuration;
    }
    const totalMinutes = Math.floor(
      (endTime - new Date(session.startTime)) / 1000 / 60,
    );
    const studyMinutes = totalMinutes - finalPausedMinutes;

    // NO token reward
    const updated = await prisma.studySession.update({
      where: { id: sessionId },
      data: {
        status: "CANCELLED",
        endTime: endTime,
        durationMinutes: studyMinutes,
        totalPausedMinutes: finalPausedMinutes,
      },
    });

    res.json({
      message: "Session cancelled",
      session: {
        id: updated.id,
        durationMinutes: updated.durationMinutes,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  startSession,
  getActiveSession,
  pauseSession,
  resumeSession,
  completeSession,
  cancelSession,
};
