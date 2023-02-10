/*
  Warnings:

  - Added the required column `nextReview` to the `StudySessionBox` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "StudySessionBox" ADD COLUMN     "nextReview" TIMESTAMP(3) NOT NULL;
