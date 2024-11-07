"user strict";

const {
  // getUser,
  addUser,
  // updateUser,
  // deleteUser,
} = require("../controllers/users");
const router = require("express").Router();
// const validateNewUser = require("../middleware/validateNewUser");
// const validateUpdatedUser = require("../middleware/validateUpdatedUser");

// getUser
// addUser,
// updateUser,
// removeUser
router
  .route("/user/")
  // .get(getUser)
  .post(addUser)
  // .put(updateUser)
  // .delete(deleteUser)

module.exports = router;