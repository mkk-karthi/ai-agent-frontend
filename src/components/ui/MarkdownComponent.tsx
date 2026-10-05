import { Markdown, type MarkdownProps } from "@tanstack/markdown/react";
import { CodeXml } from "lucide-react";
import React, { useState } from "react";

interface MarkdownComponentProps extends Partial<MarkdownProps> {
  source: string;
}

export const MarkdownComponent = ({ source, ...props }: MarkdownComponentProps) => {
  return (
    <div className="prose max-w-full dark:prose-invert prose-code:bg-gray-200/80 dark:prose-code:bg-gray-700/80 prose-code:before:content-[''] prose-code:after:content-[''] prose-code:rounded prose-code:px-1 prose-code:py-0.5 prose-code:font-normal prose-pre:prose-code:bg-transparent">
      <Markdown
        {...props}
        components={{
          pre: (props: any) => {
            const [copied, setCopied] = useState(false);

            // Extract text content safely from children
            const extractText = (node: any): string => {
              if (typeof node === "string") return node;
              if (node?.props?.children) {
                return React.Children.map(node.props.children, extractText).join("");
              }
              return "";
            };

            const codeText = extractText(props.children);

            const handleCopy = () => {
              navigator.clipboard.writeText(codeText);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            };

            return (
              <div className="relative group my-4">
                <div className="absolute top-2 flex justify-between w-full">
                  <div className="flex gap-2 items-center text-base mx-4 text-gray-500">
                    <CodeXml size={14} />
                    {props["data-lang"]}
                  </div>
                  <button
                    onClick={handleCopy}
                    className="mx-2 px-2 py-1 text-xs bg-gray-600 dark:bg-gray-700 text-white rounded hover:bg-gray-600 transition"
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
                <pre
                  {...props}
                  className="p-4 pt-10 bg-gray-200/50 dark:bg-gray-800/80 text-gray-800 dark:text-gray-100 rounded-2xl overflow-x-auto"
                />
              </div>
            );
          },
        }}
      >
        {source}
      </Markdown>
    </div>
  );
};
