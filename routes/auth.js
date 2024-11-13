"user strict";

const {
  // getUser,
  registerUser,
  // updateUser,
  // deleteUser,
} = require("../controllers/auth");
const router = require("express").Router();
const validateNewUser = require("../middleware/validateNewUser");
// const validateUpdatedUser = require("../middleware/validateUpdatedUser");

// getUser
// registerUser,
// updateUser,
// removeUser
router
  .route("/")
  // .get(getUser)
  .post(validateNewUser,registerUser)
  // .put(updateUser)
  // .delete(deleteUser)

module.exports = router;