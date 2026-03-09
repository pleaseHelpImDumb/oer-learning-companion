-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "tokenBalance" INTEGER NOT NULL DEFAULT 0,
    "username" TEXT NOT NULL,
    "nickname" TEXT,
    "avatarUrl" TEXT NOT NULL DEFAULT 'assets/profiles/profile0.png',
    "checkinIntervalMinutes" INTEGER NOT NULL DEFAULT 5,
    "favoriteQuote" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "resetPasswordToken" TEXT,
    "resetPasswordExpires" DATETIME
);
INSERT INTO "new_User" ("avatarUrl", "checkinIntervalMinutes", "createdAt", "email", "favoriteQuote", "id", "nickname", "password", "resetPasswordExpires", "resetPasswordToken", "tokenBalance", "updatedAt", "username") SELECT "avatarUrl", "checkinIntervalMinutes", "createdAt", "email", "favoriteQuote", "id", "nickname", "password", "resetPasswordExpires", "resetPasswordToken", "tokenBalance", "updatedAt", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_resetPasswordToken_key" ON "User"("resetPasswordToken");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
