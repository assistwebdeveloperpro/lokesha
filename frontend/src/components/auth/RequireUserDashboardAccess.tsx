"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  BUYER_OWNER_HOME,
  isUserDashboardRouteAllowed,
} from "@/components/layout/user-dashboard-nav";
import { useAuth } from "@/hooks/useAuth";

export default function RequireUserDashboardAccess({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { role, isAuthReady } = useAuth();
  const isAllowed = isUserDashboardRouteAllowed(pathname, role);

  useEffect(() => {
    if (!isAuthReady || isAllowed) {
      return;
    }

    router.replace(BUYER_OWNER_HOME);
  }, [isAllowed, isAuthReady, router]);

  if (!isAuthReady || !isAllowed) {
    return null;
  }

  return <>{children}</>;
}
