import React, { useState } from "react";
import {
  FileText,
  FileCode,
  Table,
  Download,
  Eye,
  File as GenericFile,
  Loader,
} from "lucide-react";
import type { AttachmentType } from "../../../types/conversation";
import FilePreviewModal from "./FilePreviewModal";
import {
  useAttachmentBlobUrl,
  downloadAttachmentFile,
} from "../../../hooks/useAttachmentUrl";

interface FileAttachmentProps {
  attachment: AttachmentType;
  isShared?: boolean;
}

export default function FileAttachment({
  attachment,
  isShared = false,
}: FileAttachmentProps): React.ReactElement {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const isImage = attachment.mimeType.startsWith("image/");
  const isPdf =
    attachment.mimeType === "application/pdf" ||
    attachment.originalName.toLowerCase().endsWith(".pdf");
  const isWord =
    attachment.mimeType.includes("word") ||
    /\.(doc|docx)$/i.test(attachment.originalName);
  const isSheet =
    attachment.mimeType.includes("csv") ||
    attachment.mimeType.includes("spreadsheet") ||
    /\.(csv|xlsx|xls)$/i.test(attachment.originalName);
  const isCode =
    attachment.mimeType.includes("json") ||
    attachment.mimeType.includes("xml") ||
    attachment.mimeType.includes("javascript") ||
    /\.(json|xml|html|css|js|ts|jsx|tsx|py|sql)$/i.test(attachment.originalName);

  const endpoint = isShared
    ? `/shared/attachment/${attachment.id}`
    : `/conversation/attachment/${attachment.id}`;

  const { blobUrl, isLoading: isImageLoading } = useAttachmentBlobUrl(
    endpoint,
    isImage,
  );

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getIcon = () => {
    if (isPdf) return <FileText size={18} className="text-red-500 shrink-0" />;
    if (isWord) return <FileText size={18} className="text-blue-500 shrink-0" />;
    if (isSheet) return <Table size={18} className="text-emerald-500 shrink-0" />;
    if (isCode) return <FileCode size={18} className="text-purple-500 shrink-0" />;
    return <GenericFile size={18} className="text-gray-400 shrink-0" />;
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (downloading) return;
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
    <>
      {isImage ? (
        <div className="relative group overflow-hidden rounded-xl border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-gray-800/50 cursor-pointer w-48 sm:w-52 max-w-full shadow-xs transition hover:border-gray-300 dark:hover:border-white/20 flex flex-col">
          <div className="relative w-full h-36 sm:h-40 overflow-hidden bg-gray-100 dark:bg-gray-900/40 flex items-center justify-center">
            {isImageLoading ? (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <Loader size={20} className="animate-spin" />
              </div>
            ) : blobUrl ? (
              <img
                src={blobUrl}
                alt={attachment.originalName}
                onClick={() => setIsPreviewOpen(true)}
                className="w-full h-full object-cover transition duration-200 group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div
                onClick={() => setIsPreviewOpen(true)}
                className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-1"
              >
                <GenericFile size={24} />
                <span className="text-xs">Failed to load</span>
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() => setIsPreviewOpen(true)}
                className="p-2 rounded-full bg-white/25 hover:bg-white/40 text-white backdrop-blur-sm transition cursor-pointer"
                title="Preview"
              >
                <Eye size={16} />
              </button>
              <button
                type="button"
                onClick={handleDownload}
                disabled={downloading}
                className="p-2 rounded-full bg-white/25 hover:bg-white/40 text-white backdrop-blur-sm transition cursor-pointer disabled:opacity-50"
                title="Download"
              >
                {downloading ? <Loader size={16} className="animate-spin" /> : <Download size={16} />}
              </button>
            </div>
          </div>
          <div
            className="w-full px-2.5 py-1.5 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xs border-t border-gray-200/60 dark:border-white/5"
            title={attachment.originalName}
          >
            <p className="text-xs text-gray-700 dark:text-gray-300 truncate font-medium">
              {attachment.originalName}
            </p>
          </div>
        </div>
      ) : (
        <div
          onClick={() => setIsPreviewOpen(true)}
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-800/80 hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer max-w-sm group shadow-xs"
        >
          <div className="p-2 rounded-lg bg-gray-100 dark:bg-white/5">
            {getIcon()}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span
              className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate group-hover:text-blue-500 transition"
              title={attachment.originalName}
            >
              {attachment.originalName}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatSize(attachment.size)}
            </span>
          </div>
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-white/10 text-gray-500 hover:text-gray-800 dark:hover:text-white transition shrink-0 cursor-pointer disabled:opacity-50"
            title="Download"
          >
            {downloading ? <Loader size={15} className="animate-spin" /> : <Download size={15} />}
          </button>
        </div>
      )}

      {isPreviewOpen && (
        <FilePreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          attachment={attachment}
          isShared={isShared}
        />
      )}
    </>
  );
}
