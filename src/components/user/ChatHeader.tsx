import { CircleChevronDown, Share } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useOutsideClick } from "../../hooks/useOutsideClick";

interface ModelsType {
  id: string;
  name: string;
  active: boolean;
  Series?: Array<ModelsType>;
}
export default function ChatHeader({ id }: { id: string }) {
  const models: ModelsType[] = [
    {
      id: "gemini",
      name: "Gemini",
      active: true,
      Series: [
        {
          id: "3.8",
          name: "Gemini 3.8 Flash",
          active: true,
        },
        {
          id: "3.7",
          name: "Gemini 3.7 Flash",
          active: true,
        },
        {
          id: "3.6",
          name: "Gemini 3.6 Flash",
          active: true,
        },
        {
          id: "3.1",
          name: "Gemini 3.1 Pro",
          active: false,
        },
      ],
    },
    {
      id: "gpt",
      name: "GPT",
      active: true,
      Series: [
        {
          id: "6.astra",
          name: "GPT-6 Astra",
          active: true,
        },
        {
          id: "5.6",
          name: "GPT-5.6",
          active: true,
        },
      ],
    },
    {
      id: "claude",
      name: "Claude",
      active: false,
      Series: [
        {
          id: "fable-5.1",
          name: "Fable 5.1",
          active: true,
        },
        {
          id: "opus-5",
          name: "Opus 5",
          active: true,
        },
        {
          id: "sonnet-5",
          name: "Sonnet 5",
          active: true,
        },
        {
          id: "haiku-5",
          name: "Haiku 5",
          active: true,
        },
      ],
    },
  ];

  const [modelsOpen, setModelsOpen] = useState(false);
  const [model, setModel] = useState<ModelsType["id"] | null>(null);
  const modelsMenuRef = useRef<HTMLUListElement>(null);

  useOutsideClick(modelsMenuRef, () => setModelsOpen(false), modelsOpen);

  useEffect(() => {
    const selectModel: ModelsType | undefined = models.find((v) => {
      v.Series = v.Series?.filter((v1) => v1.active);
      return v.Series && v.Series?.length > 0 ? v : false;
    });

    if (selectModel && selectModel.Series && selectModel.Series.length > 0) {
      setModel(selectModel.Series[0].id);
    }
  }, []);

  const modelName: string = useMemo(() => {
    const selectedModel: ModelsType | undefined = models.find((v) => {
      v.Series = v.Series?.filter((v1) => v1.id === model);
      return v.Series && v.Series?.length > 0 ? v : false;
    });
    return selectedModel?.Series?.[0]?.name ?? "";
  }, [model]);

  return (
    <div className="absolute top-0 left-12 lg:left-0 w-full min-h-14 flex justify-between p-4 z-2">
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
        <ul
          ref={modelsMenuRef}
          className={`absolute left-6 lg:left-2 top-12 min-w-42 ${modelsOpen ? "block pointer-events-auto" : "hidden pointer-events-none"} transition-all duration-300 mt-2 w-auto rounded-md shadow-lg border border-gray-400 dark:border-gray-700 bg-white dark:bg-gray-900 z-10 max-h-72 overflow-y-auto`}
        >
          {models.map((item) => (
            <div key={item.id}>
              <li
                className={`w-full px-4 py-2 transition relative group/child text-gray-800/60 dark:text-white/60 font-semibold text-left text-sm text-nowrap cursor-pointer pointer-events-none`}
              >
                {item.name}
              </li>

              {item.Series?.map((series) => (
                <li
                  key={series.id}
                  className={`w-full pl-6 pr-4 py-2 transition relative group/child ${item.active && series.active ? "text-gray-800 dark:text-white hover:bg-gray-900/10 dark:hover:bg-gray-700/50 pointer-events-auto" : "text-gray-800/50 dark:text-white/50 text-base pointer-events-none"} text-left text-sm text-nowrap cursor-pointer ${model == series.id && "bg-gray-900/10 dark:bg-gray-700/50"}`}
                  onClick={() => (setModel(series.id), setModelsOpen(false))}
                >
                  {series.name}
                </li>
              ))}
            </div>
          ))}
        </ul>
      </div>
      {id == "new" ? (
        ""
      ) : (
        <div className="flex items-center px-2.5 py-2 size-9.5 sm:size-auto bg-white dark:bg-gray-900 border border-gray-400 dark:border-gray-700 rounded-full shadow-[0_0_5px_3px] shadow-gray-600/30 cursor-pointer">
          <Share className="size-4 cursor-pointer" />
          <span className="ml-2 hidden sm:block text-balance">Share</span>
        </div>
      )}
    </div>
  );
}
