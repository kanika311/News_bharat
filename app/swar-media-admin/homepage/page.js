"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CMS_PATH } from "@/lib/cms";

export default function HomepageManagerRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(CMS_PATH);
  }, [router]);

  return null;
}
