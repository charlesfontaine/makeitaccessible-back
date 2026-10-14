import { Result } from 'axe-core';
import { Types } from 'mongoose';

// type TestResult = Result & { status: string; comment: string | null }

export type RulesType = 'inapplicable' | 'passes' | 'incomplete' | 'violations';

export interface ITestResult extends Result {
  status: string;
  comment: string;
}

export interface ITest {
  category: string;
  inapplicable: ITestResult[];
  passes: ITestResult[];
  incomplete: ITestResult[];
  violations: ITestResult[];
  audit: Types.ObjectId;
}