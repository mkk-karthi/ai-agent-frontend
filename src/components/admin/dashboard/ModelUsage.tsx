import { Bar } from "react-chartjs-2";
import colors from "tailwindcss/colors";
import { fetchService } from "../../../lib/fetchService";
import { useQuery } from "@tanstack/react-query";
import type { ChartOptions, TooltipItem } from "chart.js";
import { formatNumber } from "../../../common";

export default function ModelUsage({
  darkTheme,
  className,
}: {
  darkTheme: boolean;
  className?: string;
}): React.ReactElement {
  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    elements: {
      bar: {
        borderWidth: 1.5,
        borderRadius: 8,
      },
    },
    plugins: {
      legend: {
        display: false,
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
          label: function (context: TooltipItem<"bar">) {
            const label = context.dataset.label || "Requests";
            const yValue = formatNumber(context.parsed.y ?? 0);
            return ` ${label}: ${yValue}`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: darkTheme ? colors.gray[400] : colors.gray[500],
          font: { size: 11 },
          maxRotation: 45,
          minRotation: 0,
        },
        grid: {
          display: false,
        },
      },
      y: {
        ticks: {
          color: darkTheme ? colors.gray[400] : colors.gray[500],
          font: { size: 12 },
          callback: function (value) {
            return formatNumber(Number(value));
          },
        },
        grid: {
          color: darkTheme ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
        },
      },
    },
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["modelUsage"],
    queryFn: async (): Promise<{ label: string; value: number }[]> => {
      const res = await fetchService.get(`/token/model-usage`);
      return res.data ?? [];
    },
  });

  return (
    <div
      className={`rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-800/40 p-6 shadow-xs ${className || ""}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 mb-4 border-b border-gray-100 dark:border-white/10">
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white">Model Utilization</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Top 5 models by invocation volume across providers
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50 px-2.5 py-0.5 text-xs font-semibold">
          Top 5 Models
        </span>
      </div>

      <div className="relative h-72 w-full">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-48 w-full animate-pulse rounded-xl bg-gray-100 dark:bg-white/5" />
          </div>
        ) : isError ? (
          <div className="flex h-full items-center justify-center text-xs text-rose-500">
            Failed to load model utilization statistics.
          </div>
        ) : !data || data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-xs text-gray-400">
            No model invocation records found.
          </div>
        ) : (
          <Bar
            data={{
              labels: data.map((v) => v.label),
              datasets: [
                {
                  label: "Invocations",
                  data: data.map((v) => v.value),
                  backgroundColor: darkTheme
                    ? "rgba(99, 102, 241, 0.7)"
                    : "rgba(79, 70, 229, 0.85)",
                  borderColor: darkTheme ? colors.indigo[400] : colors.indigo[600],
                  hoverBackgroundColor: darkTheme ? colors.indigo[400] : colors.indigo[500],
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
