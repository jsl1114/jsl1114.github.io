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
            className="bg-neutral-900/10 dark:bg-white/20 rounded-[2px] px-0.5"
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
      className="card p-6 rounded-2xl min-w-0"
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
              <h3 className="text-xl text-neutral-900 dark:text-white">
                <HighlightText text={msg.name} highlight={searchQuery} />
              </h3>
              <span className="text-sm text-[var(--color-muted)] dark:text-[var(--color-muted-dark)]">
                •
              </span>
              <span className="text-sm text-[var(--color-muted)] dark:text-[var(--color-muted-dark)]">
                {new Date(msg.createdAt).toLocaleDateString()}{" "}
                {new Date(msg.createdAt).toLocaleTimeString()}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 min-w-0">
              <a
                href={`mailto:${msg.email}`}
                className="text-[var(--color-muted)] dark:text-[var(--color-muted-dark)] text-sm underline underline-offset-4 break-all min-w-0"
              >
                <HighlightText text={msg.email} highlight={searchQuery} />
              </a>
              <button
                type="button"
                onClick={() => handleCopyEmail(msg.id, msg.email)}
                className="inline-flex items-center gap-1 rounded-full border border-black/10 dark:border-white/[.08] px-2.5 py-1 text-xs text-[var(--color-muted)] dark:text-[var(--color-muted-dark)] hover:border-black/35 dark:hover:border-white/35 transition-colors cursor-pointer shrink-0"
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
                className="pill pill-ghost group w-full sm:w-auto"
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
          <p className="text-[var(--color-muted)] dark:text-[var(--color-muted-dark)] whitespace-pre-wrap leading-[1.625]">
            <HighlightText text={msg.message} highlight={searchQuery} />
          </p>
        </CollapsibleContent>
      </Collapsible>
    </motion.div>
  );
};

export default AdminMessageItem;
