import { Router } from "express";
import { wrapAsync } from "~/utils/handler";
import { verifyTokenCapchaController } from "./capcha.controllers";

const captchaRouter = Router();

captchaRouter.get("/", (req, res) => {
    res.send("Hello Capcha");
});

/*
  * Description: Verify token capcha
  Path: /capcha/verify
  Method: POST
  Body: { capcha: string }
*/
captchaRouter.post("/verify", wrapAsync(verifyTokenCapchaController));

export default captchaRouter;
