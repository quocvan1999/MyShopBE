import express, { Router } from "express";
import { getUsers } from "../controllers/userController";
import { tryCatch } from "../utils/tryCatch";
import { authMiddleware } from "../middleware/authMiddleware";

const userRoutes: Router = express.Router();

userRoutes.use("/", authMiddleware, tryCatch(getUsers));

export default userRoutes;
