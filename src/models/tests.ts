import mongoose, { Types } from 'mongoose';

export interface ITests {
  category: string;
  inapplicable: string;
  passes: string;
  incomplete: string;
  violations: string;
  audit: Types.ObjectId;
}

// testDoc entier (représente une thématique RGAA contenant les tests d'accessibilité par type : violations, passes, incomplete, innaplicable)
// dans les types violations, passes, incomplete et innaplicable, sont insérées les règles Axe-core
const testSchema = new mongoose.Schema<ITests>({
  category: String,
  inapplicable: Array,
  passes: Array,
  incomplete: Array,
  violations: Array,
  audit: { type: mongoose.Schema.Types.ObjectId, ref: 'audits' }, // ref. vers la collection audits
});

const Test = mongoose.model<ITests>('tests', testSchema);

export default Test;