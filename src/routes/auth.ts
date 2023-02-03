import { Router } from "express";
import { validate } from "../middleware/validators";
import {
  changePassword,
  login,
  oAuthLogin,
  register,
  resetPassword,
} from "../controllers/Auth";
import { verifyGoogleToken } from "../middleware/auth";

const router = Router();

router.post("/register", validate("register"), register);
router.post("/login", validate("login"), login);
router.post("/oauth_login", verifyGoogleToken, oAuthLogin);
router.post("/reset-password", validate("resetPassword"), resetPassword);
router.post("/change-password", validate("changePassword"), changePassword);

export default router;
