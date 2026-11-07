import type { Tool, Agent } from "../../../types/type";
import { Edit2, Trash2, Plus, Wrench, Bot } from "lucide-react";
import AgentCard from "./AgentCard";

interface ToolCardProps {
  tool: Tool;
  agents: Agent[];
  onEditTool: (tool: Tool) => void;
  onDeleteTool: (tool: Tool) => void;
  onToggleToolStatus: (tool: Tool) => void;
  isTogglingTool?: boolean;
  onCreateAgent: (tool: Tool) => void;
  onEditAgent: (agent: Agent) => void;
  onDeleteAgent: (agent: Agent) => void;
  onToggleAgentStatus: (agent: Agent) => void;
  isTogglingAgent?: boolean;
}

export default function ToolCard({
  tool,
  agents,
  onEditTool,
  onDeleteTool,
  onToggleToolStatus,
  isTogglingTool,
  onCreateAgent,
  onEditAgent,
  onDeleteAgent,
  onToggleAgentStatus,
  isTogglingAgent,
}: ToolCardProps) {
  const isActive = tool.status === "ACTIVE";

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-800/40 p-6 shadow-xs transition-all">
      {/* Tool Header: Title on Left, Status + Toggle + Actions on Right */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40 shadow-xs">
            <Wrench className="size-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                {tool.name}
              </h2>
              <span className="rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 px-2.5 py-0.5 text-xs font-semibold">
                {agents.length} {agents.length === 1 ? "Agent" : "Agents"}
              </span>
            </div>
          </div>
        </div>

        {/* Right Status, Toggle, and Admin Actions */}
        <div className="flex items-center flex-wrap gap-2.5 sm:gap-3">
          {/* Status Badge */}
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
              isActive
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50"
                : "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border-rose-200 dark:border-rose-800/50"
            }`}
          >
            {tool.status}
          </span>

          {/* Toggle Switch */}
          <button
            type="button"
            role="switch"
            aria-checked={isActive}
            disabled={isTogglingTool}
            onClick={() => onToggleToolStatus(tool)}
            title={isActive ? "Deactivate Tool" : "Activate Tool"}
            className={`relative inline-flex h-5.5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              isActive ? "bg-indigo-600" : "bg-gray-300 dark:bg-gray-700"
            }`}
          >
            <span
              className={`pointer-events-none inline-block size-4.5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                isActive ? "translate-x-4.5" : "translate-x-0"
              }`}
            />
          </button>

          {/* New Agent Button */}
          <button
            type="button"
            onClick={() => onCreateAgent(tool)}
            className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="size-3.5" />
            <span>New Agent</span>
          </button>

          {/* Edit Tool */}
          <button
            type="button"
            title="Edit Tool"
            onClick={() => onEditTool(tool)}
            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-indigo-600 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-indigo-400 transition-colors cursor-pointer"
          >
            <Edit2 className="size-4" />
          </button>

          {/* Delete Tool */}
          <button
            type="button"
            title="Delete Tool"
            onClick={() => onDeleteTool(tool)}
            className="rounded-lg p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-950/30 dark:hover:text-red-400 transition-colors cursor-pointer"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>

      {/* Body: Agents Cards Displayed Inside Tool Card */}
      <div className="mt-5 pt-5 border-t border-gray-100 dark:border-white/5">
        {agents.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 dark:border-white/10 p-8 text-center bg-gray-50/50 dark:bg-white/2">
            <Bot className="mx-auto size-8 text-gray-400 dark:text-gray-500" />
            <h4 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">
              No agents configured in "{tool.name}"
            </h4>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              Create an agent to enable customized workflows for this tool.
            </p>
            <button
              type="button"
              onClick={() => onCreateAgent(tool)}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 transition-all cursor-pointer"
            >
              <Plus className="size-3.5" />
              <span>Create Agent</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                onEdit={onEditAgent}
                onDelete={onDeleteAgent}
                onToggleStatus={onToggleAgentStatus}
                isToggling={isTogglingAgent}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
