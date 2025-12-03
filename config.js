"use strict";

/** Shared config for application; can be required many places. */

// require("dotenv").config();

const SECRET_KEY = process.env.SECRET_KEY || crypto.randomUUID();

const PORT = +process.env.PORT || 3001;

const LANG_EN = "language=en";
const LOCALE_US = "locale=us";

// Use dev database, testing database, or via env var, production database
function getDatabaseUri() {
  return (process.env.NODE_ENV === "test")
      ? "product_management_test"
      : process.env.DATABASE_URL || "product_management";
}

// Speed up bcrypt during tests, since the algorithm safety isn't being tested
const BCRYPT_WORK_FACTOR = process.env.NODE_ENV === "test" ? 1 : 12;

// console.log("******************************************")
// console.log("*******  PRODUCT MANAGEMENT Config  ******\n")
// console.log("1:SECRET_KEY         :  ", SECRET_KEY);
// console.log("2:PORT               :  ", PORT.toString());
// console.log("3:BCRYPT_WORK_FACTOR :  ", BCRYPT_WORK_FACTOR);
// console.log("4:Database           :  ", getDatabaseUri());
// console.log("*******  PRODUCT MANAGEMENT Config  ******\n")
// console.log("******************************************\n")

module.exports = {
  SECRET_KEY,
  PORT,
  LANG_EN,
  LOCALE_US,
  getDatabaseUri,
  BCRYPT_WORK_FACTOR,
};