import { useForm } from "react-hook-form";
import {
  changePasswordSchema,
  createPasswordSchema,
  type ChangePasswordType,
} from "../../../../schemas/userShema";
import type { apiResponse } from "../../../../types/type";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Eye, EyeClosed } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { fetchService } from "../../../../lib/fetchService";
import { toast } from "react-toastify";
import { useUserStore } from "../../../../stores/UserStore";

interface ChangePasswordFormProps {
  isCreatePassword?: boolean;
}

export default function ChangePasswordForm({ isCreatePassword = false }: ChangePasswordFormProps) {
  const [showOldPassword, setShowOldPasword] = useState(false);
  const [showPassword, setShowPasword] = useState(false);
  const [showConformPassword, setShowConformPassword] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const { user, setUser } = useUserStore();

  const formData: ChangePasswordType = {
    oldPassword: "",
    password: "",
    confirmPassword: "",
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordType>({
    resolver: zodResolver(isCreatePassword ? (createPasswordSchema as any) : changePasswordSchema),
    defaultValues: formData,
  });

  const mutation = useMutation({
    mutationFn: async (data: ChangePasswordType) => {
      setLoading(true);
      const payload = isCreatePassword
        ? { password: data.password, confirmPassword: data.confirmPassword }
        : data;
      const response = await fetchService.post("/user/change-password", payload);
      return response;
    },
    onSuccess: (data: apiResponse<null>) => {
      setLoading(false);

      if (data.success) {
        reset();
        if (user) {
          setUser({ ...user, hasPassword: true });
        }
        toast.success(
          data.message || (isCreatePassword ? "Password created successfully" : "Password changed successfully"),
        );
      } else toast.error(data.message);
    },
    onError: (error) => {
      setLoading(false);
      toast.error(error.message);
    },
  });

  return (
    <form onSubmit={handleSubmit((v) => !isLoading && mutation.mutate(v as ChangePasswordType))} className="space-y-4 p-2 mt-2">
      {!isCreatePassword && (
        <div className="border-b border-gray-300 dark:border-white/9 py-2">
          <div className="flex items-center">
            <label className="w-full md:w-1/2 mb-1 block text-sm font-medium text-gray-700 dark:text-white/90">
              Old Password
            </label>

            <div
              className={`w-full md:w-1/2 flex items-center rounded-md outline ${errors.oldPassword ? "outline-red-500" : "outline-gray-300 dark:outline-white/10 focus:outline-gray-400"}`}
            >
              <input
                {...register("oldPassword")}
                type={showOldPassword ? "text" : "password"}
                placeholder="Enter your password"
                className={`w-full px-3 py-2 text-sm bg-white dark:bg-white/5 focus:outline-2 focus:outline-gray-400 rounded-l-md`}
              />
              <div className="px-2 cursor-pointer" onClick={() => setShowOldPasword((val) => !val)}>
                {showOldPassword ? <Eye className="size-4" /> : <EyeClosed className="size-4" />}
              </div>
            </div>
          </div>
          <p className="w-full text-right mt-1 text-sm text-red-500 h-4">
            {errors.oldPassword && errors.oldPassword.message}
          </p>
        </div>
      )}

      <div className="border-b border-gray-300 dark:border-white/9 py-2">
        <div className="flex items-center">
          <label className="w-full md:w-1/2 mb-1 block text-sm font-medium text-gray-700 dark:text-white/90">
            {isCreatePassword ? "Password" : "New Password"}
          </label>

          <div
            className={`w-full md:w-1/2 flex items-center rounded-md outline ${errors.password ? "outline-red-500" : "outline-gray-300 dark:outline-white/10 focus:outline-gray-400"}`}
          >
            <input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              placeholder="Enter password"
              className={`w-full px-3 py-2 text-sm bg-white dark:bg-white/5 focus:outline-2 focus:outline-gray-400 rounded-l-md`}
            />
            <div className="px-2 cursor-pointer" onClick={() => setShowPasword((val) => !val)}>
              {showPassword ? <Eye className="size-4" /> : <EyeClosed className="size-4" />}
            </div>
          </div>
        </div>
        <p className="w-full text-right mt-1 text-sm text-red-500 h-4">
          {errors.password && errors.password.message}
        </p>
      </div>

      <div className="border-b border-gray-300 dark:border-white/9 py-2">
        <div className="flex items-center">
          <label className="w-full md:w-1/2 mb-1 block text-sm font-medium text-gray-700 dark:text-white/90">
            Confirm Password
          </label>

          <div
            className={`w-full md:w-1/2 flex items-center rounded-md outline ${errors.confirmPassword ? "outline-red-500" : "outline-gray-300 dark:outline-white/10 focus:outline-gray-400"}`}
          >
            <input
              {...register("confirmPassword")}
              type={showConformPassword ? "text" : "password"}
              placeholder="Enter confirm password"
              className={`w-full px-3 py-2 text-sm bg-white dark:bg-white/5 focus:outline-2 focus:outline-gray-400 rounded-l-md`}
            />
            <div
              className="px-2 cursor-pointer"
              onClick={() => setShowConformPassword((val) => !val)}
            >
              {showConformPassword ? <Eye className="size-4" /> : <EyeClosed className="size-4" />}
            </div>
          </div>
        </div>
        <p className="w-full text-right mt-1 text-sm text-red-500 h-4">
          {errors.confirmPassword && errors.confirmPassword.message}
        </p>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-md px-4 py-2 text-sm font-semibold bg-indigo-500 text-white hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 cursor-pointer"
        >
          {isLoading ? "Loading..." : isCreatePassword ? "Create Password" : "Change"}
        </button>
      </div>
    </form>
  );
}
