import express from "express";
const router = express.Router();

import { getSiteAuditSummaryController, deleteSiteController, getSiteView } from '../controllers/site.controller.js';

// POST / enregistre un résumé pour un site (tous les audits (url) d'un même site (domain))
router.post("/:siteId/audit-summary", getSiteAuditSummaryController); 

// GET /
router.get('/archive/:token/:id', getSiteView);

// DELETE / supprimer un site
router.delete('/:siteId', deleteSiteController);

export { router }