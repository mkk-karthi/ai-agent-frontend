import z from "zod";

export const shareConversationSchema = z
  .object({
    type: z.string().min(1, "Share option is required"),
    userMails: z.array(z.email("Invalid email")).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === "SPECIFIC_USER") {
      if (!data.userMails || data.userMails.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "At least one email is required for specific users",
          path: ["userMails"],
        });
      }
    }
  });

export type ShareConversationInput = z.infer<typeof shareConversationSchema>;
