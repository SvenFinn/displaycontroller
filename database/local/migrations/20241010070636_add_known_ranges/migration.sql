-- CreateTable
CREATE TABLE "public"."KnownRanges" (
    "macAddress" TEXT NOT NULL,
    "rangeId" INTEGER,
    "lastIp" INET,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KnownRanges_pkey" PRIMARY KEY ("macAddress")
);

-- CreateIndex
CREATE UNIQUE INDEX "KnownRanges_rangeId_key" ON "public"."KnownRanges"("rangeId");

-- CreateIndex
CREATE UNIQUE INDEX "KnownRanges_lastIp_key" ON "public"."KnownRanges"("lastIp");
