import { Router } from "express";
import { wrapAsync } from "~/utils/handler";
import { verifyTokenCapchaController } from "./capcha.controllers";

const capchaRouter = Router();

capchaRouter.get("/", (req, res) => {
    res.send("Hello Capcha");
});

/*
  * Description: Verify token capcha
  Path: /capcha/verify
  Method: POST
  Body: { capcha: string }
*/
capchaRouter.post("/verify", wrapAsync(verifyTokenCapchaController));

export default capchaRouter;
