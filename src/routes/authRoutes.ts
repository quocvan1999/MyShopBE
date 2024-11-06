import express, { Router } from "express";
import { tryCatch } from "../utils/tryCatch";
import {
  extendToken,
  login,
  sinup,
  loginFacebook,
  forgotPassword,
  changePassword,
  logout,
  resetPassword,
} from "../controllers/authController";

const authRoutes: Router = express.Router();

authRoutes.post("/sinup", tryCatch(sinup));
authRoutes.post("/login", tryCatch(login));
authRoutes.post("/logout", tryCatch(logout));
authRoutes.post("/login-facebook", tryCatch(loginFacebook));
authRoutes.post("/extend-token", tryCatch(extendToken));
authRoutes.post("/forgot-password", tryCatch(forgotPassword));
authRoutes.post("/change-password", tryCatch(changePassword));
authRoutes.post("/reset-password", tryCatch(resetPassword));
export default authRoutes;
