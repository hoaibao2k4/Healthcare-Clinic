export interface Supporter {
    supporterId?: number,
    username: string,
    fullName: string,
    email: string,
    phoneNumber: string,
    password: string,
    staffTitle: string,
    id?: number,
    isNew?: boolean
    roles: string[]
}