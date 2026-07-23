import type { SyncConflict, SyncableStore } from "./types";
import { isNewerThan, diffRecords, logWarn, now } from "./utils";

// ---------------------------------------------------------------------------
// Conflict Resolution Strategy: Last-Write-Wins
// ---------------------------------------------------------------------------

export interface ConflictInput {
  store: SyncableStore;
  recordId: string;
  localRecord: Record<string, unknown>;
  cloudRecord: Record<string, unknown>;
  localUpdatedAt: string;
  cloudUpdatedAt: string;
}

export interface ConflictResolution {
  /** The winning version */
  winner: "local" | "cloud";
  /** The record to keep */
  winningRecord: Record<string, unknown>;
  /** The conflict log entry */
  conflict: SyncConflict;
}

/**
 * Resolve a conflict between local and cloud versions of a record
 * using last-write-wins strategy based on updated_at timestamps.
 */
export function resolveConflict(input: ConflictInput): ConflictResolution {
  const { store, recordId, localRecord, cloudRecord, localUpdatedAt, cloudUpdatedAt } = input;

  const localWins = isNewerThan(localUpdatedAt, cloudUpdatedAt);
  const winner: "local" | "cloud" = localWins ? "local" : "cloud";
  const winningRecord = localWins ? localRecord : cloudRecord;

  const diff = diffRecords(localRecord, cloudRecord);
  const changedFields = Object.keys(diff);
  const description = changedFields.length > 0
    ? `Konflik pada ${store}/${recordId}: field ${changedFields.join(", ")} berbeda. ${winner === "local" ? "Versi lokal" : "Versi cloud"} menang.`
    : `Konflik pada ${store}/${recordId}: versi ${winner === "local" ? "lokal" : "cloud"} menang berdasarkan timestamp.`;

  const conflict: SyncConflict = {
    store,
    recordId,
    localUpdatedAt,
    cloudUpdatedAt,
    resolution: winner,
    description,
    detectedAt: now(),
  };

  logWarn(
    `Conflict resolved: ${store}/${recordId} → ${winner} wins ` +
    `(local: ${localUpdatedAt}, cloud: ${cloudUpdatedAt})`
  );

  return { winner, winningRecord, conflict };
}

/**
 * Resolve multiple conflicts and return results.
 */
export function resolveConflicts(inputs: ConflictInput[]): ConflictResolution[] {
  return inputs.map(resolveConflict);
}

/**
 * Build a human-readable conflict summary.
 */
export function buildConflictSummary(conflicts: SyncConflict[]): string {
  if (conflicts.length === 0) return "Tidak ada konflik.";

  const localWins = conflicts.filter((c) => c.resolution === "local").length;
  const cloudWins = conflicts.filter((c) => c.resolution === "cloud").length;

  const parts: string[] = [`${conflicts.length} konflik terdeteksi`];
  if (localWins > 0) parts.push(`${localWins} lokal menang`);
  if (cloudWins > 0) parts.push(`${cloudWins} cloud menang`);

  return parts.join(", ") + ".";
}
