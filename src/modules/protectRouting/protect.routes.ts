import { Router } from "express";
import { protectRouterValidator } from "./protect.middlewares";

const protectRouter = Router();

protectRouter.use(protectRouterValidator);

export default protectRouter;
