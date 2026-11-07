import type { Agent } from "../../../types/type";
import { Bot, ArrowRight } from "lucide-react";
import { getStaticAssetUrl } from "../../../common";

interface UserAgentCardProps {
  agent: Agent;
  onUse: (agent: Agent) => void;
}

export default function UserAgentCard({ agent, onUse }: UserAgentCardProps) {
  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-800/40 p-5 shadow-xs transition-all duration-200 hover:border-indigo-300 dark:hover:border-indigo-500/40 hover:shadow-md">
      <div>
        {/* Vertically centered title with thumbnail */}
        <div className="flex items-center gap-3.5">
          {agent.thumbnailImage ? (
            <img
              src={getStaticAssetUrl(agent.thumbnailImage)}
              alt={agent.name}
              className="size-14 shrink-0 rounded-2xl object-cover border border-gray-200 dark:border-white/10 shadow-xs"
            />
          ) : (
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40 shadow-xs">
              <Bot className="size-7" />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h3
              title={agent.name}
              className="text-base font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors"
            >
              {agent.name}
            </h3>
          </div>
        </div>

        {/* Description: 3 lines with tooltip */}
        <p
          title={agent.description || "No description provided."}
          className="mt-3.5 text-sm text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed"
        >
          {agent.description || "No description provided for this agent."}
        </p>
      </div>

      {/* Footer without input counts */}
      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-white/5 flex items-center justify-end">
        <button
          type="button"
          onClick={() => onUse(agent)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 active:scale-95 transition-all cursor-pointer"
        >
          <span>{agent.status === "ACTIVE" ? "Use" : "Test"} Agent</span>
          <ArrowRight className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
