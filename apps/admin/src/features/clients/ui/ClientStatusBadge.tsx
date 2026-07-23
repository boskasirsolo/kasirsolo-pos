"use client";

import type { KspClientStatus } from "@kasirsolo/db/types";

interface ClientStatusBadgeProps {
  status: KspClientStatus;
}

const statusConfig: Record<KspClientStatus, { label: string; className: string }> = {
  trial: { label: "Trial", className: "badge-info" },
  active: { label: "Aktif", className: "badge-success" },
  expired: { label: "Expired", className: "badge-warning" },
  locked: { label: "Locked", className: "badge-danger" },
  suspended: { label: "Suspended", className: "badge-neutral" },
};

export default function ClientStatusBadge({ status }: ClientStatusBadgeProps) {
  const config = statusConfig[status] ?? statusConfig.trial;
  return <span className={config.className}>{config.label}</span>;
}
