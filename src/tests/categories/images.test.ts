import { AxeResults } from "axe-core";

// Filtre les resultats (inapplicable, passes, incomplete et violiations "aka" anomalies) liées RGAA par thématique : thématique Images <=> RGAA-1.
const scanImages = (audit: AxeResults) => {
  let inapplicable = audit.inapplicable.filter(item => item.tags.some(tag => tag.includes('RGAA-1.')));
  let passes = audit.passes.filter(item => item.tags.some(tag => tag.includes('RGAA-1.')));
  let incomplete = audit.incomplete.filter(item => item.tags.some(tag => tag.includes('RGAA-1.')));
  let violations = audit.violations.filter(item => item.tags.some(tag => tag.includes('RGAA-1.')));

  return {
    inapplicable,
    passes,
    incomplete,
    violations
  };
};

export { scanImages }
