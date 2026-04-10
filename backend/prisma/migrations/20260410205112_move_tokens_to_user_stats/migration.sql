/*
  Warnings:

  - You are about to drop the column `totalTokensEarned` on the `User` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
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
    "nickname" TEXT,
    "checkinIntervalMinutes" INTEGER NOT NULL DEFAULT 5,
    "favoriteQuote" TEXT,
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "yearLevel" TEXT NOT NULL DEFAULT 'FRESHMAN',
    "major" TEXT,
    "trackId" INTEGER,
    CONSTRAINT "User_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "HobbyTrack" ("trackId") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("avatarUrl", "checkinIntervalMinutes", "createdAt", "email", "favoriteQuote", "major", "nickname", "onboardingCompleted", "password", "resetPasswordExpires", "resetPasswordToken", "role", "trackId", "updatedAt", "userId", "username", "yearLevel") SELECT "avatarUrl", "checkinIntervalMinutes", "createdAt", "email", "favoriteQuote", "major", "nickname", "onboardingCompleted", "password", "resetPasswordExpires", "resetPasswordToken", "role", "trackId", "updatedAt", "userId", "username", "yearLevel" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_resetPasswordToken_key" ON "User"("resetPasswordToken");
CREATE TABLE "new_UserStats" (
    "userId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "totalStudyMinutes" INTEGER NOT NULL DEFAULT 0,
    "totalSessions" INTEGER NOT NULL DEFAULT 0,
    "currentStreakLength" INTEGER NOT NULL DEFAULT 0,
    "longestStreakLength" INTEGER NOT NULL DEFAULT 0,
    "lastSessionDate" DATETIME,
    "totalAiInteractions" INTEGER NOT NULL DEFAULT 0,
    "totalWellnessChecks" INTEGER NOT NULL DEFAULT 0,
    "totalTokensEarned" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "UserStats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("userId") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_UserStats" ("currentStreakLength", "lastSessionDate", "longestStreakLength", "totalAiInteractions", "totalSessions", "totalStudyMinutes", "totalWellnessChecks", "userId") SELECT "currentStreakLength", "lastSessionDate", "longestStreakLength", "totalAiInteractions", "totalSessions", "totalStudyMinutes", "totalWellnessChecks", "userId" FROM "UserStats";
DROP TABLE "UserStats";
ALTER TABLE "new_UserStats" RENAME TO "UserStats";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
