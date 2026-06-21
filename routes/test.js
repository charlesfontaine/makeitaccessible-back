var express = require("express");
var router = express.Router();

const {testValidationAction, testIgnoreAction} = require('../controllers/test.controller.js');

// Route PUT qui valide un test
router.put("/validate", testValidationAction);

// Route PUT qui ignore un test
router.put("/ignore", testIgnoreAction);

module.exports = router;