import { Router } from "express";
import { createRental, getMyRentals, getRentalById } from "../controllers/rental.controller";
import { authenticate, authorize } from "../middleware/auth";
import validate from "../middleware/validate";
import { createRentalSchema, rentalIdParamSchema } from "../validations/rental.validation";

const router = Router();

router.use(authenticate);

router.post("/", authorize("CUSTOMER"), validate(createRentalSchema), createRental);
router.get("/", getMyRentals);
router.get("/:id", validate(rentalIdParamSchema), getRentalById);

export default router;
