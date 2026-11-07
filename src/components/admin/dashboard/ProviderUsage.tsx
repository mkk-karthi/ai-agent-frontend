import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ChartOptions, TooltipItem } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import colors from "tailwindcss/colors";
import { fetchService } from "../../../lib/fetchService";
import { formatNumber } from "../../../common";
import type { Provider } from "../../../types/type";

export default function ProviderUsage({
  darkTheme,
  className,
}: {
  darkTheme: boolean;
  className?: string;
}): React.ReactElement {
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);

  // Fetch available providers for the select box
  const { data: providers } = useQuery<Provider[]>({
    queryKey: ["providers"],
    queryFn: async (): Promise<Provider[]> => {
      const res = await fetchService.get<Provider[]>("/provider");
      return res.data ?? [];
    },
  });

  useEffect(() => {
    if (!selectedProviderId && providers && providers.length > 0 && providers[0]) {
      setSelectedProviderId(providers[0].id);
    }
  }, [providers, selectedProviderId]);

  const options: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "68%",
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          color: darkTheme ? colors.gray[300] : colors.gray[600],
          font: { size: 12 },
          padding: 16,
          boxWidth: 12,
          usePointStyle: true,
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: darkTheme ? colors.gray[800] : colors.white,
        titleColor: darkTheme ? colors.white : colors.gray[900],
        bodyColor: darkTheme ? colors.gray[300] : colors.gray[700],
        borderColor: darkTheme ? colors.gray[700] : colors.gray[200],
        borderWidth: 1,
        padding: 10,
        boxPadding: 4,
        callbacks: {
          label: function (context: TooltipItem<"doughnut">) {
            const label = context.label || "";
            const value = formatNumber(context.parsed ?? 0);
            return ` ${label}: ${value} users`;
          },
        },
      },
    },
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["providerUsage", selectedProviderId],
    queryFn: async (): Promise<{ active: number; inactive: number }> => {
      const url = selectedProviderId
        ? `/token/provider-usage?providerId=${selectedProviderId}`
        : `/token/provider-usage`;
      const res = await fetchService.get(url);
      return res.data ?? { active: 0, inactive: 0 };
    },
    enabled: selectedProviderId !== null,
    staleTime: 1000 * 60 * 5,
  });

  const activeProviderName =
    providers?.find((p) => p.id === selectedProviderId)?.name || "Provider";

  return (
    <div
      className={`rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-800/40 p-6 shadow-xs ${className || ""}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 mb-4 border-b border-gray-100 dark:border-white/10">
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white">Provider Adoption</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            User token configuration for {activeProviderName}
          </p>
        </div>

        {providers && providers.length > 0 && (
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 dark:text-gray-400">Provider:</label>
            <select
              value={selectedProviderId ?? ""}
              onChange={(e) => setSelectedProviderId(e.target.value)}
              className="rounded-xl border border-gray-200 dark:border-white/10 px-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-900/60 text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors capitalize cursor-pointer font-medium"
            >
              {providers.map((p) => (
                <option key={p.id} value={p.id} className="capitalize">
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="relative h-72 w-full">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-48 w-48 rounded-full border-4 border-indigo-200 dark:border-indigo-950 animate-pulse" />
          </div>
        ) : isError ? (
          <div className="flex h-full items-center justify-center text-xs text-rose-500">
            Failed to load provider adoption statistics.
          </div>
        ) : !data ? (
          <div className="flex h-full items-center justify-center text-xs text-gray-400">
            No provider adoption data available.
          </div>
        ) : (
          <Doughnut
            data={{
              labels: ["Configured / Active", "Unconfigured"],
              datasets: [
                {
                  label: "Users",
                  data: [data.active, data.inactive],
                  backgroundColor: darkTheme
                    ? [colors.indigo[500], "rgba(255, 255, 255, 0.08)"]
                    : [colors.indigo[600], colors.gray[200]],
                  borderColor: darkTheme ? colors.gray[800] : colors.white,
                  borderWidth: 2,
                },
              ],
            }}
            options={options}
          />
        )}
      </div>
    </div>
  );
}
