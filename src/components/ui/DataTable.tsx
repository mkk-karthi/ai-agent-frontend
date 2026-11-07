import { useQuery } from "@tanstack/react-query";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type PaginationState,
} from "@tanstack/react-table";
import { ArrowDownUp, ChevronDown, ChevronUp, Search } from "lucide-react";
import { useState } from "react";
import { fetchService } from "../../lib/fetchService";

interface DataTableProps<TData> {
  columns: ColumnDef<TData>[];
  apiUrl: string;
  queryKey: string;
  onEdit?: (id: string | number) => void;
  onDelete?: (id: string | number) => void;
}

export default function DataTable<TData>({ columns, apiUrl, queryKey }: DataTableProps<TData>) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([]);

  const pageLimitOptions = [10, 25, 50, 100];

  const { data, isLoading, isError } = useQuery({
    queryKey: [queryKey, pagination, sorting, globalFilter],
    queryFn: () =>
      fetchService.post(apiUrl, {
        page: pagination.pageIndex,
        pageSize: pagination.pageSize,
        sorting,
        search: globalFilter,
      }),
    placeholderData: (previousData) => previousData, // Prevents UI flickering during transitions
    staleTime: 1000 * 60 * 5,
  });

  columns = [
    {
      id: "id", // Custom column ID
      header: "#",
      cell: (info) => {
        const pageIndex = table.getState().pagination.pageIndex;
        const pageSize = table.getState().pagination.pageSize;
        const rowIndex = info.row.index;

        return rowIndex + 1 + pageIndex * pageSize;
      },
    },
    ...columns,
  ];

  const table = useReactTable({
    data: data?.data?.data ?? [],
    columns,
    state: { pagination, sorting, globalFilter },
    pageCount: data?.data?.total ? Math.ceil(data.data.total / pagination.pageSize) : -1,

    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,

    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) return <div>Loading records...</div>;
  if (isError) return <div>Error fetching data.</div>;

  return (
    <div className="mx-auto w-full">
      {/* Tool Bar */}
      <div className="mb-4 flex justify-between">
        {/* Search */}
        <div className="relative w-40 sm:w-60 max-w-sm flex items-center">
          <Search className="pointer-events-none absolute left-3.5 size-4 text-gray-400" />
          <input
            type="text"
            value={globalFilter}
            onChange={(event) => setGlobalFilter(event.target.value)}
            placeholder="Search..."
            className="w-full rounded-xl border border-gray-200 dark:border-white/10 pl-10 pr-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-900/60 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
          />
        </div>

        {/* Page limit */}
        <div className="relative flex items-center gap-2 text-sm text-gray-700 dark:text-white">
          <span>Rows:</span>
          <div className="relative">
            <select
              value={table.getState().pagination.pageSize}
              onChange={(event) => table.setPageSize(Number(event.target.value))}
              className="appearance-none rounded-xl border border-gray-200 dark:border-white/10 pr-10 pl-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-900/60 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            >
              {pageLimitOptions.map((limit) => (
                <option key={limit} value={limit}>
                  {limit}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
            />
          </div>
        </div>
      </div>

      {/* Responsive Table Wrapper */}
      <div className="overflow-x-auto border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-800/40 rounded-xl">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-white/10 text-sm text-left">
          <thead className="bg-indigo-50/70 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 uppercase text-xs font-semibold tracking-wider">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className="px-6 py-3.5 cursor-pointer select-none transition-colors"
                  >
                    <div className="flex items-center space-x-1.5">
                      <span>{flexRender(header.column.columnDef.header, header.getContext())}</span>
                      <span>
                        {{ asc: <ChevronUp size={12} />, desc: <ChevronDown size={12} /> }[
                          header.column.getIsSorted() as "asc" | "desc"
                        ] ?? <ArrowDownUp size={12} />}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody className="bg-white dark:bg-gray-800/50 divide-y divide-gray-200 dark:divide-white/10">
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-6 py-3.5 whitespace-nowrap text-gray-700 dark:text-gray-300"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 text-sm">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-800/80 px-3.5 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 shadow-2xs hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all cursor-pointer"
          >
            Previous
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-800/80 px-3.5 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 shadow-2xs hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all cursor-pointer"
          >
            Next
          </button>
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Page <strong className="text-gray-900 dark:text-white font-semibold">{table.getState().pagination.pageIndex + 1}</strong> of{" "}
          <strong className="text-gray-900 dark:text-white font-semibold">{table.getPageCount() > 0 ? table.getPageCount() : 1}</strong>
        </span>
      </div>
    </div>
  );
}
