import type { ReactNode } from "react";

export interface Column {
  key: string;
  header: string;
  render: (row: Record<string, any>) => ReactNode;
  className?: string;
}

interface DataTableProps {
  columns: Column[];
  rows: Record<string, any>[];
  rowActions?: (row: Record<string, any>) => ReactNode;
  empty?: ReactNode;
}

export function DataTable({ columns, rows, rowActions, empty }: DataTableProps) {
  if (rows.length === 0 && empty) return <>{empty}</>;

  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-charcoal">
      <table className="w-full min-w-[680px] text-left text-sm">
        <thead>
          <tr className="border-b border-line bg-graphite/70">
            {columns.map((c) => (
              <th
                key={c.key}
                className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-sand"
              >
                {c.header}
              </th>
            ))}
            {rowActions && (
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.12em] text-sand">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className="border-b border-line/50 transition-colors last:border-0 hover:bg-white/[0.02]"
            >
              {columns.map((c) => (
                <td
                  key={c.key}
                  className={`px-4 py-3 align-top text-cream/90 ${c.className ?? ""}`}
                >
                  {c.render(row)}
                </td>
              ))}
              {rowActions && (
                <td className="px-4 py-3 text-right align-top">
                  <div className="inline-flex items-center justify-end gap-1">
                    {rowActions(row)}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
