import { Router } from "express";
import {
  login,
  loginValidator,
  register,
  registerValidator,
  activate
} from "./controllers/auth.ctrl";
import { getAll } from "./controllers/user.ctrl";

const AuthRouter = Router();
AuthRouter.post("/login", loginValidator, login);
AuthRouter.post("/register", registerValidator, register);
AuthRouter.get("/activate/:activationToken", activate);
export { AuthRouter };

const UserRouter = Router();
UserRouter.get("/", getAll);
export { UserRouter };

const SwaggerAPIRouter = Router();
export { SwaggerAPIRouter };
