import { IUser } from "../../../models/types/UserInterface";

export type PublicUser = Pick<IUser, 'firstName' | 'lastName' | 'username' | 'email'>;
