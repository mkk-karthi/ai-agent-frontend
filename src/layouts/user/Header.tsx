import { SquareChevronRight } from "lucide-react";
import { useAppStore } from "../../stores/AppStore";

export default function Header() {
  const setNavBarOpen = useAppStore((state) => state.setNavBarOpen);

  return (
    <div className="fixed top-0 left-0 w-full min-h-14 z-2">
      <div className="flex justify-between lg:justify-end items-center p-4 w-full bg-linear-to-t from-transparent via-white/80 to-white dark:via-gray-950/80 dark:to-gray-950 min-h-14">
        <div
          className="block lg:hidden p-2.5 bg-white dark:bg-gray-900 border border-gray-400 dark:border-gray-700 rounded-full shadow-[0_0_5px_3px] shadow-gray-400/30 dark:shadow-gray-700/30 cursor-pointer"
          onClick={() => setNavBarOpen(true)}
        >
          <SquareChevronRight className="size-4.5 cursor-pointer" />
        </div>
      </div>
    </div>
  );
}
