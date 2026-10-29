import { Link, useNavigate } from "react-router-dom";
import type { LoginInput } from "../../schemas/authSchema";
import LoginForm from "../../components/auth/LoginForm";
import GoogleIcon from "../../components/ui/GoogleIcon";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { fetchService } from "../../lib/fetchService";
import type { apiResponse } from "../../types/type";
import { toast } from "react-toastify";
import { useUserStore, type userStore } from "../../stores/UserStore";
import { useAppStore } from "../../stores/AppStore";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import { queryClient } from "../../lib/queryClient";
import { useRecaptcha } from "../../hooks/useRecaptcha";
import MetaHead from "../../components/common/MetaHead";

export default function Login(): React.ReactElement {
  const setNavBarOpen = useAppStore((state) => state.setNavBarOpen);
  const breakpoint = useBreakpoint();
  const { executeRecaptcha } = useRecaptcha();

  const loginFormData: LoginInput = {
    email: "",
    password: "",
  };
  const [isLoading, setLoading] = useState(false);
  const userStore = useUserStore((state) => state);

  const navigate = useNavigate();
  const mutation = useMutation({
    mutationFn: async (data: LoginInput) => {
      setLoading(true);
      const captchaToken = await executeRecaptcha("login");
      const payload = captchaToken ? { ...data, captchaToken } : data;
      const response = await fetchService.post("/auth/login", payload);
      return response;
    },
    onSuccess: (data: apiResponse<{ user: userStore["user"]; accessToken: string }>) => {
      setLoading(false);

      if (data.success) {
        if (data.data?.user) {
          userStore.setUser(data.data.user);
          userStore.setAccessToken(data.data.accessToken);

          toast.success(data.message);

          if (!["xs", "sm", "md"].includes(breakpoint)) setNavBarOpen(true);

          queryClient.invalidateQueries({ queryKey: ["coversations"] });
          if (data.data.user.roleId == 1) navigate("/admin", { viewTransition: true });
          else navigate("/new", { viewTransition: true });
        }
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
        title="Sign In"
        description="Sign in to your MKK Agent account to continue your AI chat sessions."
      />
      <div className="min-h-full flex flex-col items-center py-8 px-4">
        <div className="w-full text-center p-4">
          <Link to="/new" className="text-3xl font-bold text-gray-950! dark:text-white!">
            <h1>MKK AI Agent</h1>
          </Link>
          <h2 className="text-2xl font-semibold text-gray-900/80 dark:text-white/80">
            Welcome back!
          </h2>
        </div>

        <div className="min-w-xs sm:min-w-sm md:min-w-md space-y-4 p-6 mt-4 rounded-2xl bg-white dark:bg-gray-900">
          <button
            type="button"
            onClick={() => window.location.assign("/api/auth/google")}
            className="flex justify-center items-center gap-x-3 w-full rounded-md px-4 py-2 text-sm font-semibold text-gray-700 dark:text-white border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 transition-all cursor-pointer"
          >
            <GoogleIcon size={16} />
            <span>Sign in with Google</span>
          </button>

          <div className="relative w-full text-sm text-gray-500 dark:text-white/50 text-center my-2 flex items-center gap-3">
            <span className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            <span>or continue with email</span>
            <span className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          </div>

          <LoginForm
            defaultValues={loginFormData}
            onSubmit={(data) => !isLoading && mutation.mutate(data)}
            isLoading={isLoading}
          />
          <p className="text-base text-center">
            Don't have an Account?{" "}
            <Link to="/auth/signUp" viewTransition>
              SignUp
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
