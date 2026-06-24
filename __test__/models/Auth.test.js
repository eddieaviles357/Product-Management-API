"use strict";

const Auth = require("../../models/Auth");
const { BadRequestError, UnauthorizedError, ConflictError } = require("../../AppError");
const {
  username1,
  username2,
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll
} = require("../helpers/_testCommon");

describe("Auth Model", () => {
  beforeAll(commonBeforeAll);
  beforeEach(commonBeforeEach);
  afterEach(commonAfterEach);
  afterAll(commonAfterAll);

  describe("authenticate", () => {
    test("works", async () => {
      const authenticatedUser = await Auth.authenticate(username1, "password");

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
      await expect(Auth.authenticate("nonexistent", "password"))
        .rejects.toThrow("Please register");
    });

    test("throws UnauthorizedError if password is incorrect", async () => {
      await expect(Auth.authenticate(username1, "wrongPassword"))
        .rejects.toThrow(UnauthorizedError);
    });

    test("throws BadRequestError if missing username", async () => {
      await expect(Auth.authenticate(undefined, "password"))
        .rejects.toThrow(BadRequestError);
    });

    test("throws BadRequestError if missing password", async () => {
      await expect(Auth.authenticate(username1, undefined))
        .rejects.toThrow(BadRequestError);
    });
  });
});