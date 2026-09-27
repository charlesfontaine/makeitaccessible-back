import { Types } from 'mongoose';
 
export type SigninUserType = {
  username: string,
  password: string,
  auditId?: string | Types.ObjectId;
  websiteId?: string | Types.ObjectId;
}