"use strict";

const {
  getAddress,
  upsertAddress,
  deleteAddress
} = require("../controllers/address");
const router = require("express").Router();
const { ensureLoggedIn, ensureUser, ensureUserOrAdmin } = require("../middleware/auth/auth");

router
  .route("/:username")
  .get(ensureLoggedIn, ensureUser, getAddress)
  .post(ensureLoggedIn, ensureUser, upsertAddress)
  .delete(ensureLoggedIn, ensureUser, ensureUserOrAdmin, deleteAddress);

module.exports = router;
