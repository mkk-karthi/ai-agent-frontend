import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchService } from "../../lib/fetchService";
import type { Tool, Agent } from "../../types/type";
import MetaHead from "../../components/common/MetaHead";
import UserToolCard from "../../components/user/tools/UserToolCard";
import AgentExecutionDialog from "../../components/user/tools/AgentExecutionDialog";
import { Search, Wrench } from "lucide-react";

export default function UserTools(): React.ReactElement {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeAgent, setActiveAgent] = useState<Agent | null>(null);
  const [executionDialogOpen, setExecutionDialogOpen] = useState(false);

  // Fetch active Tools (includes their active agents)
  const {
    data: toolsData,
    isLoading: isToolsLoading,
    isError: isToolsError,
  } = useQuery({
    queryKey: ["user", "tools"],
    queryFn: async (): Promise<Tool[]> => {
      const res = await fetchService.get<Tool[]>("/tool");
      if (res.code === 200 && res.data) {
        return res.data;
      }
      throw new Error(res.message || "Failed to fetch tools");
    },
  });

  const tools = toolsData || [];

  // Filter tools and agents by search query
  const filteredToolsWithAgents = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) {
      return tools.map((tool) => ({
        tool,
        agents: tool.agents || [],
      }));
    }

    return tools
      .map((tool) => {
        const toolMatches = tool.name.toLowerCase().includes(q);
        const matchingAgents = (tool.agents || []).filter(
          (agent) =>
            toolMatches ||
            agent.name.toLowerCase().includes(q) ||
            (agent.description && agent.description.toLowerCase().includes(q)),
        );

        if (toolMatches || matchingAgents.length > 0) {
          return {
            tool,
            agents: toolMatches ? tool.agents || [] : matchingAgents,
          };
        }
        return null;
      })
      .filter((item): item is { tool: Tool; agents: Agent[] } => item !== null);
  }, [tools, searchQuery]);

  const handleUseAgent = (agent: Agent) => {
    setActiveAgent(agent);
    setExecutionDialogOpen(true);
  };

  return (
    <>
      <MetaHead
        title="AI Tools & Agents"
        description="Browse interactive AI tools and run specialized agents tailored to your workflow."
      />

      <div className="h-[calc(100dvh-2rem)] overflow-y-auto px-4 md:px-8 py-12">
        <div className="mx-auto max-w-6xl space-y-6">
          {/* Top Separate Card: Page Title, Description, and Search */}
          <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-800/40 p-6 shadow-xs">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                AI Tools & Agents
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Select an AI tool, explore its specialized agents, and run customized workflows.
              </p>
            </div>

            {/* Search Input Bar in Top Card */}
            <div className="mt-5">
              <div className="relative flex items-center">
                <Search className="pointer-events-none absolute left-3.5 size-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tools or agents..."
                  className="w-full rounded-xl border border-gray-200 dark:border-white/10 pl-10 pr-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-900/60 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Next Tool Cards: Title, Right Status, Agents Displayed Inside Tool Card */}
          {isToolsLoading ? (
            <div className="space-y-6">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-64 rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/5 animate-pulse"
                />
              ))}
            </div>
          ) : isToolsError ? (
            <div className="rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 p-6 text-center text-sm text-red-600 dark:text-red-400">
              Failed to load tools. Please try again.
            </div>
          ) : tools.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 dark:border-white/10 p-12 text-center bg-white dark:bg-gray-800/40">
              <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40">
                <Wrench className="size-6" />
              </div>
              <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                No active tools are available right now.
              </p>
            </div>
          ) : filteredToolsWithAgents.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 dark:border-white/10 p-12 text-center bg-white dark:bg-gray-800/40">
              <Wrench className="mx-auto size-10 text-gray-400" />
              <h3 className="mt-3 text-base font-semibold text-gray-900 dark:text-white">
                No matching tools or agents
              </h3>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                No tools or agents match "{searchQuery}". Try a different search term.
              </p>
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 cursor-pointer"
              >
                Clear Search
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredToolsWithAgents.map(({ tool, agents }) => (
                <UserToolCard
                  key={tool.id}
                  tool={tool}
                  agents={agents}
                  onUseAgent={handleUseAgent}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Execution Dialog */}
      <AgentExecutionDialog
        isOpen={executionDialogOpen}
        onClose={() => {
          setExecutionDialogOpen(false);
          setActiveAgent(null);
        }}
        agent={activeAgent}
      />
    </>
  );
}
