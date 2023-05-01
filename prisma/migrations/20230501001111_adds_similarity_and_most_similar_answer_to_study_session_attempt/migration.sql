/*
  Warnings:

  - Added the required column `mostSimilarAnswer` to the `StudySessionAttempt` table without a default value. This is not possible if the table is not empty.
  - Added the required column `similarity` to the `StudySessionAttempt` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "StudySessionAttempt" ADD COLUMN     "mostSimilarAnswer" TEXT NOT NULL,
ADD COLUMN     "similarity" DOUBLE PRECISION NOT NULL;
