import { NextFunction, Request, Response, Router } from "express";
import { accessTokenValidator } from "../user/user.middlewares";
const routes: Module[] = require("./mapRouteWithRole.json");

const protectRouter = Router();

// Interface for a Route object within a module
interface Route {
    api: string;
    method: string;
    role: number;
    access_token: boolean;
}

// Interface for a Module object with nested routes
interface Module {
    module: string;
    route: { [key: string]: Route };
}

const openRoutes: string[] = [];

// Filter routes where access_token is false
routes.forEach((module: Module) => {
    for (const key in module.route) {
        if (!module.route[key].access_token) {
            openRoutes.push(module.route[key].api);
        }
    }
});

protectRouter.use((req: Request, res: Response, next: NextFunction) => {
    const url = req.path;

    console.log("size: " + openRoutes.length);

    openRoutes.forEach((route) => console.log(route));

    console.log(openRoutes.includes(url));

    if (openRoutes.includes(url)) {
        return next();
    }
    accessTokenValidator(req, res, next);
});

export default protectRouter;
