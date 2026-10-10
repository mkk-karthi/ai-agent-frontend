import type React from "react";
import type { User } from "../../../types/user";
import { Loader, Pencil } from "lucide-react";
import { useCallback, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchService } from "../../../services/fetchService";
import { toast } from "react-toastify";
import type { apiResponse } from "../../../types/type";

export default function StatusColumn({
  status,
  id,
  queryKey,
  apiUrl,
}: {
  status: User["status"];
  id: User["id"];
  queryKey: string;
  apiUrl: string;
}): React.ReactElement {
  const [edit, setEdit] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: User["status"]) => {
      setLoading(true);
      const response = await fetchService.patch(`${apiUrl}/${id}`, { status: data });
      return response;
    },
    onSuccess: (data: apiResponse<unknown>) => {
      setLoading(false);

      if (data.success) {
        setEdit(false);
        queryClient.refetchQueries({ queryKey: [queryKey] });
        toast.success(data.message);
      } else toast.error(data.message);
    },
    onError: (error) => {
      setLoading(false);
      toast.error(error.message);
    },
  });

  const changeStatus = useCallback((val: User["status"]) => {
    mutation.mutate(val);
  }, []);

  return (
    <div className="flex items-center gap-3">
      {edit ? (
        <>
          {isLoading ? (
            <div className="flex gap-2 items-center px-2 py-1 text-sm">
              <Loader className={`animate-[spin_2s_linear_infinite] size-4`} /> Loading...
            </div>
          ) : (
            <>
              <div
                className="rounded-lg border border-green-600 text-green-600 hover:bg-green-600 hover:text-green-100 text-sm font-bold px-3 py-1 cursor-pointer"
                onClick={() => changeStatus("ACTIVE")}
              >
                ACTIVE
              </div>
              <div
                className="rounded-lg border border-red-600 text-red-600 hover:bg-red-600 hover:text-red-100 text-sm font-bold px-3 py-1 cursor-pointer"
                onClick={() => changeStatus("INACTIVE")}
              >
                INACTIVE
              </div>
            </>
          )}
        </>
      ) : (
        <>
          <div
            className={
              status === "ACTIVE"
                ? "rounded-full bg-green-600 px-3 py-1 text-xs font-medium text-green-100"
                : "rounded-full bg-red-600 px-3 py-1 text-xs font-medium text-red-100"
            }
          >
            {status}
          </div>
          <div className="p-2 cursor-pointer" onClick={() => setEdit(true)}>
            <Pencil size={12} className="text-indigo-500" />
          </div>
        </>
      )}
    </div>
  );
}
