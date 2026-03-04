-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tokenBalance" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "resetPasswordToken" TEXT,
    "resetPasswordExpires" DATETIME
);
INSERT INTO "new_User" ("createdAt", "email", "id", "name", "password", "resetPasswordExpires", "resetPasswordToken", "updatedAt") SELECT "createdAt", "email", "id", "name", "password", "resetPasswordExpires", "resetPasswordToken", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_resetPasswordToken_key" ON "User"("resetPasswordToken");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
