import { useForm } from "react-hook-form";
import {
  resetPasswordSchema,
  type ForgotPasswordInput,
  type ResetPasswordInput,
} from "../../schemas/authSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Eye, EyeClosed, MoveLeft } from "lucide-react";
import type { FormProps } from "../../types/type";

export default function ResetPasswordForm({
  defaultValues,
  onSubmit,
  isLoading,
  onResendMail,
  email = "",
}: FormProps<ResetPasswordInput> & {
  email: string;
  onResendMail: (val: ForgotPasswordInput) => void;
}) {
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues,
  });
  const [showPassword, setShowPasword] = useState(false);
  const [showConformPassword, setShowConformPassword] = useState(false);
  const [resendOtpCounter, setResendOtpCounter] = useState(0);

  useEffect(() => {
    setValue("email", email);
    setResendOtpCounter(60);
  }, [email]);

  useEffect(() => {
    setTimeout(() => {
      if (resendOtpCounter > 0) setResendOtpCounter((v) => v - 1);
    }, 1000);
  }, [resendOtpCounter]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-white/90">
          Email
        </label>

        {/* <input
          {...register("email")}
          readOnly
          type="hidden"
          placeholder="Enter your email address"
          className={`w-full rounded-md px-3 py-2 text-sm bg-white dark:bg-white/5 outline focus:outline-2 ${errors.email ? "outline-red-500" : "outline-gray-300 dark:outline-white/10 focus:outline-gray-400"}`}
        /> */}
        <div className="w-full rounded-md px-3 py-2 text-sm bg-white dark:bg-white/5 outline outline-gray-300 dark:outline-white/10">
          {getValues("email")}
        </div>
        <p className="mt-1 h-4"></p>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-white/90">
          OTP
        </label>

        <input
          {...register("otp")}
          placeholder="Enter the OTP"
          className={`w-full rounded-md px-3 py-2 text-sm bg-white dark:bg-white/5 outline focus:outline-2 ${errors.otp ? "outline-red-500" : "outline-gray-300 dark:outline-white/10 focus:outline-gray-400"}`}
        />
        <p className="mt-1 text-sm text-red-500 h-4">{errors.otp && errors.otp.message}</p>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-white/90">
          Password
        </label>

        <div
          className={`flex items-center rounded-md outline ${errors.password ? "outline-red-500" : "outline-gray-300 dark:outline-white/10 focus:outline-gray-400"}`}
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
        <p className="mt-1 text-sm text-red-500 h-4">
          {errors.password && errors.password.message}
        </p>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-white/90">
          Confirm Password
        </label>
        <div
          className={`flex items-center rounded-md outline ${errors.confirmPassword ? "outline-red-500" : "outline-gray-300 dark:outline-white/10 focus:outline-gray-400"}`}
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
        <p className="mt-1 text-sm text-red-500 h-4">
          {errors.confirmPassword && errors.confirmPassword.message}
        </p>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full mt-4 rounded-md px-4 py-2 text-sm font-semibold bg-indigo-500 text-white hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 cursor-pointer"
      >
        {isLoading ? "Loading..." : "Change Password"}
      </button>
      <div className="flex flex-col md:flex-row justify-center items-center gap-2">
        <Link
          to="/auth/login"
          viewTransition
          type="button"
          className="flex flex-row justify-center items-center gap-x-2 w-full md:w-1/2 rounded-md px-4 py-2 text-sm font-semibold text-gray-700! dark:text-white! border border-gray-300 dark:border-white/9 bg-white dark:bg-white/2 hover:bg-gray-50 dark:hover:bg-white/20 ransition-all cursor-pointer order-2 md:order-1"
        >
          <MoveLeft size={16} /> <span>Back to Login</span>
        </Link>
        <button
          type="button"
          disabled={isLoading || resendOtpCounter > 0}
          onClick={() => {
            if (resendOtpCounter <= 0) {
              setResendOtpCounter(60);
              onResendMail({ email: getValues("email") });
            }
          }}
          className="w-full md:w-1/2 rounded-md px-4 py-2 text-sm font-semibold text-gray-700! dark:text-white! border border-gray-300 dark:border-white/9 bg-white dark:bg-white/2 hover:bg-gray-50 dark:hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer order-1 md:order-"
        >
          {resendOtpCounter > 0
            ? `Resend OTP in ${resendOtpCounter}`
            : isLoading
              ? "Loading..."
              : "Resend OTP"}
        </button>
      </div>
    </form>
  );
}
