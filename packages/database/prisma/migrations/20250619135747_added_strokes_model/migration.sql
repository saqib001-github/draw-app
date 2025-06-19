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
