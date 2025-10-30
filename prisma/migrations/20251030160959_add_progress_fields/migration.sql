-- CreateTable
CREATE TABLE "ReportRequest" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "dataSource" TEXT,
    "sourceData" JSONB,
    "reportType" TEXT,
    "fiscalYear" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "progress" INTEGER DEFAULT 0,
    "progressMessage" TEXT,
    "generatedReport" JSONB,
    "cloudinaryPublicId" TEXT,
    "cloudinaryUrl" TEXT,
    "fileFormat" TEXT,
    "taxpayerNif" TEXT,
    "taxpayerName" TEXT,
    "taxpayerSurname" TEXT,
    "errorMessage" TEXT,
    "totalTransactions" INTEGER,
    "totalGains" DOUBLE PRECISION,
    "totalLosses" DOUBLE PRECISION,
    "netResult" DOUBLE PRECISION,

    CONSTRAINT "ReportRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReportRequest_createdAt_idx" ON "ReportRequest"("createdAt");

-- CreateIndex
CREATE INDEX "ReportRequest_status_idx" ON "ReportRequest"("status");
