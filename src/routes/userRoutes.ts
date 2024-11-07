import express, { Router } from "express";
import {
  getProfile,
  getUsers,
  getUsersSearchPagination,
} from "../controllers/userController";
import { tryCatch } from "../utils/tryCatch";
import { authMiddleware } from "../middleware/authMiddleware";

const userRoutes: Router = express.Router();

userRoutes.get("/", authMiddleware, tryCatch(getUsers));
userRoutes.get(
  "/phan-trang-tim-kiem",
  authMiddleware,
  tryCatch(getUsersSearchPagination)
);
userRoutes.get("/profile", authMiddleware, tryCatch(getProfile));

export default userRoutes;
