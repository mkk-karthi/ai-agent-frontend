import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  ArcElement,
  Filler,
} from "chart.js";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Bot, ChevronRight, Coins, MessageSquare, RefreshCcw, Users } from "lucide-react";
import TokenUsage from "../../components/admin/dashboard/TokenUsage";
import ModelUsage from "../../components/admin/dashboard/ModelUsage";
import ProviderUsage from "../../components/admin/dashboard/ProviderUsage";
import MetaHead from "../../components/common/MetaHead";
import { fetchService } from "../../lib/fetchService";
import { queryClient } from "../../lib/queryClient";
import { formatNumber } from "../../common";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Filler,
  Tooltip,
  Legend,
);

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalConversations: number;
  totalTokens: number;
  promptTokens: number;
  outputTokens: number;
  activeTools: number;
  totalTools: number;
  activeAgents: number;
  totalAgents: number;
}

export default function Dashboard(): React.ReactElement {
  const [isLoading, setLoading] = useState(false);
  const darkTheme = useMemo(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  }, []);

  const {
    data: stats,
    isLoading: isStatsLoading,
    isFetching: isStatsFetching,
    refetch,
  } = useQuery({
    queryKey: ["admin", "dashboard-stats"],
    queryFn: async (): Promise<DashboardStats> => {
      const res = await fetchService.get<DashboardStats>("/token/dashboard-stats");
      return (
        res.data ?? {
          totalUsers: 0,
          activeUsers: 0,
          totalConversations: 0,
          totalTokens: 0,
          promptTokens: 0,
          outputTokens: 0,
          activeTools: 0,
          totalTools: 0,
          activeAgents: 0,
          totalAgents: 0,
        }
      );
    },
    staleTime: 1000 * 60 * 3,
  });

  const handleRefreshAll = () => {
    setLoading(true);
    refetch();
    queryClient.invalidateQueries({ queryKey: ["totalUsage"] });
    queryClient.invalidateQueries({ queryKey: ["modelUsage"] });
    queryClient.invalidateQueries({ queryKey: ["providerUsage"] });
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  return (
    <>
      <MetaHead
        title="Admin Dashboard"
        description="Admin dashboard metrics and token usage overview for MKK Agent."
        noIndex={true}
      />

      <div className="space-y-6 pb-16">
        {/* Top Separate Card: Page Title, Description & Refresh */}
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
                <span className="text-gray-900 dark:text-white font-medium">Dashboard</span>
              </div>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
                Admin Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                System overview, real-time KPI metrics, token consumption, and model utilization.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRefreshAll}
                disabled={isStatsFetching}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-800/80 px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-all shadow-2xs cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <RefreshCcw
                  className={`size-3.5 text-indigo-600 dark:text-indigo-400 ${
                    isStatsFetching || isLoading ? "animate-spin" : ""
                  }`}
                />
                <span>{isStatsFetching ? "Refreshing..." : "Refresh Data"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4 KPI Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Users */}
          <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-800/40 p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Total Users
              </span>
              <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <Users className="size-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {isStatsLoading ? "..." : formatNumber(stats?.totalUsers ?? 0)}
              </span>
              {stats && (
                <span className="rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 px-2 py-0.5 text-2xs font-semibold border border-emerald-200 dark:border-emerald-800/50">
                  {stats.activeUsers} Active
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Registered member accounts
            </p>
          </div>

          {/* Total Conversations */}
          <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-800/40 p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Conversations
              </span>
              <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <MessageSquare className="size-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {isStatsLoading ? "..." : formatNumber(stats?.totalConversations ?? 0)}
              </span>
              <span className="text-xs text-gray-400">Sessions</span>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              User chat threads generated
            </p>
          </div>

          {/* Tokens Consumed */}
          <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-800/40 p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Tokens Processed
              </span>
              <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <Coins className="size-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {isStatsLoading ? "..." : formatNumber(stats?.totalTokens ?? 0)}
              </span>
              <span className="text-xs text-gray-400">Tokens</span>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 truncate">
              {stats
                ? `${formatNumber(stats.promptTokens)} in · ${formatNumber(stats.outputTokens)} out`
                : "Prompt & completion tokens"}
            </p>
          </div>

          {/* Active AI Tools & Agents */}
          <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-800/40 p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                AI Capabilities
              </span>
              <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <Bot className="size-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {isStatsLoading ? "..." : `${stats?.activeAgents ?? 0} Agents`}
              </span>
              <span className="text-xs text-gray-400">active</span>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Across {stats?.activeTools ?? 0} active categories
            </p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="space-y-6">
          <TokenUsage darkTheme={darkTheme} className="w-full" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ModelUsage darkTheme={darkTheme} />
            <ProviderUsage darkTheme={darkTheme} />
          </div>
        </div>
      </div>
    </>
  );
}
