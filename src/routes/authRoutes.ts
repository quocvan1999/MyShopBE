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
  verifyEmail,
  sendCodeVerifyEmail,
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
authRoutes.post("/send-code-verify-email", tryCatch(sendCodeVerifyEmail));
authRoutes.post("/verify-email", tryCatch(verifyEmail));
export default authRoutes;
