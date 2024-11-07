import express, { Router } from "express";
import { getProfile, getUsers } from "../controllers/userController";
import { tryCatch } from "../utils/tryCatch";
import { authMiddleware } from "../middleware/authMiddleware";

const userRoutes: Router = express.Router();

userRoutes.get("/", authMiddleware, tryCatch(getUsers));
userRoutes.get("/profile", authMiddleware, tryCatch(getProfile));

export default userRoutes;
