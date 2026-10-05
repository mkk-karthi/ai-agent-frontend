import { X } from "lucide-react";
import Modal from "../../ui/Modal";
import { useCallback, useContext, useMemo } from "react";
import { UserContext } from "../../../context/userContext";
import { settingsList } from "../../../data";
import type { SettingsType } from "../../../types/type";

export default function SettingsModel(): React.ReactElement {
  const { isSettingsOpen, activeSettingTab, setSettingTab, setSettingsOpen } =
    useContext(UserContext);

  const closeModel = useCallback(() => setSettingsOpen(false), [isSettingsOpen]);

  const getActiveTab: SettingsType | undefined = useMemo(() => {
    return settingsList.find((v) => v.id == activeSettingTab);
  }, [activeSettingTab]);

  return (
    <>
      {/* Settings Model */}
      <Modal isOpen={isSettingsOpen} onClose={() => setSettingsOpen(false)} size="xl">
        <div className="flex flex-col md:flex-row h-[90dvh]">
          <div className="flex md:hidden sticky top-0 right-0 shrink-0 items-center justify-between border-b border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 p-4 pb-2!">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Settings</h2>

            <button
              type="button"
              onClick={() => setSettingsOpen(false)}
              className="rounded-md p-2 text-gray-700 dark:text-white border border-gray-300 dark:border-white/9 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
              aria-label="Close modal"
            >
              <X size={16} />
            </button>
          </div>
          <div className="flex flex-row md:flex-col w-full md:w-1/3 overflow-y-auto p-2 md:p-4 dark:bg-gray-800/50 border-l border-gray-800">
            {settingsList.map(({ id, name, Icon }) => (
              <div
                key={id}
                onClick={() => setSettingTab(id)}
                className={`flex justify-start items-center rounded hover:bg-gray-900/5 dark:hover:bg-white/5 cursor-pointer whitespace-nowrap overflow-hidden px-2 py-1 my-1 ${activeSettingTab == id && "bg-gray-900/5 dark:bg-white/5"}`}
              >
                <Icon className="size-4" />
                <span className="ml-2">{name}</span>
              </div>
            ))}
          </div>
          <div className="w-full md:w-2/3">
            <div className="hidden md:flex sticky top-0 right-0 shrink-0 items-center justify-between border-b border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 p-4 pb-2!">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {getActiveTab?.name}
              </h2>

              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="rounded-md p-2 text-gray-700 dark:text-white border border-gray-300 dark:border-white/9 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-2  overflow-y-auto max-h-[76dvh] md:max-h-[80dvh]">
              {getActiveTab && <getActiveTab.Component onClose={closeModel} />}
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
