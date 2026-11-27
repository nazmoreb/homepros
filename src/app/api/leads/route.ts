import { NextResponse, type NextRequest } from "next/server";
import {
  attributionFromBody,
  mergeAttribution,
  parseAttributionCookie,
  readCookieValue,
} from "@/lib/attribution";
import { ConsentMismatchError, createLead } from "@/lib/leads";
import { requestIp } from "@/lib/request";
import { sanitizePageUrl, validateLead } from "@/lib/validation";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as unknown;
  const parsed = validateLead(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: "Check the highlighted answers.", fields: parsed.errors }, { status: 400 });
  }

  const cookieAttribution = parseAttributionCookie(readCookieValue(request.headers.get("cookie"), "hp_attr"));
  const bodyAttribution = attributionFromBody(
    body && typeof body === "object" ? (body as { attribution?: unknown }).attribution : null,
  );
  const pageUrl = sanitizePageUrl(parsed.data.pageUrl, new URL("/quote", request.url).toString());

  try {
    const result = await createLead({
      submission: { ...parsed.data, pageUrl },
      attribution: mergeAttribution(cookieAttribution, bodyAttribution),
      ip: requestIp(request),
      userAgent: request.headers.get("user-agent") ?? "unknown",
    });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ConsentMismatchError) {
      return NextResponse.json(
        {
          error: "matches_changed",
          consentText: error.consentText,
          contractors: error.contractors,
        },
        { status: 409 },
      );
    }
    console.error("[HomePros] lead create failed", error);
    return NextResponse.json({ error: "We could not save this request." }, { status: 500 });
  }
}
