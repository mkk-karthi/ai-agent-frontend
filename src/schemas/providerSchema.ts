import z from "zod";

export const providerSchema = z
  .object({
    token: z.string().transform((v) => v.trim()),
    status: z.enum(["ACTIVE", "INACTIVE"]),
  })
  .partial()
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: "Either token or status must be provided",
    path: [],
  });

export type providerInput = z.infer<typeof providerSchema>;
