import { UserRole } from "../user/user.enum";
import { RouteConfig } from "./protect.schemas";

export const routesConfig: RouteConfig[] = [
    {
        contextPath: "/admin",
        roles: [UserRole.Admin],
    }, //Admin can access all
    { contextPath: "/user", roles: [UserRole.Customer, UserRole.Admin] }, // User only access to Customer
    { contextPath: "/employee", roles: [UserRole.Employee, UserRole.Admin] }, // Employee only access to Employee
];
