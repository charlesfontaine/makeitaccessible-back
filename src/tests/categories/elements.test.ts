import { AxeResults } from "axe-core";

// Filtre les anomalies de la thématique Elements Obligatoires <=> RGAA-8.
const scanElements = (audit: AxeResults) => {
  let inapplicable = audit.inapplicable.filter(item => item.tags.some(tag => tag.includes('RGAA-8.')));
  let passes = audit.passes.filter(item => item.tags.some(tag => tag.includes('RGAA-8.')));
  let incomplete = audit.incomplete.filter(item => item.tags.some(tag => tag.includes('RGAA-8.')));
  let violations = audit.violations.filter(item => item.tags.some(tag => tag.includes('RGAA-8.')));

  return {
    inapplicable,
    passes,
    incomplete,
    violations
  };
};

export { scanElements }
