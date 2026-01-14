import { motion } from "framer-motion";
import { Trash2, Copy, Check, ChevronDown } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const HighlightText = ({ text, highlight }) => {
  if (!highlight || !text) return text;

  const parts = String(text).split(new RegExp(`(${highlight})`, "gi"));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <span
            key={i}
            className="bg-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-100 rounded-[2px] px-0.5"
          >
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  );
};

const AdminMessageItem = ({
  msg,
  handleCopyEmail,
  copiedMessageId,
  deleteMessage,
  searchQuery,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-neutral-900 p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-shadow min-w-0"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.defaultPrevented) return;
        if (e.key === "c" || e.key === "C") {
          e.preventDefault();
          handleCopyEmail(msg.id, msg.email);
        }
      }}
    >
      <Collapsible defaultOpen={false}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2 min-w-0">
              <h3 className="font-semibold text-lg text-neutral-900 dark:text-white">
                <HighlightText text={msg.name} highlight={searchQuery} />
              </h3>
              <span className="text-sm text-neutral-500 dark:text-neutral-400">
                •
              </span>
              <span className="text-sm text-neutral-500 dark:text-neutral-400">
                {new Date(msg.createdAt).toLocaleDateString()}{" "}
                {new Date(msg.createdAt).toLocaleTimeString()}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 min-w-0">
              <a
                href={`mailto:${msg.email}`}
                className="text-blue-600 dark:text-blue-400 text-sm hover:underline break-all min-w-0"
              >
                <HighlightText text={msg.email} highlight={searchQuery} />
              </a>
              <button
                type="button"
                onClick={() => handleCopyEmail(msg.id, msg.email)}
                className="inline-flex items-center gap-1 rounded-md border border-neutral-200 dark:border-neutral-800 px-2 py-1 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer shrink-0"
                title="Copy email (or press C while focused)"
                aria-label={`Copy ${msg.email} to clipboard`}
              >
                {copiedMessageId === msg.id ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start w-full sm:w-auto">
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="group inline-flex items-center justify-center gap-1 rounded-lg bg-neutral-100 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700 transition-colors hover:cursor-pointer w-full sm:w-auto"
                aria-label="Toggle message"
              >
                <span className="sm:hidden">View</span>
                <span className="hidden sm:inline">View</span>
                <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
              </button>
            </CollapsibleTrigger>

            <button
              onClick={() => deleteMessage(msg.id)}
              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors hover:cursor-pointer self-end sm:self-auto bg-red-50 dark:bg-red-900/20 w-full sm:w-auto sm:bg-transparent dark:sm:bg-transparent flex items-center justify-center sm:flex-none"
              title="Delete message"
            >
              <Trash2 className="w-5 h-5" />
              <div className="pl-1 sm:hidden">Delete</div>
            </button>
          </div>
        </div>

        <CollapsibleContent className="mt-4 p-2">
          <p className="text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap leading-relaxed">
            <HighlightText text={msg.message} highlight={searchQuery} />
          </p>
        </CollapsibleContent>
      </Collapsible>
    </motion.div>
  );
};

export default AdminMessageItem;
