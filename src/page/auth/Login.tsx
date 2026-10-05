import { Link, useNavigate } from "react-router-dom";
import type { LoginInput } from "../../schemas/authSchema";
import LoginForm from "../../components/auth/LoginForm";
import GoogleIcon from "../../components/ui/GoogleIcon";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchService } from "../../services/fetchService";
import type { apiResponse } from "../../types/type";
import { toast } from "react-toastify";
import { useUserStore, type userStore } from "../../stores/UserStore";
import { useAppStore } from "../../stores/AppStore";
import { useBreakpoint } from "../../hooks/useBreakpoint";

export default function Login(): React.ReactElement {
  const setNavBarOpen = useAppStore((state) => state.setNavBarOpen);
  const breakpoint = useBreakpoint();

  const loginFormData: LoginInput = {
    email: "",
    password: "",
  };
  const [loading, setLoading] = useState(false);
  const userStore = useUserStore((state) => state);

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (data: LoginInput) => {
      setLoading(true);
      const response = await fetchService.post("/auth/login", data);
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
            className="flex justify-center items-center gap-x-3 w-full rounded-md px-4 py-2 text-sm font-semibold text-gray-700 dark:text-white border border-gray-300 dark:border-white/9 bg-white dark:bg-white/2 hover:bg-gray-50 dark:hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <GoogleIcon size={16} />
            <span>Sign in with Google</span>
          </button>

          <div className="relative w-full text-base text-gray-900/80 dark:text-white/80 my-4 text-center before:bg-gray-300 dark:before:bg-gray-700 before:w-full before:h-0.5 before:block before:absolute before:top-3">
            <span className="bg-gray-300 dark:bg-gray-700 w-fit relative z-2 px-2 py-0.5 rounded">
              Or Login with email
            </span>
          </div>

          <LoginForm defaultValues={loginFormData} onSubmit={mutation.mutate} isLoading={loading} />
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
