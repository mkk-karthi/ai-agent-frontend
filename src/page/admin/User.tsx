import { ChevronRight, CirclePlus } from "lucide-react";
import { Link } from "react-router-dom";
import DataTable from "../../components/ui/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import CreateUser from "../../components/admin/user/UserCreate";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  // status: "Active" | "Inactive";
}

export default function User(): React.ReactElement {
  const [isOpenCreateUser, openCreateUser] = useState(false);

  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        accessorKey: "firstName",
        header: "First Name",
      },
      {
        accessorKey: "lastName",
        header: "Last Name",
      },
      {
        accessorKey: "email",
        header: "Email",
      },
      // {
      //   accessorKey: "status",
      //   header: "Status",
      //   cell: ({ row }) => {
      //     const status = row.original.status;

      //     return (
      //       <span
      //         className={
      //           status === "Active"
      //             ? "rounded-full bg-green-600 px-3 py-1 text-xs font-medium text-green-100"
      //             : "rounded-full bg-red-600 px-3 py-1 text-xs font-medium text-red-100"
      //         }
      //       >
      //         {status}
      //       </span>
      //     );
      //   },
      // },
    ],
    [],
  );

  return (
    <>
      <div className="rounded-lg px-6 py-8 dark:bg-gray-800/20 ring shadow-xl ring-gray-300 dark:ring-white/10 outline-1 outline-white/10">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-base text-gray-500 dark:text-gray-400">
              <Link to="/admin/dashboard" className="hover:text-gray-700 dark:hover:text-white">
                Home
              </Link>
              <ChevronRight className="size-4" />
              <Link to="/admin/user" className="hover:text-gray-700 dark:hover:text-white">
                User
              </Link>
            </div>
            <h2 className="text-2xl/7 font-bold text-gray-900 dark:text-white sm:truncate sm:text-3xl sm:tracking-tight mt-1">
              Users
            </h2>
          </div>
          {/* <div className="flex mt-0 ml-4">
            <button
              type="button"
              className="inline-flex items-center rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 cursor-pointer"
              onClick={() => openCreateUser(true)}
            >
              <CirclePlus className="size-5" />
              <span className="hidden sm:block ml-2"> Create</span>
            </button>
          </div> */}
        </div>

        <div className="mt-4">
          <DataTable<User> columns={columns} apiUrl="/user" queryKey="users" />
        </div>
        <CreateUser isModalOpen={isOpenCreateUser} onModalUpdate={openCreateUser} />
      </div>
    </>
  );
}
