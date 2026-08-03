import RequireAuth from "@/components/auth/RequireAuth";
import RequireUserDashboardAccess from "@/components/auth/RequireUserDashboardAccess";
import UserDashboardShell from "@/components/layout/UserDashboardShell";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <RequireAuth>
      <RequireUserDashboardAccess>
        <UserDashboardShell>{children}</UserDashboardShell>
      </RequireUserDashboardAccess>
    </RequireAuth>
  );
}
