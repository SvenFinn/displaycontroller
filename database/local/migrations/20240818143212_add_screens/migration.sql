-- CreateEnum
CREATE TYPE "ScreensPreset" AS ENUM ('drawTarget', 'cpcView', 'imageViewer', 'evaluation');

-- CreateTable
CREATE TABLE "Screens" (
    "id" SERIAL NOT NULL,
    "preset" "ScreensPreset" NOT NULL,
    "options" JSONB NOT NULL,
    "condition" JSONB,
    "visibleFrom" TIMESTAMP(3),
    "visibleUntil" TIMESTAMP(3),
    "duration" INTEGER NOT NULL DEFAULT 30000,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Screens_pkey" PRIMARY KEY ("id")
);
