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
       where: { sessionId: session.sessionId },
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
   const tokensEarned = Math.floor(totalElapsed / MINUTES_PER_TOKEN); // <- 1 token per 5 minutes
   const tokensAvailable = tokensEarned - session.tokensSpent;


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
       sessionId: session.sessionId,
       status: session.status,
       startTime: session.startTime,
       lastPauseTime: session.lastPauseTime,
       totalPausedMinutes: session.totalPausedMinutes,
       currentStudyMinutes: studyMinutes,
       tokensAvailable: tokensAvailable,
       sessionGoalMinutes: session.sessionGoalMinutes,
     },
   });
 } catch (err) {
   next(err);
 }
};


// Spend Token -- Endpoint for currently spending 1 token (for playing a mini-game)
const spendToken = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const session = await prisma.studySession.findFirst({
      where: {
        userId,
        status: { in: ["ACTIVE", "PAUSED"] },
      },
    });

    if (!session) {
      return res.json({ message: "No session found", session: null });
    }

    const now = new Date();
    const totalElapsed = Math.floor(
      (now - new Date(session.startTime)) / 60000,
    );

    const tokensEarned = Math.floor(totalElapsed / 5);
    const tokensAvailable = tokensEarned - session.tokensSpent;

    if (tokensAvailable < COST_PER_GAME) {
      return res.json({ message: "Not enough tokens" });
    }

    const updatedSession = await prisma.studySession.update({
      where: {
        id: session.id,
      },
      data: {
        tokensSpent: {
          increment: 1,
        },
      },
    });

    return res.json({
      message: "Token spent",
      session: {
        sessionId: updatedSession.id,
        status: updatedSession.status,
        tokensAvailable: tokensAvailable - 1,
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
        sessionId: updated.id,
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
        sessionId: updated.id,
        status: updated.status,
        totalPausedMinutes: updated.totalPausedMinutes,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Complete Session - User Finishes Session
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

// badge award-er helper function
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
const cancelSession = async (req, res, next) => {
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
          status: "CANCELLED",
          endTime: endTime,
          durationMinutes: studyMinutes,
          totalPausedMinutes: finalPausedMinutes,
        },
      });

      // update only total time studied
      await tx.userStats.update({
        where: { userId },
        data: {
          totalStudyMinutes: { increment: studyMinutes },
        },
      });

      return updatedSession;
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
        sessionId: updated.id,
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
