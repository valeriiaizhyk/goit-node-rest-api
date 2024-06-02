import express from "express";
import validateBody from "../helpers/validateBody.js";
import { resendVerifySchema } from "../schemas/usersSchemas.js";
import UsersController from "../controllers/usersControllers.js";
import authMiddleware from "../middleware/auth.js";
import uploadMiddleware from "../middleware/avatar.js";

const usersRouter = express.Router();
const jsonParser = express.json();

usersRouter.patch(
  "/avatars",
  authMiddleware,
  uploadMiddleware.single("avatar"),
  UsersController.updateAvatar
);
usersRouter.get("/avatar", authMiddleware, UsersController.getAvatar);

usersRouter.get("/verify/verificationToken", UsersController.verify);
usersRouter.post(
  "/verify",
  jsonParser,
  validateBody(resendVerifySchema),
  UsersController.resendVerify
);

export default usersRouter;
