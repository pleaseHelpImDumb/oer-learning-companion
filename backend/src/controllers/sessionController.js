const { StatusCodes } = require("http-status-codes"); // Status codes

const COST_PER_GAME = 1;
const MINUTES_PER_TOKEN = 5;
const { sessionSchema } = require("../validation/sessionSchema.js");
// Database setup
const { PrismaClient } = require("@prisma/client");
let opts;
if (!process.env.NODE_ENV || process.env.NODE_ENV == "development") {
  opts = { log: ["query"] };
} else {
  opts = {};
}
const prisma = new PrismaClient(opts);

// Helper Function for getActiveSession and spendtOKEN
function calcStudyTime(session, now = new Date()) {
  const totalElapsedMinutes = Math.floor(
    (now - new Date(session.startTime)) / 1000 / 60,
  );

  const currentPauseMinutes =
    session.status === "PAUSED" && session.lastPauseTime
      ? Math.floor((now - new Date(session.lastPauseTime)) / 1000 / 60)
      : 0;

  const studyMinutes = Math.max(
    0,
    totalElapsedMinutes - session.totalPausedMinutes - currentPauseMinutes,
  );
  const studySeconds = studyMinutes * 60; // consistent with minute-resolution storage
  const tokensEarned = Math.floor(studyMinutes / MINUTES_PER_TOKEN);

  return { studyMinutes, studySeconds, tokensEarned };
}

// Start Session
// 409 conflict if ACTIVE session exists
// Response: { session-details }
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

    const { value, error } = sessionSchema.validate(req.body);
    if (error) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: error.details[0].message,
      });
    }
    // create session
    const session = await prisma.studySession.create({
      data: {
        userId: userId,
        status: "ACTIVE",
        sessionGoalMinutes: value.sessionGoalMinutes,
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
// Also cancels sessions older than 12 hours
// Response: { session-deatils }
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
      const { studyMinutes } = calcStudyTime(session);

      await prisma.studySession.update({
        where: { sessionId: session.sessionId },
        data: {
          status: "CANCELLED",
          endTime: new Date(),
          durationMinutes: studyMinutes,
        },
      });

      return res.json({
        session: null,
        message: "Previous session was automatically ended due to inactivity",
      });
    }

    // Calculate current elapsed time
    const now = new Date();
    const { studyMinutes, studySeconds, tokensEarned } = calcStudyTime(
      session,
      now,
    );
    const tokensAvailable = Math.max(0, tokensEarned - session.tokensSpent);

    res.json({
      session: {
        sessionId: session.sessionId,
        status: session.status,
        startTime: session.startTime,
        lastPauseTime: session.lastPauseTime,
        totalPausedMinutes: session.totalPausedMinutes,
        currentStudyMinutes: studyMinutes,
        currentStudySeconds: studySeconds,
        tokensAvailable: tokensAvailable,
        sessionGoalMinutes: session.sessionGoalMinutes,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Spend Tokens
// Spends a requested number of tokens
// Request: { requestedCost }
// Response: { session-deatils }
const spendToken = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const sessionId = Number(req.params.id);
    const requestedCost = Number(req.body?.cost ?? 0);

    if (!Number.isInteger(sessionId) || sessionId <= 0) {
      return res.status(400).json({ message: "Invalid session id" });
    }

    if (!Number.isInteger(requestedCost) || requestedCost <= 0) {
      return res.status(400).json({ message: "Invalid token cost" });
    }

    const session = await prisma.studySession.findFirst({
      where: {
        sessionId,
        userId,
        status: { in: ["ACTIVE", "PAUSED"] },
      },
    });

    if (!session) {
      return res
        .status(404)
        .json({ message: "No matching active session found" });
    }

    const { tokensEarned } = calcStudyTime(session);
    const tokensAvailable = Math.max(0, tokensEarned - session.tokensSpent);

    if (tokensAvailable < requestedCost) {
      return res.status(400).json({
        message: "Not enough tokens",
        session: {
          sessionId: session.sessionId,
          status: session.status,
          tokensAvailable,
        },
      });
    }

    const updatedSession = await prisma.studySession.update({
      where: { sessionId: session.sessionId },
      data: {
        tokensSpent: {
          increment: requestedCost,
        },
      },
    });

    return res.json({
      message: "Tokens spent",
      session: {
        sessionId: updatedSession.sessionId,
        status: updatedSession.status,
        tokensAvailable: tokensAvailable - requestedCost,
      },
    });
  } catch (err) {
    console.error("spendToken error:", err);
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
        sessionId: sessionId,
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
      where: { sessionId: sessionId },
      data: {
        status: "PAUSED",
        lastPauseTime: new Date(),
      },
    });

    res.json({
      message: "Session paused",
      session: {
        sessionId: updated.sessionId,
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
        sessionId: sessionId,
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
          sessionId: session.sessionId,
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
      where: { sessionId: sessionId },
      data: {
        status: "ACTIVE",
        totalPausedMinutes: session.totalPausedMinutes + pauseDuration,
        lastPauseTime: null,
      },
    });

    res.json({
      message: "Session resumed",
      session: {
        sessionId: updated.sessionId,
        status: updated.status,
        totalPausedMinutes: updated.totalPausedMinutes,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Complete Session
// Updates user's stats and awards any badges
// Response: { session-details, badges-earned[] }
const completeSession = async (req, res, next) => {
  try {
    const sessionId = parseInt(req.params.id);
    const userId = req.user.id;
    const session = await prisma.studySession.findFirst({
      where: {
        sessionId: sessionId,
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

    const result = await prisma.$transaction(async (tx) => {
      const updatedSession = await tx.studySession.update({
        where: { sessionId: sessionId },
        data: {
          status: "COMPLETED",
          endTime: endTime,
          durationMinutes: studyMinutes,
          totalPausedMinutes: finalPausedMinutes,
        },
      });

      const updatedStats = await updateUserStats(
        tx,
        userId,
        studyMinutes,
        session,
      );
      // award bages based on those updatedStats
      const earnedBadges = await checkAndAwardBadges(
        tx,
        userId,
        updatedStats,
        updatedSession,
      );

      return { updatedSession, updatedStats, earnedBadges };
    });

    res.json({
      message: "Session completed!",
      session: {
        sessionId: result.updatedSession.sessionId,
        startTime: result.updatedSession.startTime,
        endTime: result.updatedSession.endTime,
        durationMinutes: result.updatedSession.durationMinutes,
        totalPausedMinutes: result.updatedSession.totalPausedMinutes,
      },
      rewards: {
        badgesEarned: result.earnedBadges,
      },
    });
  } catch (err) {
    next(err);
  }
};

// user stats helper function -- updates the UserStats in the DB after a completed session
async function updateUserStats(tx, userId, studyMinutes, session) {
  // get user's stats
  let stats = await tx.userStats.findUnique({
    where: { userId },
  });

  if (!stats) {
    stats = await tx.userStats.create({
      data: {
        userId,
        lastSessionDate: new Date(0),
      },
    });
  }

  const today = new Date();
  const last = new Date(stats.lastSessionDate);

  const isSameDay = today.toDateString() === last.toDateString();

  // streak logic, getting yesterday
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = yesterday.toDateString() === last.toDateString();
  let newStreak = stats.currentStreakLength;
  if (!isSameDay) {
    if (isYesterday) {
      newStreak += 1;
    } else {
      newStreak = 1;
    }
  }
  // tokens earned, adding to user lifetime
  const tokensEarned = Math.floor(studyMinutes / MINUTES_PER_TOKEN);

  return await tx.userStats.update({
    where: { userId },
    data: {
      totalStudyMinutes: { increment: studyMinutes },
      totalSessions: { increment: 1 },
      currentStreakLength: newStreak,
      longestStreakLength: Math.max(newStreak, stats.longestStreakLength),
      lastSessionDate: today,
      totalAiInteractions: { increment: session.numAiInteractions },
      totalTokensEarned: { increment: tokensEarned },
    },
  });
}

// badge awarder helper function
async function checkAndAwardBadges(tx, userId, stats, session) {
  // get all badges
  const userBadges = await tx.userBadge.findMany({
    where: { userId },
    select: { badgeId: true },
  });

  //  get all owned ids
  const ownedIds = userBadges.map((b) => b.badgeId);

  // split based on category and filter on<= threshold val
  // TOTAL_TIME
  const timeBadges = await tx.badge.findMany({
    where: {
      type: "TOTAL_TIME",
      thresholdValue: { lte: stats.totalStudyMinutes },
      badgeId: { notIn: ownedIds },
    },
  });

  // STREAK
  const streakBadges = await tx.badge.findMany({
    where: {
      type: "STREAK",
      thresholdValue: { lte: stats.currentStreakLength },
      badgeId: { notIn: ownedIds },
    },
  });

  // SESSION_COUNT
  const sessionBadges = await tx.badge.findMany({
    where: {
      type: "SESSION_COUNT",
      thresholdValue: { lte: stats.totalSessions },
      badgeId: { notIn: ownedIds },
    },
  });

  // MILESTONE
  const milestoneBadges = await tx.badge.findMany({
    where: {
      type: "MILESTONE",
      thresholdValue: { lte: stats.totalSessions },
      badgeId: { notIn: ownedIds },
    },
  });

  // construct badges earned -- put in userBadge
  const earned = [
    ...timeBadges,
    ...streakBadges,
    ...sessionBadges,
    ...milestoneBadges,
  ];

  if (earned.length === 0) return [];

  await tx.userBadge.createMany({
    data: earned.map((b) => ({
      userId,
      badgeId: b.badgeId,
    })),
    skipDuplicates: true,
  });

  return earned; //<-- array of ALL earned badges NOT ALREADY owned
}

// Cancel Session - App cancels the session
// User stats are not updated
const cancelSession = async (req, res, next) => {
  try {
    const sessionId = parseInt(req.params.id);
    const userId = req.user.id;

    const session = await prisma.studySession.findFirst({
      where: { sessionId, userId },
    });
    if (!session) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: "Session not found" });
    }
    if (session.status === "COMPLETED" || session.status === "CANCELLED") {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "Session already ended" });
    }

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

    const result = await prisma.studySession.update({
      where: { sessionId },
      data: {
        status: "CANCELLED",
        endTime,
        durationMinutes: studyMinutes,
        totalPausedMinutes: finalPausedMinutes,
      },
    });

    res.json({
      message: "Session cancelled",
      session: {
        sessionId: result.sessionId,
        durationMinutes: result.durationMinutes,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Set Session Notes - Sets note attribute for any session, no restrictions
// Request: { session-notes } No validation is done on this atm
// Response: { session-details }
const setSessionNotes = async (req, res, next) => {
  try {
    const sessionId = parseInt(req.params.id);
    const userId = req.user.id;

    const sessionNotes = req.body.sessionNotes;
    // sessionNotes validation

    const session = await prisma.studySession.findFirst({
      where: {
        sessionId: sessionId,
        userId: userId,
      },
    });
    if (!session) {
      return res.status(StatusCodes.NOT_FOUND).json({
        error: "Session not found",
      });
    }

    // validate if session is active/canceled/paused here -> restrict setting notes to active session only

    const updated = await prisma.studySession.update({
      where: { sessionId: sessionId },
      data: {
        notes: sessionNotes,
      },
    });

    res.json({
      message: "Session notes updated!",
      session: {
        sessionId: updated.sessionId,
        sessionNotes: updated.notes,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Get Session Notes
const getSessionNotes = async (req, res, next) => {
  try {
    const sessionId = parseInt(req.params.id);
    const userId = req.user.id;

    const session = await prisma.studySession.findFirst({
      where: {
        sessionId: sessionId,
        userId: userId,
      },
    });
    if (!session) {
      return res.status(StatusCodes.NOT_FOUND).json({
        error: "Session not found",
      });
    }

    res.json({
      session: {
        sessionId: session.sessionId,
        sessionNotes: session.notes,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Creates a WellnessCheck -- Possibly move to own file later
const createWellnessCheck = async (req, res, next) => {
  try {
    const sessionId = parseInt(req.params.id);
    const { feelingGood, helpChosen } = req.body; // validation later?

    const check = await prisma.wellnessCheck.create({
      data: {
        sessionId,
        feelingGood,
        helpChosen,
      },
    });

    res.json({ check });
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
  setSessionNotes,
  getSessionNotes,
  createWellnessCheck,
  spendToken,
};
