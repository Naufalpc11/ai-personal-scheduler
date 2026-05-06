const asyncHandler = require("../utils/asyncHandler");

const notReady = asyncHandler(async (_req, res) => {
  res.status(501).json({
    success: false,
    message: "AI endpoints are not enabled yet",
  });
});

module.exports = {
  handleAiResult: notReady,
  handleAiGenerate: notReady,
  handleAiExecute: notReady,
};
