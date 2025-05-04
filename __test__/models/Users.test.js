"use strict";

const Users = require("../../models/Users");
const { BadRequestError, UnauthorizedError, ConflictError } = require("../../AppError");
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

  describe("register user", function () {
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
    
    
    test("throws ConflictError if user already exists", async function() {

      const registeredUser = await Users.register(user);
      await expect(Users.register(user)).rejects.toThrow(ConflictError);
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
      delete user.lastName;
      await expect(Users.register(user)).rejects.toThrow(BadRequestError);
    });
  });

  describe("authenticate", function () {
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
      const authenticatedUser = await Users.authenticate(user.username, user.password);

      expect(authenticatedUser).toEqual({
        id: expect.any(Number),
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        joinAt: expect.any(Date),
        lastLoginAt: expect.any(Date)
      });

      expect(authenticatedUser.id).toEqual(registeredUser.id);
      expect(authenticatedUser.password).toBeUndefined();
      expect(authenticatedUser.isAdmin).toBeFalsy();
      expect(authenticatedUser.isAdmin).toBeFalsy();
    })

    test("throws UnauthorizedError if user not found", async function() {
      await expect(Users.authenticate(user.username, user.password)).rejects.toThrow("Please register");
    });

    test("throws UnauthorizedError if password is incorrect", async function() {
      const registeredUser = await Users.register(user);
      await expect(Users.authenticate(registeredUser.username, "wrongPassword")).rejects.toThrow(UnauthorizedError);
    });

    test("throws BadRequestError if missing required fields", async function() {

      const registeredUser = await Users.register(user);
      await expect(Users.authenticate(user.username)).rejects.toThrow(BadRequestError);
      await expect(Users.authenticate()).rejects.toThrow(BadRequestError);
    })
  });
});