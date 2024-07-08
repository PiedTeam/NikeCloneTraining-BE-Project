export const PROTECT_MESSAGES = {
    ROLE_ADMIN: "You are admin",
    ROLE_CUSTOMER: "You are customer",
    ROLE_EMPLOYEE: "You are employee",
    ROLE_NOT_FOUND: "Role not found",
    ROLE_NOT_VALID: "Role not valid",
    ACCESS_DENIED: "Access denied",
    UNAUTHORIZED: "Unauthorized",
    ROUTE_AND_ROLE_MIS_MATCH_SEEM_WRONG_AT_ROUTES_CONFIG:
        "Route and role mismatch seem wrong at routes config",
    ROUTES_CONFIG_WRONG: "Routes config is wrong",
    MISSING_ACCESS_TOKEN: "Missing access token",
} as const;
