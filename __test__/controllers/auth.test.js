"use strict";

const request = require("supertest");
const app = require("../../app");
const createToken = require("../../helpers/tokens");
const { BadRequestError, ConflictError } = require("../../AppError");
const Users = require("../../models/Users");

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
      jest.spyOn(Users, "authenticate").mockImplementation(() => {
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

  describe("POST /api/v1/auth/register", () => {
    test("successful registration", async () => {
      const response = await request(app)
        .post("/api/v1/auth/register")
        .send({
          username: "newuser",
          password: "password123",
          firstName: "New",
          lastName: "User",
          email: "newuser@example.com",
        });
          
      expect(response.statusCode).toBe(201);
      expect(response.body).toEqual({
        token: expect.any(String),
      });
    });

    test("missing password field", async () => {
      const response = await request(app)
        .post("/api/v1/auth/register")
        .send({ username: "newuser", firstName: "first", lastName: "last", email: "test@test.com" });

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty("errors");
      expect(response.body.errors).toContainEqual(
        expect.objectContaining({
          property: "password",
          message: expect.stringContaining("password")
        })
      );
    });

    test("missing lastName field", async () => {
      const response = await request(app)
        .post("/api/v1/auth/register")
        .send({ username: "newuser", firstName: "first", password: "pass", email: "test@test.com" });

      expect(response.statusCode).toBe(400);
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors.length).toBeGreaterThan(0);
    });

    test("missing multiple fields", async () => {
      const response = await request(app)
        .post("/api/v1/auth/register")
        .send({ username: "newuser" });

      expect(response.statusCode).toBe(400);
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors.length).toBeGreaterThanOrEqual(3);
    });

    test("duplicate username", async () => {
      const response = await request(app)
        .post("/api/v1/auth/register")
        .send({
          firstName: "west",
          lastName: "wes",
          username: "west123",
          password: "password123",
          email: "testuser@example.com",
        });

      expect(response.statusCode).toBe(409);
      expect(response.body).toEqual({
        error: {
          message: "User already exists",
          status: 409,
        },
      });
    });

    test("database error handling", async () => {
      jest.spyOn(Users, "register").mockImplementation(() => {
        throw new BadRequestError("Database error");
      });

      const response = await request(app)
        .post("/api/v1/auth/register")
        .send({
          firstName: "west",
          lastName: "wes",
          username: "newtest123",
          password: "password123",
          email: "test@test.com",
        });
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