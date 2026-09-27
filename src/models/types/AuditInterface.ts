import { Types } from 'mongoose';

export interface IAudit {
  url: string | undefined;
  status: string;
  createdAt: Date;
  summary: {
    inapplicable: number;
    passes: number;
    incomplete: number;
    violations: number;
    total: number;
    score: number;
  };
  site: Types.ObjectId;
  user: Types.ObjectId;
}