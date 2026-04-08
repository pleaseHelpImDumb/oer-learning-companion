/*
  Warnings:

  - You are about to drop the column `category` on the `Badge` table. All the data in the column will be lost.
  - Added the required column `type` to the `Badge` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Badge" (
    "badgeId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "thresholdValue" INTEGER,
    "iconUrl" TEXT NOT NULL
);
INSERT INTO "new_Badge" ("badgeId", "description", "iconUrl", "name") SELECT "badgeId", "description", "iconUrl", "name" FROM "Badge";
DROP TABLE "Badge";
ALTER TABLE "new_Badge" RENAME TO "Badge";
CREATE UNIQUE INDEX "Badge_name_key" ON "Badge"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
