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
import { useMemo } from "react";
import TokenUsage from "../../components/admin/TokenUsage";
import ModelUsage from "../../components/admin/ModelUsage";
import ProviderUsage from "../../components/admin/ProviderUsage";

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

export default function Dashboard(): React.ReactElement {
  const darkTheme = useMemo(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    } else return false;
  }, []);

  return (
    <div className="grid grid-cols-2 grid-rows-3 md:grid-rows-2 gap-4">
      <TokenUsage darkTheme={darkTheme} className="col-span-2" />
      <ModelUsage darkTheme={darkTheme} className="col-span-2 md:col-span-1 md:row-start-2" />
      <ProviderUsage darkTheme={darkTheme} className="col-span-2 md:col-span-1 md:row-start-2" />
    </div>
  );
}
