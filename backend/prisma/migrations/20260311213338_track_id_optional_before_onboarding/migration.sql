-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
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
    "trackId" INTEGER,
    CONSTRAINT "User_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "HobbyTrack" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("avatarUrl", "checkinIntervalMinutes", "createdAt", "email", "favoriteQuote", "id", "nickname", "onboardingCompleted", "password", "resetPasswordExpires", "resetPasswordToken", "role", "tokenBalance", "trackId", "updatedAt", "username") SELECT "avatarUrl", "checkinIntervalMinutes", "createdAt", "email", "favoriteQuote", "id", "nickname", "onboardingCompleted", "password", "resetPasswordExpires", "resetPasswordToken", "role", "tokenBalance", "trackId", "updatedAt", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_resetPasswordToken_key" ON "User"("resetPasswordToken");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
