import { Outlet } from "react-router-dom";
import NavBar from "./NavBar";
import Footer from "../Footer";
import Header from "./Header";

export default function AdminLayout() {
  return (
    <div className="flex relative bg-white dark:bg-gray-950">
      {/* Sidebar */}
      <NavBar />

      <div className="w-full">
        {/* header */}
        <Header />

        {/* main */}
        <main className={`relative overflow-hidden size-full`}>
          <div className={`py-4 px-4 lg:px-8 overflow-auto h-[calc(100dvh-6rem)]`}>
            <Outlet />
          </div>
        </main>

        {/* footer */}
        <Footer />
      </div>
    </div>
  );
}
