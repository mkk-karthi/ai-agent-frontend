import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useState } from "react";
import type { apiResponse, Provider } from "../../types/type";
import { providerSchema, type providerInput } from "../../schemas/providerSchema";
import { fetchService } from "../../lib/fetchService";
import { Eye, EyeClosed } from "lucide-react";
import { queryClient } from "../../lib/queryClient";

export default function ProviderForm({ item }: { item: Provider }) {
  const [isLoading, setLoading] = useState(false);
  const [isEdit, setEdit] = useState(false);
  const [showPassword, setShowPasword] = useState(false);

  const formData: providerInput = {
    token: "",
    status: item?.status ?? null,
  };
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<providerInput>({
    resolver: zodResolver(providerSchema),
    defaultValues: formData,
  });

  const mutation = useMutation({
    mutationFn: async (data: providerInput) => {
      setLoading(true);
      const response = await fetchService.put(`/provider/${item.id}`, data);
      return response;
    },
    onSuccess: (data: apiResponse<unknown>) => {
      setLoading(false);

      if (data.success) {
        setEdit(false);
        reset({ token: "" });
        queryClient.invalidateQueries({ queryKey: ["providers"] });
        toast.success(data.message);
      } else toast.error(data.message);
    },
    onError: (error) => {
      setLoading(false);
      toast.error(error.message);
    },
  });
  const syncModelMutation = useMutation({
    mutationFn: async () => {
      setLoading(true);
      const response = await fetchService.post(`/provider/sync-model/${item.id}`, []);
      return response;
    },
    onSuccess: (data: apiResponse<unknown>) => {
      setLoading(false);

      if (data.success) {
        setEdit(false);
        queryClient.invalidateQueries({ queryKey: ["providers"] });
        toast.success(data.message);
      } else toast.error(data.message);
    },
    onError: (error) => {
      setLoading(false);
      toast.error(error.message);
    },
  });

  return (
    <div>
      <form
        onSubmit={handleSubmit((v) => isEdit && !isLoading && mutation.mutate(v))}
        className="space-y-4 p-2 mt-2 w-full md:w-1/3"
      >
        <div className="pb-1">
          <div className="flex items-center">
            <label className="w-full md:w-1/3 mb-1 block text-sm font-medium text-gray-700 dark:text-white/90">
              Token
            </label>

            {isEdit ? (
              <div
                className={`w-full md:w-2/3 flex items-center rounded-md outline ${errors.token ? "outline-red-500" : "outline-gray-300 dark:outline-white/10 focus:outline-gray-400"}`}
              >
                <input
                  {...register("token")}
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your api key"
                  className={`w-full px-3 py-2 text-sm bg-white dark:bg-white/5 focus:outline-2 focus:outline-gray-400 rounded-l-md`}
                />
                <div className="px-2 cursor-pointer" onClick={() => setShowPasword((val) => !val)}>
                  {showPassword ? <Eye className="size-4" /> : <EyeClosed className="size-4" />}
                </div>
              </div>
            ) : (
              [...Array(10)].map(() => "*")
            )}
          </div>
          <p className="w-full text-right mt-1 text-sm text-red-500 h-4">
            {errors.token && errors.token.message}
          </p>
        </div>

        <div className="pb-1">
          <div className="flex items-center">
            <label className="w-full md:w-1/3 mb-1 block text-sm font-medium text-gray-700 dark:text-white/90">
              Status
            </label>

            {isEdit ? (
              <select
                {...register("status")}
                className={`w-full md:w-2/3 rounded-md px-3 py-2 text-sm bg-white dark:bg-white/5 outline focus:outline-2 ${errors.status ? "outline-red-500" : "outline-gray-300 dark:outline-white/10 focus:outline-gray-400"}`}
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            ) : (
              <div
                className={
                  item.status === "ACTIVE"
                    ? "rounded-full bg-green-600 px-3 py-1 text-xs font-medium text-green-100"
                    : "rounded-full bg-red-600 px-3 py-1 text-xs font-medium text-red-100"
                }
              >
                {item.status}
              </div>
            )}
          </div>
          <p className="w-full text-right mt-1 text-sm text-red-500 h-4">
            {errors.status && errors.status.message}
          </p>
        </div>

        {isEdit && (
          <div className="flex justify-center gap-2">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => setEdit(false)}
              className="rounded-md px-3 py-1 text-sm font-semibold text-gray-700 dark:text-white border border-gray-300 dark:border-white/9 bg-white dark:bg-white/2 hover:bg-gray-50 dark:hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-md px-3 py-1 text-sm font-semibold bg-indigo-500 text-white hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 cursor-pointer"
            >
              {isLoading ? "Loading..." : "Save"}
            </button>
          </div>
        )}
      </form>
      {!isEdit && (
        <div className="flex gap-2 w-full mx-4">
          <button
            type="button"
            onClick={() => setEdit(true)}
            className="rounded-md px-3 py-1 text-sm font-semibold bg-indigo-500 text-white hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 cursor-pointer"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => !isLoading && syncModelMutation.mutate()}
            className="rounded-md px-3 py-1 text-sm font-semibold bg-indigo-500 text-white hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 cursor-pointer"
          >
            {isLoading ? "Loading..." : "Sync Models"}
          </button>
        </div>
      )}
    </div>
  );
}
