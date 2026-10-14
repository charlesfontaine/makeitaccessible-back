import { Request, Response } from 'express';
import User from "../models/users.js";
import Site from "../models/sites.js";
import Audit from "../models/audits.js";
import Test from "../models/tests.js";
import { checkBody } from "../modules/checkBody.js";
import { getSiteAuditSummary } from "../services/scoreSite.service.js";

// POST: score global d'un site (fusion de toutes ses pages) si user connecté uniquement
const getSiteAuditSummaryController = async (req: Request<{ siteId: string }, any, { token: string }>, res: Response) => {
  const { token } = req.body;
  const { siteId } = req.params;

  console.log('token reçu :', token);
  console.log('siteId reçu :', siteId);

  // CheckBody vérifie que token est présent et non vide
  if (!checkBody(req.body, ['token'])) {
    return res.status(403).json({ result: false, error: "Token is missing" });
  }

  // Vérifier si un utilisateur existe et si un site existe aussi 
  const user = await User.findOne({ token });
  if (!user) {
    return res.status(403).json({ result: false, error: "User not found" });
  }

  const site = await Site.findById(siteId);
  if (!site) {
    return res.status(403).json({ result: false, error: "Site not found" });
  }

  const hasAccess = await Audit.exists({ site: siteId, user: user._id });
  if (!hasAccess) {
    return res.status(403).json({ result: false, error: "Unauthorised access to this site" });
  }

  const { summary, pages } = await getSiteAuditSummary(siteId, user._id);

  res.status(200).json({
    result: true,
    site: { _id: site._id, name: site.name, domain: site.domain },
    summary,
    pages,
  });
};

// GET / dynamique par site 
const getSiteView = async (req: Request<{ token: string; id: string }, any, {}>, res: Response) => {
  const { token, id } = req.params;

   const user = await User.findOne({ token });
  if (!user) {
    return res.status(403).json({ result: false, error: "Utilisateur non trouvé" });
  }

  const site = await Site.findById(id);

         if (!site) {

    return res.status(404).json({ result: false, error: "site introuvable" });
  }

  const audits = await Audit.find({ site: id });
  const auditIds = audits.map(audit => audit._id);
   const tests = await Test.find({ audit: { $in: auditIds } });

   res.json({ result: true, results: site, audits, tests });

};


// DELETE: supprimer un site
const deleteSiteController = async (req: Request<{ siteId: string }, any, { token: string}>, res: Response) => {
  const { siteId } = req.params;
  const { token } = req.body;

  // 1. vérifier si token, utilisateur et site ok
  if (!token) {
    return res.status(403).json({ result: false, error: "Token is missing" });
  }
  const user = await User.findOne({ token });
  if (!user) {
    return res.status(403).json({ result: false, error: "User not found" });
  }
  const site = await Site.findById(siteId);
  if (!site) {
    return res.status(403).json({ result: false, error: "Site not found" });
  }

  // 2. vérifie que l'utilisateur est bien propriétaire du site
  const hasAccess = await Audit.exists({ site: siteId, user: user._id });
  if (!hasAccess) {
    return res.status(403).json({ result: false, error: "Unauthorised access" });
  }

  // 3. Récupère tous les audits du site
  const audits = await Audit.find({ site: siteId }, '_id');
  const auditIds = audits.map(audit => audit._id);

  // 4. Supprime tous les tests liés à ces audits
  for (const auditId of auditIds) {
    await Test.deleteMany({ audit: auditId });
  }

  // 5. Supprime tous les audits du site
  await Audit.deleteMany({ site: siteId });

  // 6. Supprime le site
  await Site.deleteOne({ _id: siteId });

  res.status(200).json({ result: true });
};

export { getSiteAuditSummaryController, getSiteView, deleteSiteController };