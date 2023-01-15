/*
  Warnings:

  - A unique constraint covering the columns `[image]` on the table `Deck` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Deck" ADD COLUMN     "image" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Deck_image_key" ON "Deck"("image");
