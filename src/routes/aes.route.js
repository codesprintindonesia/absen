import express from "express";
import { encryptData, decryptData } from "../middlewares/aes.middleware.js";

const router = express.Router();

router.post("/encrypt", (req, res) => {
  const encryptedData = encryptData(req.body);
  res.json({ encryptedData });
});

router.post("/decrypt", (req, res) => {
  const { encryptedData } = req.body;
  const responseData = decryptData(encryptedData);
  res.json(responseData);
});

export default router;
