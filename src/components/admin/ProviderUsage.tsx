import { useQuery } from "@tanstack/react-query";
import type { ChartData, ChartOptions, TooltipItem } from "chart.js";
import { Pie } from "react-chartjs-2";
import colors from "tailwindcss/colors";
import { fetchService } from "../../services/fetchService";
import { formatNumber } from "../../common";

export default function ProviderUsage({
  darkTheme,
  className,
}: {
  darkTheme: boolean;
  className?: string;
}): React.ReactElement {
  const options: ChartOptions<"pie"> = {
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
        text: "Gemini Users",
        color: darkTheme ? colors.gray[200] : colors.gray[700],
        font: {
          size: 24,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: TooltipItem<"pie">) {
            const label = context.dataset.label || "";
            const yValue = formatNumber(context.parsed ?? 0);

            return `${label}: ${yValue}`;
          },
        },
      },
    },
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["providerUsage"],
    queryFn: async (): Promise<{ active: number; inactive: number }> => {
      const data = await fetchService.get(`/token/provider-usage`);
      return data.data ?? [];
    },
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) return <div className={`${className} text-center`}>Loading...</div>;
  if (isError) return <div className={`${className} text-center`}>Error</div>;
  if (!data) return <div className={`${className} text-center`}>No data</div>;

  const labels = ["Active Users", "Not Used"];

  const chartData: ChartData<"pie"> = {
    labels,
    datasets: [
      {
        label: "Users",
        data: [data.active, data.inactive],
        backgroundColor: darkTheme
          ? [colors.green[950], colors.rose[950]]
          : [colors.green[200], colors.rose[200]],
        borderColor: darkTheme
          ? [colors.green[600], colors.rose[600]]
          : [colors.green[500], colors.rose[500]],
      },
    ],
  };
  return (
    <>
      <div
        className={`rounded-lg px-6 py-8 bg-gray-800/50 ring shadow-lg ring-gray-900/5 ${className}`}
      >
        <div className="relative h-72 w-full">
          <Pie data={chartData} options={options} />
        </div>
      </div>
    </>
  );
}
