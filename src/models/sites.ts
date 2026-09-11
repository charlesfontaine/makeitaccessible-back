import mongoose, { Types } from 'mongoose';

export interface ISite {
  name: string;
  domain: string;
  createdAt: Date;
  updatedAt: Date;
  user: Types.ObjectId;
}

const siteSchema = new mongoose.Schema<ISite>({
  name: String,
  domain: String,
  createdAt: Date,
  updatedAt: Date,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'users', default: null },
});

const Site = mongoose.model<ISite>('sites', siteSchema);

export default Site;