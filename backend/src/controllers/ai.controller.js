const asyncHandler = require("../utils/asyncHandler");
const aiService = require("../services/ai.service");
const AppError = require("../utils/appError");

const handleAiGenerate = asyncHandler(async (req, res) => {
  const { userRequest } = req.body;
  const userId = req.user.id;

  const result = await aiService.generateAiResult(userRequest, userId);

  res.status(200).json({
    success: true,
    data: result,
  });
});

const handleAiExecute = asyncHandler(async (_req, res) => {
  throw new AppError("AI execute endpoint not yet implemented", 501);
});

const handleAiResult = asyncHandler(async (_req, res) => {
  throw new AppError("AI result endpoint not yet implemented", 501);
});

module.exports = {
  handleAiGenerate,
  handleAiExecute,
  handleAiResult,
};
