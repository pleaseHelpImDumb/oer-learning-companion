/*
  Warnings:

  - Added the required column `name` to the `Badge` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Badge" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL
);
INSERT INTO "new_Badge" ("category", "description", "id") SELECT "category", "description", "id" FROM "Badge";
DROP TABLE "Badge";
ALTER TABLE "new_Badge" RENAME TO "Badge";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
