import { Router } from "express";
import { getAllGear, getGearById, getAllCategories } from "../controllers/gear.controller";
import validate from "../middleware/validate";
import { gearIdParamSchema } from "../validations/gear.validation";

const router = Router();

router.get("/gear", getAllGear);
router.get("/gear/:id", validate(gearIdParamSchema), getGearById);
router.get("/categories", getAllCategories);

export default router;
