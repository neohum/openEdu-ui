import React, { useState } from "react";
import { Skeleton } from "../primitives/skeleton.tsx";
import { Pager } from "../selection/pager.tsx";
import "./forms.css";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string | number;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  loading?: boolean;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onSortChange?: (sortKey: string, direction: "asc" | "desc") => void;
  emptyMessage?: string;
  className?: string;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  page = 1,
  totalPages = 1,
  onPageChange,
  onSortChange,
  emptyMessage = "데이터가 없습니다.",
  className = "",
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const handleSort = (colKey: string) => {
    let nextDir: "asc" | "desc" = "asc";
    if (sortKey === colKey && sortDir === "asc") {
      nextDir = "desc";
    }
    setSortKey(colKey);
    setSortDir(nextDir);
    onSortChange?.(colKey, nextDir);
  };

  return (
    <div className={["oe-data-table-container", className].filter(Boolean).join(" ")}>
      <div className="oe-data-table-scroll-wrapper">
        <table className="oe-data-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={col.width ? { width: col.width } : undefined}
                  className={col.sortable ? "oe-data-table-th--sortable" : ""}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="oe-data-table-th-content">
                    <span>{col.header}</span>
                    {col.sortable && (
                      <span className="oe-data-table-sort-indicator">
                        {sortKey === col.key ? (sortDir === "asc" ? "▲" : "▼") : "↕"}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, rIdx) => (
                <tr key={`skel-row-${rIdx}`}>
                  {columns.map((col, cIdx) => (
                    <td key={`skel-cell-${rIdx}-${cIdx}`}>
                      <Skeleton style={{ height: "1.2rem", width: "80%" }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="oe-data-table-empty">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rIdx) => (
                <tr key={row.id || `row-${rIdx}`}>
                  {columns.map((col) => (
                    <td key={col.key}>
                      {col.render ? col.render(row) : String(row[col.key] ?? "")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && onPageChange && (
        <div className="oe-data-table-pagination">
          <Pager page={page} totalPages={totalPages} onPageChange={onPageChange} />
        </div>
      )}
    </div>
  );
}
