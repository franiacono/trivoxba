import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const admin = await verifyAdminToken(req.headers.get("authorization"));
  if (!admin) return NextResponse.json({ authorized: false }, { status: 403 });
  return NextResponse.json({ authorized: true, uid: admin.uid, email: admin.email });
}
