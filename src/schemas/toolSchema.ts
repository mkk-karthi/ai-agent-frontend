import z from "zod";

export const toolSchema = z.object({
  name: z.string().min(1, "Tool name is required").max(120),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});

export type ToolFormInput = z.infer<typeof toolSchema>;
