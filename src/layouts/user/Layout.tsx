import { Outlet } from "react-router-dom";
import Footer from "../Footer";
import { useState } from "react";
import NavBar from "./NavBar";
import Header from "./Header";
import { useAppStore } from "../../stores/AppStore";

export default function Layout() {
  const navBarOpen: boolean = useAppStore((state) => state.navBarOpen);
  const setNavBarOpen = useAppStore((state) => state.setNavBarOpen);
  const [isMenuOpen, setMenuOpen] = useState(navBarOpen);

  const handleNavBarOpen = (val: boolean) => {
    setMenuOpen(val);
    setNavBarOpen(val);
  };

  return (
    <div className="flex relative bg-white dark:bg-gray-950">
      {/* Sidebar */}
      <NavBar menuOpen={isMenuOpen} onMenuOpen={handleNavBarOpen} />
      <div className="w-full">
        {/* header */}
        <Header onMenuOpen={setMenuOpen} />

        {/* main */}
        <main>
          <div className={`relative overflow-hidden h-[calc(100dvh-3rem)]`}>
            <Outlet />
          </div>
        </main>

        {/* footer */}
        <Footer />
      </div>
    </div>
  );
}
