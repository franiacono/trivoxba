"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackVisit } from "@/lib/analytics";

export default function SiteAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    trackVisit(pathname).catch(() => {
      // Las métricas nunca deben interferir con la navegación del sitio.
    });
  }, [pathname]);

  return null;
}
