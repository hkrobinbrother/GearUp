import { z } from "zod";

export const updateUserStatusSchema = z.object({
  body: z.object({
    status: z.enum(["ACTIVE", "SUSPENDED"], {
      errorMap: () => ({ message: "Status must be ACTIVE or SUSPENDED" }),
    }),
  }),
  params: z.object({
    id: z.string().uuid("Invalid user ID"),
  }),
});
