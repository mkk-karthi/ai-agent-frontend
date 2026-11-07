import { ChevronRight, Users as UsersIcon } from "lucide-react";
import { Link } from "react-router-dom";
import DataTable from "../../components/ui/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import type { User } from "../../types/user";
import StatusColumn from "../../components/ui/StatusColumn";
import MetaHead from "../../components/common/MetaHead";

export default function UserPage(): React.ReactElement {
  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        accessorKey: "email",
        header: "User",
        cell: ({ row }) => {
          const user = row.original;
          const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User";
          const initial = (user.firstName?.[0] || user.email?.[0] || "U").toUpperCase();

          return (
            <div className="flex items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-semibold text-sm select-none">
                {initial}
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-gray-900 dark:text-white truncate">
                  {fullName}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user.email}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: "Joined Date",
        cell: ({ row }) => {
          const rawDate = row.original.createdAt;
          if (!rawDate) return <span className="text-gray-400">-</span>;
          const formatted = new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }).format(new Date(rawDate));
          return <span className="text-gray-600 dark:text-gray-300">{formatted}</span>;
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          return (
            <StatusColumn
              status={row.original.status}
              id={row.original.id}
              apiUrl="/user/status"
              queryKey="users"
            />
          );
        },
      },
    ],
    [],
  );

  return (
    <>
      <MetaHead
        title="Users Management"
        description="Manage users, account statuses, and permissions in MKK Agent Admin."
        noIndex={true}
      />

      <div className="space-y-6 pb-16">
        {/* Top Separate Card: Page Title, Description & Breadcrumbs */}
        <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-800/40 p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <Link
                  to="/admin/dashboard"
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Home
                </Link>
                <ChevronRight className="size-3.5" />
                <span className="text-gray-900 dark:text-white font-medium">Users</span>
              </div>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
                Users Management
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                View registered user accounts, manage active statuses, and audit membership
                creation.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 px-3.5 py-2 text-xs font-semibold text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/40">
                <UsersIcon className="size-4 text-indigo-600 dark:text-indigo-400" />
                <span>Account Directory</span>
              </div>
            </div>
          </div>
        </div>

        {/* User Table Card */}
        <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-800/40 p-6 shadow-xs">
          <DataTable<User> columns={columns} apiUrl="/user" queryKey="users" />
        </div>
      </div>
    </>
  );
}
