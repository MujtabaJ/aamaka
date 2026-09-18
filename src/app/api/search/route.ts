import { NextResponse } from "next/server";
import { searchAll } from "@/lib/data";

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q") ?? "";
  const results = await searchAll(q);
  return NextResponse.json(results);
}
