var { chromium } = require("playwright");
var frLocale = require("axe-core/locales/fr.json"); // locale FR officielle
var scanImages = require('./categories/images.test.js')

const categories = [
  { name: 'Images', scan: scanImages }, // scan = scanImages
];

async function runAllTests(url) {
  // 1. Playwright charge le HTML dynamique (JS exécuté, CSS appliqué, DOM complet)
  // Quand on passe une page (url) à Playwright, il va ouvrir une vraie page dans Chromium. 
  // Le navigateur "virtuel" télécharge la page, exécute le JavaScript, applique le CSS, et
  // construit un vrai DOM complet en mémoire.
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url);

  // 2. Injection axe-core + audit
  await page.addScriptTag({ path: "./node_modules/axe-core/axe.min.js" });

  // 3. On configure axe-core pour avoir des résultats en français
  const audit = await page.evaluate(async (locale) => {
    axe.configure({
      locale, // retourne les résultats en français, dans le contexte du navigateur virtuel
      //reporter: "no-passes", // retourne uniquement les violations, ne retourne pas les règles qui passent (on s'en fiche !)
    });

    // Lance axe-run pour récupérer tous les résultats de l'audit
    return await axe.run({
      runOnly: {
        type: "tag",
        values: [
          "RGAAv4",
          "best-practice",
        ],
      },
    });
  }, frLocale); // Passe les traductions fr

  const results = [];

  for (const category of categories) {
    // On filtre par thématique (on récupère les tests non applicables, non testables, les validés et les violations) dans l'objet resultsByImageTag
    const resultsByImageTag = category.scan(audit);
    // Peuple le tableau results par categorie
    results.push({ category: category.name, resultsByImageTag });
  }

  // 4. On ferme le navigateur virtuel
  await browser.close();
  return results;
}

module.exports = runAllTests;