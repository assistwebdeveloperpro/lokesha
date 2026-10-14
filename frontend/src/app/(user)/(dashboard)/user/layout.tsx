import RequireAuth from "@/components/user/auth/RequireAuth";
import RequireUserDashboardAccess from "@/components/user/auth/RequireUserDashboardAccess";
import UserDashboardShell from "@/components/user/dashboard/layout/UserDashboardShell";

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
