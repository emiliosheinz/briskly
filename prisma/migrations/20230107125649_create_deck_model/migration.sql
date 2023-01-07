-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('Public', 'Private', 'WithLink');

-- CreateTable
CREATE TABLE "Deck" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "visibility" "Visibility" NOT NULL DEFAULT 'Public',
    "ownerId" TEXT NOT NULL,

    CONSTRAINT "Deck_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Deck" ADD CONSTRAINT "Deck_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
