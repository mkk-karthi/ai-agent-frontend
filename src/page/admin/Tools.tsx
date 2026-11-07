import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ChevronRight, Plus, Search, Wrench } from "lucide-react";
import { toast } from "react-toastify";
import { fetchService } from "../../lib/fetchService";
import { queryClient } from "../../lib/queryClient";
import type { Tool, Agent } from "../../types/type";
import MetaHead from "../../components/common/MetaHead";
import ToolCard from "../../components/admin/tools/ToolCard";
import ToolFormModal from "../../components/admin/tools/ToolFormModal";
import AgentFormModal from "../../components/admin/tools/AgentFormModal";
import type { ToolFormInput } from "../../schemas/toolSchema";

export default function Tools(): React.ReactElement {
  const [searchQuery, setSearchQuery] = useState("");
  const [toolModalOpen, setToolModalOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<Tool | null>(null);

  const [agentModalOpen, setAgentModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [selectedToolIdForNewAgent, setSelectedToolIdForNewAgent] = useState<number | undefined>(
    undefined,
  );

  // Fetch Tools (includes their agents)
  const {
    data: toolsData,
    isLoading: isToolsLoading,
    isError: isToolsError,
  } = useQuery({
    queryKey: ["admin", "tools"],
    queryFn: async (): Promise<Tool[]> => {
      const res = await fetchService.get<Tool[]>("/tool");
      if (res.code === 200 && res.data) {
        return res.data;
      }
      throw new Error(res.message || "Failed to fetch tools");
    },
  });

  const tools = toolsData || [];

  const invalidateToolsQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "tools"] });
    queryClient.invalidateQueries({ queryKey: ["user", "tools"] });
  };

  // Tool Mutations
  const createToolMutation = useMutation({
    mutationFn: async (data: ToolFormInput) => {
      return await fetchService.post("/tool", data);
    },
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message || "Tool created successfully");
        setToolModalOpen(false);
        invalidateToolsQueries();
      } else {
        toast.error(res.message || "Failed to create tool");
      }
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create tool");
    },
  });

  const updateToolMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ToolFormInput }) => {
      return await fetchService.put(`/tool/${id}`, data);
    },
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message || "Tool updated successfully");
        setToolModalOpen(false);
        setEditingTool(null);
        invalidateToolsQueries();
      } else {
        toast.error(res.message || "Failed to update tool");
      }
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update tool");
    },
  });

  const toggleToolStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: "ACTIVE" | "INACTIVE" }) => {
      return await fetchService.patch(`/tool/${id}/status`, { status });
    },
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Tool status updated");
        invalidateToolsQueries();
      } else {
        toast.error(res.message || "Failed to update status");
      }
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update status");
    },
  });

  const deleteToolMutation = useMutation({
    mutationFn: async (id: number) => {
      return await fetchService.delete(`/tool/${id}`);
    },
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Tool deleted");
        invalidateToolsQueries();
      } else {
        toast.error(res.message || "Failed to delete tool");
      }
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete tool");
    },
  });

  // Agent Mutations
  const createAgentMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return await fetchService.post("/agent", formData);
    },
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message || "Agent created successfully");
        setAgentModalOpen(false);
        invalidateToolsQueries();
      } else {
        toast.error(res.message || "Failed to create agent");
      }
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create agent");
    },
  });

  const updateAgentMutation = useMutation({
    mutationFn: async ({ id, formData }: { id: number; formData: FormData }) => {
      return await fetchService.put(`/agent/${id}`, formData);
    },
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message || "Agent updated successfully");
        setAgentModalOpen(false);
        setEditingAgent(null);

        invalidateToolsQueries();
        queryClient.invalidateQueries({ queryKey: ["agent", res.data?.id] });
      } else {
        toast.error(res.message || "Failed to update agent");
      }
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update agent");
    },
  });

  const toggleAgentStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: "ACTIVE" | "INACTIVE" }) => {
      return await fetchService.patch(`/agent/${id}/status`, { status });
    },
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Agent status updated");
        invalidateToolsQueries();
      } else {
        toast.error(res.message || "Failed to update status");
      }
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update status");
    },
  });

  const deleteAgentMutation = useMutation({
    mutationFn: async (id: number) => {
      return await fetchService.delete(`/agent/${id}`);
    },
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Agent deleted");
        invalidateToolsQueries();
      } else {
        toast.error(res.message || "Failed to delete agent");
      }
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete agent");
    },
  });

  // Filtered tools and their agents based on search query
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

  const handleToolSubmit = (data: ToolFormInput) => {
    if (editingTool) {
      updateToolMutation.mutate({ id: editingTool.id, data });
    } else {
      createToolMutation.mutate(data);
    }
  };

  const handleAgentSubmit = (formData: FormData) => {
    if (editingAgent) {
      updateAgentMutation.mutate({ id: editingAgent.id, formData });
    } else {
      createAgentMutation.mutate(formData);
    }
  };

  const handleToolDelete = (tool: Tool) => {
    if (
      window.confirm(
        `Are you sure you want to delete tool "${tool.name}"? All associated agents will also be deleted.`,
      )
    ) {
      deleteToolMutation.mutate(tool.id);
    }
  };

  const handleAgentDelete = (agent: Agent) => {
    if (window.confirm(`Are you sure you want to delete agent "${agent.name}"?`)) {
      deleteAgentMutation.mutate(agent.id);
    }
  };

  const handleCreateAgentForTool = (tool: Tool) => {
    setSelectedToolIdForNewAgent(tool.id);
    setEditingAgent(null);
    setAgentModalOpen(true);
  };

  return (
    <>
      <MetaHead
        title="Tools & Agents Management"
        description="Configure AI tools, agents, dynamic input fields, and system prompts in MKK Agent Admin."
        noIndex={true}
      />

      <div className="space-y-6 pb-16">
        {/* Top Separate Card: Page Title, Description, Search, and New Tool Action */}
        <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-800/40 p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <Link
                  to="/admin/dashboard"
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Home
                </Link>
                <ChevronRight className="size-3.5" />
                <span className="text-gray-900 dark:text-white font-medium">Tools & Agents</span>
              </div>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
                Tools & Agents
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Create and manage AI tools, their specialized agents, and dynamic user input forms.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setEditingTool(null);
                  setToolModalOpen(true);
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 active:scale-95 transition-all cursor-pointer"
              >
                <Plus className="size-4" />
                <span>New Tool</span>
              </button>
            </div>
          </div>

          {/* Search Input in Top Card */}
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

        {/* Next Tool Cards: Title, Right Status & Toggle, Agents Card Display Inside Tool Card */}
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
            Failed to load tools. Please refresh the page.
          </div>
        ) : tools.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 dark:border-white/10 p-12 text-center bg-white dark:bg-gray-800/40">
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40">
              <Wrench className="size-6" />
            </div>
            <h3 className="mt-3 text-base font-semibold text-gray-900 dark:text-white">
              No tools configured
            </h3>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Get started by creating your first AI tool category (e.g. "Job Search").
            </p>
            <button
              type="button"
              onClick={() => {
                setEditingTool(null);
                setToolModalOpen(true);
              }}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 transition-all cursor-pointer"
            >
              <Plus className="size-3.5" />
              <span>Create Tool</span>
            </button>
          </div>
        ) : filteredToolsWithAgents.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 dark:border-white/10 p-12 text-center bg-white dark:bg-gray-800/40">
            <Wrench className="mx-auto size-10 text-gray-400" />
            <h3 className="mt-3 text-base font-semibold text-gray-900 dark:text-white">
              No matching tools or agents
            </h3>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              No tools or agents match "{searchQuery}". Try a different keyword.
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
              <ToolCard
                key={tool.id}
                tool={tool}
                agents={agents}
                onEditTool={(t) => {
                  setEditingTool(t);
                  setToolModalOpen(true);
                }}
                onDeleteTool={handleToolDelete}
                onToggleToolStatus={(t) =>
                  toggleToolStatusMutation.mutate({
                    id: t.id,
                    status: t.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
                  })
                }
                isTogglingTool={toggleToolStatusMutation.isPending}
                onCreateAgent={handleCreateAgentForTool}
                onEditAgent={(a) => {
                  setEditingAgent(a);
                  setSelectedToolIdForNewAgent(tool.id);
                  setAgentModalOpen(true);
                }}
                onDeleteAgent={handleAgentDelete}
                onToggleAgentStatus={(a) =>
                  toggleAgentStatusMutation.mutate({
                    id: a.id,
                    status: a.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
                  })
                }
                isTogglingAgent={toggleAgentStatusMutation.isPending}
              />
            ))}
          </div>
        )}
      </div>

      {/* Tool Form Modal */}
      <ToolFormModal
        isOpen={toolModalOpen}
        onClose={() => {
          setToolModalOpen(false);
          setEditingTool(null);
        }}
        onSubmit={handleToolSubmit}
        isLoading={createToolMutation.isPending || updateToolMutation.isPending}
        tool={editingTool}
      />

      {/* Agent Form Modal */}
      <AgentFormModal
        isOpen={agentModalOpen}
        onClose={() => {
          setAgentModalOpen(false);
          setEditingAgent(null);
          setSelectedToolIdForNewAgent(undefined);
        }}
        onSubmit={handleAgentSubmit}
        isLoading={createAgentMutation.isPending || updateAgentMutation.isPending}
        agent={editingAgent}
        tools={tools}
        selectedToolId={selectedToolIdForNewAgent}
      />
    </>
  );
}
