"user strict";

const {
  registerUser,
  token,
} = require("../controllers/auth");
const router = require("express").Router();
const validateNewUser = require("../middleware/validateNewUser");
const validateUserAuth = require("../middleware/validateUserAuth");
// const validateUpdatedUser = require("../middleware/validateUpdatedUser");

router
  .route("/")
  .post(validateNewUser,registerUser)

router
  .route("/token")
  .post(validateUserAuth, token)

module.exports = router;