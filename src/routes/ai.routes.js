const express = require("express");
const aiController = require("../controllers/ai.controller");
const validate = require("../middleware/validate.middleware");
const { aiResultSchema, aiGenerateSchema } = require("../utils/validators");

const router = express.Router();

router.post("/ai-generate", validate(aiGenerateSchema), aiController.handleAiGenerate);
router.post("/ai-execute", validate(aiGenerateSchema), aiController.handleAiExecute);
router.post("/ai-result", validate(aiResultSchema), aiController.handleAiResult);

module.exports = router;
