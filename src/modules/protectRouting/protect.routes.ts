import { Router } from "express";
import { wrapAsync } from "~/utils/handler";

const protectRouter = Router();

protectRouter.post("/protect", (req, res) => {
    let msg = "You are not authorized";
    const { role } = req.body;
    if (role === 0) {
        return res.status(200).send("You are admin");
    } else if (role === 1) {
        return res.status(200).send("You are customer");
    } else if (role === 2) {
        return res.status(200).send("You are employee");
    } else {
        return res.status(401).json({ message: msg });
    }
});

export default protectRouter;
