import mongoose from 'mongoose';
import { ITest } from "./types/TestInterface";

// testDoc entier (représente une thématique RGAA contenant les tests d'accessibilité par type : violations, passes, incomplete, innaplicable)
// dans les types violations, passes, incomplete et innaplicable, sont insérées les règles Axe-core
const testSchema = new mongoose.Schema<ITest>({
  category: String,
  inapplicable: Array,
  passes: Array,
  incomplete: Array,
  violations: Array,
  audit: { type: mongoose.Schema.Types.ObjectId, ref: 'audits' }, // ref. vers la collection audits
});

const Test = mongoose.model<ITest>('tests', testSchema);

export default Test;