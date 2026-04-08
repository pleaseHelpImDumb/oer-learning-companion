-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_UserStats" (
    "userId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "totalStudyMinutes" INTEGER NOT NULL DEFAULT 0,
    "totalSessions" INTEGER NOT NULL DEFAULT 0,
    "currentStreakLength" INTEGER NOT NULL DEFAULT 0,
    "longestStreakLength" INTEGER NOT NULL DEFAULT 0,
    "lastSessionDate" DATETIME NOT NULL,
    "totalAiInteractions" INTEGER NOT NULL DEFAULT 0,
    "totalWellnessChecks" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "UserStats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("userId") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_UserStats" ("currentStreakLength", "lastSessionDate", "longestStreakLength", "totalAiInteractions", "totalSessions", "totalStudyMinutes", "userId") SELECT "currentStreakLength", "lastSessionDate", "longestStreakLength", "totalAiInteractions", "totalSessions", "totalStudyMinutes", "userId" FROM "UserStats";
DROP TABLE "UserStats";
ALTER TABLE "new_UserStats" RENAME TO "UserStats";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
