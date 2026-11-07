import { Outlet } from "react-router-dom";
import NavBar from "./NavBar";
import Footer from "../Footer";
import Header from "./Header";
import { useEffect } from "react";

export default function AdminLayout() {
  useEffect(() => {
    const badges = document.querySelectorAll<HTMLElement>(".grecaptcha-badge");
    badges.forEach((b) => {
      b.style.visibility = "hidden";
      b.style.pointerEvents = "none";
    });
  }, []);

  return (
    <div className="flex relative bg-gray-100 dark:bg-gray-950 max-w-dvw">
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
