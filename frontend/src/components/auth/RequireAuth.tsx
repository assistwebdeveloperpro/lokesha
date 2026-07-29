"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getToken } from "@/services/session";

export default function RequireAuth({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (getToken()) {
      setAllowed(true);
      return;
    }

    router.replace("/login");
  }, [router]);

  if (!allowed) {
    return null;
  }

  return <>{children}</>;
}
