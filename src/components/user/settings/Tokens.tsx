import { BadgeCheck, BadgeX } from "lucide-react";
import TokenUpdateForm from "./TokenUpdateForm";
import { useQuery } from "@tanstack/react-query";
import { fetchService } from "../../../services/fetchService";

interface TokenType {
  id: number;
  name: string;
  apiTokens: Array<{
    id: number;
    token: string;
    status: string;
  }>;
}

export default function Tokens(): React.ReactElement {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["tokens"],
    queryFn: async (): Promise<TokenType[]> => {
      const data = await fetchService.get("/token");
      return data.data ?? [];
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error</div>;

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white m-2">Tokens</h2>
      {data?.map((v, _) => (
        <div className="space-y-4 p-2 mt-4" key={v.id}>
          <div className="flex border-b border-gray-300 dark:border-white/9 py-2">
            <label className="w-3/12 my-1.5 block text-sm font-medium text-gray-700 dark:text-white/90">
              {v.name}
            </label>

            <TokenUpdateForm id={v.id} className="w-8/12" />
            <div className="w-1/12 mx-2 my-1.5">
              {v.apiTokens.length > 0 && v.apiTokens[0].status == "ACTIVE" ? (
                <BadgeCheck className="size-6 text-green-500" />
              ) : (
                <BadgeX className="size-6 text-red-500" />
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
