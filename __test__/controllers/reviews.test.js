"use strict";
const request = require("supertest");
const app = require("../../app");
const Reviews = require("../../models/Reviews");
const Auth = require("../../models/Auth");
const createToken = require("../../helpers/tokens");
const { BadRequestError } = require("../../AppError");
const db = require("../../db.js");
const {
  productIds,
  userIdUsername,
  username1,
  username2,
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

      const body = response.body;

      expect(response.statusCode).toBe(200);
      expect(body.success).toBe(true);
      expect(body.averageRating).toBe(3);
      expect(response.body.pagination).toEqual({
        currentPage: 1,
        pageSize: 10,
        totalReviews: expect.any(Number),
        totalPages: expect.any(Number)
      });
      expect(body.data).toBeInstanceOf(Array);
      expect(body.data[0]).toEqual({
        userId: expect.any(Number),
        firstName: expect.any(String),
        review: expect.any(String),
        rating: expect.any(Number),
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
      });
    });

    test("should return 400 if id is not a number", async () => {
      const response = await request(app)
        .get("/api/v1/reviews/product/invalidId");

      expect(response.statusCode).toBe(400);
      expect(response.body.error.message).toContain("id must be a positive integer");
    });

    test("should return 200, and an empty object when product does not exist", async () => {
      const response = await request(app)
        .get(`/api/v1/reviews/product/999999/${username1}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.review).toEqual({});
    });
  });

  describe("GET /api/v1/reviews/product/:productId/:username", () => {
    test("should return a single review", async () => {
      const response = await request(app)
        .get(`/api/v1/reviews/product/${productIds[0]}/${username1}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.review).toBeDefined();
    });

    test("should return 400 if productId is not a number", async () => {
      const response = await request(app)
        .get("/api/v1/reviews/product/invalidId/username");

      expect(response.statusCode).toBe(400);
      expect(response.body.error.message).toContain("productId must be a positive integer");
    });
  });

  describe("POST /api/v1/reviews/product/:productId/:username", () => {
    test("should add a review to a product", async () => {
      const currentUser = await Auth.authenticate(username1, "password");
      const token = await createToken(currentUser);
      
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
      expect(response.body.review).toBeDefined();
    });

    test("should return 400 if productId is not a number", async () => {
      const currentUser = await Auth.authenticate(username1, "password");
      const token = await createToken(currentUser);

      const response = await request(app)
        .post(`/api/v1/reviews/product/invalidId/${username1}`)
        .send({ review: "Test", rating: 5 })
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(400);
      expect(response.body.error.message).toContain("productId must be a positive integer");
    });

    test("should return 401 if user is not logged in", async () => {
      const response = await request(app)
        .post(`/api/v1/reviews/product/${productIds[2]}/${username1}`)
        .send({ review: "Test", rating: 5 });

      expect(response.statusCode).toBe(401);
    });
  });

  describe("PUT /api/v1/reviews/product/:productId/:username", () => {
    test("should update a review for a product", async () => {
      const currentUser = await Auth.authenticate(username1, "password");
      const token = await createToken(currentUser);
      
      const updatedReview = {
        review: "Updated review text",
        rating: 4
      };

      const response = await request(app)
        .put(`/api/v1/reviews/product/${productIds[0]}/${username1}`)
        .send(updatedReview)
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.review).toBeDefined();
    });

    test("should return 401 if user is not logged in", async () => {
      const response = await request(app)
        .put(`/api/v1/reviews/product/${productIds[0]}/${username1}`)
        .send({ review: "Test", rating: 5 });

      expect(response.statusCode).toBe(401);
    });
  });

  describe("DELETE /api/v1/reviews/product/:productId/:username", () => {
    test("should delete a review for a product", async () => {
      const currentUser = await Auth.authenticate(username1, "password");
      const token = await createToken(currentUser);

      const response = await request(app)
        .delete(`/api/v1/reviews/product/${productIds[0]}/${username1}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test("should return 401 if user is not logged in", async () => {
      const response = await request(app)
        .delete(`/api/v1/reviews/product/${productIds[0]}/${username1}`);

      expect(response.statusCode).toBe(401);
    });
  });
});