-- CreateEnum
CREATE TYPE "ScreensPreset" AS ENUM ('drawTarget', 'cpcView', 'imageViewer', 'evaluation', 'evaluationGallery');

-- CreateTable
CREATE TABLE "Screens" (
    "id" SERIAL NOT NULL,
    "preset" "ScreensPreset" NOT NULL,
    "options" JSONB,
    "condition" JSONB NOT NULL,
    "visibleFrom" DOUBLE PRECISION NOT NULL DEFAULT -1,
    "visibleUntil" DOUBLE PRECISION NOT NULL DEFAULT -1,
    "duration" DOUBLE PRECISION NOT NULL DEFAULT -1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Screens_pkey" PRIMARY KEY ("id")
);
