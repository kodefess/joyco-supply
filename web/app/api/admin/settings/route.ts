import { type NextRequest, NextResponse } from "next/server";

import { isAdmin } from "@/lib/admin-auth";
import { parseSettings } from "@/lib/settings";
import { saveSettings } from "@/lib/store";

export async function PUT(request: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const settings = parseSettings(await request.json().catch(() => null));
  if (!settings) return NextResponse.json({ error: "Data pengaturan tidak valid." }, { status: 400 });
  try {
    await saveSettings(settings);
  } catch (error) {
    console.error("Gagal menyimpan pengaturan", error);
    return NextResponse.json({ error: "Gagal menyimpan. Coba lagi." }, { status: 500 });
  }
  return NextResponse.json(settings);
}
