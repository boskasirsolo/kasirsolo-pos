"use client";

import { PosShell } from "@/components/layout/PosShell";

export default function PosLayout({ children }: { children: React.ReactNode }) {
  return <PosShell>{children}</PosShell>;
}
