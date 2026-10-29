import { Link, useNavigate } from "react-router-dom";
import type { RegisterInput } from "../../schemas/authSchema";
import RegisterForm from "../../components/auth/RegisterForm";
import GoogleIcon from "../../components/ui/GoogleIcon";
import { useMutation } from "@tanstack/react-query";
import { fetchService } from "../../lib/fetchService";
import { useState } from "react";
import type { apiResponse } from "../../types/type";
import { toast } from "react-toastify";
import { useRecaptcha } from "../../hooks/useRecaptcha";
import MetaHead from "../../components/common/MetaHead";

export default function SignUp(): React.ReactElement {
  const { executeRecaptcha } = useRecaptcha();
  const registerFormData: RegisterInput = {
    email: "",
    password: "",
    confirmPassword: "",
  };
  const [isLoading, setLoading] = useState(false);

  const navigate = useNavigate();
  const mutation = useMutation({
    mutationFn: async (data: RegisterInput) => {
      setLoading(true);
      const captchaToken = await executeRecaptcha("register");
      const payload = captchaToken ? { ...data, captchaToken } : data;
      const response = await fetchService.post("/auth/register", payload);
      return response;
    },
    onSuccess: (data: apiResponse<null>) => {
      setLoading(false);
      if (data.success) {
        toast.success(data.message);

        navigate("/auth/login", { viewTransition: true });
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
        title="Create Account"
        description="Create an account on MKK Agent to get started with AI chats and personal agent workflows."
      />
      <div className="min-h-full flex flex-col items-center py-8 px-4">
        <div className="w-full text-center p-4">
          <Link to="/new" className="text-3xl font-bold text-gray-950! dark:text-white!">
            <h1>MKK AI Agent</h1>
          </Link>
          <h2 className="text-2xl font-semibold text-gray-900/80 dark:text-white/80">
            Create an Account!
          </h2>
        </div>

        <div className="min-w-md space-y-4 p-6 mt-4 rounded-2xl bg-white dark:bg-gray-900">
          <button
            type="button"
            onClick={() => window.location.assign("/api/auth/google")}
            className="flex justify-center items-center gap-x-3 w-full rounded-md px-4 py-2 text-sm font-semibold text-gray-700 dark:text-white border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 transition-all cursor-pointer"
          >
            <GoogleIcon size={16} />
            <span>Sign up with Google</span>
          </button>

          <div className="relative w-full text-sm text-gray-500 dark:text-white/50 text-center my-2 flex items-center gap-3">
            <span className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            <span>or sign up with email</span>
            <span className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          </div>

          <RegisterForm
            defaultValues={registerFormData}
            onSubmit={(data) => !isLoading && mutation.mutate(data)}
            isLoading={isLoading}
          />
          <p className="text-base text-center">
            Already have an Account?{" "}
            <Link to="/auth/login" viewTransition>
              SignIn
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
