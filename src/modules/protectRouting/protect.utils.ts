import { UserRole } from "../user/user.enum";

const routes: Module[] = require("./mapRouteWithRole.json");

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

export function getOpenRoutes(): string[] {
    const openRoutes: string[] = [];

    // Filter routes where access_token is false
    routes.forEach((module: Module) => {
        for (const key in module.route) {
            if (!module.route[key].access_token) {
                openRoutes.push(module.route[key].api);
            }
        }
    });

    return openRoutes;
}

export function checkRole(role: UserRole): void {
    if (role === UserRole.Admin) {
        console.log("User are Admin");
    } else if (role === UserRole.Customer) {
        console.log("User are Customer");
    } else {
        console.log("User are Employee");
    }
}
