import express, { Router } from "express";
import { tryCatch } from "../utils/tryCatch";
import { extendToken, login, sinup } from "../controllers/authController";

const authRoutes: Router = express.Router();

authRoutes.post("/sinup", tryCatch(sinup));
authRoutes.post("/login", tryCatch(login));
authRoutes.post("/extend-token", tryCatch(extendToken));
export default authRoutes;
