import { type NextRequest, NextResponse } from "next/server";

import { isAdmin } from "@/lib/admin-auth";
import { parseCatalog } from "@/lib/catalog";
import { getCatalogFresh, saveCatalog } from "@/lib/store";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await getCatalogFresh());
}

export async function PUT(request: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const catalog = parseCatalog(await request.json().catch(() => null));
  if (!catalog) return NextResponse.json({ error: "Data katalog tidak valid." }, { status: 400 });
  try {
    await saveCatalog(catalog);
  } catch (error) {
    console.error("Gagal menyimpan katalog", error);
    return NextResponse.json({ error: "Gagal menyimpan. Coba lagi." }, { status: 500 });
  }
  return NextResponse.json(catalog);
}
