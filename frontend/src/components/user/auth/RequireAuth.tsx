"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSessionToken } from "@/hooks/useSessionStore";
import { getToken } from "@/services/session";

export default function RequireAuth({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const token = useSessionToken();

  useEffect(() => {
    // The store reports no token until hydration ends, so storage is checked directly
    if (!getToken()) router.replace("/login");
  }, [router, token]);

  if (!token) {
    return null;
  }

  return <>{children}</>;
}
