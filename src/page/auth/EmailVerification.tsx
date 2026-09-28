import { useMutation } from "@tanstack/react-query";
import { BadgeCheck, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { fetchService } from "../../services/fetchService";
import type { apiResponse } from "../../types/type";

export default function EmailVerification() {
  const params = useParams();
  console.log("id", params.id);
  const [loading, setLoading] = useState(true);
  const [isError, setError] = useState(false);

  const navigate = useNavigate();
  const mutation = useMutation({
    mutationFn: async () => {
      setLoading(true);
      const response = await fetchService.post(`/auth/verify-mail/${params.id}`, {});
      return response;
    },
    onSuccess: (data: apiResponse<null>) => {
      setLoading(false);
      if (data.success) {
        toast.success(data.message);

        navigate("/auth/login", { viewTransition: true });
      } else {
        setError(true);
        toast.error(data.message);
      }
    },
    onError: (error) => {
      setLoading(false);
      setError(true);
      toast.error(error.message);
    },
  });

  useEffect(() => {
    mutation.mutate();
  }, []);

  return (
    <div className="flex w-full h-dvh justify-center items-center">
      <div className="flex flex-col gap-3 justify-center items-center bg-gray-800 rounded border border-gary-700 shadow-2xl shadow-gray-800 p-4 h-1/2 w-10/12 lg:w-1/3">
        {loading ? (
          <Loader2 size={54} className="text-blue-500 animate-spin" />
        ) : (
          <BadgeCheck size={54} className="text-blue-500" />
        )}
        <p className="text-2xl font-bold">{loading ? "Loading..." : "Verified"}</p>
        {!loading && (
          <Link
            to="/auth/login"
            viewTransition
            type="button"
            className="rounded-md px-4 py-2 text-sm font-semibold bg-indigo-500 text-white! hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 cursor-pointer"
          >
            {isError ? "Try Again" : "Back to Login"}
          </Link>
        )}
      </div>
    </div>
  );
}
