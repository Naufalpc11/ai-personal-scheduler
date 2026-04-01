const asyncHandler = require("../utils/asyncHandler");
const aiService = require("../services/ai.service");

const handleAiResult = asyncHandler(async (req, res) => {
  const task = await aiService.handleAiResult(req.user.id, req.body);

  res.status(201).json({
    success: true,
    message: "AI result processed",
    data: task,
  });
});

module.exports = {
  handleAiResult,
};
