import AppRoutes from "./routes/AppRoutes";
import { QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import { queryClient } from "./lib/queryClient";

function App() {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <ToastContainer position="top-right" autoClose={5000} theme="dark" />
        <AppRoutes />
      </QueryClientProvider>
    </>
  );
}

export default App;
