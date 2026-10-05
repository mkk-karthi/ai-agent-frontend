import { Outlet } from "react-router-dom";
import Footer from "../Footer";
import NavBar from "./NavBar";
import Header from "./Header";
import SettingsModel from "../../components/user/settings/SettingsModel";
import SearchModel from "../../components/user/SearchModel";
import { UserProvider } from "../../context/userContext";
import ConversationOptions from "../../components/user/chats/ConversationOptions";
import { ConversationProvider } from "../../context/conversationContext";
import { useAppStore } from "../../stores/AppStore";

export default function Layout() {
  const isNavOpen = useAppStore((state) => state.navBarOpen);

  return (
    <div className="flex relative bg-white dark:bg-gray-950 max-w-dvw">
      <UserProvider>
        <ConversationProvider>
          {/* Sidebar */}
          <NavBar />
          <ConversationOptions />
          <div className={`transition-all duration-300 w-dvw ${isNavOpen && "lg:w-[80dvw]"}`}>
            {/* header */}
            <Header />

            {/* Settings Model */}
            <SettingsModel />

            {/* Search Model */}
            <SearchModel />

            {/* main */}
            <main className={`relative overflow-hidden size-full`}>
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
