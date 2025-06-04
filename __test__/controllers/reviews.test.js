"use strict";
const request = require("supertest");
const app = require("../../app");
const Reviews = require("../../models/Reviews");
const { BadRequestError } = require("../../AppError");
const db = require("../../db.js");
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

describe("Reviews Controller", () => {
  beforeAll(commonBeforeAll);
  beforeEach(commonBeforeEach);
  afterEach(commonAfterEach);
  afterAll(commonAfterAll);

  describe("GET /api/v1/reviews/product/:id", () => {
    test("should return reviews for a product", async () => {
      const response = await request(app)
        .get(`/api/v1/reviews/product/${productIds[0]}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body).toEqual({
        success: true,
        totalReviews: 2,
        averageRating: 3,
        reviews: expect.any(Array)
      });
    });

    test("should return 400 if id is not a number", async () => {
      const response = await request(app)
        .get("/api/v1/reviews/product/invalidId");

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        error: {
          message: "Id must be a number",
          status: 400
        }
      })
    });

    test("should return 400 if id is missing", async () => {
      const response = await request(app)
        .get("/api/v1/reviews/product/");

      expect(response.statusCode).toBe(404);
    });

    test("should return 404 if product does not exist", async () => {
      const response = await request(app)
        .get("/api/v1/reviews/product/999999");

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        error: {
          message: "Product does not exist",
          status: 400
        }
      });
    });

  });

})