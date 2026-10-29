import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ResetPasswordForm from "../../components/auth/ResetPasswordForm";
import { useMutation } from "@tanstack/react-query";
import { fetchService } from "../../lib/fetchService";
import { toast } from "react-toastify";
import type { apiResponse } from "../../types/type";
import type { ForgotPasswordInput, ResetPasswordInput } from "../../schemas/authSchema";
import ForgotPasswordForm from "../../components/auth/ForgotPasswordForm";
import { useRecaptcha } from "../../hooks/useRecaptcha";
import MetaHead from "../../components/common/MetaHead";

export default function ResetPassword(): React.ReactElement {
  const { executeRecaptcha } = useRecaptcha();
  const forgotPasswordData: ForgotPasswordInput = {
    email: "",
  };
  const resetPasswordData: ResetPasswordInput = {
    email: "",
    otp: "",
    password: "",
    confirmPassword: "",
  };
  const [isLoading, setLoading] = useState(false);
  const [isOtpSent, setOtpSent] = useState(false);
  const [email, setEmail] = useState("");

  const navigate = useNavigate();
  const forgotPasswordMutation = useMutation({
    mutationFn: async (data: ForgotPasswordInput) => {
      setLoading(true);
      const captchaToken = await executeRecaptcha("forgot_password");
      const payload = captchaToken ? { ...data, captchaToken } : data;
      const response = await fetchService.post("/auth/forgot-password", payload);
      setEmail(data.email);
      return response;
    },
    onSuccess: (data: apiResponse<null>) => {
      setLoading(false);

      if (data.success) {
        toast.success(data.message);
        setOtpSent(true);
      } else toast.error(data.message);
    },
    onError: (error) => {
      setLoading(false);
      toast.error(error.message);
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (data: ResetPasswordInput) => {
      setLoading(true);
      const captchaToken = await executeRecaptcha("reset_password");
      const payload = captchaToken ? { ...data, captchaToken } : data;
      const response = await fetchService.post("/auth/reset-password", payload);
      return response;
    },
    onSuccess: (data: apiResponse<null>) => {
      setLoading(false);

      if (data.success) {
        toast.success(data.message);
        navigate("/new", { viewTransition: true });
      } else toast.error(data.message);
    },
    onError: (error) => {
      setLoading(false);
      toast.error(error.message);
    },
  });

  return (
    <div className="h-dvh w-full overflow-y-auto bg-gray-100 dark:bg-gray-950">
      <MetaHead
        title="Reset Password"
        description="Reset your MKK Agent account password with one-time verification."
      />
      <div className="min-h-full flex flex-col items-center py-8 px-4">
        <div className="w-full text-center p-4">
          <Link to="/new" className="text-3xl font-bold text-gray-950! dark:text-white!">
            <h1>MKK AI Agent</h1>
          </Link>
          <h2 className="text-2xl font-semibold text-gray-900/80 dark:text-white/80">
            Forgot Password!
          </h2>
        </div>

        <div className="min-w-xs sm:min-w-sm md:min-w-md space-y-4 p-6 mt-4 rounded-2xl bg-white dark:bg-gray-900">
          {isOtpSent ? (
            <ResetPasswordForm
              defaultValues={resetPasswordData}
              onSubmit={(data) => !isLoading && resetPasswordMutation.mutate(data)}
              onResendMail={forgotPasswordMutation.mutate}
              isLoading={isLoading}
              email={email}
            />
          ) : (
            <ForgotPasswordForm
              defaultValues={forgotPasswordData}
              onSubmit={(data) => !isLoading && forgotPasswordMutation.mutate(data)}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>
    </div>
  );
}
