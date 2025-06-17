import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { validateSchema, authenticate, wrapAsync } from "@repo/common";
import {
  signupSchema,
  loginSchema,
  createRoomSchema,
} from "../schemas/user.schema";

const router: Router = Router();

router.post(
  "/signup",
  validateSchema(signupSchema),
  wrapAsync(UserController.signup)
);

router.post(
  "/login",
  validateSchema(loginSchema),
  wrapAsync(UserController.login)
);

router.post(
  "/room",
  authenticate,
  validateSchema(createRoomSchema),
  wrapAsync(UserController.createRoom)
);

router.get(
  "/room/:slug",
  authenticate,
  wrapAsync(UserController.getRoomBySlug)
);

router.get("/me", authenticate, wrapAsync(UserController.userProfile));

router.get(
  "/rooms/:roomId/chats",
  authenticate,
  wrapAsync(UserController.getRoomChats)
);

export default router;
