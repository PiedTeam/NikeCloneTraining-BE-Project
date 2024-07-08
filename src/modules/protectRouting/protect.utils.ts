import { UserRole } from "../user/user.enum";
import rawRoutes from "./mapRouteWithRole.json";
import { routesConfig } from "./protect.configs";
import { Module, RouteConfig } from "./protect.schemas";

// Cast rawRoutes to unknown first, then to Module[]
const routes: Module[] = rawRoutes as unknown as Module[];

export function getOpenRoutes(): string[] {
    const openRoutes: string[] = [];

    // Filter routes where access_token is false
    routes.forEach((module: Module) => {
        for (const key in module.route) {
            const route = module.route[key];
            //if in case of multiple routes
            if (Array.isArray(route)) {
                route.forEach((r) => {
                    if (!r.access_token) {
                        openRoutes.push(r.api);
                    }
                });
            } else {
                if (!route.access_token) {
                    openRoutes.push(route.api);
                }
            }
        }
    });

    return openRoutes;
}

// match the route.contextPath with the req.path (/user/login) but take the first part only (/user)
// ex: /user/login -> /user : { contextPath: '/user', roles: [ 0,1 ]}
// ex: /user/login -> /admin : undefined
export function checkRole(
    requestPath: string,
    delimiter: string,
): RouteConfig | undefined {
    return routesConfig.find(
        (route) =>
            route.contextPath === delimiter + requestPath.split(delimiter)[1],
    );
}

// Type guard to check if a number is a valid UserRole
export function isValidUserRole(role: UserRole): boolean {
    return Object.values(UserRole).includes(role);
}
