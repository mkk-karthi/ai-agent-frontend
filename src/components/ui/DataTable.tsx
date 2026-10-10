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
import { fetchService } from "../../services/fetchService";

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
        <div className="relative w-40 sm:w-60 max-w-sm">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white"
          />
          <input
            type="text"
            value={globalFilter}
            onChange={(event) => setGlobalFilter(event.target.value)}
            placeholder="Search..."
            className="w-full rounded-md py-2 pl-10 pr-3 text-sm transition bg-white dark:bg-white/5 outline focus:outline-2 outline-gray-300 dark:outline-white/10 focus:outline-gray-400"
          />
        </div>

        {/* Page limit */}
        <div className="relative flex items-center gap-2 text-sm text-gray-700 dark:text-white">
          <span>Rows:</span>
          <div className="relative">
            <select
              value={table.getState().pagination.pageSize}
              onChange={(event) => table.setPageSize(Number(event.target.value))}
              className="appearance-none rounded-md bg-white dark:bg-white/5 py-2 pl-3 pr-8 text-sm outline focus:outline-2 outline-gray-300 dark:outline-white/10 focus:outline-gray-400"
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
      <div className="overflow-x-auto border border-gray-200 dark:border-white/10 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-white/10 text-sm text-left">
          <thead className="bg-gray-50 dark:bg-gray-800/75 uppercase text-xs font-semibold tracking-wider">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className="px-6 py-3 cursor-pointer select-none text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center space-x-1">
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
                className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400 font-medium"
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
      <div className="flex items-center justify-between mt-4 text-sm">
        <div className="flex space-x-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1.5 text-gray-700 dark:text-white border border-gray-300 dark:border-white/9 rounded-md bg-white dark:bg-white/10 hover:bg-gray-50 dark:hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            Previous
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1.5 text-gray-700 dark:text-white border border-gray-300 dark:border-white/9 rounded-md bg-white dark:bg-white/10 hover:bg-gray-50 dark:hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            Next
          </button>
        </div>
        <span className="text-gray-700 dark:text-white">
          Page <strong>{table.getState().pagination.pageIndex + 1}</strong> of{" "}
          <strong>{table.getPageCount()}</strong>
        </span>
      </div>
    </div>
  );
}
