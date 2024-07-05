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

interface RouteConfig {
    path: string;
    roles: UserRole[];
}

export const routesConfig: RouteConfig[] = [
    {
        path: "/admin",
        roles: [UserRole.Employee, UserRole.Customer, UserRole.Admin],
    }, //Admin can access all
    { path: "/user", roles: [UserRole.Customer] }, // User only access to Customer
    { path: "/employee", roles: [UserRole.Employee] }, // Employee only access to Employee
];

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

// math the route.path with the req.path (/user/login) but take the first part only (/user)
export function checkRole(
    path: string,
    pattern: string,
): RouteConfig | undefined {
    return routesConfig.find(
        (route) => route.path === pattern + path.split(pattern)[1],
    );
}
