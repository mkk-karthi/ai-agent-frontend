import type { Tool, Agent } from "../../../types/type";
import { Wrench, Bot } from "lucide-react";
import UserAgentCard from "./UserAgentCard";

interface UserToolCardProps {
  tool: Tool;
  agents: Agent[];
  onUseAgent: (agent: Agent) => void;
}

export default function UserToolCard({ tool, agents, onUseAgent }: UserToolCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-800/40 p-6 shadow-xs transition-all">
      {/* Tool Header: Clean Title on Left, No tool status or total count */}
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40 shadow-xs">
          <Wrench className="size-5" />
        </div>
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate">{tool.name}</h2>
        </div>
      </div>

      {/* Body: Agents Cards Displayed Inside Tool Card */}
      <div className="mt-5 pt-5 border-t border-gray-100 dark:border-white/5">
        {agents.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 dark:border-white/10 p-6 text-center bg-gray-50/50 dark:bg-white/2">
            <Bot className="mx-auto size-7 text-gray-400" />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              No active agents currently available for "{tool.name}".
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map((agent) => (
              <UserAgentCard key={agent.id} agent={agent} onUse={onUseAgent} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
