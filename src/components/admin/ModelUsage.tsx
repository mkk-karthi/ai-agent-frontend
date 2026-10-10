import { Bar } from "react-chartjs-2";
import colors from "tailwindcss/colors";
import { fetchService } from "../../services/fetchService";
import { useQuery } from "@tanstack/react-query";
import type { ChartData, ChartOptions, TooltipItem } from "chart.js";
import { formatNumber } from "../../common";

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
        borderWidth: 2,
      },
    },
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
        text: "Model Usage",
        color: darkTheme ? colors.gray[200] : colors.gray[700],
        font: {
          size: 24,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: TooltipItem<"bar">) {
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
    queryKey: ["modelUsage"],
    queryFn: async (): Promise<{ label: string; value: number }[]> => {
      const data = await fetchService.get(`/token/model-usage`);
      return data.data ?? [];
    },
  });

  if (isLoading) return <div className={`${className} text-center`}>Loading...</div>;
  if (isError) return <div className={`${className} text-center`}>Error</div>;
  if (!data) return <div className={`${className} text-center`}>No data</div>;

  const chartData: ChartData<"bar", number[]> = {
    labels: data.map((v) => v.label),
    datasets: [
      {
        label: "Usage",
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
        <div className="relative h-72 w-full">
          <Bar data={chartData} options={options} />
        </div>
      </div>
    </>
  );
}
