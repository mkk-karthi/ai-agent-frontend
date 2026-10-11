import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchService } from "../../lib/fetchService";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import type { Provider } from "../../types/type";
import ProviderForm from "../../components/admin/ProviderForm";
import StatusColumn from "../../components/admin/user/StatusColumn";

export default function Providers(): React.ReactElement {
  const [activeTab, setActiveTab] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["providers"],
    queryFn: async (): Promise<Provider[]> => {
      const data = await fetchService.get(`/provider`);
      if (!activeTab && data.data && data.data.length > 0) {
        setActiveTab(data.data[0].id);
      }
      return data.data ?? [];
    },
  });

  useEffect(() => {
    if (!activeTab && data && data.length > 0) setActiveTab(data[0].id);
  }, []);

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error</div>;
  if (!data) return <div>No data</div>;

  return (
    <>
      <div className="rounded-lg px-6 py-8 dark:bg-gray-800/20 ring shadow-xl ring-gray-300 dark:ring-white/10 outline-1 outline-white/10">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-base text-gray-500 dark:text-gray-400">
            <Link to="/admin/dashboard" className="hover:text-gray-700 dark:hover:text-white">
              Home
            </Link>
            <ChevronRight className="size-4" />
            <Link to="/admin/provider" className="hover:text-gray-700 dark:hover:text-white">
              Provider
            </Link>
          </div>
          <h2 className="text-2xl/7 font-bold text-gray-900 dark:text-white sm:truncate sm:text-3xl sm:tracking-tight mt-1">
            Providers
          </h2>
        </div>

        <div className="flex flex-row gap-2 w-full overflow-y-auto p-2 bg-gray-900/5 dark:bg-gray-800/50 mt-4 rounded-sm">
          {data.map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`rounded hover:bg-gray-900/10 dark:hover:bg-white/5 cursor-pointer whitespace-nowrap overflow-hidden px-4 py-2 ${activeTab == item.id && "bg-gray-900/10 dark:bg-white/5"} lowercase first-letter:uppercase`}
            >
              {item.name}
            </div>
          ))}
        </div>

        {activeTab &&
          data.map(
            (item) =>
              item.id === activeTab && (
                <div key={item.id}>
                  <ProviderForm item={item} />
                  <hr className="my-4 border-1.5 border-gray-300 dark:border-white/9" />
                  <h2 className="text-xl/6 sm:text-2xl sm:tracking-tight font-bold text-gray-900 dark:text-white sm:truncate mt-1">
                    Models
                  </h2>
                  <table className="my-4 w-full">
                    {item.models.map((model) => (
                      <tr
                        key={model.id}
                        className="hover:bg-gray-900/5 dark:hover:bg-white/5"
                      >
                        <td className="px-4 py-2">{model.modelName}</td>
                        <td className="lowercase first-letter:uppercase px-4 py-2">{model.type}</td>
                        <td className="px-4 py-2 flex justify-end">
                          <StatusColumn
                            status={model.status}
                            id={model.id}
                            apiUrl="/provider/model"
                            queryKey="providers"
                          />
                        </td>
                      </tr>
                    ))}
                  </table>
                </div>
              ),
          )}
      </div>
    </>
  );
}
