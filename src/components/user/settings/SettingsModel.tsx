import { X } from "lucide-react";
import Modal from "../../ui/Modal";
import { useMemo } from "react";

interface SettingsType {
  id: string;
  name: string;
  icon: React.ReactNode;
  child: React.ReactElement;
}

export default function SettingsModel({
  isModelOpen,
  setModelOpen,
  activeTab,
  setActiveTab,
  settingsList,
}: {
  isModelOpen: boolean;
  setModelOpen: (val: boolean) => void;
  activeTab: string;
  setActiveTab: (val: string) => void;
  settingsList: SettingsType[];
}): React.ReactElement {
  const getActiveTab: SettingsType | undefined = useMemo(() => {
    return settingsList.find((v) => v.id == activeTab);
  }, [activeTab]);

  return (
    <>
      {/* Settings Model */}
      <Modal isOpen={isModelOpen} onClose={() => setModelOpen(false)} size="xl">
        <div className="flex h-[90vh]">
          <div className="w-1/3 overflow-y-auto p-4 dark:bg-gray-800/50 border-l border-gray-800">
            {settingsList.map((item) => (
              <div
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex justify-start items-center rounded hover:bg-gray-900/5 dark:hover:bg-white/5 cursor-pointer whitespace-nowrap overflow-hidden px-2 py-1 my-1 ${activeTab == item.id && "bg-gray-900/5 dark:bg-white/5"}`}
              >
                {item.icon}
                <span className="ml-2">{item.name}</span>
              </div>
            ))}
          </div>
          <div className="w-2/3 overflow-y-auto">
            <div className="sticky top-0 right-0 flex shrink-0 items-center justify-between border-b border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 p-4 pb-2!">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {getActiveTab?.name}
              </h2>

              <button
                type="button"
                onClick={() => setModelOpen(false)}
                className="rounded-md p-2 text-gray-700 dark:text-white border border-gray-300 dark:border-white/9 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-2">{getActiveTab?.child}</div>
          </div>
        </div>
      </Modal>
    </>
  );
}
