/*
  Warnings:

  - You are about to drop the column `createdAt` on the `StudySession` table. All the data in the column will be lost.

*/
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
    CONSTRAINT "StudySession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_StudySession" ("durationMinutes", "endTime", "id", "lastPauseTime", "startTime", "status", "totalPausedMinutes", "userId") SELECT "durationMinutes", "endTime", "id", "lastPauseTime", "startTime", "status", "totalPausedMinutes", "userId" FROM "StudySession";
DROP TABLE "StudySession";
ALTER TABLE "new_StudySession" RENAME TO "StudySession";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
