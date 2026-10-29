import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useUserStore, type userStore } from "../../stores/UserStore";
import { useAppStore } from "../../stores/AppStore";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import { toast } from "react-toastify";
import { queryClient } from "../../lib/queryClient";
import { fetchService } from "../../lib/fetchService";
import MetaHead from "../../components/common/MetaHead";

export default function GoogleCallback(): React.ReactElement {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser, setAccessToken } = useUserStore();
  const setNavBarOpen = useAppStore((s) => s.setNavBarOpen);
  const breakpoint = useBreakpoint();
  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) return;

    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (error || !token) {
      processedRef.current = true;
      toast.error("Google sign-in failed. Please try again.", { toastId: "google-login-error" });
      navigate("/auth/login", { replace: true });
      return;
    }

    processedRef.current = true;

    const completeAuth = async () => {
      try {
        setAccessToken(token);

        // Fetch auth user profile securely via backend API
        const res = await fetchService.get<userStore["user"]>("/auth/user", {
          Authorization: `Bearer ${token}`,
        });

        if (!res.success || !res.data) {
          throw new Error(res.message || "Failed to fetch user");
        }

        const user = res.data;
        setUser(user);

        if (!["xs", "sm"].includes(breakpoint)) setNavBarOpen(true);

        queryClient.invalidateQueries({ queryKey: ["coversations"] });

        toast.success("Signed in with Google!", { toastId: "google-login-success" });
        if (user.roleId === 1) navigate("/admin", { replace: true });
        else navigate("/new", { replace: true, viewTransition: true });
      } catch {
        toast.error("Authentication failed. Please try again.", { toastId: "google-login-error" });
        navigate("/auth/login", { replace: true });
      }
    };

    completeAuth();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="h-dvh w-full flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-950 gap-4">
      <MetaHead
        title="Signing In with Google..."
        description="Authenticating your Google account with MKK Agent."
        noIndex={true}
      />
      {/* Spinner */}
      <div className="w-12 h-12 rounded-full border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 dark:border-t-blue-400 animate-spin" />
      <p className="text-gray-700 dark:text-white/80 text-base font-medium">
        Completing Google sign-in…
      </p>
    </div>
  );
}
