import type React from "react";
import { Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { fetchService } from "../../lib/fetchService";
import { toast } from "react-toastify";
import type { apiResponse } from "../../types/type";
import { queryClient } from "../../lib/queryClient";

interface StatusColumnProps {
  status: "ACTIVE" | "INACTIVE";
  id: string | number;
  queryKey: string;
  apiUrl: string;
}

export default function StatusColumn({
  status,
  id,
  queryKey,
  apiUrl,
}: StatusColumnProps): React.ReactElement {
  const mutation = useMutation({
    mutationFn: async (nextStatus: "ACTIVE" | "INACTIVE") => {
      const response = await fetchService.patch(`${apiUrl}/${id}`, { status: nextStatus });
      return response;
    },
    onSuccess: (data: apiResponse<unknown>) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: [queryKey] });
        toast.success(data.message || "Status updated successfully");
      } else {
        toast.error(data.message || "Failed to update status");
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update status");
    },
  });

  const handleToggle = () => {
    if (mutation.isPending) return;
    const nextStatus = status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    mutation.mutate(nextStatus);
  };

  const isActive = status === "ACTIVE";

  return (
    <div className="inline-flex items-center gap-2.5">
      <button
        type="button"
        role="switch"
        aria-checked={isActive}
        aria-label={`Toggle status, currently ${status}`}
        onClick={handleToggle}
        disabled={mutation.isPending}
        className={`relative inline-flex h-4 w-8 shrink-0 cursor-pointer rounded-full outline-2 transition-colors duration-200 ease-in-out mr-1 ${
          isActive
            ? "outline-indigo-600 bg-indigo-600"
            : "outline-gray-300 dark:outline-gray-700 bg-gray-300 dark:bg-gray-700"
        }`}
      >
        <span
          aria-hidden="true"
          className={`pointer-events-none flex items-center justify-center size-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            isActive ? "translate-x-4" : "translate-x-0"
          }`}
        >
          {mutation.isPending && <Loader2 className="size-2.5 animate-spin text-indigo-600" />}
        </span>
      </button>

      <span
        className={`text-xs font-medium select-none ${
          isActive ? "text-emerald-700 dark:text-emerald-400" : "text-gray-500 dark:text-gray-400"
        }`}
      >
        {isActive ? "Active" : "Inactive"}
      </span>
    </div>
  );
}
