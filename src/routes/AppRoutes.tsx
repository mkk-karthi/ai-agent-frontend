import {
  createBrowserRouter,
  isRouteErrorResponse,
  Navigate,
  redirect,
  RouterProvider,
  useRouteError,
  type MiddlewareFunction,
  type RouteObject,
} from "react-router-dom";
import Home from "../page/user/Home";
import Privacy from "../page/user/privacy";
import Dashboard from "../page/admin/Dashboard";
import Providers from "../page/admin/Providers";
import AdminLayout from "../layouts/admin/AdminLayout";
import User from "../page/admin/User";
import Layout from "../layouts/user/Layout";
import Login from "../page/auth/Login";
import SignUp from "../page/auth/SignUp";
import ResetPassword from "../page/auth/ResetPassword";
import EmailVerification from "../page/auth/EmailVerification";
import { useUserStore } from "../stores/UserStore";
import { queryClient } from "../lib/queryClient";

const authRedirectMiddleware: MiddlewareFunction = ({}, next) => {
  const { user } = useUserStore.getState();
  if (user && user.id) {
    return redirect("/new");
  }
  return next();
};

const authMiddleware: MiddlewareFunction = ({}, next) => {
  const { user } = useUserStore.getState();

  if (!user || !user.id) {
    queryClient.clear();
    return redirect("/auth/login");
  }
  return next();
};

const authAdminMiddleware: MiddlewareFunction = ({}, next) => {
  const { user } = useUserStore.getState();

  if (user && user.id) {
    if (user.roleId == 1) {
      return next();
    }
    return redirect("/new");
  }
  queryClient.clear();
  return redirect("/auth/login");
};

function CustomErrorPage() {
  const error = useRouteError();
  let errorMessage: string;

  if (isRouteErrorResponse(error)) {
    // error is narrowed to ErrorResponse type
    errorMessage = error.statusText || error.data?.message || "Unknown router error";
  } else if (error instanceof Error) {
    // standard JS/TS error object
    errorMessage = error.message;
  } else if (typeof error === "string") {
    errorMessage = error;
  } else {
    console.error(error);
    errorMessage = "An unknown error occurred.";
  }

  return (
    <div className="flex flex-col w-full h-dvh items-center justify-center">
      <h1 className="text-6xl font-bold my-2">Oops!</h1>
      <p className="text-xl">Unexpected error occurred.</p>
      <p className="text-base">{errorMessage}</p>
    </div>
  );
}

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Layout />,
    errorElement: <CustomErrorPage />,
    children: [
      {
        path: "/:id",
        index: true,
        element: <Home />,
        middleware: [authMiddleware],
      },
      {
        path: "",
        element: <Navigate to="/new" replace />,
      },
    ],
  },
  {
    path: "/auth",
    middleware: [authRedirectMiddleware],
    errorElement: <CustomErrorPage />,
    children: [
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "signUp",
        element: <SignUp />,
      },
      {
        path: "reset",
        element: <ResetPassword />,
      },
      {
        path: "verify-email/:id",
        element: <EmailVerification />,
      },
    ],
  },
  {
    path: "privacy",
    element: <Privacy />,
  },
  {
    path: "*",
    element: <Navigate to="/new" replace />,
  },
  {
    path: "admin",
    element: <AdminLayout />,
    middleware: [authAdminMiddleware],
    errorElement: <CustomErrorPage />,
    children: [
      {
        path: "",
        element: <Navigate to="/admin/dashboard" replace />,
      },
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "user",
        element: <User />,
      },
      {
        path: "providers",
        element: <Providers />,
      },
    ],
  },
];

const router = createBrowserRouter(routes);

export default function AppRoutes(): React.ReactElement {
  return <RouterProvider router={router} />;
}
