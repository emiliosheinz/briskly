/*
  Warnings:

  - You are about to drop the column `cardId` on the `StudySessionAttempt` table. All the data in the column will be lost.
  - You are about to drop the column `studySessionBoxId` on the `StudySessionAttempt` table. All the data in the column will be lost.
  - Added the required column `studySessionBoxCardId` to the `StudySessionAttempt` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "StudySessionAttempt" DROP CONSTRAINT "StudySessionAttempt_cardId_fkey";

-- DropForeignKey
ALTER TABLE "StudySessionAttempt" DROP CONSTRAINT "StudySessionAttempt_studySessionBoxId_fkey";

-- AlterTable
ALTER TABLE "StudySessionAttempt" DROP COLUMN "cardId",
DROP COLUMN "studySessionBoxId",
ADD COLUMN     "studySessionBoxCardId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "StudySessionBoxCard" (
    "id" TEXT NOT NULL,
    "studySessionBoxId" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,

    CONSTRAINT "StudySessionBoxCard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StudySessionBoxCard_studySessionBoxId_cardId_key" ON "StudySessionBoxCard"("studySessionBoxId", "cardId");

-- AddForeignKey
ALTER TABLE "StudySessionBoxCard" ADD CONSTRAINT "StudySessionBoxCard_studySessionBoxId_fkey" FOREIGN KEY ("studySessionBoxId") REFERENCES "StudySessionBox"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudySessionBoxCard" ADD CONSTRAINT "StudySessionBoxCard_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudySessionAttempt" ADD CONSTRAINT "StudySessionAttempt_studySessionBoxCardId_fkey" FOREIGN KEY ("studySessionBoxCardId") REFERENCES "StudySessionBoxCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;
