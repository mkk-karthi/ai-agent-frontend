import {
  createBrowserRouter,
  Navigate,
  redirect,
  RouterProvider,
  type MiddlewareFunction,
  type RouteObject,
} from "react-router-dom";
import Home from "../page/user/Home";
import Privacy from "../page/user/privacy";
import Dashboard from "../page/admin/Dashboard";
import AdminLayout from "../layouts/admin/AdminLayout";
import User from "../page/admin/User";
import Layout from "../layouts/user/Layout";
import Tokens from "../page/admin/Tokens";
import Login from "../page/auth/Login";
import SignUp from "../page/auth/SignUp";
import ResetPassword from "../page/auth/ResetPassword";
import EmailVerification from "../page/auth/EmailVerification";
import { useUserStore } from "../stores/UserStore";

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
  return redirect("/auth/login");
};

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Layout />,
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
        path: "tokens",
        element: <Tokens />,
      },
    ],
  },
];

const router = createBrowserRouter(routes);

export default function AppRoutes(): React.ReactElement {
  return <RouterProvider router={router} />;
}
