import { Router } from "express";
import { body, param } from "express-validator";
import { AuthController } from "../controllers/AuthController";
import { handleInputErrors } from "../middleware/validation";
import { authenticate } from "../middleware/auth";

const router = Router();

router.post(
  "/create-account",
  body("name").notEmpty().withMessage("The name is required"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("The password is too short, min 8 characteres"),
  body("password_confirmation").custom((value, { req }) => {
    if (value != req.body.password) {
      throw new Error("the Passwords are not equal");
    }
    return true;
  }),
  body("email").isEmail().withMessage("Not valid E-mail"),
  handleInputErrors,
  AuthController.createAccount,
);

router.post(
  "/confirm-account",
  body("token").notEmpty().withMessage("The token is required"),
  handleInputErrors,
  AuthController.confirmAccount,
);

router.post(
  "/login",
  body("email").isEmail().withMessage("Not valid E-mail"),
  body("password").notEmpty().withMessage("The password is required"),
  handleInputErrors,
  AuthController.login,
);
router.post(
  "/request-code",
  body("email").isEmail().withMessage("Not valid E-mail"),
  handleInputErrors,
  AuthController.requestConfirmationCode,
);
router.post(
  "/forgot-password",
  body("email").isEmail().withMessage("Not valid E-mail"),
  handleInputErrors,
  AuthController.forgotPassword,
);
router.post(
  "/validate-token",
  body("token").notEmpty().withMessage("The token is required"),
  handleInputErrors,
  AuthController.validateToken,
);
router.post(
  "/update-password/:token",
  param("token").isNumeric().withMessage("Not valid Token"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("The password is too short, min 8 characteres"),
  body("password_confirmation").custom((value, { req }) => {
    if (value != req.body.password) {
      throw new Error("the Passwords are not equal");
    }
    return true;
  }),
  handleInputErrors,
  AuthController.updatePasswordWithToken,
);

router.get("/",

  authenticate,
  AuthController.user
)
export default router;
