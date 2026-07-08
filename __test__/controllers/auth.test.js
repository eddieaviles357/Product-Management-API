"use strict";

const request = require("supertest");
const app = require("../../app");
const createToken = require("../../helpers/tokens");
const { BadRequestError, ConflictError } = require("../../AppError");
const Auth = require("../../models/Auth");

const {
  productIds,
  categoryIds,
  userIdUsername,
  addressIds,
  username1,
  username2,
  orderIds,
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll
} = require("../helpers/_testCommon");
const db = require("../../db.js");

describe("Auth Routes", () => {
  beforeAll(commonBeforeAll);
  beforeEach(commonBeforeEach);
  afterEach(commonAfterEach);
  afterAll(commonAfterAll);

  describe("POST /api/v1/auth/authenticate", () => {
    test("successful login", async () => {
      const response = await request(app)
        .post("/api/v1/auth/authenticate")
        .send({ username: "west123", password: "password" });

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        token: expect.any(String),
      });
    });

    test("invalid credentials - user not found", async () => {
      const response = await request(app)
        .post("/api/v1/auth/authenticate")
        .send({ username: "testuser", password: "wrongpassword" });

      expect(response.statusCode).toBe(401);
      expect(response.body).toEqual({
        error: {
          message: "Please register",
          status: 401,
        },
      });
    });

    test("missing password field", async () => {
      const response = await request(app)
        .post("/api/v1/auth/authenticate")
        .send({ username: "testFail" });

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty("errors");
      expect(response.body.errors).toContainEqual(
        expect.objectContaining({
          property: "password",
          message: expect.stringContaining("password")
        })
      );
    });

    test("database error handling", async () => {
      jest.spyOn(Auth, "authenticate").mockImplementation(() => {
        throw new BadRequestError("Database error");
      });

      const response = await request(app)
        .post("/api/v1/auth/authenticate")
        .send({ username: "testuser", password: "wrongpassword" });

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        error: {
          message: "Database error",
          status: 400,
        },
      });
    });
  });

  
});