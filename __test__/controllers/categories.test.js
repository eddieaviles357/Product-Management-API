"use strict";

const request = require("supertest");
const app = require("../../app");
const { createToken } = require("../../helpers/tokens");
const { BadRequestError } = require("../../AppError");
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

describe("Categories Routes", () => {
  beforeAll(commonBeforeAll);
  beforeEach(commonBeforeEach);
  afterEach(commonAfterEach);
  afterAll(commonAfterAll);

  describe("GET /categories", () => {
    test("returns all categories", async () => {
      const response = await request(app)
        .get("/api/v1/categories")
        .set("Authorization", `Bearer ${createToken({ username: "west123" })}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        categories: [
          { id: categoryIds[0], name: "Electronics" },
          { id: categoryIds[1], name: "Books" },
          { id: categoryIds[2], name: "Clothing" },
        ],
      });
    });

    test("unauthenticated user", async () => {
      const response = await request(app).get("/api/v1/categories");

      expect(response.statusCode).toBe(401);
      expect(response.body).toEqual({
        error: {
          message: "Unauthorized",
          status: 401,
        },
      });
    });
  });
});