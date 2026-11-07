import z from "zod";
import { AGENT_FIELD_TYPES, MAX_AGENT_DYNAMIC_FIELDS } from "../types/type";

export const agentFieldFormSchema = z
  .object({
    id: z.number().optional(),
    key: z
      .string()
      .min(1, "Key is required")
      .regex(/^[a-zA-Z0-9_]+$/, "Letters, numbers, and underscores only"),
    label: z.string().min(1, "Label is required"),
    type: z.enum(AGENT_FIELD_TYPES),
    isRequired: z.boolean(),
    maxFile: z.number(),
    selectOptions: z.array(z.string()).optional(),
    sortOrder: z.number(),
  })
  .superRefine((data, ctx) => {
    if (data.type === "SELECT") {
      const validOptions = (data.selectOptions || []).map((s) => s.trim()).filter(Boolean);
      if (validOptions.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Select options are required for SELECT fields",
          path: ["selectOptions"],
        });
      } else {
        const seen = new Set<string>();
        const duplicates = new Set<string>();
        for (const opt of validOptions) {
          if (seen.has(opt)) {
            duplicates.add(opt);
          } else {
            seen.add(opt);
          }
        }
        if (duplicates.size > 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Duplicate dropdown options are not allowed: ${Array.from(duplicates)
              .map((d) => `"${d}"`)
              .join(", ")}`,
            path: ["selectOptions"],
          });
        }
      }
    }
  });

export const agentFormSchema = z
  .object({
    name: z.string().min(1, "Agent name is required").max(120),
    description: z.string().max(2000).optional(),
    systemPrompt: z.string().min(1, "System prompt is required"),
    status: z.enum(["ACTIVE", "INACTIVE"]),
    inputFields: z
      .array(agentFieldFormSchema)
      .min(1, "At least one input field is required")
      .max(
        MAX_AGENT_DYNAMIC_FIELDS,
        `A maximum of ${MAX_AGENT_DYNAMIC_FIELDS} dynamic fields is allowed`,
      ),
  })
  .superRefine((data, ctx) => {
    const keys = data.inputFields.map((f) => f.key.trim().toLowerCase());
    const duplicates = keys.filter((key, idx) => keys.indexOf(key) !== idx);
    if (duplicates.length > 0) {
      const uniqueDups = Array.from(new Set(duplicates));
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Duplicate field key "${uniqueDups.join(", ")}" is not allowed. Each field must have a unique key.`,
        path: ["inputFields"],
      });
    }
  });

export type AgentFieldFormInput = z.infer<typeof agentFieldFormSchema>;
export type AgentFormInput = z.infer<typeof agentFormSchema>;
