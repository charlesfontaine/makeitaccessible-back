// Nécessaire pour la mise en production sur Vercel car les fonctions serverless de Vercel ne supportent pas Playwright nativement
// On utilise @sparticuz/chromium + playwright-core pour faire tourner Playwright sur des environnements serverless.
// const playwright = require('playwright-core');
// const chromium = require('@sparticuz/chromium');
import playwright from 'playwright';

import path from 'path';
import frLocale from 'axe-core/locales/fr.json'; // locale FR officielle
import { scanImages } from './categories/images.test'; // 1. Images
import { scanCadres } from './categories/cadres.test'; // 2. Cadres
import { scanCouleurs } from './categories/couleurs.test'; // 3. Couleurs
import { scanMultimedia } from './categories/multimedia.test'; // 4. Multimédia
import { scanTableaux } from './categories/tableaux.test'; // 5. Tableaux
import { scanLiens } from './categories/liens.test'; // 6. Liens
import { scanScripts } from './categories/scripts.test'; // 7. Scripts
import { scanElements } from './categories/elements.test'; // 8. Elements obligatoires
import { scanStructuration } from './categories/structuration.test'; // 9. Structuration de l'information
import { scanPresentation } from './categories/presentation.test'; // 10. Présentation de l'information
import { scanFormulaires } from './categories/formulaires.test'; // 11. Formulaires
import { scanNavigation } from './categories/navigation.test'; // 12. Navigation
import { scanConsultation } from './categories/consultation.test'; // 13. Consultation

declare const axe: typeof import('axe-core');
import { IAxeResultsByCat } from './types/IAxeResultsByCatInterface';

// 0. On crée un tableau de catégories servant à filtrer les résultats par thématique
// cf. https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/

/**
 * categoryies: Array of objects
 ** category : object
 *** name: String // Nom de la catégorie
 *** scan: Function // Fonction de scan lancée par thématique
 */
const categories = [
  { name: "Images", scan: scanImages },
  { name: "Cadres", scan: scanCadres },
  { name: "Couleurs", scan: scanCouleurs },
  { name: "Multimédia", scan: scanMultimedia },
  { name: "Tableaux", scan: scanTableaux },
  { name: "Liens", scan: scanLiens },
  { name: "Scripts", scan: scanScripts },
  { name: "Éléments obligatoires", scan: scanElements },
  { name: "Structuration de l'information", scan: scanStructuration },
  { name: "Présentation de l'information", scan: scanPresentation },
  { name: "Formulaires", scan: scanFormulaires },
  { name: "Navigation", scan: scanNavigation },
  { name: "Consultation", scan: scanConsultation },
];

/**
 * Utility function to get all axe-core results
 * @param url 
 * @returns 
 */
async function runAllTests(url: string): Promise<IAxeResultsByCat[]> {
  // 1. Playwright charge le HTML dynamique (JS exécuté, CSS appliqué, DOM complet)
  // Quand on passe une page (url) à Playwright, il va ouvrir une vraie page dans Chromium.
  // Le navigateur "virtuel" télécharge la page, exécute le JavaScript, applique le CSS, et
  // construit un vrai DOM complet en mémoire.
  // note: si vous ne pouvez pas installer Playwright via yarn, faîtes "npx playwright install"
  
  // Lance chromium via la lib @sparticuz/chromium pour lancer un navigateur headless sur un environnement serverless
  let browser;
  if (process.env.VERCEL) {
  // Lance chromium via la lib @sparticuz/chromium pour lancer un navigateur headless sur un environnement serverless
  // Vercel : binaire Linux via @sparticuz/chromium  
    const { default: chromium } = await import('@sparticuz/chromium');
    browser = await playwright.chromium.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    });
  } else {
    // Local : playwright complet avec navigateurs installés
    // On doit installer le navigateur chromium en local: npx playwright install chromium
    // Lance chromium
    browser = await playwright.chromium.launch({ headless: true });
  }
  // Crée une page viruel
  const page = await browser.newPage();
  await page.goto(url);

  // 2. Injection du script axe-core + audit
  await page.addScriptTag({ path: path.join(__dirname, '../../', 'node_modules/axe-core/axe.min.js') });

  // 3. On configure axe-core pour avoir des résultats en français
  const audit = await page.evaluate(async (locale: any) => { // any nécessaire car axe-core oblige le type fail sur checkMessages et n'est pas disponible sur frLocale
    axe.configure({
      locale, // retourne les résultats en français, dans le contexte du navigateur virtuel
      //reporter: "no-passes", // retourne uniquement les violations, ne retourne pas les règles qui passent (on s'en fiche !)
    });

    // 4. Lance axe-run pour récupérer tous les résultats de l'audit
    return await axe.run({
      runOnly: {
        type: "tag",
        values: ["RGAAv4", "best-practice"],
      },
    });
  }, frLocale); // Passe les traductions fr

  const results = [];

  // 5. Parcours toutes les categories (thématiques) que l'on souhaite filter
  for (const category of categories) {
    // On filtre par thématique (on récupère les tests non applicables, non testables, les validés et les violations) dans l'objet resultsByImageTag
    const resultsByFilteredCategory = category.scan(audit);
    // Peuple le tableau results par categorie
    results.push({ category: category.name, resultsByFilteredCategory });
  }

  // 6. On ferme le navigateur virtuel
  await browser.close();

  // 7. On retourne le tableau listant chaque résultat de chaque thématique (13 au total : 1. Images... 2. Cadres... 3. Couleurs... 4. Multimédia, etc...)
  // return audit => retourne les données brutes d'Axe-core
  return results; // retourne les données mappées et filtrées par thématique/catégorie
}

export { runAllTests };
