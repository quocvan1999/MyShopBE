import express, { Router } from "express";
import userRoutes from "./userRoutes";
import authRoutes from "./authRoutes";

const rootRoutes: Router = express.Router();

rootRoutes.use("/users", userRoutes);
rootRoutes.use("/auth", authRoutes);

export default rootRoutes;
