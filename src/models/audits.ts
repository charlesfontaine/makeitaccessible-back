import mongoose, { Types } from 'mongoose';

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

const auditSchema = new mongoose.Schema<IAudit>({
  url: { type: String, default: null }, // url du site à auditer
  status: { type: String, default: "pending" }, // status d'état de l'analyse renvoyé par axe-core
  createdAt: { type: Date, default: Date.now() }, // date de création de l'audit
  summary: {
    inapplicable: { type: Number, default: 0 }, // nombre total de critères inapplicables
    passes: { type: Number, default: 0 }, // nombre total de critères validés
    incomplete: { type: Number, default: 0 }, // nombre total de critères incomplet
    violations: { type: Number, default: 0 }, // nombre total de critères en anomalie
    total: { type: Number, default: 0 }, // nombre total de critères évalués
    score: { type: Number, default: 0 }, // pourcentage de réussite : (passes / (passes + incomplete + violations) * 100)
  },
  site: { type: mongoose.Schema.Types.ObjectId, ref: "sites", default: null }, // réf. vers la collection sites
  user: { type: mongoose.Schema.Types.ObjectId, ref: "users", default: null } // réf. vers la collections users
});

const Audit = mongoose.model<IAudit>("audits", auditSchema);

export default Audit;
