"use strict";

const router = require("express").Router({ mergeParams: true });

const {
  createCategory,
  updateCategory,
  removeCategory
} = require("../models/categories");

router.route('/');

module.exports = router;