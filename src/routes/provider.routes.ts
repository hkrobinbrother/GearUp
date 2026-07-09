import { Router } from "express";
import {
  addGear,
  updateGear,
  deleteGear,
  getProviderGear,
  getProviderOrders,
  updateOrderStatus,
} from "../controllers/provider.controller";
import { authenticate, authorize } from "../middleware/auth";
import validate from "../middleware/validate";
import {
  createGearSchema,
  updateGearSchema,
  gearIdParamSchema,
} from "../validations/gear.validation";
import { updateRentalStatusSchema } from "../validations/rental.validation";

const router = Router();

router.use(authenticate, authorize("PROVIDER"));

router.post("/gear", validate(createGearSchema), addGear);
router.get("/gear", getProviderGear);
router.put("/gear/:id", validate(updateGearSchema), updateGear);
router.delete("/gear/:id", validate(gearIdParamSchema), deleteGear);

router.get("/orders", getProviderOrders);
router.patch("/orders/:id", validate(updateRentalStatusSchema), updateOrderStatus);

export default router;
