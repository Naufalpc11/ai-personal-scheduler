const AppError = require("../utils/appError");

const notReady = () => {
  throw new AppError("AI service is not enabled yet", 501);
};

module.exports = {
  handleAiResult: notReady,
  generateAiResult: notReady,
  generateAndSaveAiResult: notReady,
  transformGeneratedPlanToPayload: notReady,
};
