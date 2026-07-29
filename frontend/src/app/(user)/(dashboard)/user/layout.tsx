import RequireAuth from "@/components/auth/RequireAuth";
import UserDashboardShell from "@/components/layout/UserDashboardShell";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <RequireAuth>
      <UserDashboardShell>{children}</UserDashboardShell>
    </RequireAuth>
  );
}
