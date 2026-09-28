import { Link, useNavigate } from "react-router-dom";
import type { RegisterInput } from "../../schemas/authSchema";
import RegisterForm from "../../components/auth/RegisterForm";
import GoogleIcon from "../../components/ui/GoogleIcon";
import { useMutation } from "@tanstack/react-query";
import { fetchService } from "../../services/fetchService";
import { useState } from "react";
import type { apiResponse } from "../../types/type";
import { toast } from "react-toastify";

export default function SignUp(): React.ReactElement {
  const registerFormData: RegisterInput = {
    email: "",
    password: "",
    confirmPassword: "",
  };
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const mutation = useMutation({
    mutationFn: async (data: RegisterInput) => {
      setLoading(true);
      const response = await fetchService.post("/auth/register", data);
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
            className="flex justify-center items-center gap-x-3 w-full rounded-md px-4 py-2 text-sm font-semibold text-gray-700 dark:text-white border border-gray-300 dark:border-white/9 bg-white dark:bg-white/2 hover:bg-gray-50 dark:hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <GoogleIcon size={16} />
            <span>Sign up with Google</span>
          </button>

          <div className="relative w-full text-base text-gray-900/80 dark:text-white/80 my-4 text-center before:bg-gray-300 dark:before:bg-gray-700 before:w-full before:h-0.5 before:block before:absolute before:top-3">
            <span className="bg-gray-300 dark:bg-gray-700 w-fit relative z-2 px-2 py-0.5 rounded">
              Or Login with email
            </span>
          </div>

          <RegisterForm
            defaultValues={registerFormData}
            onSubmit={mutation.mutate}
            isLoading={loading}
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
