import { NextResponse, type NextRequest } from "next/server";
import { resolveCategory } from "@/lib/categories";
import { previewMatches } from "@/lib/leads";
import { normalizeZip } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const zip = normalizeZip(request.nextUrl.searchParams.get("zip") ?? "");
  const category = resolveCategory(request.nextUrl.searchParams.get("category") ?? "");
  if (!zip) return NextResponse.json({ error: "Enter a 5-digit ZIP code." }, { status: 400 });
  if (!category) return NextResponse.json({ error: "Choose a project type." }, { status: 400 });

  const preview = await previewMatches(zip, category.id);
  if (!preview) return NextResponse.json({ error: "Choose a project type." }, { status: 400 });

  return NextResponse.json({
    contractors: preview.contractors,
    consentText: preview.consentText,
    category: preview.category.id,
  });
}
