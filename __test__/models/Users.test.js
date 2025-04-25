"use strict";

const Users = require("../../models/Users");
const { BadRequestError } = require("../../AppError");
const {
  userIdUsername,
  addressIds,
  username1,
  username2,
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll
} = require("../helpers/_testCommon");
const db = require("../../db.js");

describe("Users Model", function () {
  beforeAll(commonBeforeAll);
  beforeEach(commonBeforeEach);
  afterEach(commonAfterEach);
  afterAll(commonAfterAll);

  describe("getUserId", function () {
    const user = {
      firstName: "firstNameTester", 
      lastName: "lastNameTester", 
      username: "usernameTester",
      password: "passwordTester", 
      email: "tester@tester.com", 
      isAdmin: false
    }

    test("works", async function() {
      const registeredUser = await Users.register(user);

      expect(registeredUser).toEqual({
        id: expect.any(Number),
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin
      });
    });
    
    
    test("throws BadRequestError if user already exists", async function() {

      const registeredUser = await Users.register(user);
      await expect(Users.register(user)).rejects.toThrow(BadRequestError);
      await expect(Users.register(user)).rejects.toThrow("User already exists");
    });

    test("throws BadRequestError if missing required fields", async function() {
      delete user.email;
      await expect(Users.register(user)).rejects.toThrow(BadRequestError);
    });

    test("throws BadRequestError if missing required fields", async function() {
      user.email = "tester@tester.com"
      delete user.password;
      await expect(Users.register(user)).rejects.toThrow(BadRequestError);
    });

    test("throws BadRequestError if missing required fields", async function() {
      user.password = "passwordTester"
      delete user.username;
      await expect(Users.register(user)).rejects.toThrow(BadRequestError);
    });

    test("throws BadRequestError if missing required fields", async function() {
      user.username = "usernameTester"
      delete user.firstName;
      await expect(Users.register(user)).rejects.toThrow(BadRequestError);
    });

    test("throws BadRequestError if missing required fields", async function() {
      user.firstName = "firstNameTester"
      console.log(user)
      delete user.lastName;
      await expect(Users.register(user)).rejects.toThrow(BadRequestError);
    });
  });
});