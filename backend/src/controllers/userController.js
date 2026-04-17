const { StatusCodes } = require("http-status-codes"); // Status codes

// Validation
const Joi = require("joi");
const {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  onboardSchema,
} = require("../validation/userSchema");

// Database setup
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
const crypto = require("crypto");

// Security
const jwt = require("jsonwebtoken");
const { generateCSRFToken } = require("../utils/csrf");

// Emailer for Forgot Password
const { sendPasswordResetEmail } = require("../utils/emailService");

// FUNCTIONS ************************************************************************************************

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
        OR: [{ email: identity }, { username: identity }],
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
        userId: user.userId,
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
        userId: user.userId,
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

    const { username, email, password } = value;

    // check if already registered? via email
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser)
      return res
        .status(StatusCodes.CONFLICT)
        .json({ error: "User already exists!" });

    // If not, create the new user
    const hashedPassword = await bcrypt.hash(password, 10);
    // create user and user's stats
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
        },
      });

      await tx.userStats.create({
        data: {
          user: {
            connect: { userId: user.userId },
          },
          lastSessionDate: null,
        },
      });

      return user;
    });

    // Security CSRF & JWT:
    const csrfToken = generateCSRFToken();
    const token = jwt.sign(
      {
        userId: result.userId,
        email: result.email,
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
        userId: result.userId,
        username: result.username,
        email: result.email,
      },
      csrfToken: csrfToken,
      message: `Welcome, ${result.username}! Your account has been registered.`,
    });
  } catch (err) {
    next(err);
  }
};
// LOGOUT (Clear Cookie)
const logout = (req, res) => {
  res.clearCookie("jwt");
  res.status(StatusCodes.OK).json({ message: "Logged out" });
};

// FORGOT-PASSWORD (Sends Email if Email exists)
const forgotPassword = async (req, res, next) => {
  try {
    // validate
    console.log(req.body);
    const { error, value } = forgotPasswordSchema.validate(req.body);
    if (error) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: error.details[0].message,
      });
    }
    const { email } = value;

    // find user
    const user = await prisma.user.findUnique({
      where: { email: email },
    });

    if (!user) {
      return res.json({
        message: "If that email exists, a reset link has been sent",
      });
    }

    // generate token and hashed version
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    await prisma.user.update({
      where: { userId: user.userId },
      data: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: new Date(Date.now() + 30 * 60 * 1000), // 30 min
      },
    });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    await sendPasswordResetEmail(user.email, resetUrl);

    console.log(`Reset token for ${email}: ${resetToken}`); // For testing

    res.json({
      message: "If that email exists, a reset link has been sent",
    });
  } catch (err) {
    next(err);
  }
};
// RESET-PASSWORD (If tokens and dates are good, update password with new hashed password)
const resetPassword = async (req, res, next) => {
  try {
    // validate
    const { error, value } = resetPasswordSchema.validate(req.body);
    if (error) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: error.details[0].message,
      });
    }
    const { token, newPassword } = value;

    // get hashed token
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // find user w/ hashed token && before expired dated
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: {
          gt: new Date(),
        },
      },
    });
    if (!user) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: "Invalid or expired reset token",
      });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // we found user, hashed password, and can now UPDATE
    await prisma.user.update({
      where: { userId: user.userId },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    res.status(OK).json({
      message: "Password reset successful. You can now log in.",
    });
  } catch (err) {
    next(err);
  }
};

// ONBOARDING (Fills avatar, checkinInterval, favQuote)
const onboard = async (req, res, next) => {
  try {
    const { error, value } = onboardSchema.validate(req.body);
    if (error) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: error.details[0].message,
      });
    }

    const {
      favoriteQuote,
      avatarUrl,
      checkInIntervalMinutes,
      trackId,
      nickname,
      yearLevel,
      major,
    } = value;
    const userId = req.user.id; // get from auth middleware

    // find track
    const track = await prisma.hobbyTrack.findUnique({
      where: { trackId: trackId },
    });
    if (!track) {
      return res.status(StatusCodes.NOT_FOUND).json({
        error: "Selected track not found",
      });
    }

    const yearLevelMap = {
      1: "FRESHMAN",
      2: "SOPHOMORE",
      3: "JUNIOR",
      4: "SENIOR",
    };
    const yearLevelEnum = yearLevelMap[Number(yearLevel)];

    // user
    const updatedUser = await prisma.user.update({
      where: { userId: userId },
      data: {
        favoriteQuote: favoriteQuote,
        avatarUrl: avatarUrl,
        checkinIntervalMinutes: checkInIntervalMinutes,
        onboardingCompleted: true,
        nickname: nickname,
        trackId: trackId,
        yearLevel: yearLevelEnum,
        major: major,
      },
    });

    return res.status(StatusCodes.OK).json({
      message: "Onboarding completed",
      user: {
        userId: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        nickname: updatedUser.nickname,
        favoriteQuote: updatedUser.favoriteQuote,
        avatarUrl: updatedUser.avatarUrl,
        checkInIntervalMinutes: updatedUser.checkInIntervalMinutes,
        onboardingCompleted: updatedUser.onboardingCompleted,
        yearLevel: updatedUser.yearLevel,
        major: updatedUser.major,
      },
      selectedTrack: {
        trackId: track.trackId,
        name: track.name,
        description: track.description,
      },
    });
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(StatusCodes.CONFLICT).json({
        error: "You have already selected this track",
      });
    }
    next(err);
  }
};

// getCurrentUser (GET for basic user information)
const getCurrentUser = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await prisma.user.findUnique({
      where: { userId },
      include: {
        userBadges: {
          select: {
            unlockedAt: true,
            badge: {
              select: {
                badgeId: true,
                name: true,
                description: true,
                iconUrl: true,
              },
            },
          },
        },
        userStats: true,
      },
    });

    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        error: "User not found",
      });
    }

    const badges = user.userBadges.map((ub) => ({
      badgeId: ub.badge.badgeId,
      name: ub.badge.name,
      description: ub.badge.description,
      iconUrl: ub.badge.iconUrl,
      unlockedAt: ub.unlockedAt,
    }));
    res.status(StatusCodes.OK).json({
      user: {
        userId: user.userId,
        username: user.username,
        displayName: user.nickname,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        favoriteQuote: user.favoriteQuote,
        checkinIntervalMinutes: user.checkinIntervalMinutes,
        onboardingCompleted: user.onboardingCompleted,
        createdAt: user.createdAt,
        track: user.track,
        totalTokensEarned: user.userStats?.totalTokensEarned ?? 0,
        badges: badges,
      },
    });
  } catch (err) {
    next(err);
  }
};

// simply increments the user # of breaks for UserStats
const incrementBreakCount = async (req, res, next) => {
  const userId = req.user.id;
  const user = await prisma.userStats.findUnique({
    where: { userId },
  });

  if (!user) {
    return res.status(StatusCodes.NOT_FOUND).json({
      error: "User not found",
    });
  }

  try {
    const result = await prisma.userStats.update({
      where: { userId },
      data: {
        totalBreaks: { increment: 1 },
      },
    });

    res.status(StatusCodes.OK).json({
      totalBreaks: result.totalBreaks,
    });
  } catch (err) {
    next(err);
  }
};

// gets all user stats lifetime and total minutes for the past week
const getWeekStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await prisma.userStats.findUnique({
      where: { userId },
    });

    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        error: "User not found",
      });
    }

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // get hours for the past week
    const weeklyStudy = await prisma.studySession.aggregate({
      where: {
        userId,
        status: "COMPLETED",
        endTime: {
          gte: oneWeekAgo,
        },
      },
      _sum: {
        durationMinutes: true,
      },
    });
    // get lifetime stats
    const stats = await prisma.userStats.findUnique({
      where: { userId },
    });

    res.status(StatusCodes.OK).json({
      // weekly
      weeklyMinsStudied: weeklyStudy._sum.durationMinutes || 0,
      // lifetime
      totalCheckIns: stats.totalWellnessChecks,
      totalMinutes: stats.totalStudyMinutes,
      aiHelpCount: stats.totalAiInteractions,
      totalBreaks: stats.totalBreaks,
    });
    res.status(StatusCodes.OK).json({});
  } catch (err) {
    next(err);
  }
};

module.exports = {
  login,
  register,
  forgotPassword,
  resetPassword,
  logout,
  onboard,
  getCurrentUser,
  incrementBreakCount,
  getWeekStats,
};
