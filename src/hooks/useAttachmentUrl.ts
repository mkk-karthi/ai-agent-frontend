import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchService } from "../lib/fetchService";

export function useAttachmentBlobUrl(
  endpoint: string | null | undefined,
  enabled: boolean = true,
) {
  const {
    data: blob,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["attachment-blob", endpoint],
    queryFn: async () => {
      if (!endpoint) return null;
      return await fetchService.get(endpoint, undefined, "blob");
    },
    enabled: Boolean(endpoint && enabled),
    staleTime: 10 * 60 * 1000,
  });

  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!blob) {
      setBlobUrl(null);
      return;
    }

    const url = URL.createObjectURL(blob);
    setBlobUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [blob]);

  return { blobUrl, blob, isLoading, isError, error };
}

export async function downloadAttachmentFile(
  endpoint: string,
  filename: string,
): Promise<void> {
  const downloadEndpoint = endpoint.includes("?")
    ? `${endpoint}&download=true`
    : `${endpoint}?download=true`;

  const blob = await fetchService.get(downloadEndpoint, undefined, "blob");
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

