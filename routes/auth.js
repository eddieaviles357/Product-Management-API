"user strict";

const {
  registerUser,
  authenticateUser,
} = require("../controllers/auth");
const router = require("express").Router();
const validateSchema = require("../middleware/validation/validateSchema");
const userAuthSchema = require("../schemas/userAuthSchema.json");
const newUserSchema = require("../schemas/newUserSchema.json");

router
  .route("/register")
  .post(validateSchema(newUserSchema),registerUser)

router
  .route("/authenticate")
  .post(validateSchema(userAuthSchema), authenticateUser)

module.exports = router;