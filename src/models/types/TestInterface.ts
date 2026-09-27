import { Types } from 'mongoose';

export interface ITest {
  category: string;
  inapplicable: string;
  passes: string;
  incomplete: string;
  violations: string;
  audit: Types.ObjectId;
}