const express = require("express");
const aiController = require("../controllers/ai.controller");
const validate = require("../middleware/validate.middleware");
const { aiResultSchema } = require("../utils/validators");

const router = express.Router();

router.post("/ai-result", validate(aiResultSchema), aiController.handleAiResult);

module.exports = router;
