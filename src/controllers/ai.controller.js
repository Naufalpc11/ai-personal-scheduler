const asyncHandler = require("../utils/asyncHandler");
const aiService = require("../services/ai.service");

// Menyimpan payload AI yang sudah jadi ke task, subtask, dan jadwal.
const handleAiResult = asyncHandler(async (req, res) => {
  const task = await aiService.handleAiResult(req.user.id, req.body);

  res.status(201).json({
    success: true,
    message: "AI result processed",
    data: task,
  });
});

// Menghasilkan rencana AI terverifikasi tanpa menyimpannya ke database.
const handleAiGenerate = asyncHandler(async (req, res) => {
  const result = await aiService.generateAiResult(req.body);

  res.status(200).json({
    success: true,
    message: "AI plan generated",
    data: {
      provider: result.provider,
      model: result.model,
      output: result.data,
    },
  });
});

// Menjalankan alur penuh: generate rencana AI, transform data, lalu simpan.
const handleAiExecute = asyncHandler(async (req, res) => {
  const result = await aiService.generateAndSaveAiResult(req.user.id, req.body);

  res.status(201).json({
    success: true,
    message: "AI plan generated and saved",
    data: {
      provider: result.generated.provider,
      model: result.generated.model,
      output: result.generated.data,
      task: result.savedTask,
    },
  });
});

module.exports = {
  handleAiResult,
  handleAiGenerate,
  handleAiExecute,
};
