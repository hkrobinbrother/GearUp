import { Router } from "express";
import {
  createPayment,
  confirmPayment,
  getMyPayments,
  getPaymentById,
} from "../controllers/payment.controller";
import { authenticate, authorize } from "../middleware/auth";
import validate from "../middleware/validate";
import { createPaymentSchema, paymentIdParamSchema } from "../validations/payment.validation";

const router = Router();

// NOTE: the raw Stripe webhook route (/api/payments/webhook) is mounted
// separately in app.ts, BEFORE the global JSON parser, because Stripe
// signature verification needs the untouched raw body.

// Manual confirm (JSON body, requires login) - used for Postman/grading flow.
router.post("/confirm", authenticate, confirmPayment);

router.use(authenticate);
router.post("/create", authorize("CUSTOMER"), validate(createPaymentSchema), createPayment);
router.get("/", getMyPayments);
router.get("/:id", validate(paymentIdParamSchema), getPaymentById);

export default router;
