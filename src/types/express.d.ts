// Merge user key types for User interface asked by passport

import { IUser } from "../models/types/UserInterface";

declare global {
  namespace Express {
    interface User extends IUser {}
  }
}

export { };
