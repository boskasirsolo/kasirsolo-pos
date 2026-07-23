import React, { useState, useMemo, type ReactNode } from "react";
import { colors, radii, fonts, fontSizes, fontWeights, spacing, transitions, shadows } from "../theme";

export interface DataTableColumn<T> {
  /** Unique column key */
  key: string;
  /** Column header label */
  label: string;
  /** Whether this column is sortable */
  sortable?: boolean;
  /** Column width (CSS value) */
  width?: string;
  /** Custom cell renderer */
  render?: (row: T, index: number) => ReactNode;
  /** Text alignment */
  align?: "left" | "center" | "right";
}

export interface DataTableProps<T> {
  /** Column definitions */
  columns: DataTableColumn<T>[];
  /** Row data */
  data: T[];
  /** Unique key extractor for each row */
  rowKey: (row: T) => string;
  /** Loading state */
  loading?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  /** Row click handler */
  onRowClick?: (row: T) => void;
  /** Whether to show striped rows */
  striped?: boolean;
  /** Whether the table is compact */
  compact?: boolean;
}

type SortDirection = "asc" | "desc";

/**
 * Sortable data table component with column configuration.
 */
export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  rowKey,
  loading = false,
  emptyMessage = "Tidak ada data",
  onRowClick,
  striped = true,
  compact = false,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDirection>("asc");

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sortedData = useMemo(() => {
    if (!sortKey) return data;

    return [...data].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return sortDir === "asc" ? -1 : 1;
      if (bVal == null) return sortDir === "asc" ? 1 : -1;

      if (typeof aVal === "string" && typeof bVal === "string") {
        const cmp = aVal.localeCompare(bVal, "id");
        return sortDir === "asc" ? cmp : -cmp;
      }

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDir === "asc" ? aVal - bVal : bVal - aVal;
      }

      const cmp = String(aVal).localeCompare(String(bVal));
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir]);

  const cellPadding = compact ? `${spacing[1]} ${spacing[2]}` : `${spacing[2]} ${spacing[3]}`;

  const tableStyle: React.CSSProperties = {
    width: "100%",
    borderCollapse: "collapse",
    fontFamily: fonts.body,
    fontSize: compact ? fontSizes.sm : fontSizes.base,
  };

  const thStyle = (col: DataTableColumn<T>): React.CSSProperties => ({
    padding: cellPadding,
    textAlign: (col.align ?? "left") as React.CSSProperties["textAlign"],
    fontWeight: fontWeights.semibold,
    fontSize: fontSizes.xs,
    color: colors.dark[500],
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    borderBottom: `2px solid ${colors.dark[200]}`,
    cursor: col.sortable ? "pointer" : "default",
    userSelect: col.sortable ? "none" : undefined,
    whiteSpace: "nowrap",
    width: col.width,
    transition: `color ${transitions.fast}`,
  });

  const tdStyle = (col: DataTableColumn<T>): React.CSSProperties => ({
    padding: cellPadding,
    textAlign: (col.align ?? "left") as React.CSSProperties["textAlign"],
    color: colors.dark[800],
    borderBottom: `1px solid ${colors.dark[100]}`,
    verticalAlign: "middle",
  });

  const sortIndicator = (key: string): string => {
    if (sortKey !== key) return " \u2195";
    return sortDir === "asc" ? " \u2191" : " \u2193";
  };

  if (loading) {
    return (
      <div
        style={{
          padding: spacing[8],
          textAlign: "center",
          color: colors.dark[400],
          fontFamily: fonts.body,
        }}
      >
        Memuat data...
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto", borderRadius: radii.lg, boxShadow: shadows.card }}>
      <table style={tableStyle}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                style={thStyle(col)}
                onClick={col.sortable ? () => handleSort(col.key) : undefined}
              >
                {col.label}
                {col.sortable && (
                  <span style={{ color: sortKey === col.key ? colors.primary[500] : colors.dark[300] }}>
                    {sortIndicator(col.key)}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                style={{
                  padding: spacing[8],
                  textAlign: "center",
                  color: colors.dark[400],
                }}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            sortedData.map((row, idx) => (
              <tr
                key={rowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                style={{
                  backgroundColor:
                    striped && idx % 2 === 1 ? colors.dark[50] : colors.white,
                  cursor: onRowClick ? "pointer" : "default",
                  transition: `background-color ${transitions.fast}`,
                }}
              >
                {columns.map((col) => (
                  <td key={col.key} style={tdStyle(col)}>
                    {col.render
                      ? col.render(row, idx)
                      : (row[col.key] as ReactNode) ?? "\u2014"}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

DataTable.displayName = "DataTable";
