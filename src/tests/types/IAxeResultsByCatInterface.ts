import { Result, IncompleteResult } from 'axe-core';

export interface IAxeResultsByCat {
  category: string;
  resultsByFilteredCategory: {
    inapplicable: Result[];
    passes: Result[];
    incomplete: IncompleteResult[];
    violations: Result[];
  };
}