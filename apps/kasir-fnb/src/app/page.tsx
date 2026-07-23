"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/auth";
import { checkDeviceBinding } from "@/lib/device";

export default function HomePage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        const session = await getSession();
        if (!session) {
          router.replace("/login");
          return;
        }

        const binding = await checkDeviceBinding();
        if (!binding.bound) {
          router.replace("/login");
          return;
        }

        router.replace("/pos");
      } catch {
        router.replace("/login");
      } finally {
        setChecking(false);
      }
    }

    init();
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-dark">
        <div className="text-center">
          <div className="text-3xl font-heading font-bold text-white mb-2">
            KASIR<span className="text-brand-primary">SOLO</span>
          </div>
          <p className="text-gray-400 text-sm">F&B</p>
          <div className="mt-6 flex justify-center">
            <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return null;
}
