import { Router } from "express";
import { ProjectController } from "../controllers/ProjectController";
import { body, param } from "express-validator";
import { handleInputErrors } from "../middleware/validation";
import { TaskController } from "../controllers/TaskController";
import { projectExists } from "../middleware/project";
import { taskBelongsToProject, taskExists } from "../middleware/task";

const router = Router();

router.post(
  "/",
  body("projectName").notEmpty().withMessage("The Project name is mandatory"),
  body("clientName").notEmpty().withMessage("The Client name is mandatory"),
  body("description").notEmpty().withMessage("The description is mandatory"),
  handleInputErrors,
  ProjectController.createProject,
);
router.get("/", ProjectController.getAllProjects);
router.get(
  "/:id",
  param("id").isMongoId().withMessage("Not valid ID"),
  handleInputErrors,
  ProjectController.getProjectById,
);
router.put(
  "/:id",
  param("id").isMongoId().withMessage("Not valid ID"),
  body("projectName").notEmpty().withMessage("The Project name is mandatory"),
  body("clientName").notEmpty().withMessage("The Client name is mandatory"),
  body("description").notEmpty().withMessage("The description is mandatory"),
  handleInputErrors,
  ProjectController.updateProject,
);
router.delete(
  "/:id",
  param("id").isMongoId().withMessage("Not valid ID"),
  handleInputErrors,
  ProjectController.deleteProject,
);

/** Routes for Task **/

router.param("projectId", projectExists);
router.post(
  "/:projectId/tasks",
  body("name").notEmpty().withMessage("The Task name is mandatory"),
  body("description").notEmpty().withMessage("The description is mandatory"),
  handleInputErrors,
  TaskController.createTask,
);
router.get("/:projectId/tasks", TaskController.getProjectTasks);
router.param("taskId", taskExists);
router.param("taskId", taskBelongsToProject);
router.get(
  "/:projectId/tasks/:taskId",
  param("taskId").isMongoId().withMessage("Not valid ID"),
  handleInputErrors,
  TaskController.getTaskById,
);

router.put(
  "/:projectId/tasks/:taskId",
  param("taskId").isMongoId().withMessage("Not valid ID"),
  body("name").notEmpty().withMessage("The Task name is mandatory"),
  body("description").notEmpty().withMessage("The description is mandatory"),
  handleInputErrors,
  TaskController.updateTask,
);
router.delete(
  "/:projectId/tasks/:taskId",
  param("taskId").isMongoId().withMessage("Not valid ID"),
  handleInputErrors,
  TaskController.deleteTask,
);

router.post(
  "/:projectId/tasks/:taskId/status",
  param("taskId").isMongoId().withMessage("Not valid ID"),
  body("status").notEmpty().withMessage("The state is mandatory"),
  handleInputErrors,
  TaskController.updateStatus,
);

export default router;
