/*
  Warnings:

  - You are about to drop the `DeckTopic` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "DeckTopic" DROP CONSTRAINT "DeckTopic_deckId_fkey";

-- DropForeignKey
ALTER TABLE "DeckTopic" DROP CONSTRAINT "DeckTopic_topicId_fkey";

-- DropTable
DROP TABLE "DeckTopic";

-- CreateTable
CREATE TABLE "_DeckToTopic" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_DeckToTopic_AB_unique" ON "_DeckToTopic"("A", "B");

-- CreateIndex
CREATE INDEX "_DeckToTopic_B_index" ON "_DeckToTopic"("B");

-- AddForeignKey
ALTER TABLE "_DeckToTopic" ADD CONSTRAINT "_DeckToTopic_A_fkey" FOREIGN KEY ("A") REFERENCES "Deck"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DeckToTopic" ADD CONSTRAINT "_DeckToTopic_B_fkey" FOREIGN KEY ("B") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
