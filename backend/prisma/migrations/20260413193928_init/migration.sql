-- CreateEnum
CREATE TYPE "AIRole" AS ENUM ('USER', 'AI');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('STUDENT', 'ADMIN');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "StudentYear" AS ENUM ('FRESHMAN', 'SOPHOMORE', 'JUNIOR', 'SENIOR');

-- CreateEnum
CREATE TYPE "Group" AS ENUM ('CONTROL', 'TREATMENT');

-- CreateEnum
CREATE TYPE "BadgeType" AS ENUM ('TOTAL_TIME', 'SESSION_COUNT', 'STREAK', 'MILESTONE');

-- CreateTable
CREATE TABLE "User" (
    "userId" SERIAL NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'STUDENT',
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "avatarUrl" TEXT NOT NULL DEFAULT 'assets/profiles/profile0.png',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "resetPasswordToken" TEXT,
    "resetPasswordExpires" TIMESTAMP(3),
    "nickname" TEXT,
    "checkinIntervalMinutes" INTEGER NOT NULL DEFAULT 5,
    "favoriteQuote" TEXT,
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "yearLevel" "StudentYear" NOT NULL DEFAULT 'FRESHMAN',
    "major" TEXT,
    "trackId" INTEGER,

    CONSTRAINT "User_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "HobbyTrack" (
    "trackId" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "iconUrl" TEXT NOT NULL,

    CONSTRAINT "HobbyTrack_pkey" PRIMARY KEY ("trackId")
);

-- CreateTable
CREATE TABLE "Badge" (
    "badgeId" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "BadgeType" NOT NULL,
    "thresholdValue" INTEGER,
    "iconUrl" TEXT NOT NULL,

    CONSTRAINT "Badge_pkey" PRIMARY KEY ("badgeId")
);

-- CreateTable
CREATE TABLE "UserBadge" (
    "userId" INTEGER NOT NULL,
    "badgeId" INTEGER NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserBadge_pkey" PRIMARY KEY ("userId","badgeId")
);

-- CreateTable
CREATE TABLE "UserStats" (
    "userId" INTEGER NOT NULL,
    "totalStudyMinutes" INTEGER NOT NULL DEFAULT 0,
    "totalSessions" INTEGER NOT NULL DEFAULT 0,
    "currentStreakLength" INTEGER NOT NULL DEFAULT 0,
    "longestStreakLength" INTEGER NOT NULL DEFAULT 0,
    "lastSessionDate" TIMESTAMP(3),
    "totalAiInteractions" INTEGER NOT NULL DEFAULT 0,
    "totalWellnessChecks" INTEGER NOT NULL DEFAULT 0,
    "totalTokensEarned" INTEGER NOT NULL DEFAULT 0,
    "totalBreaks" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "UserStats_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "StudySession" (
    "sessionId" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "status" "SessionStatus" NOT NULL DEFAULT 'ACTIVE',
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3),
    "lastPauseTime" TIMESTAMP(3),
    "totalPausedMinutes" INTEGER NOT NULL DEFAULT 0,
    "durationMinutes" INTEGER,
    "numAiInteractions" INTEGER NOT NULL DEFAULT 0,
    "tokensSpent" INTEGER NOT NULL DEFAULT 0,
    "group" "Group",
    "notes" TEXT,

    CONSTRAINT "StudySession_pkey" PRIMARY KEY ("sessionId")
);

-- CreateTable
CREATE TABLE "AIInteraction" (
    "aiInteractionId" SERIAL NOT NULL,
    "sessionId" INTEGER NOT NULL,
    "role" "AIRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "message" TEXT NOT NULL,
    "supportLevel" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "AIInteraction_pkey" PRIMARY KEY ("aiInteractionId")
);

-- CreateTable
CREATE TABLE "WellnessCheck" (
    "wellnessCheckId" SERIAL NOT NULL,
    "sessionId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "feelingGood" BOOLEAN NOT NULL,
    "helpChosen" TEXT NOT NULL,

    CONSTRAINT "WellnessCheck_pkey" PRIMARY KEY ("wellnessCheckId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_resetPasswordToken_key" ON "User"("resetPasswordToken");

-- CreateIndex
CREATE UNIQUE INDEX "HobbyTrack_name_key" ON "HobbyTrack"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Badge_name_key" ON "Badge"("name");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "HobbyTrack"("trackId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBadge" ADD CONSTRAINT "UserBadge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBadge" ADD CONSTRAINT "UserBadge_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "Badge"("badgeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserStats" ADD CONSTRAINT "UserStats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudySession" ADD CONSTRAINT "StudySession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIInteraction" ADD CONSTRAINT "AIInteraction_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "StudySession"("sessionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WellnessCheck" ADD CONSTRAINT "WellnessCheck_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "StudySession"("sessionId") ON DELETE RESTRICT ON UPDATE CASCADE;
