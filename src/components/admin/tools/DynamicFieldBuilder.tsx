import { useEffect, useMemo, useState } from "react";
import type { AgentFieldFormInput } from "../../../schemas/agentSchema";
import { useAppConfig } from "../../../hooks/useAppConfig";
import type { AgentFieldType } from "../../../types/type";
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from "lucide-react";

interface DynamicFieldBuilderProps {
  fields: AgentFieldFormInput[];
  onChange: (fields: AgentFieldFormInput[]) => void;
  errors?: any;
}

function SelectOptionsEditor({
  options,
  onChange,
  errorMessage,
}: {
  options: string[] | undefined;
  onChange: (options: string[]) => void;
  errorMessage?: string;
}) {
  const [text, setText] = useState(() => (options || []).join("\n"));

  // Sync if options change externally
  useEffect(() => {
    const currentClean = text
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const incoming = options || [];
    if (JSON.stringify(currentClean) !== JSON.stringify(incoming)) {
      setText(incoming.join("\n"));
    }
  }, [options]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setText(val);

    // Parse options while preserving user text in editor
    const parsed = val
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    onChange(parsed);
  };

  return (
    <div className="rounded-lg bg-gray-50 dark:bg-white/5 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
          Dropdown Options (one per line) <span className="text-red-500">*</span>
        </label>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {(options || []).length} configured
        </span>
      </div>
      <textarea
        rows={4}
        value={text}
        onChange={handleChange}
        placeholder={"Option 1\nOption 2\nOption 3"}
        className={`w-full rounded-lg border p-2.5 text-xs bg-white dark:bg-gray-900 font-mono focus:outline-none ${
          errorMessage
            ? "border-red-500 text-red-600 focus:border-red-500 focus:ring-1 focus:ring-red-500"
            : "border-gray-300 dark:border-white/10 text-gray-900 dark:text-white focus:border-indigo-500"
        }`}
      />
      {errorMessage && (
        <div className="flex items-center gap-1.5 text-2xs text-red-600 dark:text-red-400 font-medium">
          <AlertCircle className="size-3.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
      <p className="text-2xs text-gray-400 dark:text-gray-500">
        Press Enter or Shift+Enter to create a new option line. Empty lines will be trimmed
        automatically on submit.
      </p>
    </div>
  );
}

export default function DynamicFieldBuilder({
  fields,
  onChange,
  errors,
}: DynamicFieldBuilderProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(fields.length > 0 ? 0 : null);

  const { config } = useAppConfig();
  const maxDynamicFields = config.agent.maxDynamicFields;
  const fieldTypes = config.agent.fieldTypeList;

  // Track key occurrences to detect duplicates
  const keyCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    fields.forEach((f) => {
      const k = f.key?.trim().toLowerCase();
      if (k) {
        counts[k] = (counts[k] || 0) + 1;
      }
    });
    return counts;
  }, [fields]);

  const hasDuplicateKeys = useMemo(() => {
    return Object.values(keyCounts).some((count) => count > 1);
  }, [keyCounts]);

  const hasDuplicateSelectOptions = useMemo(() => {
    return fields.some((f) => {
      if (f.type !== "SELECT" || !f.selectOptions) return false;
      const norm = f.selectOptions.map((s) => s.trim()).filter(Boolean);
      return new Set(norm).size !== norm.length;
    });
  }, [fields]);

  const addField = () => {
    if (fields.length >= maxDynamicFields) return;
    const nextSortOrder = fields.length;
    const newField: AgentFieldFormInput = {
      key: `field_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
      label: `Field ${fields.length + 1}`,
      type: "SMALL_TEXT",
      isRequired: false,
      maxFile: 1,
      sortOrder: nextSortOrder,
      selectOptions: [],
    };
    const updated = [...fields, newField];
    onChange(updated);
    setExpandedIndex(updated.length - 1);
  };

  const removeField = (index: number) => {
    const updated = fields.filter((_, i) => i !== index);
    onChange(updated);
    if (expandedIndex === index) {
      setExpandedIndex(null);
    } else if (expandedIndex !== null && expandedIndex > index) {
      setExpandedIndex(expandedIndex - 1);
    }
  };

  const updateField = (index: number, patch: Partial<AgentFieldFormInput>) => {
    const updated = fields.map((f, i) => (i === index ? { ...f, ...patch } : f));
    onChange(updated);
  };

  const moveField = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === fields.length - 1)
    ) {
      return;
    }
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const updated = [...fields];
    const temp = updated[index];
    const target = updated[targetIndex];
    if (temp && target) {
      updated[index] = target;
      updated[targetIndex] = temp;
      updated.forEach((f, i) => {
        f.sortOrder = i;
      });
      onChange(updated);
      setExpandedIndex(targetIndex);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
            Dynamic Input Fields ({fields.length}/{maxDynamicFields})
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Define the inputs the user must provide (up to {maxDynamicFields} fields).
          </p>
        </div>
        <button
          type="button"
          onClick={addField}
          disabled={fields.length >= maxDynamicFields}
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <Plus className="size-3.5" />
          <span>Add Field</span>
        </button>
      </div>

      {hasDuplicateKeys && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 px-3.5 py-2.5 text-xs font-medium text-red-700 dark:text-red-300">
          <AlertCircle className="size-4 shrink-0 text-red-600 dark:text-red-400" />
          <span>Duplicate field keys detected. Each field must have a unique identifier key.</span>
        </div>
      )}

      {hasDuplicateSelectOptions && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 px-3.5 py-2.5 text-xs font-medium text-red-700 dark:text-red-300">
          <AlertCircle className="size-4 shrink-0 text-red-600 dark:text-red-400" />
          <span>
            Duplicate dropdown options detected in select fields. Each option must be unique.
          </span>
        </div>
      )}

      {fields.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 dark:border-white/10 p-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No input fields configured yet. Click "Add Field" to add user inputs.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {fields.map((field, idx) => {
            const isExpanded = expandedIndex === idx;
            const isSelect = field.type === "SELECT";
            const fieldKeyNorm = field.key?.trim().toLowerCase();
            const isDuplicate = fieldKeyNorm && (keyCounts[fieldKeyNorm] || 0) > 1;
            const selectOpts = (field.selectOptions || []).map((s) => s.trim()).filter(Boolean);
            const fieldHasDuplicateOptions =
              isSelect && new Set(selectOpts).size !== selectOpts.length;
            const fieldError = errors?.[idx];
            const labelErrorMessage = fieldError?.label?.message;
            const keyErrorMessage = fieldError?.key?.message;
            const selectErrorMessage = fieldError?.selectOptions?.message;
            const generalFieldErrorMessage =
              typeof fieldError?.message === "string"
                ? fieldError.message
                : typeof fieldError?.root?.message === "string"
                  ? fieldError.root.message
                  : undefined;
            const hasFieldError = Boolean(
              labelErrorMessage ||
              keyErrorMessage ||
              selectErrorMessage ||
              generalFieldErrorMessage,
            );

            return (
              <div
                key={field.id ? `f-${field.id}` : `idx-${idx}`}
                className={`rounded-xl border overflow-hidden shadow-xs transition-colors ${
                  isDuplicate || fieldHasDuplicateOptions || hasFieldError
                    ? "border-red-300 dark:border-red-800/60 bg-red-50/50 dark:bg-red-950/20"
                    : "border-gray-200 dark:border-white/10 bg-white dark:bg-gray-800/40"
                }`}
              >
                {/* Header row */}
                <div
                  onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                  className="flex items-center justify-between px-4 py-3 bg-gray-50/60 dark:bg-white/5 cursor-pointer hover:bg-gray-100/60 dark:hover:bg-white/10 transition-colors select-none"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-gray-200 dark:bg-white/10 text-xs font-semibold text-gray-700 dark:text-gray-300">
                      {idx + 1}
                    </span>
                    <span className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                      {field.label || `Field ${idx + 1}`}
                    </span>
                    <span className="shrink-0 rounded-md bg-gray-100 dark:bg-white/10 px-2 py-0.5 text-xs text-gray-600 dark:text-gray-400">
                      {field.type}
                    </span>
                    {field.isRequired && (
                      <span className="shrink-0 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50 px-2 py-0.5 text-xs font-medium">
                        Required
                      </span>
                    )}
                    {isDuplicate && (
                      <span className="shrink-0 rounded-full bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-400 border border-red-200 dark:border-red-800/50 px-2 py-0.5 text-xs font-medium">
                        Duplicate Key
                      </span>
                    )}
                    {fieldHasDuplicateOptions && (
                      <span className="shrink-0 rounded-full bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-400 border border-red-200 dark:border-red-800/50 px-2 py-0.5 text-xs font-medium">
                        Duplicate Options
                      </span>
                    )}
                    {hasFieldError && !isDuplicate && !fieldHasDuplicateOptions && (
                      <span className="shrink-0 rounded-full bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-400 border border-red-200 dark:border-red-800/50 px-2 py-0.5 text-xs font-medium">
                        {labelErrorMessage
                          ? "Label Required"
                          : keyErrorMessage
                            ? "Key Error"
                            : selectErrorMessage
                              ? "Options Error"
                              : "Error"}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveField(idx, "up")}
                      className="rounded-md p-1 text-gray-400 hover:text-gray-700 dark:hover:text-white disabled:opacity-30 cursor-pointer"
                      title="Move up"
                    >
                      <ArrowUp className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === fields.length - 1}
                      onClick={() => moveField(idx, "down")}
                      className="rounded-md p-1 text-gray-400 hover:text-gray-700 dark:hover:text-white disabled:opacity-30 cursor-pointer"
                      title="Move down"
                    >
                      <ArrowDown className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeField(idx)}
                      className="rounded-md p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 cursor-pointer"
                      title="Remove field"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                      className="rounded-md p-1 text-gray-400 hover:text-gray-700 dark:hover:text-white cursor-pointer"
                    >
                      {isExpanded ? (
                        <ChevronUp className="size-4" />
                      ) : (
                        <ChevronDown className="size-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Collapsible config */}
                {isExpanded && (
                  <div className="p-4 space-y-3 border-t border-gray-100 dark:border-white/5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Field Label <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={field.label}
                          onChange={(e) => updateField(idx, { label: e.target.value })}
                          placeholder="e.g. Upload your CV"
                          className={`w-full rounded-lg border px-3 py-1.5 text-xs bg-white dark:bg-gray-900 focus:outline-none ${
                            labelErrorMessage
                              ? "border-red-500 text-red-600 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                              : "border-gray-300 dark:border-white/10 text-gray-900 dark:text-white focus:border-indigo-500"
                          }`}
                        />
                        {labelErrorMessage && (
                          <p className="mt-1 text-2xs text-red-500 font-medium">
                            {labelErrorMessage}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Field Key (identifier) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={field.key}
                          onChange={(e) =>
                            updateField(idx, {
                              key: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_"),
                            })
                          }
                          placeholder="e.g. cv_file, job_description"
                          className={`w-full rounded-lg border px-3 py-1.5 text-xs font-mono bg-white dark:bg-gray-900 focus:outline-none ${
                            isDuplicate || keyErrorMessage
                              ? "border-red-500 text-red-600 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                              : "border-gray-300 dark:border-white/10 text-gray-900 dark:text-white focus:border-indigo-500"
                          }`}
                        />
                        {isDuplicate && (
                          <p className="mt-1 text-2xs text-red-500 font-medium">
                            Duplicate key! Field keys must be unique.
                          </p>
                        )}
                        {!isDuplicate && keyErrorMessage && (
                          <p className="mt-1 text-2xs text-red-500 font-medium">
                            {keyErrorMessage}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Field Type
                        </label>
                        <select
                          value={field.type}
                          onChange={(e) =>
                            updateField(idx, {
                              type: e.target.value as AgentFieldType,
                            })
                          }
                          className="w-full rounded-lg border border-gray-300 dark:border-white/10 px-3 py-1.5 text-xs bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500"
                        >
                          {fieldTypes.map((t) => (
                            <option key={t.value} value={t.value}>
                              {t.label} ({t.desc})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center gap-2 pt-4">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={field.isRequired}
                            onChange={(e) => updateField(idx, { isRequired: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                          Required field
                        </span>
                      </div>
                    </div>

                    {/* SELECT options configuration */}
                    {isSelect && (
                      <SelectOptionsEditor
                        options={field.selectOptions}
                        onChange={(opts) => updateField(idx, { selectOptions: opts })}
                        errorMessage={selectErrorMessage}
                      />
                    )}

                    {generalFieldErrorMessage && (
                      <p className="text-2xs text-red-500 font-medium">
                        {generalFieldErrorMessage}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
