"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CMS_PATH } from "@/lib/cms";

export default function CommentsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(`${CMS_PATH}/users`);
  }, [router]);

  return null;
}
