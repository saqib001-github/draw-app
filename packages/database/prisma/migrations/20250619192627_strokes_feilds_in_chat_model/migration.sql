/*
  Warnings:

  - You are about to drop the `Stroke` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `type` to the `Chat` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Stroke" DROP CONSTRAINT "Stroke_roomId_fkey";

-- DropForeignKey
ALTER TABLE "Stroke" DROP CONSTRAINT "Stroke_userId_fkey";

-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "endPoint" JSONB,
ADD COLUMN     "isSelected" BOOLEAN DEFAULT false,
ADD COLUMN     "points" JSONB,
ADD COLUMN     "startPoint" JSONB,
ADD COLUMN     "style" JSONB,
ADD COLUMN     "text" TEXT,
ADD COLUMN     "type" TEXT NOT NULL,
ALTER COLUMN "message" DROP NOT NULL;

-- DropTable
DROP TABLE "Stroke";
