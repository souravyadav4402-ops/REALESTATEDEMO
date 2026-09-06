import { NextRequest, NextResponse } from "next/server";
import { convertCrores } from "@/lib/currency";

export const revalidate = 3600;

export async function GET(request: NextRequest) {
  const crores = Number(request.nextUrl.searchParams.get("crores") ?? 1);
  if (!Number.isFinite(crores) || crores < 0 || crores > 100_000) return NextResponse.json({ success: false, message: "Crores must be between 0 and 100,000." }, { status: 400 });
  try {
    const prices = await convertCrores(crores);
    return NextResponse.json({ success: true, baseCrores: crores, prices }, { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } });
  } catch {
    return NextResponse.json({ success: false, message: "Currency conversion is temporarily unavailable." }, { status: 503 });
  }
}
