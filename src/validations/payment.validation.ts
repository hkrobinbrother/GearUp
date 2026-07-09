import { z } from "zod";

export const createPaymentSchema = z.object({
  body: z.object({
    rentalOrderId: z.string().uuid("Invalid rental order ID"),
  }),
});

export const paymentIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid payment ID"),
  }),
});
