import { UserRole } from "../user/user.enum";

export interface Route {
    api: string;
    method: string;
    access_token: boolean;
}

// Interface for a Module object with nested routes
export interface Module {
    module: string;
    route: Record<string, Route | Route[]>;
}

export interface RouteConfig {
    contextPath: string;
    roles: UserRole[];
}

export type RequestPath = string;
