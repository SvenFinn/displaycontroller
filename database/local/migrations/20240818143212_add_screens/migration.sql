-- CreateEnum (final enum to be used)
CREATE TYPE "ScreensTypes" AS ENUM ('drawTarget', 'cpcView', 'imageViewer', 'evaluation', 'embed');

-- CreateTable with final structure
CREATE TABLE "Screens" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "type" "ScreensTypes" NOT NULL,
    "options" JSONB NOT NULL,
    "conditions" JSONB,
    "visibleFrom" TIMESTAMP(3),
    "visibleUntil" TIMESTAMP(3),
    "duration" INTEGER NOT NULL DEFAULT 30000,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);