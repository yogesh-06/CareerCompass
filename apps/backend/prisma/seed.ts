import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.dataFieldConfidence.deleteMany();
  await prisma.workAuthorizationRoute.deleteMany();
  await prisma.destinationRoleMarketData.deleteMany();

  const germanyBackend = await prisma.destinationRoleMarketData.create({
    data: {
      originCountry: "India",
      destinationCountry: "Germany",
      targetRole: "Senior Backend Engineer",
      salaryCurrencyCode: "EUR",
      salaryMin: 50000,
      salaryMedian: 70000,
      salaryMax: 90000,
      requiredQualifications: ["5+ years backend experience", "System design proficiency"],
      languageRequirements: ["English B2", "German A2 preferred"],
      degreeEquivalencyNotes:
        "Indian bachelor's degree commonly accepted with credential translation.",
      typicalHiringDurationMonths: 3,
      authorizationWindowMonths: 6,
      marketDemandLevel: "high",
      demandScaleDefinition: "high = frequent openings with sustained hiring",
    },
  });

  await prisma.workAuthorizationRoute.createMany({
    data: [
      {
        marketDataId: germanyBackend.id,
        name: "EU Blue Card",
        type: "employment",
        sponsorshipRequired: true,
        processingTimeMin: 4,
        processingTimeMax: 6,
        eligibilityCriteria: [
          "Signed offer from German employer",
          "Salary above route threshold",
        ],
      },
      {
        marketDataId: germanyBackend.id,
        name: "Skilled Worker Visa",
        type: "employment",
        sponsorshipRequired: true,
        processingTimeMin: 5,
        processingTimeMax: 7,
        eligibilityCriteria: [
          "Recognized qualification",
          "Employer-supported application",
        ],
      },
    ],
  });

  await prisma.dataFieldConfidence.createMany({
    data: [
      { marketDataId: germanyBackend.id, fieldName: "salary", confidence: "estimated" },
      {
        marketDataId: germanyBackend.id,
        fieldName: "work_authorization_routes",
        confidence: "estimated",
      },
      {
        marketDataId: germanyBackend.id,
        fieldName: "credentials",
        confidence: "placeholder",
      },
      {
        marketDataId: germanyBackend.id,
        fieldName: "timeline",
        confidence: "estimated",
      },
      {
        marketDataId: germanyBackend.id,
        fieldName: "market_demand",
        confidence: "placeholder",
      },
    ],
  });

  const ukPm = await prisma.destinationRoleMarketData.create({
    data: {
      originCountry: "India",
      destinationCountry: "United Kingdom",
      targetRole: "Product Manager",
      salaryCurrencyCode: "GBP",
      salaryMin: 55000,
      salaryMedian: 80000,
      salaryMax: 105000,
      requiredQualifications: [
        "3+ years product management experience",
        "Cross-functional leadership",
      ],
      languageRequirements: ["English C1"],
      degreeEquivalencyNotes: "Degree equivalency rarely blocks role entry for PM positions.",
      typicalHiringDurationMonths: 2,
      authorizationWindowMonths: 2,
      marketDemandLevel: "medium",
      demandScaleDefinition: "medium = regular opportunities with selective hiring",
    },
  });

  await prisma.workAuthorizationRoute.createMany({
    data: [
      {
        marketDataId: ukPm.id,
        name: "Skilled Worker Visa",
        type: "employment",
        sponsorshipRequired: false,
        processingTimeMin: 1,
        processingTimeMax: 2,
        eligibilityCriteria: ["Offer from licensed sponsor where applicable"],
      },
      {
        marketDataId: ukPm.id,
        name: "Direct Hiring Route",
        type: "employment",
        sponsorshipRequired: false,
        processingTimeMin: 0,
        processingTimeMax: 1,
        eligibilityCriteria: ["No sponsorship constraints"],
      },
    ],
  });

  await prisma.dataFieldConfidence.createMany({
    data: [
      { marketDataId: ukPm.id, fieldName: "salary", confidence: "estimated" },
      {
        marketDataId: ukPm.id,
        fieldName: "work_authorization_routes",
        confidence: "placeholder",
      },
      { marketDataId: ukPm.id, fieldName: "credentials", confidence: "estimated" },
      { marketDataId: ukPm.id, fieldName: "timeline", confidence: "estimated" },
      { marketDataId: ukPm.id, fieldName: "market_demand", confidence: "estimated" },
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
