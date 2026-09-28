import { Outlet } from "react-router-dom";
import { useCallback, useState } from "react";
import NavBar from "./NavBar";
import Footer from "../Footer";
import Header from "./Header";

export default function AdminLayout() {
  const [isMenuOpen, setMenuOpen] = useState(false);

  const handleMenuOpen = useCallback(
    (val: boolean) => {
      setMenuOpen(val);
    },
    [setMenuOpen],
  );

  return (
    <div className="flex relative bg-white dark:bg-gray-950">
      {/* Sidebar */}
      <NavBar menuOpen={isMenuOpen} onMenuOpen={handleMenuOpen} />

      <div className="w-full">
        {/* header */}
        <Header onMenuOpen={handleMenuOpen} />

        {/* main */}
        <main>
          <div className={`py-4 px-4 lg:px-8 overflow-auto h-[calc(100dvh-7rem)]`}>
            <Outlet />
          </div>
        </main>

        {/* footer */}
        <Footer />
      </div>
    </div>
  );
}
