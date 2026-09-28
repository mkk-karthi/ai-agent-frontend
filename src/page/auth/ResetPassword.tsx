import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ResetPasswordForm from "../../components/auth/ResetPasswordForm";
import { useMutation } from "@tanstack/react-query";
import { fetchService } from "../../services/fetchService";
import { toast } from "react-toastify";
import type { apiResponse } from "../../types/type";
import type { ForgotPasswordInput, ResetPasswordInput } from "../../schemas/authSchema";
import ForgotPasswordForm from "../../components/auth/ForgotPasswordForm";

export default function ResetPassword(): React.ReactElement {
  const forgotPasswordData: ForgotPasswordInput = {
    email: "",
  };
  const resetPasswordData: ResetPasswordInput = {
    email: "",
    otp: "",
    password: "",
    confirmPassword: "",
  };
  const [loading, setLoading] = useState(false);
  const [isOtpSent, setOtpSent] = useState(false);
  const [email, setEmail] = useState("");

  const navigate = useNavigate();
  const forgotPasswordMutation = useMutation({
    mutationFn: async (data: ForgotPasswordInput) => {
      setLoading(true);
      const response = await fetchService.post("/auth/forgot-password", data);
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
      const response = await fetchService.post("/auth/reset-password", data);
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
              onSubmit={resetPasswordMutation.mutate}
              onResendMail={forgotPasswordMutation.mutate}
              isLoading={loading}
              email={email}
            />
          ) : (
            <ForgotPasswordForm
              defaultValues={forgotPasswordData}
              onSubmit={forgotPasswordMutation.mutate}
              isLoading={loading}
            />
          )}
        </div>
      </div>
    </div>
  );
}
