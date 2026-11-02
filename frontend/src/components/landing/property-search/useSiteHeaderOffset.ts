"use client";

import { useLayoutEffect, useState } from "react";

const SITE_HEADER_SELECTOR = "header.sticky, header";

export function useSiteHeaderOffset(active = true) {
  const [headerBottomPx, setHeaderBottomPx] = useState(0);

  useLayoutEffect(() => {
    if (!active) return;

    const header = document.querySelector(SITE_HEADER_SELECTOR);
    if (!header) return;

    const measure = () => {
      setHeaderBottomPx(header.getBoundingClientRect().bottom);
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(header);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure);
    };
  }, [active]);

  return headerBottomPx;
}
