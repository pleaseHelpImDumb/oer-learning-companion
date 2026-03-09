/*
  Warnings:

  - You are about to drop the column `iconUrl` on the `UserTrack` table. All the data in the column will be lost.
  - Added the required column `favoriteQuote` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `iconUrl` to the `hobbyTrack` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "tokenBalance" INTEGER NOT NULL DEFAULT 0,
    "userName" TEXT NOT NULL,
    "nickName" TEXT NOT NULL,
    "avatarUrl" TEXT NOT NULL,
    "checkinInterval" INTEGER NOT NULL DEFAULT 5,
    "favoriteQuote" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "resetPasswordToken" TEXT,
    "resetPasswordExpires" DATETIME
);
INSERT INTO "new_User" ("avatarUrl", "checkinInterval", "createdAt", "email", "id", "nickName", "password", "resetPasswordExpires", "resetPasswordToken", "tokenBalance", "updatedAt", "userName") SELECT "avatarUrl", "checkinInterval", "createdAt", "email", "id", "nickName", "password", "resetPasswordExpires", "resetPasswordToken", "tokenBalance", "updatedAt", "userName" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_resetPasswordToken_key" ON "User"("resetPasswordToken");
CREATE TABLE "new_UserTrack" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "trackId" INTEGER NOT NULL,
    CONSTRAINT "UserTrack_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserTrack_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "hobbyTrack" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_UserTrack" ("id", "trackId", "userId") SELECT "id", "trackId", "userId" FROM "UserTrack";
DROP TABLE "UserTrack";
ALTER TABLE "new_UserTrack" RENAME TO "UserTrack";
CREATE UNIQUE INDEX "UserTrack_userId_trackId_key" ON "UserTrack"("userId", "trackId");
CREATE TABLE "new_hobbyTrack" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "iconUrl" TEXT NOT NULL
);
INSERT INTO "new_hobbyTrack" ("description", "id", "name") SELECT "description", "id", "name" FROM "hobbyTrack";
DROP TABLE "hobbyTrack";
ALTER TABLE "new_hobbyTrack" RENAME TO "hobbyTrack";
CREATE UNIQUE INDEX "hobbyTrack_name_key" ON "hobbyTrack"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
