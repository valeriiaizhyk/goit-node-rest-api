import express from "express";
import validateBody from "../helpers/validateBody.js";
import { userSchema } from "../schemas/usersSchemas.js";
import authMiddleware from "../middleware/auth.js";
import authControllers from "../controllers/authControllers.js";

const authRouter = express.Router();
const jsonParser = express.json();

authRouter.post(
  "/register",
  jsonParser,
  validateBody(userSchema),
  authControllers.register
);
authRouter.post(
  "/login",
  jsonParser,
  validateBody(userSchema),
  authControllers.login
);
authRouter.post("/logout", jsonParser, authMiddleware, authControllers.logout);
authRouter.get("/current", jsonParser, authMiddleware, authControllers.getUser);

export default authRouter;
