import { Types } from "mongoose"; 

export type SignupUserType = {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  auditId?: string | Types.ObjectId;
  websiteId?: string | Types.ObjectId;
}