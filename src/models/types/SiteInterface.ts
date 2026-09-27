import { Types } from 'mongoose';

export interface ISite {
  name: string;
  domain: string;
  createdAt: Date;
  updatedAt: Date;
  user: Types.ObjectId;
}