import { useQuery } from "@tanstack/react-query";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  type TooltipItem,
  type ChartOptions,
  type ChartData,
} from "chart.js";
import { useMemo, useState } from "react";
import { Bar } from "react-chartjs-2";
import colors from "tailwindcss/colors";
import { fetchService } from "../../../lib/fetchService";
import { formatNumber } from "../../../common";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export function Usage() {
  const darkTheme = useMemo(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme) return savedTheme;

      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  }, []);

  const tokenTypes = [
    { label: "Last week", value: "day" },
    { label: "Last 4 weeks", value: "week" },
  ];
  const [tokenType, setTockenType] = useState(tokenTypes[0].value);

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
        text: "Token Usage",
        color: darkTheme ? colors.gray[200] : colors.gray[700],
        font: {
          size: 24,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: TooltipItem<"bar">) {
            const label = context.dataset.label || "";
            console.log("context.parsed", context.parsed);
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
          // stepSize: 5,
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
    queryKey: ["tokenUsage", tokenType],
    queryFn: async (): Promise<{ label: string; value: string }[]> => {
      const data = await fetchService.get(
        `/token/usage?limit=${tokenType == "day" ? 7 : 4}&type=${tokenType}`,
      );
      return data.data ?? [];
    },
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error</div>;
  if (!data) return <div>No data</div>;

  const chartData: ChartData<"bar", string[]> = {
    labels: data.map((v) => v.label),
    datasets: [
      {
        label: "Tokens",
        data: data.map((v) => v.value),
        backgroundColor: darkTheme ? colors.sky[800] : colors.sky[200],
        borderColor: darkTheme ? colors.sky[400] : colors.sky[500],
      },
    ],
  };

  return (
    <div className="w-full max-w-xl mx-auto p-2">
      <div className="">
        <select
          name="tokenType"
          className="w-24 rounded-md p-2 text-sm bg-white dark:bg-white/5 outline focus:outline-2 outline-gray-300 dark:outline-white/10 focus:outline-gray-400"
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
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}
