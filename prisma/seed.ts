import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { exampleProjectDetails } from "../src/lib/categories";
import { buildConsentText, buildNoMatchConsentText } from "../src/lib/consent";

const prisma = new PrismaClient();

const portalPassword = "HomeProsPortal!2026";
const adminPassword = "HomeProsAdmin!2026";

type SeedContractor = {
  businessName: string;
  email: string;
  contactName: string;
  phone: string;
  status: "PENDING" | "VETTED" | "APPROVED" | "SUSPENDED";
  categories: string[];
  serviceZips: string[];
  city: string;
  state: string;
  monthlyLeadCap?: number;
  yearsInBusiness: number;
  licenseNumber: string;
  bio: string;
};

const contractorRows: Array<
  [string, string, string, string, string[], string, string, number | undefined, number]
> = [
  ["Hill Country Roofing", "hillcountry@example.com", "Sam Hill", "ROOFING", ["78704", "78745"], "Austin", "TX", undefined, 18],
  ["Live Oak Metal Roofs", "liveoak@example.com", "Riley Oak", "ROOFING", ["78704"], "Austin", "TX", 4, 11],
  ["South Congress Roof Co", "southcongress@example.com", "Jordan SoCo", "ROOFING", ["78704", "78702"], "Austin", "TX", undefined, 9],
  ["Barton Creek HVAC", "bartonhvac@example.com", "Casey Barton", "HVAC", ["78704", "78746"], "Austin", "TX", undefined, 15],
  ["Hillside Heat Pumps", "hillside@example.com", "Parker Hill", "HVAC", ["78704"], "Austin", "TX", undefined, 7],
  ["Lake Austin Windows", "lakeaustin@example.com", "Reese Lake", "WINDOWS", ["78704"], "Austin", "TX", undefined, 12],
  ["Tarrytown Glass", "tarrytown@example.com", "Quinn Tarry", "WINDOWS", ["78704", "78703"], "Austin", "TX", undefined, 20],
  ["Zilker Siding", "zilker@example.com", "Avery Zilker", "SIDING", ["78704"], "Austin", "TX", undefined, 8],
  ["Clarksville Exteriors", "clarksville@example.com", "Drew Clark", "SIDING", ["78704"], "Austin", "TX", 3, 14],
  ["Barton Springs Gutters", "bartonsprings@example.com", "Logan Springs", "GUTTERS", ["78704"], "Austin", "TX", undefined, 10],
  ["Shield Gutter Guards", "shieldgutters@example.com", "Morgan Shield", "GUTTERS", ["78704", "78745"], "Austin", "TX", undefined, 6],
  ["South Lamar Floors", "southlamar@example.com", "Taylor Lamar", "FLOORING", ["78704"], "Austin", "TX", undefined, 13],
  ["Hyde Park Flooring", "hydepark@example.com", "Jamie Hyde", "FLOORING", ["78704", "78751"], "Austin", "TX", undefined, 16],
  ["Peachtree Comfort", "peachtree@example.com", "Sky Peach", "HVAC", ["30308", "30309"], "Atlanta", "GA", undefined, 17],
  ["Mile High Windows", "milehigh@example.com", "Chris Mile", "WINDOWS", ["80205"], "Denver", "CO", undefined, 19],
  ["Capitol Hill Glass", "capitolglass@example.com", "Alex Capitol", "WINDOWS", ["80205", "80203"], "Denver", "CO", undefined, 8],
  ["Lakeview Siding", "lakeview@example.com", "Robin Lake", "SIDING", ["60614", "60657"], "Chicago", "IL", undefined, 21],
  ["Willamette Gutters", "willamette@example.com", "Elliot Will", "GUTTERS", ["97214", "97202"], "Portland", "OR", undefined, 12],
  ["East Atlanta Floors", "eastatlanta@example.com", "Noah East", "FLOORING", ["30308"], "Atlanta", "GA", undefined, 9],
  ["Decatur Floor Studio", "decatur@example.com", "Remy Decatur", "FLOORING", ["30308", "30030"], "Decatur", "GA", undefined, 11],
  ["Pending Roof Co", "pendingroof@example.com", "Pat Pending", "ROOFING", ["78704"], "Austin", "TX", undefined, 3],
  ["Vetted Air", "vettedair@example.com", "Val Vetted", "HVAC", ["78704"], "Austin", "TX", undefined, 5],
  ["Suspended Siding Co", "suspendedsiding@example.com", "Sid Suspended", "SIDING", ["78704"], "Austin", "TX", undefined, 4],
];

const contractors: SeedContractor[] = contractorRows.map((row, index) => {
  const [businessName, email, contactName, category, serviceZips, city, state, monthlyLeadCap, yearsInBusiness] = row;
  const status = email.startsWith("pending")
    ? "PENDING"
    : email.startsWith("vetted")
      ? "VETTED"
      : email.startsWith("suspended")
        ? "SUSPENDED"
        : "APPROVED";
  return {
    businessName: String(businessName),
    email: String(email),
    contactName: String(contactName),
    phone: `512555${String(100 + index).padStart(4, "0")}`,
    status,
    categories: [String(category)],
    serviceZips: serviceZips as string[],
    city: String(city),
    state: String(state),
    monthlyLeadCap: monthlyLeadCap as number | undefined,
    yearsInBusiness: yearsInBusiness as number,
    licenseNumber: `HP-${1000 + index}`,
    bio: `${businessName} serves the ZIP codes on this profile.`,
  } satisfies SeedContractor;
});

async function main() {
  const portalHash = await bcrypt.hash(portalPassword, 10);
  const adminHash = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { email: "admin@homepros.cartley.com" },
    update: { passwordHash: adminHash, role: "ADMIN" },
    create: { email: "admin@homepros.cartley.com", passwordHash: adminHash, role: "ADMIN" },
  });

  for (const entry of contractors) {
    const user = await prisma.user.upsert({
      where: { email: entry.email },
      update: { passwordHash: portalHash, role: "CONTRACTOR" },
      create: { email: entry.email, passwordHash: portalHash, role: "CONTRACTOR" },
    });
    await prisma.contractor.upsert({
      where: { email: entry.email },
      update: {
        userId: user.id,
        businessName: entry.businessName,
        contactName: entry.contactName,
        phone: entry.phone,
        status: entry.status,
        categories: entry.categories,
        serviceZips: entry.serviceZips,
        monthlyLeadCap: entry.monthlyLeadCap ?? null,
        city: entry.city,
        state: entry.state,
        yearsInBusiness: entry.yearsInBusiness,
        licenseNumber: entry.licenseNumber,
        bio: entry.bio,
      },
      create: {
        userId: user.id,
        email: entry.email,
        businessName: entry.businessName,
        contactName: entry.contactName,
        phone: entry.phone,
        status: entry.status,
        categories: entry.categories,
        serviceZips: entry.serviceZips,
        monthlyLeadCap: entry.monthlyLeadCap ?? null,
        city: entry.city,
        state: entry.state,
        yearsInBusiness: entry.yearsInBusiness,
        licenseNumber: entry.licenseNumber,
        bio: entry.bio,
      },
    });
  }

  const previousMonth = new Date();
  previousMonth.setUTCDate(0);
  previousMonth.setUTCHours(15, 0, 0, 0);

  await ensureLead({
    publicToken: "seed-windows-80205",
    zip: "80205",
    category: "WINDOWS",
    projectDetails: exampleProjectDetails("WINDOWS"),
    timeline: "two_weeks",
    homeownerStatus: "owner_occupied",
    firstName: "Maya",
    lastName: "Chen",
    email: "maya.chen@example.com",
    phone: "3035550142",
    contractorEmails: ["capitolglass@example.com", "milehigh@example.com"],
    consentText: buildConsentText(["Capitol Hill Glass", "Mile High Windows"], "Windows"),
    createdAt: previousMonth,
    utmSource: "google",
    utmMedium: "cpc",
    utmCampaign: "windows-denver",
    gclid: "test-gclid-seed",
  });

  await ensureLead({
    publicToken: "seed-flooring-99501",
    zip: "99501",
    category: "FLOORING",
    projectDetails: exampleProjectDetails("FLOORING"),
    timeline: "researching",
    homeownerStatus: "owner_occupied",
    firstName: "Jonah",
    lastName: "Ellis",
    email: "jonah.ellis@example.com",
    phone: "9075550177",
    contractorEmails: [],
    consentText: buildNoMatchConsentText("99501", "Flooring"),
    createdAt: previousMonth,
    fbclid: "test-fbclid-seed",
  });

  console.info("Seeded HomePros admin, contractors, and sample leads.");
}

async function ensureLead(input: {
  publicToken: string;
  zip: string;
  category: string;
  projectDetails: Record<string, string>;
  timeline: string;
  homeownerStatus: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  contractorEmails: string[];
  consentText: string;
  createdAt: Date;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  gclid?: string;
  fbclid?: string;
}) {
  const existing = await prisma.lead.findUnique({ where: { publicToken: input.publicToken } });
  if (existing) return;
  const matched = await prisma.contractor.findMany({ where: { email: { in: input.contractorEmails } } });
  await prisma.lead.create({
    data: {
      publicToken: input.publicToken,
      zip: input.zip,
      category: input.category,
      projectDetails: input.projectDetails,
      timeline: input.timeline,
      homeownerStatus: input.homeownerStatus,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone,
      utmSource: input.utmSource,
      utmMedium: input.utmMedium,
      utmCampaign: input.utmCampaign,
      gclid: input.gclid,
      fbclid: input.fbclid,
      consentText: input.consentText,
      consentAt: input.createdAt,
      consentIp: "127.0.0.1",
      consentUserAgent: "HomeProsSeed/1.0",
      consentPageUrl: "https://homepros.cartley.com/quote",
      status: matched.length > 0 ? "ASSIGNED" : "UNMATCHED",
      createdAt: input.createdAt,
      assignments: {
        create: matched.map((contractor) => ({
          contractorId: contractor.id,
          status: "SENT",
          createdAt: input.createdAt,
        })),
      },
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
