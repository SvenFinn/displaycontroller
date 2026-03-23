-- CreateTable
CREATE TABLE "Parameter" (
    "key" TEXT NOT NULL,
    "strValue" TEXT,
    "boolValue" BOOLEAN,
    "numValue" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Parameter_pkey" PRIMARY KEY ("key")
);
