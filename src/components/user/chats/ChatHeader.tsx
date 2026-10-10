import { CircleChevronDown, Share } from "lucide-react";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useOutsideClick } from "../../../hooks/useOutsideClick";
import { useQuery } from "@tanstack/react-query";
import { fetchService } from "../../../services/fetchService";
import { UserContext } from "../../../context/userContext";

interface ModelsType {
  id: string;
  name: string;
  status: string;
  models?: Array<{ id: string; modelName: string; status: string }>;
}
export default function ChatHeader({
  chatId,
  modelId,
  setModelId,
}: {
  chatId: string;
  modelId: string;
  setModelId: (v: string) => void;
}) {
  const { setSettingTab, setSettingsOpen } = useContext(UserContext);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["models"],
    queryFn: async (): Promise<ModelsType[]> => {
      const data = await fetchService.get("/provider/model");
      return data.data ?? [];
    },
  });

  const [modelsOpen, setModelsOpen] = useState(false);
  const modelsMenuRef = useRef<HTMLUListElement>(null);

  useOutsideClick(modelsMenuRef, () => setModelsOpen(false), modelsOpen);

  useEffect(() => {
    const selectModel: ModelsType | undefined = data?.find((v) => {
      v.models = v.models?.filter((v1) => v1.status === "ACTIVE");
      return v.status === "ACTIVE" && v.models && v.models?.length > 0 ? v : false;
    });

    if (selectModel && selectModel.models && selectModel.models.length > 0 && chatId == "new") {
      setModelId(selectModel.models[0].id);
    }
  }, [data, chatId]);

  const modelName: string = useMemo(() => {
    const models = structuredClone(data);

    const selectedModel: ModelsType | undefined = models?.find((v) => {
      v.models = v.models?.filter((v1) => v1.id === modelId);
      return v.models && v.models?.length > 0 ? v : false;
    });
    return selectedModel?.models?.[0]?.modelName ?? "-";
  }, [modelId, data]);

  return (
    <div className="absolute top-0 left-12 lg:left-0 w-[calc(100%-56px)] lg:w-full min-h-14 flex justify-between p-4 z-2">
      <div className="group/menu">
        <div
          className="flex items-center justify-between gap-x-2 cursor-pointer rounded-xl bg-white dark:bg-gray-950 p-2 min-w-46"
          onClick={() => setModelsOpen((v) => !v)}
        >
          <div className="px-2 max-w-36 text-nowrap overflow-hidden text-ellipsis">{modelName}</div>
          <CircleChevronDown
            className={`size-4 block ${modelsOpen && "rotate-180"} transition-[rotate] duration-300`}
          />
        </div>

        {!isError && (
          <ul
            ref={modelsMenuRef}
            className={`absolute left-6 lg:left-2 top-12 min-w-42 ${modelsOpen ? "block pointer-events-auto" : "hidden pointer-events-none"} transition-all duration-300 mt-2 w-auto rounded-md shadow-lg border border-gray-400 dark:border-gray-700 bg-white dark:bg-gray-900 z-10 max-h-72 overflow-y-auto`}
          >
            {isLoading
              ? "Loading"
              : data?.map((item) => (
                  <div key={item.id}>
                    <li
                      className={`w-full px-4 py-2 transition relative group/child text-gray-800/60 dark:text-white/60 font-semibold text-left text-sm text-nowrap cursor-pointer pointer-events-none`}
                    >
                      {item.name}
                    </li>

                    {item.models?.map((modelData) => (
                      <li
                        key={modelData.id}
                        className={`w-full pl-6 pr-4 py-2 transition relative group/child ${item.status === "ACTIVE" && modelData.status === "ACTIVE" ? "text-gray-800 dark:text-white hover:bg-gray-900/10 dark:hover:bg-gray-700/50 pointer-events-auto" : "text-gray-800/50 dark:text-white/50 text-base pointer-events-none"} text-left text-sm text-nowrap cursor-pointer ${modelId == modelData.id && "bg-gray-900/10 dark:bg-gray-700/50"}`}
                        onClick={() => (setModelId(modelData.id), setModelsOpen(false))}
                      >
                        {modelData.modelName}
                      </li>
                    ))}
                  </div>
                ))}
            <li
              className={`w-full px-4 py-2 transition relative group/child text-gray-800 dark:text-white font-semibold text-left text-sm text-nowrap cursor-pointer`}
              onClick={() => (setSettingTab("tokens"), setSettingsOpen(true), setModelsOpen(false))}
            >
              Add Token
            </li>
          </ul>
        )}
      </div>
      {chatId == "new" ? (
        ""
      ) : (
        <div className="flex items-center px-2.5 py-2 size-9.5 lg:size-auto bg-white dark:bg-gray-900 border border-gray-400 dark:border-gray-700 rounded-full shadow-[0_0_5px_3px] shadow-gray-600/30 cursor-pointer">
          <Share className="size-4 cursor-pointer" />
          <span className="ml-2 hidden lg:block text-balance">Share</span>
        </div>
      )}
    </div>
  );
}
