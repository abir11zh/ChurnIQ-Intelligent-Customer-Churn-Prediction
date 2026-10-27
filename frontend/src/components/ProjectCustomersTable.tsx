import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef
} from "@tanstack/react-table";
import { Eye, Play, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { getCustomerSample, type ProjectCustomer } from "../lib/api";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { cn } from "../lib/utils";

function customerSegment(customer: ProjectCustomer) {
  if (customer.monthly_charges >= 80 && customer.tenure >= 24) return "VIP";
  if (customer.risk === "CRITICAL" || customer.risk === "HIGH") return "At Risk";
  if (customer.tenure <= 12) return "New";
  if (customer.tenure >= 36) return "Loyal";
  return "Core";
}

function segmentTone(segment: string): "primary" | "success" | "danger" | "warning" | "neutral" {
  if (segment === "VIP") return "primary";
  if (segment === "Loyal") return "success";
  if (segment === "At Risk") return "danger";
  if (segment === "New") return "warning";
  return "neutral";
}

export function ProjectCustomersTable() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["customers-sample"],
    queryFn: () => getCustomerSample(12)
  });

  const columns = useMemo<ColumnDef<ProjectCustomer>[]>(
    () => [
      {
        accessorKey: "customer_id",
        header: "Customer",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-amber-200 to-primary text-xs font-extrabold text-white">
              {row.original.customer_id.slice(-2)}
            </div>
            <div>
              <p className="font-extrabold text-ink dark:text-white">{row.original.name}</p>
              <p className="text-xs text-muted">{row.original.customer_id} - {row.original.email}</p>
            </div>
          </div>
        )
      },
      {
        id: "segment",
        header: "Customer Segment",
        cell: ({ row }) => {
          const segment = customerSegment(row.original);
          return <Badge tone={segmentTone(segment)}>{segment}</Badge>;
        }
      },
      { accessorKey: "contract", header: "Contract Type" },
      {
        id: "health",
        header: "Health Score",
        cell: ({ row }) => {
          const score = Math.max(4, 100 - row.original.churn_probability);
          return (
            <div className="min-w-32">
              <div className="flex items-center justify-between text-xs font-bold">
                <span>{score}/100</span>
                <span className={cn(score >= 70 ? "text-success" : score >= 45 ? "text-warning" : "text-danger")}>{score >= 70 ? "Healthy" : score >= 45 ? "Watch" : "Weak"}</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-slate-100">
                <div className={cn("h-full rounded-full", score >= 70 ? "bg-success" : score >= 45 ? "bg-warning" : "bg-danger")} style={{ width: `${score}%` }} />
              </div>
            </div>
          );
        }
      },
      {
        accessorKey: "monthly_charges",
        header: "Monthly Charges",
        cell: ({ row }) => `$${row.original.monthly_charges.toFixed(2)}`
      },
      {
        accessorKey: "tenure",
        header: "Tenure",
        cell: ({ row }) => `${row.original.tenure} mo`
      },
      {
        accessorKey: "risk",
        header: "Risk Badge",
        cell: ({ row }) => (
          <Badge tone={row.original.risk === "CRITICAL" || row.original.risk === "HIGH" ? "danger" : row.original.risk === "MEDIUM" ? "warning" : "success"}>
            {row.original.risk}
          </Badge>
        )
      },
      {
        accessorKey: "churn_probability",
        header: "Risk Progress",
        cell: ({ row }) => (
          <div className="min-w-36">
            <div className="flex items-center justify-between text-xs font-bold">
              <span>{row.original.churn_probability}%</span>
              <span className="text-muted">CatBoost</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-slate-100">
              <div
                className={cn("h-full rounded-full", row.original.churn_probability >= 70 ? "bg-danger" : row.original.churn_probability >= 45 ? "bg-warning" : "bg-success")}
                style={{ width: `${row.original.churn_probability}%` }}
              />
            </div>
          </div>
        )
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Button asChild variant="ghost" size="icon" aria-label="View customer">
              <Link to={`/customers/${row.original.customer_id}`}><Eye className="h-4 w-4" /></Link>
            </Button>
            <Button variant="ghost" size="icon" aria-label="Predict customer"><Play className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" aria-label="Delete customer"><Trash2 className="h-4 w-4 text-danger" /></Button>
          </div>
        )
      }
    ],
    []
  );

  const table = useReactTable({
    data: data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2, 3].map((item) => <div key={item} className="h-14 animate-pulse rounded-xl bg-slate-100" />)}
      </div>
    );
  }

  if (isError || !data?.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center">
        <p className="font-extrabold text-ink">No customers available</p>
        <p className="mt-2 text-sm text-muted">Start FastAPI or import a customer file to populate this table.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto scrollbar-thin">
      <table className="w-full min-w-[1120px] text-left text-sm">
        <thead className="text-muted">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="px-4 py-3 font-bold">
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border-t border-slate-100">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-4">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-5 flex items-center justify-between">
        <Button variant="outline" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Previous</Button>
        <p className="text-sm font-semibold text-muted">Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}</p>
        <Button variant="outline" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Next</Button>
      </div>
    </div>
  );
}
