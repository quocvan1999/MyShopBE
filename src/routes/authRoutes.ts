import express, { Router } from "express";
import { tryCatch } from "../utils/tryCatch";
import { sinup } from "../controllers/authController";

const authRoutes: Router = express.Router();

authRoutes.use("/sinup", tryCatch(sinup));

export default authRoutes;
