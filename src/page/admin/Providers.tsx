import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { fetchService } from "../../lib/fetchService";
import { Link } from "react-router-dom";
import { ChevronRight, Cpu, KeyRound, Loader2, RefreshCcw, Sparkles } from "lucide-react";
import type { apiResponse, Provider } from "../../types/type";
import StatusColumn from "../../components/ui/StatusColumn";
import MetaHead from "../../components/common/MetaHead";
import ProviderFormModel from "../../components/admin/ProviderFormModel";
import type { providerInput } from "../../schemas/providerSchema";
import { toast } from "react-toastify";
import { queryClient } from "../../lib/queryClient";

export default function Providers(): React.ReactElement {
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [providerModalOpen, setProviderModalOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["providers"],
    queryFn: async (): Promise<Provider[]> => {
      const res = await fetchService.get(`/provider`);
      const providers = res.data ?? [];
      if (!activeTab && providers.length > 0) {
        setActiveTab(providers[0].id);
      }
      return providers;
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: providerInput) => {
      if (!editingProvider) throw new Error("No provider selected");
      const response = await fetchService.put(`/provider/${editingProvider.id}`, data);
      return response;
    },
    onSuccess: (data: apiResponse<unknown>) => {
      if (data.success) {
        setProviderModalOpen(false);
        setEditingProvider(null);
        queryClient.invalidateQueries({ queryKey: ["providers"] });
        toast.success(data.message || "Provider updated successfully");
      } else {
        toast.error(data.message || "Failed to update provider");
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update provider");
    },
  });

  const syncModelMutation = useMutation({
    mutationFn: async (id: Provider["id"]) => {
      const response = await fetchService.post(`/provider/sync-model/${id}`, []);
      return response;
    },
    onSuccess: (data: apiResponse<unknown>) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["providers"] });
        toast.success(data.message || "Models synchronized successfully");
      } else {
        toast.error(data.message || "Failed to sync models");
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to sync models");
    },
  });

  useEffect(() => {
    if (!activeTab && data && data.length > 0) {
      setActiveTab(data[0].id);
    }
  }, [data, activeTab]);

  const activeProvider = data?.find((item) => item.id === activeTab);

  return (
    <>
      <MetaHead
        title="AI Providers & Models"
        description="Configure AI provider connections, API tokens, and model availability in MKK Agent Admin."
        noIndex={true}
      />

      <div className="space-y-6 pb-16">
        {/* Top Separate Card: Page Title, Description & Breadcrumb */}
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
                <span className="text-gray-900 dark:text-white font-medium">Providers</span>
              </div>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
                AI Providers & Models
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Configure AI provider API credentials, discover available models, and manage
                execution status.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 px-3.5 py-2 text-xs font-semibold text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/40">
                <Cpu className="size-4 text-indigo-600 dark:text-indigo-400" />
                <span>Multi-Provider Engine</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Card with Tabs & Models */}
        <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-800/40 shadow-xs overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2">
              <Loader2 className="size-4 animate-spin text-indigo-600" />
              <span>Loading providers...</span>
            </div>
          ) : isError ? (
            <div className="p-8 text-center text-sm text-rose-500">
              Failed to load AI providers. Please try again.
            </div>
          ) : !data || data.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">
              No AI providers configured.
            </div>
          ) : (
            <>
              {/* Provider Selection Tabs */}
              <div className="flex items-center gap-2 px-6 pt-5 pb-4 border-b border-gray-200 dark:border-white/10 overflow-x-auto">
                {data.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveTab(item.id)}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                        isActive
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"
                      }`}
                    >
                      <Sparkles className="size-4 opacity-80" />
                      <span className="capitalize">{item.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Active Provider Details & Models List */}
              {activeProvider && (
                <div className="p-6">
                  {/* Provider Header Toolbar */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-gray-100 dark:border-white/10">
                    <div className="flex items-center gap-3">
                      <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white capitalize flex items-center gap-2">
                          <span>{activeProvider.name}</span>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                              activeProvider.status === "ACTIVE"
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50"
                                : "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border-rose-200 dark:border-rose-800/50"
                            }`}
                          >
                            {activeProvider.status}
                          </span>
                        </h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {activeProvider.models?.length || 0} discovered models
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center flex-wrap gap-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingProvider(activeProvider);
                          setProviderModalOpen(true);
                        }}
                        className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-800/80 px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-all shadow-2xs cursor-pointer active:scale-95"
                      >
                        <KeyRound className="size-3.5 text-indigo-600 dark:text-indigo-400" />
                        <span>Configure API Key</span>
                      </button>

                      <button
                        type="button"
                        disabled={syncModelMutation.isPending}
                        onClick={() => syncModelMutation.mutate(activeProvider.id)}
                        className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-all shadow-xs disabled:opacity-50 cursor-pointer active:scale-95"
                      >
                        <RefreshCcw
                          className={`size-3.5 ${
                            syncModelMutation.isPending ? "animate-spin" : ""
                          }`}
                        />
                        <span>{syncModelMutation.isPending ? "Syncing..." : "Sync Models"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Models Table */}
                  <div className="mt-5">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                      Available Models
                    </h3>

                    {!activeProvider.models || activeProvider.models.length === 0 ? (
                      <div className="text-center py-8 text-sm text-gray-500 dark:text-gray-400 border border-dashed border-gray-200 dark:border-white/10 rounded-xl">
                        No models discovered yet. Click "Sync Models" to fetch catalog from
                        provider.
                      </div>
                    ) : (
                      <div className="overflow-x-auto border border-gray-200 dark:border-white/10 rounded-xl">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-white/10 text-sm text-left">
                          <thead className="bg-indigo-50/70 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 uppercase text-xs font-semibold tracking-wider">
                            <tr>
                              <th className="px-6 py-3.5">Model Identifier</th>
                              <th className="px-6 py-3.5">Capability Type</th>
                              <th className="px-6 py-3.5 text-right">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-white/10 bg-white dark:bg-gray-800/40">
                            {activeProvider.models.map((model) => (
                              <tr
                                key={model.id}
                                className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                              >
                                <td className="px-6 py-3.5 font-medium text-gray-900 dark:text-white">
                                  {model.modelName}
                                </td>
                                <td className="px-6 py-3.5">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300 uppercase">
                                    {model.type}
                                  </span>
                                </td>
                                <td className="px-6 py-3.5 text-right">
                                  <div className="flex justify-end">
                                    <StatusColumn
                                      status={model.status}
                                      id={model.id}
                                      apiUrl="/provider/model"
                                      queryKey="providers"
                                    />
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Provider Form Modal */}
      <ProviderFormModel
        isOpen={providerModalOpen}
        onClose={() => {
          setProviderModalOpen(false);
          setEditingProvider(null);
        }}
        onSubmit={(v) => !mutation.isPending && mutation.mutate(v)}
        isLoading={mutation.isPending}
        provider={editingProvider}
      />
    </>
  );
}
