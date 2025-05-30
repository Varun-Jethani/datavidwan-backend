import { Router } from "express";

import { verifyJWT } from "../middlewares/userAuth.middleware.js";

import {
  loginUser,
  logoutUser,
  registerUser,
  userProfile,
  validateToken,
} from "../controllers/user.controller.js";

const userRouter = Router();
userRouter.route("/register").post(registerUser);
userRouter.route("/login").post(loginUser);
userRouter.route("/logout").post(logoutUser);

userRouter.route("/profile").get(verifyJWT, userProfile);


export default userRouter;
