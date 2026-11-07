import type { Agent } from "../../../types/type";
import { Edit2, Trash2, Bot } from "lucide-react";
import { getStaticAssetUrl } from "../../../common";

interface AgentCardProps {
  agent: Agent;
  onEdit: (agent: Agent) => void;
  onDelete: (agent: Agent) => void;
  onToggleStatus: (agent: Agent) => void;
  isToggling?: boolean;
}

export default function AgentCard({
  agent,
  onEdit,
  onDelete,
  onToggleStatus,
  isToggling,
}: AgentCardProps) {
  const isActive = agent.status === "ACTIVE";

  return (
    <div className="group relative flex flex-col justify-between rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-800/40 p-5 shadow-sm transition-all duration-200 hover:border-gray-300 dark:hover:border-white/20 hover:shadow-md">
      <div>
        <div className="flex items-center gap-3">
          {agent.thumbnailImage ? (
            <img
              src={getStaticAssetUrl(agent.thumbnailImage)}
              alt={agent.name}
              className="size-12 shrink-0 rounded-xl object-cover border border-gray-200 dark:border-white/10"
            />
          ) : (
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <Bot className="size-6" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h3
              title={agent.name}
              className="line-clamp-2 text-base font-semibold text-gray-900 dark:text-white"
            >
              {agent.name}
            </h3>
          </div>
        </div>

        {agent.description && (
          <p
            title={agent.description}
            className="mt-3 line-clamp-3 text-sm text-gray-600 dark:text-gray-400 leading-relaxed"
          >
            {agent.description}
          </p>
        )}
      </div>

      <div className="mt-4 flex items-center justify-end gap-1.5 border-t border-gray-100 dark:border-white/5 pt-3">
        {/* Status Toggle Switch near edit icon */}
        <button
          type="button"
          role="switch"
          aria-checked={isActive}
          disabled={isToggling}
          onClick={() => onToggleStatus(agent)}
          title={isActive ? "Deactivate Agent" : "Activate Agent"}
          className={`relative inline-flex h-4 w-8 shrink-0 cursor-pointer rounded-full outline-2 transition-colors duration-200 ease-in-out mr-1 ${
            isActive
              ? "outline-indigo-600 bg-indigo-600"
              : "outline-gray-300 dark:outline-gray-700 bg-gray-300 dark:bg-gray-700"
          }`}
        >
          <span
            className={`pointer-events-none inline-block size-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
              isActive ? "translate-x-4" : "translate-x-0"
            }`}
          />
        </button>

        <button
          type="button"
          title="Edit Agent"
          onClick={() => onEdit(agent)}
          className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-indigo-600 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-indigo-400 transition-colors cursor-pointer"
        >
          <Edit2 className="size-4" />
        </button>
        <button
          type="button"
          title="Delete Agent"
          onClick={() => onDelete(agent)}
          className="rounded-lg p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-950/30 dark:hover:text-red-400 transition-colors cursor-pointer"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
    </div>
  );
}
