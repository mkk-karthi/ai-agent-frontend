import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Loader2, Pencil } from "lucide-react";
import { useForm } from "react-hook-form";
import { tokenUpdateSchema, type TokenUpdateType } from "../../../schemas/userShema";
import type { apiResponse } from "../../../types/type";
import { toast } from "react-toastify";
import { fetchService } from "../../../lib/fetchService";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { queryClient } from "../../../lib/queryClient";

export default function TokenUpdateForm({
  id,
  className = "",
}: {
  id: number;
  className?: string;
}): React.ReactElement {
  const [isLoading, setLoading] = useState(false);
  const [isEdit, setEdit] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TokenUpdateType>({
    resolver: zodResolver(tokenUpdateSchema),
    defaultValues: {
      providerId: id,
      token: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: TokenUpdateType) => {
      setLoading(true);
      const response = await fetchService.put("/token", data);
      return response;
    },
    onSuccess: (data: apiResponse<null>) => {
      setLoading(false);

      if (data.success) {
        reset();
        setEdit(false);
        toast.success(data.message);
        queryClient.invalidateQueries({ queryKey: ["tokens"] });
      } else toast.error(data.message);
    },
    onError: (error) => {
      setLoading(false);
      toast.error(error.message);
    },
  });

  return (
    <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className={`${className}`}>
      <div
        className={`flex items-center ${isEdit && "rounded-md outline"} ${errors.token ? "outline-red-500" : "outline-gray-300 dark:outline-white/10 focus:outline-gray-400"}`}
      >
        {isEdit ? (
          <>
            <input
              {...register("token")}
              type="password"
              placeholder="Enter your API Key"
              className={`w-full px-3 py-2 text-sm bg-white dark:bg-white/5 focus:outline-2 focus:outline-gray-400 rounded-l-md`}
            />
            <button type="submit" disabled={isLoading} className="px-2 cursor-pointer outline-none">
              {isLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Check className="size-4" />
              )}
            </button>
          </>
        ) : (
          <div className="flex justify-end w-full my-1.5">
            <div className="tracking-[0.5rem]">{[...Array(10)].map(() => "*")}</div>
            <button
              type="button"
              className="px-2 cursor-pointer outline-none"
              onClick={() => setEdit(true)}
            >
              <Pencil className="size-4" />
            </button>
          </div>
        )}
      </div>
      <p className="w-full mt-1 text-sm text-red-500 h-4">{errors.token && errors.token.message}</p>
    </form>
  );
}
