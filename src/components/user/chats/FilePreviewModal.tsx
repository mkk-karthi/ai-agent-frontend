import React, { useState } from "react";
import Modal from "../../ui/Modal";
import { Download, FileText, AlertCircle, Loader } from "lucide-react";
import type { AttachmentType } from "../../../types/conversation";
import { fetchService } from "../../../lib/fetchService";
import { useQuery } from "@tanstack/react-query";
import {
  useAttachmentBlobUrl,
  downloadAttachmentFile,
} from "../../../hooks/useAttachmentUrl";

interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  attachment: AttachmentType | null;
  isShared?: boolean;
}

export default function FilePreviewModal({
  isOpen,
  onClose,
  attachment,
  isShared = false,
}: FilePreviewModalProps): React.ReactElement | null {
  const [downloading, setDownloading] = useState(false);

  const isImage = attachment?.mimeType.startsWith("image/");
  const isPdf =
    attachment?.mimeType === "application/pdf" || attachment?.originalName.endsWith(".pdf");
  const isTextual =
    attachment?.mimeType.startsWith("text/") ||
    attachment?.mimeType === "application/json" ||
    attachment?.mimeType === "application/xml" ||
    attachment?.mimeType === "application/javascript" ||
    /\.(txt|md|csv|json|xml|html|css|js)$/i.test(attachment?.originalName || "");

  const endpoint = attachment
    ? isShared
      ? `/shared/attachment/${attachment.id}`
      : `/conversation/attachment/${attachment.id}`
    : "";

  // Text content query (for text/code/json/markdown)
  const {
    data: textContent,
    isLoading: isTextLoading,
    isError: isTextError,
    error: textError,
  } = useQuery({
    queryKey: ["attachment-content", attachment?.id, isShared],
    queryFn: async () => {
      if (!endpoint) return "";
      return await fetchService.get(endpoint, undefined, "text");
    },
    enabled: Boolean(isOpen && attachment && isTextual && !isPdf && !isImage),
    staleTime: 5 * 60 * 1000,
  });

  // Blob URL query for Image & PDF
  const {
    blobUrl,
    isLoading: isBlobLoading,
    isError: isBlobError,
    error: blobError,
  } = useAttachmentBlobUrl(
    endpoint,
    Boolean(isOpen && attachment && (isImage || isPdf)),
  );

  if (!attachment) return null;

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleDownload = async () => {
    if (!endpoint || downloading) return;
    setDownloading(true);
    try {
      await downloadAttachmentFile(endpoint, attachment.originalName);
    } catch {
      // download error handled gracefully
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" title={attachment.originalName}>
      <div className="flex flex-col gap-4">
        {/* Top Info Bar */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pb-2 border-b border-gray-200 dark:border-white/10">
          <span>
            {formatSize(attachment.size)} • {attachment.mimeType}
          </span>
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white! font-medium text-xs transition cursor-pointer disabled:opacity-50"
          >
            {downloading ? <Loader size={14} className="animate-spin" /> : <Download size={14} />}
            {downloading ? "Downloading..." : "Download"}
          </button>
        </div>

        {/* Content Viewer */}
        <div className="min-h-75 max-h-[70vh] overflow-auto rounded-lg flex items-center justify-center bg-gray-50 dark:bg-gray-900/50 p-2">
          {isImage ? (
            isBlobLoading ? (
              <div className="flex flex-col items-center gap-2 text-gray-500">
                <Loader size={24} className="animate-spin" />
                <span className="text-sm">Loading image...</span>
              </div>
            ) : isBlobError ? (
              <div className="flex flex-col items-center gap-2 text-red-500">
                <AlertCircle size={24} />
                <span className="text-sm">
                  {blobError instanceof Error ? blobError.message : "Failed to load image"}
                </span>
              </div>
            ) : blobUrl ? (
              <img
                src={blobUrl}
                alt={attachment.originalName}
                className="max-h-[65vh] w-auto max-w-full object-contain rounded"
              />
            ) : null
          ) : isPdf ? (
            isBlobLoading ? (
              <div className="flex flex-col items-center gap-2 text-gray-500">
                <Loader size={24} className="animate-spin" />
                <span className="text-sm">Loading PDF...</span>
              </div>
            ) : isBlobError ? (
              <div className="flex flex-col items-center gap-2 text-red-500">
                <AlertCircle size={24} />
                <span className="text-sm">
                  {blobError instanceof Error ? blobError.message : "Failed to load PDF"}
                </span>
              </div>
            ) : blobUrl ? (
              <iframe
                src={blobUrl}
                title={attachment.originalName}
                className="w-full h-[65vh] rounded border border-gray-200 dark:border-white/10"
              />
            ) : null
          ) : isTextual ? (
            isTextLoading ? (
              <div className="flex flex-col items-center gap-2 text-gray-500">
                <Loader size={24} className="animate-spin" />
                <span className="text-sm">Loading preview...</span>
              </div>
            ) : isTextError ? (
              <div className="flex flex-col items-center gap-2 text-red-500">
                <AlertCircle size={24} />
                <span className="text-sm">
                  {textError instanceof Error ? textError.message : "Failed to load content"}
                </span>
              </div>
            ) : (
              <pre className="w-full h-full max-h-[65vh] overflow-auto p-4 text-xs font-mono text-gray-800 dark:text-gray-200 whitespace-pre-wrap wrap-break-word rounded bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 select-text">
                {textContent}
              </pre>
            )
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center text-gray-500 dark:text-gray-400 gap-3">
              <FileText size={48} className="text-blue-500 stroke-1" />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  Preview not available for this file type
                </p>
                <p className="text-xs mt-1">You can download the file to view it on your device.</p>
              </div>
              <button
                type="button"
                onClick={handleDownload}
                disabled={downloading}
                className="mt-2 flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs transition cursor-pointer disabled:opacity-50"
              >
                {downloading ? <Loader size={14} className="animate-spin" /> : <Download size={14} />}
                Download {attachment.originalName}
              </button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
