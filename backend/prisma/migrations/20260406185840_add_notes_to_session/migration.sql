/*
  Warnings:

  - Added the required column `iconUrl` to the `Badge` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "StudySession" ADD COLUMN "notes" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Badge" (
    "badgeId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "iconUrl" TEXT NOT NULL
);
INSERT INTO "new_Badge" ("badgeId", "category", "description", "name") SELECT "badgeId", "category", "description", "name" FROM "Badge";
DROP TABLE "Badge";
ALTER TABLE "new_Badge" RENAME TO "Badge";
CREATE UNIQUE INDEX "Badge_name_key" ON "Badge"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
