"use strict";
const request = require("supertest");
const app = require("../../app");
const Reviews = require("../../models/Reviews");
const User = require("../../models/Users");
const createToken = require("../../helpers/tokens");
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

    test("should return 500 on database error", async () => {
      jest.spyOn(Reviews, "getReviewsForOneProduct").mockImplementation(() => {
        throw new Error("Database error");
      });

      const response = await request(app)
        .get(`/api/v1/reviews/product/${productIds[0]}`);

      expect(response.statusCode).toBe(500);
      expect(response.body).toEqual({
        error: {
          message: "Database error",
          status: 500
        }
      });
    });
  });

  describe("GET /api/v1/reviews/product/:productId/:username", () => {
    test("should return a single review", async () => {
      const response = await request(app)
        .get(`/api/v1/reviews/product/${productIds[0]}/${username1}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.review).toEqual({
        productId: productIds[0],
        userId: userIdUsername[0].id,
        review: "nice item",
        rating: 1,
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
      });
    });

    test("should return 400 if productId is not a number", async () => {
      const response = await request(app)
        .get("/api/v1/reviews/product/invalidId/username");

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        error: {
          message: "Id must be a number",
          status: 400
        }
      });
    });

    test("should return 404 if review does not exist", async () => {
      const response = await request(app)
        .get(`/api/v1/reviews/product/${productIds[0]}/nonexistentUser`);

      expect(response.statusCode).toBe(404);
      expect(response.body).toEqual({
        error: {
          message: "User does not exist",
          status: 404
        }
      });
    });

    test("should return 500 on database error", async () => {
      jest.spyOn(Reviews, "getSingleReview").mockImplementation(() => {
        throw new Error("Database error");
      });

      const response = await request(app)
        .get(`/api/v1/reviews/product/${productIds[0]}/${username1}`);

      expect(response.statusCode).toBe(500);
      expect(response.body).toEqual({
        error: {
          message: "Database error",
          status: 500
        }
      });
    });
  });

  describe("POST /api/v1/reviews/product/:productId/:username", () => {
    test("should add a review to a product", async () => {
    const currentUser = await User.authenticate(username1, "password");
    const token = createToken(currentUser);
      const newReview = {
        review: "Great product!",
        rating: 5
      };

      const response = await request(app)
        .post(`/api/v1/reviews/product/${productIds[2]}/${username1}`)
        .send(newReview)
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.review).toEqual({
        productId: productIds[2],
        userId: userIdUsername[0].id,
        review: "Great product!",
        rating: 5,
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
      });
    });

    
  });

})