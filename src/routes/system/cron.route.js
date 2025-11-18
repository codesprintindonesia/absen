// src/routes/system/cron.route.js
import { Router } from "express";
import getCronStatusController from "../../controllers/system/cron/status.controller.js";

const router = Router(); 

router.get("/status", getCronStatusController);

export default router;
