/*
  Warnings:

  - You are about to drop the column `answer` on the `Card` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Card" DROP COLUMN "answer",
ADD COLUMN     "validAnswers" TEXT[];
