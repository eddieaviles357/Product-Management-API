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
const db = require("../../db");

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

    test("throws BadRequestError if missing username", async () => {
      const user = {
        firstName: "Test", 
        lastName: "User", 
        password: "password",
        email: "test@test.com"
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

    test("throws BadRequestError if email format is invalid", async () => {
      const user = {
        firstName: "Test", 
        lastName: "User", 
        username: "testuser",
        password: "password", 
        email: "invalid-email-format"
      };

      await expect(Users.register(user)).rejects.toThrow(BadRequestError);
    });
  });

  describe("register user error handling", () => {
    test("throws BadRequestError if there is a problem with the database query", async () => {
      // Temporarily override the db.query to simulate a db error
      const originalDbQuery = db.query;
      db.query = jest.fn().mockImplementation(() => {
        throw new Error("Database error");
      });

      const user = {
        firstName: "Test", 
        lastName: "User", 
        username: "testuser",
        password: "password", 
        email: "test@test.com"
      };

      await expect(Users.register(user)).rejects.toThrow(BadRequestError);

      // Restore the original db.query method
      db.query = originalDbQuery;
    });
  });

  describe("getUserId", () => {
    test("works", async () => {
      const userId = await Users.getUserId(username1);
      expect(userId).toEqual(expect.any(Number));
    });

    test("returns 0 if user does not exist", async () => {
      const userId = await Users.getUserId("nonexistentuser");
      expect(userId).toBe(0);
    });
  });

  describe("getUserId error handling", () => {
    test("throws BadRequestError if there is a problem with the database query", async () => {
      // Temporarily override the db.query to simulate a db error
      const originalDbQuery = db.query;
      db.query = jest.fn().mockImplementation(() => {
        throw new Error("Database error");
      });

      await expect(Users.getUserId(username1)).rejects.toThrow(BadRequestError);

      // Restore the original db.query method
      db.query = originalDbQuery;
    });
  });

  describe("remove user", () => {
    test("works", async () => {
      const isUserRemoved = await Users.removeUser(username2);
      expect(isUserRemoved).toBe(true);
    });

    test("returns false if user does not exist", async () => {
      const isUserRemoved = await Users.removeUser("nonexistentuser");
      expect(isUserRemoved).toBe(false);
    });
  });
});