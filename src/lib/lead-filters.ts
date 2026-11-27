import type { Prisma } from "@prisma/client";
import { getCategoryById } from "@/lib/categories";

const leadStatuses = ["ASSIGNED", "UNMATCHED", "RETURNED", "INVALID"];

export type LeadFilterInput = {
  status?: string;
  category?: string;
  zip?: string;
  q?: string;
};

export function leadWhere(input: LeadFilterInput): Prisma.LeadWhereInput {
  const where: Prisma.LeadWhereInput = {};
  if (input.status && leadStatuses.includes(input.status)) where.status = input.status;
  if (input.category && getCategoryById(input.category)) where.category = input.category.toUpperCase();
  if (input.zip && /^\d{5}$/.test(input.zip)) where.zip = input.zip;
  const q = input.q?.trim().slice(0, 80);
  if (q) {
    const digits = q.replace(/\D/g, "");
    where.OR = [
      { firstName: { contains: q, mode: "insensitive" } },
      { lastName: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { phone: { contains: digits || q } },
      { zip: { contains: q } },
    ];
  }
  return where;
}
