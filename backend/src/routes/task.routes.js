const express = require("express");
const taskController = require("../controllers/task.controller");
const subtaskController = require("../controllers/subtask.controller");
const validate = require("../middleware/validate.middleware");
const {
  createTaskSchema,
  getTaskByIdSchema,
  updateTaskSchema,
  createSubtaskSchema,
  getSubtaskByTaskSchema,
  updateSubtaskSchema,
} = require("../utils/validators");

const router = express.Router();

router.post("/tasks", validate(createTaskSchema), taskController.createTask);
router.get("/tasks", taskController.getTasks);
router.get("/tasks/:id", validate(getTaskByIdSchema), taskController.getTaskById);
router.put("/tasks/:id", validate(updateTaskSchema), taskController.updateTask);
router.delete("/tasks/:id", validate(getTaskByIdSchema), taskController.deleteTask);

router.post("/tasks/:id/subtasks", validate(createSubtaskSchema), subtaskController.createSubtask);
router.get("/tasks/:id/subtasks", validate(getSubtaskByTaskSchema), subtaskController.getSubtasksByTask);
router.put("/subtasks/:id", validate(updateSubtaskSchema), subtaskController.updateSubtask);
router.delete("/subtasks/:id", validate(getTaskByIdSchema), subtaskController.deleteSubtask);

module.exports = router;
