import { Router } from "express";
import { wrapAsync } from "~/utils/handler";
import { accessTokenValidator } from "../user/user.middlewares";
import { registerPassword } from "./pass.controllers";
import { registerPasswordValidator } from "./pass.middleware";

const passwordRouter = Router();
passwordRouter.post(
    "/updatePass",
    accessTokenValidator,
    registerPasswordValidator,
    wrapAsync(registerPassword),
);

export default passwordRouter;
