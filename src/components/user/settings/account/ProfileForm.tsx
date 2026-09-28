import { useForm } from "react-hook-form";
import { userProfileSchema, type UserProfileType } from "../../../../schemas/userShema";
import type { apiResponse } from "../../../../types/type";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUserStore, type userStore } from "../../../../stores/UserStore";
import { useMutation } from "@tanstack/react-query";
import { fetchService } from "../../../../services/fetchService";
import { toast } from "react-toastify";
import { useState } from "react";

export default function ProfileForm() {
  const [isLoading, setLoading] = useState(false);
  const { user, setUser } = useUserStore.getState();

  const formData: UserProfileType = {
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? null,
  };
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserProfileType>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: formData,
  });

  const mutation = useMutation({
    mutationFn: async (data: UserProfileType) => {
      setLoading(true);
      const response = await fetchService.put(`/user`, data);
      return response;
    },
    onSuccess: (data: apiResponse<userStore["user"]>) => {
      setLoading(false);

      if (data.success) {
        if (data.data) setUser({ ...user, ...data.data });
        toast.success(data.message);
      } else toast.error(data.message);
    },
    onError: (error) => {
      setLoading(false);
      toast.error(error.message);
    },
  });

  return (
    <form
      onSubmit={handleSubmit((v) => mutation.mutate(v))}
      className="space-y-4 p-2 mt-2"
    >
      <div className="flex items-center border-b border-gray-300 dark:border-white/9 py-2">
        <label className="w-full md:w-1/2 mb-1 block text-sm font-medium text-gray-700 dark:text-white/90">
          Email
        </label>

        <div className="w-full md:w-1/2 py-2 text-sm text-right">{user?.email}</div>
      </div>

      <div className="border-b border-gray-300 dark:border-white/9 py-2">
        <div className="flex items-center">
          <label className="w-full md:w-1/2 mb-1 block text-sm font-medium text-gray-700 dark:text-white/90">
            First Name
          </label>

          <input
            {...register("firstName")}
            placeholder="Enter your First Name"
            className={`w-full md:w-1/2 rounded-md px-2 py-1 text-sm bg-white dark:bg-white/5 outline focus:outline-2 ${errors.firstName ? "outline-red-500" : "outline-gray-300 dark:outline-white/10 focus:outline-gray-400"}`}
          />
        </div>
        <p className="w-full text-right mt-1 text-sm text-red-500 h-4">
          {errors.firstName && errors.firstName.message}
        </p>
      </div>

      <div className="border-b border-gray-300 dark:border-white/9 py-2">
        <div className="flex items-center">
          <label className="w-full md:w-1/2 mb-1 block text-sm font-medium text-gray-700 dark:text-white/90">
            Last Name
          </label>

          <input
            {...register("lastName")}
            placeholder="Enter your Last Name"
            className={`w-full md:w-1/2 rounded-md px-2 py-1 text-sm bg-white dark:bg-white/5 outline focus:outline-2 ${errors.lastName ? "outline-red-500" : "outline-gray-300 dark:outline-white/10 focus:outline-gray-400"}`}
          />
        </div>
        <p className="w-full text-right mt-1 text-sm text-red-500 h-4">
          {errors.lastName && errors.lastName.message}
        </p>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-md px-4 py-2 text-sm font-semibold bg-indigo-500 text-white hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 cursor-pointer"
        >
          {isLoading ? "Loading..." : "Save"}
        </button>
      </div>
    </form>
  );
}
