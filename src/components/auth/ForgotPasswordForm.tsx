import { useForm } from "react-hook-form";
import { forgotPasswordSchema, type ForgotPasswordInput } from "../../schemas/authSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { MoveLeft } from "lucide-react";
import type { FormProps } from "../../types/type";

export default function ForgotPasswordForm({
  defaultValues,
  onSubmit,
  isLoading,
}: FormProps<ForgotPasswordInput>) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-white/90">
          Email
        </label>

        <input
          {...register("email")}
          placeholder="Enter your email address"
          className={`w-full rounded-md px-3 py-2 text-sm bg-white dark:bg-white/5 outline focus:outline-2 ${errors.email ? "outline-red-500" : "outline-gray-300 dark:outline-white/10 focus:outline-gray-400"}`}
        />
        <p className="mt-1 text-sm text-red-500 h-4">{errors.email && errors.email.message}</p>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-md px-4 py-2 text-sm font-semibold bg-indigo-500 text-white hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 cursor-pointer"
      >
        {isLoading ? "Loading..." : "Send OTP"}
      </button>
      <Link
        to="/auth/login"
        viewTransition
        type="button"
        className="flex flex-row justify-center items-center gap-x-2 rounded-md px-4 py-2 text-sm font-semibold text-gray-700! dark:text-white! border border-gray-300 dark:border-white/9 bg-white dark:bg-white/2 hover:bg-gray-50 dark:hover:bg-white/20 transition-all cursor-pointer"
      >
        <MoveLeft size={16} /> <span>Back to Login</span>
      </Link>
    </form>
  );
}
