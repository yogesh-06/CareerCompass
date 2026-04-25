-- CreateEnum
CREATE TYPE "ConfidenceLevel" AS ENUM ('verified', 'estimated', 'placeholder');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DestinationRoleMarketData" (
    "id" TEXT NOT NULL,
    "originCountry" TEXT NOT NULL,
    "destinationCountry" TEXT NOT NULL,
    "targetRole" TEXT NOT NULL,
    "salaryCurrencyCode" TEXT NOT NULL,
    "salaryMin" INTEGER NOT NULL,
    "salaryMedian" INTEGER NOT NULL,
    "salaryMax" INTEGER NOT NULL,
    "requiredQualifications" TEXT[],
    "languageRequirements" TEXT[],
    "degreeEquivalencyNotes" TEXT NOT NULL,
    "typicalHiringDurationMonths" INTEGER NOT NULL,
    "authorizationWindowMonths" INTEGER NOT NULL,
    "marketDemandLevel" TEXT NOT NULL,
    "demandScaleDefinition" TEXT NOT NULL,

    CONSTRAINT "DestinationRoleMarketData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkAuthorizationRoute" (
    "id" TEXT NOT NULL,
    "marketDataId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "sponsorshipRequired" BOOLEAN NOT NULL,
    "processingTimeMin" INTEGER NOT NULL,
    "processingTimeMax" INTEGER NOT NULL,
    "eligibilityCriteria" TEXT[],

    CONSTRAINT "WorkAuthorizationRoute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataFieldConfidence" (
    "id" TEXT NOT NULL,
    "marketDataId" TEXT NOT NULL,
    "fieldName" TEXT NOT NULL,
    "confidence" "ConfidenceLevel" NOT NULL,

    CONSTRAINT "DataFieldConfidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedCareerPlan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "originCountry" TEXT NOT NULL,
    "destinationCountry" TEXT NOT NULL,
    "targetRole" TEXT NOT NULL,
    "salaryExpectation" INTEGER NOT NULL,
    "salaryCurrencyCode" TEXT NOT NULL,
    "timelineMonths" INTEGER NOT NULL,
    "requiresSponsorship" BOOLEAN NOT NULL,
    "deterministicAssessment" JSONB NOT NULL,
    "rankedActionPlan" JSONB NOT NULL,
    "dataConfidenceSummary" JSONB NOT NULL,
    "warningMessages" JSONB NOT NULL,
    "llmNarrative" TEXT NOT NULL,
    "llmNarrativeStatus" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedCareerPlan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "WorkAuthorizationRoute" ADD CONSTRAINT "WorkAuthorizationRoute_marketDataId_fkey" FOREIGN KEY ("marketDataId") REFERENCES "DestinationRoleMarketData"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataFieldConfidence" ADD CONSTRAINT "DataFieldConfidence_marketDataId_fkey" FOREIGN KEY ("marketDataId") REFERENCES "DestinationRoleMarketData"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedCareerPlan" ADD CONSTRAINT "SavedCareerPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
