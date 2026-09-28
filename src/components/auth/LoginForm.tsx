import { useForm } from "react-hook-form";
import { loginSchema, type LoginInput } from "../../schemas/authSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Eye, EyeClosed } from "lucide-react";
import type { FormProps } from "../../types/type";

export default function LoginForm({ defaultValues, onSubmit, isLoading }: FormProps<LoginInput>) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues,
  });
  const [showPassword, setShowPasword] = useState(false);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-4">
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

      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-white/90">
          Password
        </label>

        <div
          className={`flex items-center rounded-md outline ${errors.password ? "outline-red-500" : "outline-gray-300 dark:outline-white/10 focus:outline-gray-400"}`}
        >
          <input
            {...register("password")}
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            className={`w-full px-3 py-2 text-sm bg-white dark:bg-white/5 focus:outline-2 focus:outline-gray-400 rounded-l-md`}
          />
          <div className="px-2 cursor-pointer" onClick={() => setShowPasword((val) => !val)}>
            {showPassword ? <Eye className="size-4" /> : <EyeClosed className="size-4" />}
          </div>
        </div>
        <p className="mt-1 text-sm text-red-500 h-4">{errors.password && errors.password.message}</p>
      </div>

      <div className="flex justify-end">
        <Link to="/auth/reset" viewTransition>Forget your password?</Link>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full mt-4 rounded-md px-4 py-2 text-sm font-semibold bg-indigo-500 text-white hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 cursor-pointer"
      >
        {isLoading ? "Loading..." : "Login"}
      </button>
    </form>
  );
}
