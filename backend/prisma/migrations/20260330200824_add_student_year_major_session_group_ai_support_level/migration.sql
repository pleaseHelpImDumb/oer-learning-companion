-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AIInteraction" (
    "aiInteractionId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sessionId" INTEGER NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "message" TEXT NOT NULL,
    "supportLevel" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "AIInteraction_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "StudySession" ("sessionId") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_AIInteraction" ("aiInteractionId", "createdAt", "message", "role", "sessionId") SELECT "aiInteractionId", "createdAt", "message", "role", "sessionId" FROM "AIInteraction";
DROP TABLE "AIInteraction";
ALTER TABLE "new_AIInteraction" RENAME TO "AIInteraction";
CREATE TABLE "new_StudySession" (
    "sessionId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "startTime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" DATETIME,
    "lastPauseTime" DATETIME,
    "totalPausedMinutes" INTEGER NOT NULL DEFAULT 0,
    "durationMinutes" INTEGER,
    "numAiInteractions" INTEGER NOT NULL DEFAULT 0,
    "group" TEXT,
    CONSTRAINT "StudySession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("userId") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_StudySession" ("durationMinutes", "endTime", "lastPauseTime", "sessionId", "startTime", "status", "totalPausedMinutes", "userId") SELECT "durationMinutes", "endTime", "lastPauseTime", "sessionId", "startTime", "status", "totalPausedMinutes", "userId" FROM "StudySession";
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
    "yearLevel" TEXT NOT NULL DEFAULT 'FRESHMAN',
    "major" TEXT,
    "trackId" INTEGER,
    CONSTRAINT "User_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "HobbyTrack" ("trackId") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("avatarUrl", "checkinIntervalMinutes", "createdAt", "email", "favoriteQuote", "nickname", "onboardingCompleted", "password", "resetPasswordExpires", "resetPasswordToken", "role", "tokenBalance", "trackId", "updatedAt", "userId", "username") SELECT "avatarUrl", "checkinIntervalMinutes", "createdAt", "email", "favoriteQuote", "nickname", "onboardingCompleted", "password", "resetPasswordExpires", "resetPasswordToken", "role", "tokenBalance", "trackId", "updatedAt", "userId", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_resetPasswordToken_key" ON "User"("resetPasswordToken");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
