import { Router } from "express";
import { ProjectController } from "../controllers/ProjectController";
import { body, param } from "express-validator";
import { handleInputErrors } from "../middleware/validation";
import { TaskController } from "../controllers/TaskController";
import { projectExists } from "../middleware/project";
import {
  hasAuthorization,
  taskBelongsToProject,
  taskExists,
} from "../middleware/task";
import { authenticate } from "../middleware/auth";
import { TeamMemberController } from "../controllers/TeamControllers";
import { NoteController } from "../controllers/NoteController";

const router = Router();

router.use(authenticate);
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
  hasAuthorization,
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
  hasAuthorization,
  param("taskId").isMongoId().withMessage("Not valid ID"),
  body("name").notEmpty().withMessage("The Task name is mandatory"),
  body("description").notEmpty().withMessage("The description is mandatory"),
  handleInputErrors,
  TaskController.updateTask,
);
router.delete(
  "/:projectId/tasks/:taskId",
  hasAuthorization,
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

router.post(
  "/:projectId/team/find",
  body("email").isEmail().toLowerCase().withMessage("Not valid E-mail"),
  handleInputErrors,
  TeamMemberController.findMemberByEmail,
);
router.get(
  "/:projectId/team",
  handleInputErrors,
  TeamMemberController.getProjectTeam,
);
router.post(
  "/:projectId/team",
  body("id").isMongoId().withMessage("Not valid ID"),
  handleInputErrors,
  TeamMemberController.addMemberById,
);
router.delete(
  "/:projectId/team/:userId",
  param("userId").isMongoId().withMessage("Not valid ID"),
  handleInputErrors,
  TeamMemberController.removeMemberById,
);

/** Notes */
router.post(
  "/:projectId/tasks/:taskId/notes",
  body("content").notEmpty().withMessage("The content is required"),
  handleInputErrors,
  NoteController.createNote,
);
router.get(
  "/:projectId/tasks/:taskId/notes",
  handleInputErrors,
  NoteController.getTaskNotes,
);
router.delete(
  "/:projectId/tasks/:taskId/notes/:noteId",
  param("noteId").isMongoId().withMessage("Not valid ID"),
  handleInputErrors,
  NoteController.deleteNotes,
);

export default router;
