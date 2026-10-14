"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ADMIN_SESSION_CHANGE_EVENT,
  getAdminToken,
} from "@/services/adminSession";

export default function RequireAdminAuth({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const check = () => {
      if (getAdminToken()) {
        setAllowed(true);
        return;
      }
      setAllowed(false);
      router.replace("/backend/login");
    };

    check();
    window.addEventListener(ADMIN_SESSION_CHANGE_EVENT, check);
    return () => window.removeEventListener(ADMIN_SESSION_CHANGE_EVENT, check);
  }, [router]);

  if (!allowed) {
    return null;
  }

  return <>{children}</>;
}
