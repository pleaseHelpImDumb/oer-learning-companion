/*
  Warnings:

  - You are about to drop the column `sessionGoal` on the `StudySession` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "StudySession" DROP COLUMN "sessionGoal",
ADD COLUMN     "sessionGoalMinutes" INTEGER;
