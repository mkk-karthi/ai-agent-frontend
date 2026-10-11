import { useQuery } from "@tanstack/react-query";
import { type TooltipItem, type ChartOptions, type ChartData } from "chart.js";
import { useState } from "react";
import { Line } from "react-chartjs-2";
import colors from "tailwindcss/colors";
import { fetchService } from "../../lib/fetchService";
import { formatNumber } from "../../common";

export default function TokenUsage({
  darkTheme,
  className,
}: {
  darkTheme: boolean;
  className?: string;
}): React.ReactElement {
  const tokenTypes = [
    { label: "Last week", value: "day" },
    { label: "Last 4 weeks", value: "week" },
  ];
  const [tokenType, setTockenType] = useState(tokenTypes[0].value);

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: darkTheme ? colors.gray[300] : colors.gray[600],
          font: {
            size: 14,
          },
        },
      },
      title: {
        display: true,
        text: "Token Usage",
        color: darkTheme ? colors.gray[200] : colors.gray[700],
        font: {
          size: 24,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: TooltipItem<"line">) {
            const label = context.dataset.label || "";
            const yValue = formatNumber(context.parsed.y ?? 0);

            return `${label}: ${yValue}`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: darkTheme ? colors.gray[300] : colors.gray[600],
        },
        grid: {
          color: darkTheme ? colors.gray[800] : colors.gray[300],
        },
      },
      y: {
        ticks: {
          autoSkip: false,
          color: darkTheme ? colors.gray[300] : colors.gray[600],
          callback: function (value) {
            return formatNumber(Number(value));
          },
        },
        grid: {
          color: darkTheme ? colors.gray[800] : colors.gray[300],
        },
      },
    },
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["totalUsage", tokenType],
    queryFn: async (): Promise<{ label: string; value: number }[]> => {
      const data = await fetchService.get(
        `/token/usage?limit=${tokenType == "day" ? 7 : 4}&type=${tokenType}&userId=`,
      );
      return data.data ?? [];
    },
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) return <div className={`${className} text-center`}>Loading...</div>;
  if (isError) return <div className={`${className} text-center`}>Error</div>;
  if (!data) return <div className={`${className} text-center`}>No data</div>;

  const chartData: ChartData<"line", number[]> = {
    labels: data.map((v) => v.label),
    datasets: [
      {
        fill: true,
        label: "Tokens",
        data: data.map((v) => v.value),
        backgroundColor: darkTheme ? colors.sky[800] : colors.sky[200],
        borderColor: darkTheme ? colors.sky[400] : colors.sky[500],
      },
    ],
  };

  return (
    <>
      <div
        className={`rounded-lg px-6 py-8 bg-gray-800/50 ring shadow-lg ring-gray-900/5 ${className}`}
      >
        <div className="">
          <select
            name="tokenType"
            className="w-32 rounded-md p-2 text-sm bg-white dark:bg-white/5 outline focus:outline-2 outline-gray-300 dark:outline-white/10 focus:outline-gray-400"
            onChange={(e) => setTockenType(e.target.value)}
            value={tokenType}
          >
            {tokenTypes.map((v) => (
              <option key={v.value} value={v.value}>
                {v.label}
              </option>
            ))}
          </select>
        </div>
        <div className="relative h-72 w-full">
          <Line data={chartData} options={options} />
        </div>
      </div>
    </>
  );
}
