"use strict";

const app = require("../../app");
const request = require("supertest");
const Users = require("../../models/Users");
const createToken = require("../../helpers/tokens");
const { BadRequestError } = require("../../AppError");
const db = require("../../db.js");
const {
  userIdUsername,
  username1,
  username2,
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll
} = require("../helpers/_testCommon");

describe("Users Routes", () => {
  beforeAll(commonBeforeAll);
  beforeEach(commonBeforeEach);
  afterEach(commonAfterEach);
  afterAll(commonAfterAll);

  describe("POST /api/v1/users/register", () => {
    test("successful registration", async () => {
      const response = await request(app)
        .post("/api/v1/users/register")
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
        .post("/api/v1/users/register")
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
        .post("/api/v1/users/register")
        .send({ username: "newuser", firstName: "first", password: "pass", email: "test@test.com" });

      expect(response.statusCode).toBe(400);
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors.length).toBeGreaterThan(0);
    });

    test("missing multiple fields", async () => {
      const response = await request(app)
        .post("/api/v1/users/register")
        .send({ username: "newuser" });

      expect(response.statusCode).toBe(400);
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors.length).toBeGreaterThanOrEqual(3);
    });

    test("duplicate username", async () => {
      const response = await request(app)
        .post("/api/v1/users/register")
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
        .post("/api/v1/users/register")
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