/*
  Warnings:

  - The primary key for the `AIInteraction` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `AIInteraction` table. All the data in the column will be lost.
  - The primary key for the `Badge` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Badge` table. All the data in the column will be lost.
  - The primary key for the `HobbyTrack` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `HobbyTrack` table. All the data in the column will be lost.
  - The primary key for the `StudySession` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `StudySession` table. All the data in the column will be lost.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `User` table. All the data in the column will be lost.
  - The primary key for the `UserBadge` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `UserBadge` table. All the data in the column will be lost.
  - Added the required column `aiInteractionId` to the `AIInteraction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `badgeId` to the `Badge` table without a default value. This is not possible if the table is not empty.
  - Added the required column `trackId` to the `HobbyTrack` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sessionId` to the `StudySession` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AIInteraction" (
    "aiInteractionId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sessionId" INTEGER NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "message" TEXT NOT NULL,
    CONSTRAINT "AIInteraction_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "StudySession" ("sessionId") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_AIInteraction" ("createdAt", "message", "role", "sessionId") SELECT "createdAt", "message", "role", "sessionId" FROM "AIInteraction";
DROP TABLE "AIInteraction";
ALTER TABLE "new_AIInteraction" RENAME TO "AIInteraction";
CREATE TABLE "new_Badge" (
    "badgeId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL
);
INSERT INTO "new_Badge" ("category", "description", "name") SELECT "category", "description", "name" FROM "Badge";
DROP TABLE "Badge";
ALTER TABLE "new_Badge" RENAME TO "Badge";
CREATE UNIQUE INDEX "Badge_name_key" ON "Badge"("name");
CREATE TABLE "new_HobbyTrack" (
    "trackId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "iconUrl" TEXT NOT NULL
);
INSERT INTO "new_HobbyTrack" ("description", "iconUrl", "name") SELECT "description", "iconUrl", "name" FROM "HobbyTrack";
DROP TABLE "HobbyTrack";
ALTER TABLE "new_HobbyTrack" RENAME TO "HobbyTrack";
CREATE UNIQUE INDEX "HobbyTrack_name_key" ON "HobbyTrack"("name");
CREATE TABLE "new_StudySession" (
    "sessionId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "startTime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" DATETIME,
    "lastPauseTime" DATETIME,
    "totalPausedMinutes" INTEGER NOT NULL DEFAULT 0,
    "durationMinutes" INTEGER,
    CONSTRAINT "StudySession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("userId") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_StudySession" ("durationMinutes", "endTime", "lastPauseTime", "startTime", "status", "totalPausedMinutes", "userId") SELECT "durationMinutes", "endTime", "lastPauseTime", "startTime", "status", "totalPausedMinutes", "userId" FROM "StudySession";
DROP TABLE "StudySession";
ALTER TABLE "new_StudySession" RENAME TO "StudySession";
CREATE TABLE "new_User" (
    "userId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "role" TEXT NOT NULL DEFAULT 'STUDENT',
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "avatarUrl" TEXT NOT NULL DEFAULT 'assets/profiles/profile0.png',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "resetPasswordToken" TEXT,
    "resetPasswordExpires" DATETIME,
    "tokenBalance" INTEGER NOT NULL DEFAULT 0,
    "nickname" TEXT,
    "checkinIntervalMinutes" INTEGER NOT NULL DEFAULT 5,
    "favoriteQuote" TEXT,
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "trackId" INTEGER,
    CONSTRAINT "User_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "HobbyTrack" ("trackId") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("avatarUrl", "checkinIntervalMinutes", "createdAt", "email", "favoriteQuote", "nickname", "onboardingCompleted", "password", "resetPasswordExpires", "resetPasswordToken", "role", "tokenBalance", "trackId", "updatedAt", "username") SELECT "avatarUrl", "checkinIntervalMinutes", "createdAt", "email", "favoriteQuote", "nickname", "onboardingCompleted", "password", "resetPasswordExpires", "resetPasswordToken", "role", "tokenBalance", "trackId", "updatedAt", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_resetPasswordToken_key" ON "User"("resetPasswordToken");
CREATE TABLE "new_UserBadge" (
    "userId" INTEGER NOT NULL,
    "badgeId" INTEGER NOT NULL,
    "unlockedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("userId", "badgeId"),
    CONSTRAINT "UserBadge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("userId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserBadge_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "Badge" ("badgeId") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_UserBadge" ("badgeId", "unlockedAt", "userId") SELECT "badgeId", "unlockedAt", "userId" FROM "UserBadge";
DROP TABLE "UserBadge";
ALTER TABLE "new_UserBadge" RENAME TO "UserBadge";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
