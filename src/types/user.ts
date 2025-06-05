import { Permission } from "./permission";

export interface User {
    username: string, 
    available_roles: string[],
    accessToken: string
}

export interface UserPermission {
    accessToken: string,
    refreshToken: string,
    selected_role: string,
    permissionList: Permission[],
}