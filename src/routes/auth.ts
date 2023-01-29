import { Router } from "express";
import { validate } from "../middleware/validators/index.js";
import {
  changePassword,
  login,
  oAuthLogin,
  register,
  resetPassword,
} from "../controllers/Auth.js";
import { verifyGoogleToken } from "../middleware/auth.js";

const router = Router();

router.post("/register", validate("register"), register);
router.post("/login", validate("login"), login);
router.post("/oauth_login", verifyGoogleToken, oAuthLogin);
router.post("/reset-password", validate("resetPassword"), resetPassword);
router.post("/change-password", validate("changePassword"), changePassword);

export default router;
