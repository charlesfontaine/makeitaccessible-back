import { UserType } from "./UserType";

export type UserUpdatePayload = Omit<UserType, 'token'>;