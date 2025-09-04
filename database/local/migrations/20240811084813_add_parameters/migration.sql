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

INSERT INTO "Parameter" ("key", "strValue") VALUES
('SM_SERVER_IP', '192.168.10.200');

INSERT INTO "Parameter" ("key", "boolValue") VALUES
('ENABLE_TIME_SYNC', true), ('ENABLE_EVALUATION_SYNC', true);

INSERT INTO "Parameter" ("key", "numValue") VALUES
('TIME_SYNC_INTERVAL', 600000), ('EVALUATION_SYNC_INTERVAL', 60000), ('FREE_RANGE_SHOT_TIMEOUT', 1800000);