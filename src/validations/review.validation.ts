import { z } from "zod";

export const createReviewSchema = z.object({
  body: z.object({
    gearItemId: z.string().uuid("Invalid gear item ID"),
    rating: z.number().int().min(1, "Rating must be 1-5").max(5, "Rating must be 1-5"),
    comment: z.string().max(1000).optional(),
  }),
});
