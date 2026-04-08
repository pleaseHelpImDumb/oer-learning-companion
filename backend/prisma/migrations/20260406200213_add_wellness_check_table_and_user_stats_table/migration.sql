-- CreateTable
CREATE TABLE "UserStats" (
    "userId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "totalStudyMinutes" INTEGER NOT NULL DEFAULT 0,
    "totalSessions" INTEGER NOT NULL DEFAULT 0,
    "currentStreakLength" INTEGER NOT NULL DEFAULT 0,
    "longestStreakLength" INTEGER NOT NULL DEFAULT 0,
    "lastSessionDate" DATETIME NOT NULL,
    "totalAiInteractions" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "UserStats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("userId") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WellnessCheck" (
    "wellnessCheckId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sessionId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "feelingGood" BOOLEAN NOT NULL,
    "helpChosen" TEXT NOT NULL,
    CONSTRAINT "WellnessCheck_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "StudySession" ("sessionId") ON DELETE RESTRICT ON UPDATE CASCADE
);
