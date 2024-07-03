import { Router } from "express";
import { accessTokenValidator } from "../user/user.middlewares";
import { protectRouterValidator } from "./protect.middlewares";

const protectRouter = Router();

protectRouter.use(protectRouterValidator);

export default protectRouter;
