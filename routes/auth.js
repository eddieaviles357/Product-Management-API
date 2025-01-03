"user strict";

const {
  registerUser,
  authenticateUser,
} = require("../controllers/auth");
const router = require("express").Router();
const validateNewUser = require("../middleware/validation/validateNewUser");
const validateUserAuth = require("../middleware/validation/validateUserAuth");
// const validateUpdatedUser = require("../middleware/validateUpdatedUser");

router
  .route("/")
  .post(validateNewUser,registerUser)

router
  .route("/authenticate")
  .post(validateUserAuth, authenticateUser)

module.exports = router;