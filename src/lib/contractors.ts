import "server-only";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import type { ContractorProfile } from "@/lib/validation";

export async function emailTaken(email: string, exceptContractorId?: string) {
  const contractor = await prisma.contractor.findUnique({ where: { email } });
  if (contractor && contractor.id !== exceptContractorId) return true;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return false;
  return contractor?.userId !== user.id;
}

export async function createContractorAccount(
  profile: ContractorProfile,
  options: { status: ContractorProfile["status"] },
) {
  const passwordHash = await bcrypt.hash(profile.password, 10);
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: profile.email,
        passwordHash,
        role: "CONTRACTOR",
      },
    });
    return tx.contractor.create({
      data: {
        userId: user.id,
        businessName: profile.businessName,
        contactName: profile.contactName,
        email: profile.email,
        phone: profile.phone,
        status: options.status,
        categories: profile.categories,
        serviceZips: profile.serviceZips,
        monthlyLeadCap: profile.monthlyLeadCap,
        webhookUrl: profile.webhookUrl || null,
        webhookSecret: profile.webhookSecret || null,
        bio: profile.bio || null,
        licenseNumber: profile.licenseNumber || null,
        yearsInBusiness: profile.yearsInBusiness,
        city: profile.city || null,
        state: profile.state || null,
      },
    });
  });
}

export async function updateContractorAccount(
  contractorId: string,
  profile: ContractorProfile,
  options: { allowStatus: boolean; allowCap: boolean; existingSecret: string | null },
) {
  const contractor = await prisma.contractor.findUnique({ where: { id: contractorId } });
  if (!contractor) return null;

  const passwordHash = profile.password ? await bcrypt.hash(profile.password, 10) : null;
  const secret = profile.webhookSecret ? profile.webhookSecret : options.existingSecret;

  return prisma.$transaction(async (tx) => {
    if (contractor.userId) {
      await tx.user.update({
        where: { id: contractor.userId },
        data: {
          email: profile.email,
          ...(passwordHash ? { passwordHash } : {}),
        },
      });
    }
    return tx.contractor.update({
      where: { id: contractorId },
      data: {
        businessName: profile.businessName,
        contactName: profile.contactName,
        email: profile.email,
        phone: profile.phone,
        categories: profile.categories,
        serviceZips: profile.serviceZips,
        webhookUrl: profile.webhookUrl || null,
        webhookSecret: secret,
        bio: profile.bio || null,
        licenseNumber: profile.licenseNumber || null,
        yearsInBusiness: profile.yearsInBusiness,
        city: profile.city || null,
        state: profile.state || null,
        ...(options.allowStatus ? { status: profile.status } : {}),
        ...(options.allowCap ? { monthlyLeadCap: profile.monthlyLeadCap } : {}),
      },
    });
  });
}
