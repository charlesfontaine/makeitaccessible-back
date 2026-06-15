var express = require("express");
var router = express.Router();

const {createAuditController, getAuditController, testValidationController} = require('../controllers/audit.controller.js');

// Route POST qui lance un audit et récupère la proprieté "url" dans le corps (body) de la requête
router.post("/", createAuditController);

router.post("/tests/validate", testValidationController);

router.get("/:id", getAuditController);

module.exports = router;
