-- CreateEnum
CREATE TYPE "AnswerValidationReportStatus" AS ENUM ('Pending', 'Accepted', 'Rejected');

-- AlterTable
ALTER TABLE "AnswerValidationReport" ADD COLUMN     "status" "AnswerValidationReportStatus" NOT NULL DEFAULT 'Pending';
