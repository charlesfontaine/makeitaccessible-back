var express = require("express");
var router = express.Router();
const runAllTests = require("../tests/runAllTests.js");
const Site = require('../models/sites.js');
const Audit = require('../models/audits.js');

let auditResults;
const createAudit = (url, siteId) => {
  const audit = new Audit({
    url,
    status: 'pending',
    errorMessage: '',
    createdAt: Date.now(),
    summary: {
      total: 0,
      passed: 0,
      failed: 0,
      inapplicable: 0,
      incomplete: 0,
      score: 0,
    },
    site: siteId
  });

  return audit;
}

// Route POST qui lance un audit et récupère la key url dans le corps de la requête
router.post("/audit", async (req, res) => {
  console.log('req.body', req.body);
  const { url, name, domain } = req.body;

  // @nina todo : vérifier/tester qu'une url envoyée est bien au format url (http://, https://) via une regex
  if (url === undefined || url === '') {
    res.status(403).json({result: false, error: 'Missing or empty url'})
    return;
  }

  // Lance le scan via runAllTests et on "attend" le retour des résultats avant d'enregistrer un site
  try {
    auditResults = await runAllTests(url);
  } catch (error) {
    console.error(error);
  }

  // Si on a des résultats (anomalies, etc...)
  if (auditResults) {
    // Vérifie si un site existe déjà
    Site.findOne({ domain }).then((site) => {
      // Si un site existe déjà, on enregistre un nouveau site dans la collection "sites"
      if (site === null) {
        const website = new Site({
          name,
          domain,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          user: null
        });

        website.save().then((newSite) => {
          // On attente le site s'enregistre, puis on créé un nouvel audit
          const newAudit = createAudit(url, newSite._id);

          if (newAudit) {
            // On enregistre le nouvel audit
            newAudit.save().then(newAudit => {
              res.status(200).json({ result: true, website: newSite, audit: newAudit });
            })
          }
        });
      }
      else {
        // Sinon un site existe déjà et on update la date du site existant
        Site.updateOne({ domain }, { updatedAt: Date.now() }).then(updatedSite => {
          // On attend que le site soit mis à jour, puis on créé un nouvel audit pour ce même site
          const newAudit = createAudit(url, site._id);

          if (newAudit) {
            // On enregistre le nouvel audit
            newAudit.save().then(newAudit => {
              res.status(200).json({ result: true, website: site, audit: newAudit });
            });
          }
        });
      }
    });
  } else {
    res.status(403).json({result: false, error: 'Audit has failed'})
  }
});

module.exports = router;
