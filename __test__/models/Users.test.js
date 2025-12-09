"use strict";

const Users = require("../../models/Users");
const { BadRequestError, UnauthorizedError, ConflictError } = require("../../AppError");
const {
  username1,
  username2,
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll
} = require("../helpers/_testCommon");

describe("Users Model", () => {
  beforeAll(commonBeforeAll);
  beforeEach(commonBeforeEach);
  afterEach(commonAfterEach);
  afterAll(commonAfterAll);

  describe("register user", () => {
    test("works", async () => {
      const user = {
        firstName: "firstNameTester", 
        lastName: "lastNameTester", 
        username: "newUsernameTester",
        password: "passwordTester", 
        email: "newtester@tester.com", 
        isAdmin: false
      };

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
    
    test("throws ConflictError if user already exists", async () => {
      const user = {
        firstName: "Test", 
        lastName: "User", 
        username: username1,
        password: "password", 
        email: "test@test.com"
      };

      await expect(Users.register(user)).rejects.toThrow(ConflictError);
    });

    test("throws BadRequestError if missing email", async () => {
      const user = {
        firstName: "Test", 
        lastName: "User", 
        username: "testuser",
        password: "password"
      };
      
      await expect(Users.register(user)).rejects.toThrow(BadRequestError);
    });

    test("throws BadRequestError if missing password", async () => {
      const user = {
        firstName: "Test", 
        lastName: "User", 
        username: "testuser",
        email: "test@test.com"
      };
      
      await expect(Users.register(user)).rejects.toThrow(BadRequestError);
    });

    test("throws BadRequestError if missing username", async () => {
      const user = {
        firstName: "Test", 
        lastName: "User", 
        password: "password",
        email: "test@test.com"
      };
      
      await expect(Users.register(user)).rejects.toThrow(BadRequestError);
    });

    test("throws BadRequestError if missing firstName", async () => {
      const user = {
        lastName: "User", 
        username: "testuser",
        password: "password",
        email: "test@test.com"
      };
      
      await expect(Users.register(user)).rejects.toThrow(BadRequestError);
    });

    test("throws BadRequestError if missing lastName", async () => {
      const user = {
        firstName: "Test",
        username: "testuser",
        password: "password",
        email: "test@test.com"
      };
      
      await expect(Users.register(user)).rejects.toThrow(BadRequestError);
    });
  });

  describe("authenticate", () => {
    test("works", async () => {
      const authenticatedUser = await Users.authenticate(username1, "password");

      expect(authenticatedUser).toEqual({
        id: expect.any(Number),
        firstName: expect.any(String),
        lastName: expect.any(String),
        username: username1,
        email: expect.any(String),
        isAdmin: expect.any(Boolean),
        joinAt: expect.any(Date),
        lastLoginAt: expect.any(Date)
      });

      expect(authenticatedUser.password).toBeUndefined();
    });

    test("throws UnauthorizedError if user not found", async () => {
      await expect(Users.authenticate("nonexistent", "password"))
        .rejects.toThrow("Please register");
    });

    test("throws UnauthorizedError if password is incorrect", async () => {
      await expect(Users.authenticate(username1, "wrongPassword"))
        .rejects.toThrow(UnauthorizedError);
    });

    test("throws BadRequestError if missing username", async () => {
      await expect(Users.authenticate(undefined, "password"))
        .rejects.toThrow(BadRequestError);
    });

    test("throws BadRequestError if missing password", async () => {
      await expect(Users.authenticate(username1, undefined))
        .rejects.toThrow(BadRequestError);
    });
  });
});