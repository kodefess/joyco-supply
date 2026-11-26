import { AdminEditor } from "@/components/admin/admin-editor";
import { AdminLogin } from "@/components/admin/admin-login";
import { isAdmin, isConfigured } from "@/lib/admin-auth";
import { getAllReviews, getCatalogFresh, getSettingsFresh, storageMode } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isAdmin())) return <AdminLogin configured={isConfigured()} />;
  const [catalog, settings, reviews] = await Promise.all([getCatalogFresh(), getSettingsFresh(), getAllReviews()]);
  return <AdminEditor initial={catalog} settings={settings} reviews={reviews} storage={storageMode()} />;
}
