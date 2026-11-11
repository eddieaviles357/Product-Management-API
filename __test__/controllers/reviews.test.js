"use strict";
const request = require("supertest");
const app = require("../../app");
const Auth = require("../../models/Auth");
const createToken = require("../../helpers/tokens");
const {
  productIds,
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
        totalReviews: 2,
        totalPages: 1
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
      expect(response.body.error.message).toBe("Invalid order ID");
    });

    test("should paginate product reviews", async () => {
      const response = await request(app)
        .get(`/api/v1/reviews/product/${productIds[0]}?page=1&limit=1`);

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.pagination).toEqual({
        currentPage: 1,
        pageSize: 1,
        totalReviews: 2,
        totalPages: 2,
      });
    });

    test("should return an empty object when the user has not reviewed the product", async () => {
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
      expect(response.body.error.message).toBe("Invalid order ID");
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
      expect(response.body.error.message).toBe("Invalid order ID");
    });

    test("should reject ratings outside the request schema range", async () => {
      const currentUser = await Auth.authenticate(username1, "password");
      const token = await createToken(currentUser);

      const response = await request(app)
        .post(`/api/v1/reviews/product/${productIds[2]}/${username1}`)
        .send({ review: "Invalid rating", rating: 0 })
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(400);
      expect(response.body.errors).toEqual(expect.arrayContaining([
        expect.objectContaining({ property: "rating" })
      ]));
    });

    test("should return 401 if user is not logged in", async () => {
      const response = await request(app)
        .post(`/api/v1/reviews/product/${productIds[2]}/${username1}`)
        .send({ review: "Test", rating: 5 });

      expect(response.statusCode).toBe(401);
    });
  });

  describe("PATCH /api/v1/reviews/product/:productId/:username", () => {
    test("should update a review for a product", async () => {
      const currentUser = await Auth.authenticate(username1, "password");
      const token = await createToken(currentUser);
      
      const updatedReview = {
        review: "Updated review text",
        rating: 4
      };

      const response = await request(app)
        .patch(`/api/v1/reviews/product/${productIds[0]}/${username1}`)
        .send(updatedReview)
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.review).toBeDefined();
    });

    test("should return 401 if user is not logged in", async () => {
      const response = await request(app)
        .patch(`/api/v1/reviews/product/${productIds[0]}/${username1}`)
        .send({ review: "Test", rating: 5 });

      expect(response.statusCode).toBe(401);
    });

    test("should reject ratings outside the request schema range", async () => {
      const currentUser = await Auth.authenticate(username1, "password");
      const token = await createToken(currentUser);

      const response = await request(app)
        .patch(`/api/v1/reviews/product/${productIds[0]}/${username1}`)
        .send({ review: "Updated review", rating: 0 })
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(400);
      expect(response.body.errors).toEqual(expect.arrayContaining([
        expect.objectContaining({ property: "rating" })
      ]));
    });
  });

  describe("GET /api/v1/reviews/:username", () => {
    test("should return reviews written by the authenticated user", async () => {
      const currentUser = await Auth.authenticate(username1, "password");
      const token = await createToken(currentUser);
      const response = await request(app)
        .get(`/api/v1/reviews/${username1}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.reviews).toEqual(expect.arrayContaining([
        expect.objectContaining({
          productId: productIds[0],
          productName: expect.any(String),
          imageUrl: expect.any(String),
          rating: expect.any(Number),
          review: expect.any(String),
        })
      ]));
    });

    test("should reject requests without authentication", async () => {
      const response = await request(app)
        .get(`/api/v1/reviews/${username1}`);

      expect(response.statusCode).toBe(401);
      expect(response.body.error.message).toBe("Unauthorized");
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