/*
  Warnings:

  - The primary key for the `StudySession` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The required column `id` was added to the `StudySession` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "StudySession" DROP CONSTRAINT "StudySession_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "StudySession_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "StudySessionBox" (
    "id" TEXT NOT NULL,
    "studySessionId" TEXT NOT NULL,
    "lastReview" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewGapInHours" INTEGER NOT NULL,

    CONSTRAINT "StudySessionBox_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "StudySessionBox" ADD CONSTRAINT "StudySessionBox_studySessionId_fkey" FOREIGN KEY ("studySessionId") REFERENCES "StudySession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
