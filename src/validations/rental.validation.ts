import { z } from "zod";

export const createRentalSchema = z.object({
  body: z
    .object({
      startDate: z.coerce.date({ errorMap: () => ({ message: "Valid startDate is required" }) }),
      endDate: z.coerce.date({ errorMap: () => ({ message: "Valid endDate is required" }) }),
      items: z
        .array(
          z.object({
            gearItemId: z.string().uuid("Invalid gear item ID"),
            quantity: z.number().int().positive("Quantity must be at least 1"),
          })
        )
        .min(1, "At least one gear item is required"),
    })
    .refine((data) => data.endDate > data.startDate, {
      message: "endDate must be after startDate",
      path: ["endDate"],
    }),
});

export const rentalIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid rental order ID"),
  }),
});

export const updateRentalStatusSchema = z.object({
  body: z.object({
    status: z.enum(["CONFIRMED", "CANCELLED", "PICKED_UP", "RETURNED"], {
      errorMap: () => ({
        message: "Status must be one of CONFIRMED, CANCELLED, PICKED_UP, RETURNED",
      }),
    }),
  }),
  params: z.object({
    id: z.string().uuid("Invalid rental order ID"),
  }),
});
