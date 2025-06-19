/*
  Warnings:

  - You are about to drop the column `endPoint` on the `Chat` table. All the data in the column will be lost.
  - You are about to drop the column `isSelected` on the `Chat` table. All the data in the column will be lost.
  - You are about to drop the column `points` on the `Chat` table. All the data in the column will be lost.
  - You are about to drop the column `startPoint` on the `Chat` table. All the data in the column will be lost.
  - You are about to drop the column `style` on the `Chat` table. All the data in the column will be lost.
  - You are about to drop the column `text` on the `Chat` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Chat` table. All the data in the column will be lost.
  - Made the column `message` on table `Chat` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Chat" DROP COLUMN "endPoint",
DROP COLUMN "isSelected",
DROP COLUMN "points",
DROP COLUMN "startPoint",
DROP COLUMN "style",
DROP COLUMN "text",
DROP COLUMN "type",
ALTER COLUMN "message" SET NOT NULL;

-- CreateTable
CREATE TABLE "Stroke" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "startPoint" JSONB NOT NULL,
    "endPoint" JSONB NOT NULL,
    "style" JSONB NOT NULL,
    "points" JSONB,
    "text" TEXT,
    "isSelected" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Stroke_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Stroke" ADD CONSTRAINT "Stroke_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stroke" ADD CONSTRAINT "Stroke_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
