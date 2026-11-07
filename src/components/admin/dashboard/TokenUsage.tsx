import { useQuery } from "@tanstack/react-query";
import { type TooltipItem, type ChartOptions } from "chart.js";
import { useState } from "react";
import { Line } from "react-chartjs-2";
import colors from "tailwindcss/colors";
import { fetchService } from "../../../lib/fetchService";
import { formatNumber } from "../../../common";

export default function TokenUsage({
  darkTheme,
  className,
}: {
  darkTheme: boolean;
  className?: string;
}): React.ReactElement {
  const tokenTypes = [
    { label: "Last 7 Days", value: "day" },
    { label: "Last 4 Weeks", value: "week" },
  ];
  const [tokenType, setTokenType] = useState(tokenTypes[0].value);

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
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
          label: function (context: TooltipItem<"line">) {
            const label = context.dataset.label || "Tokens";
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
          font: { size: 12 },
        },
        grid: {
          color: darkTheme ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
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
    queryKey: ["totalUsage", tokenType],
    queryFn: async (): Promise<{ label: string; value: number }[]> => {
      const res = await fetchService.get(
        `/token/usage?limit=${tokenType === "day" ? 7 : 4}&type=${tokenType}&userId=`,
      );
      return res.data ?? [];
    },
    staleTime: 1000 * 60 * 5,
  });

  return (
    <div
      className={`rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-800/40 p-6 shadow-xs ${className || ""}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 mb-4 border-b border-gray-100 dark:border-white/10">
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white">Token Consumption</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Total model tokens processed across user chat sessions
          </p>
        </div>

        <div>
          <select
            name="tokenType"
            className="rounded-xl border border-gray-200 dark:border-white/10 px-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-900/60 text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            onChange={(e) => setTokenType(e.target.value)}
            value={tokenType}
          >
            {tokenTypes.map((v) => (
              <option key={v.value} value={v.value}>
                {v.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="relative h-72 w-full">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-48 w-full animate-pulse rounded-xl bg-gray-100 dark:bg-white/5" />
          </div>
        ) : isError ? (
          <div className="flex h-full items-center justify-center text-xs text-rose-500">
            Failed to load token usage statistics.
          </div>
        ) : !data || data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-xs text-gray-400">
            No token activity recorded in this period.
          </div>
        ) : (
          <Line
            data={{
              labels: data.map((v) => v.label),
              datasets: [
                {
                  fill: true,
                  label: "Tokens",
                  data: data.map((v) => v.value),
                  backgroundColor: darkTheme
                    ? "rgba(99, 102, 241, 0.15)"
                    : "rgba(79, 70, 229, 0.08)",
                  borderColor: darkTheme ? colors.indigo[400] : colors.indigo[600],
                  pointBackgroundColor: darkTheme ? colors.indigo[400] : colors.indigo[600],
                  pointBorderColor: darkTheme ? "#1e1b4b" : "#ffffff",
                  pointHoverBackgroundColor: "#ffffff",
                  pointHoverBorderColor: darkTheme ? colors.indigo[400] : colors.indigo[600],
                  borderWidth: 2.5,
                  tension: 0.35,
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
