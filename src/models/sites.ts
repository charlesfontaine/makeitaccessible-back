import mongoose from 'mongoose';
import { ISite } from "./types/SiteInterface"

const siteSchema = new mongoose.Schema<ISite>({
  name: String,
  domain: String,
  createdAt: Date,
  updatedAt: Date,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'users', default: null },
});

const Site = mongoose.model<ISite>('sites', siteSchema);

export default Site;