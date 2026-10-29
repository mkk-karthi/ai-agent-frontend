import { Outlet } from "react-router-dom";
import Footer from "../Footer";
import NavBar from "./NavBar";
import Header from "./Header";
import SettingsModel from "../../components/user/settings/SettingsModel";
import SearchModel from "../../components/user/SearchModel";
import { UserProvider } from "../../context/userContext";
import { ConversationProvider } from "../../context/conversationContext";
import { useAppStore } from "../../stores/AppStore";
import { useEffect } from "react";

export default function Layout() {
  const isNavOpen = useAppStore((state) => state.navBarOpen);

  useEffect(() => {
    const badges = document.querySelectorAll<HTMLElement>(".grecaptcha-badge");
    badges.forEach((b) => {
      b.style.visibility = "hidden";
      b.style.pointerEvents = "none";
    });
  }, []);

  return (
    <div className="flex relative bg-white dark:bg-gray-950 max-w-dvw">
      <UserProvider>
        <ConversationProvider>
          {/* Sidebar */}
          <NavBar />
          <div className={`transition-all duration-300 w-dvw ${isNavOpen ? "md:w-[calc(100dvw-18rem)] lg:w-[80dvw]" : "md:w-[calc(100dvw-3rem)]"}`}>
            {/* header */}
            <Header />

            {/* Settings Model */}
            <SettingsModel />

            {/* Search Model */}
            <SearchModel />

            {/* main */}
            <main className={`relative overflow-hidden size-full h-dvh`}>
              <Outlet />
            </main>

            {/* footer */}
            <Footer />
          </div>
        </ConversationProvider>
      </UserProvider>
    </div>
  );
}
