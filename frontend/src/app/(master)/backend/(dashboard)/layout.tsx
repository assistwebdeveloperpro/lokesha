import RequireAdminAuth from "@/components/master/auth/RequireAdminAuth";
import MasterDashboardShell from "@/components/master/layout/MasterDashboardShell";

export default function MasterDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <RequireAdminAuth>
      <MasterDashboardShell>{children}</MasterDashboardShell>
    </RequireAdminAuth>
  );
}
