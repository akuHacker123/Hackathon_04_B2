import { redirect } from "next/navigation";

import { AppLayout } from "@/components/layout/AppLayout";
import { getCurrentUser } from "@/lib/auth/get-user";

export default async function ProtectedAppLayout({ children }: LayoutProps<"/">) {
  const user = await getCurrentUser();

  if (!user) redirect("/login");

  return <AppLayout user={user}>{children}</AppLayout>;
}
