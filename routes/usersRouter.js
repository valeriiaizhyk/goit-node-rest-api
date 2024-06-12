import express from "express";
import validateBody from "../helpers/validateBody.js";
import { userSchema } from "../schemas/usersSchemas.js";
import UsersController from "../controllers/usersControllers.js";
import authMiddleware from "../middleware/auth.js";
import uploadMiddleware from "../middleware/avatar.js";

const usersRouter = express.Router();
const jsonParser = express.json();

usersRouter.post(
  "/register",
  jsonParser,
  validateBody(userSchema),
  UsersController.register
);
usersRouter.post(
  "/login",
  jsonParser,
  validateBody(userSchema),
  UsersController.login
);
usersRouter.post("/logout", jsonParser, authMiddleware, UsersController.logout);
usersRouter.get(
  "/current",
  jsonParser,
  authMiddleware,
  UsersController.getUser
);
usersRouter.patch(
  "/avatars",
  authMiddleware,
  uploadMiddleware.single("avatar"),
  UsersController.updateAvatar
);
usersRouter.get("/avatar", authMiddleware, UsersController.getAvatar);

export default usersRouter;
