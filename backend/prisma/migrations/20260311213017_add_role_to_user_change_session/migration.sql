/*
  Warnings:

  - You are about to drop the `UserTrack` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `hobbyTrack` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `completed` on the `StudySession` table. All the data in the column will be lost.
  - You are about to drop the column `completedAt` on the `StudySession` table. All the data in the column will be lost.
  - Added the required column `trackId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "UserTrack_userId_trackId_key";

-- DropIndex
DROP INDEX "hobbyTrack_name_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "UserTrack";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "hobbyTrack";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "HobbyTrack" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "iconUrl" TEXT NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_StudySession" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "startTime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" DATETIME,
    "lastPauseTime" DATETIME,
    "totalPausedMinutes" INTEGER NOT NULL DEFAULT 0,
    "durationMinutes" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StudySession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_StudySession" ("createdAt", "durationMinutes", "id", "userId") SELECT "createdAt", "durationMinutes", "id", "userId" FROM "StudySession";
DROP TABLE "StudySession";
ALTER TABLE "new_StudySession" RENAME TO "StudySession";
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
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
    "trackId" INTEGER NOT NULL,
    CONSTRAINT "User_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "HobbyTrack" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_User" ("avatarUrl", "checkinIntervalMinutes", "createdAt", "email", "favoriteQuote", "id", "nickname", "onboardingCompleted", "password", "resetPasswordExpires", "resetPasswordToken", "tokenBalance", "updatedAt", "username") SELECT "avatarUrl", "checkinIntervalMinutes", "createdAt", "email", "favoriteQuote", "id", "nickname", "onboardingCompleted", "password", "resetPasswordExpires", "resetPasswordToken", "tokenBalance", "updatedAt", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_resetPasswordToken_key" ON "User"("resetPasswordToken");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "HobbyTrack_name_key" ON "HobbyTrack"("name");
