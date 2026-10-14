import express from "express";
const router = express.Router();
import {testValidationAction, testIgnoreAction, testReviewAction} from "../controllers/test.controller.js";

// Route PUT qui valide une rule axe-core
router.put("/validate", testValidationAction);

// Route PUT qui ignore une rule axe-core
router.put("/ignore", testIgnoreAction);

// Route PUT qui commente une rule axe-core
router.put("/review", testReviewAction);

export { router }