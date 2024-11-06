import express, { Router } from "express";
import { tryCatch } from "../utils/tryCatch";
import { extendToken, login, sinup } from "../controllers/authController";

const authRoutes: Router = express.Router();

authRoutes.use("/sinup", tryCatch(sinup));
authRoutes.use("/login", tryCatch(login));
authRoutes.use("/extend-token", tryCatch(extendToken));
export default authRoutes;
