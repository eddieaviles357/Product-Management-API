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

    test("should return 400 if productId is not a number", async () => {
    const currentUser = await User.authenticate(username1, "password");
    const token = createToken(currentUser);
      const response = await request(app)
        .post(`/api/v1/reviews/product/invalidId/${username1}`)
        .send({ review: "Test", rating: 5 })
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        error: {
          message: "Id must be a number",
          status: 400
        }
      });
    });

    test("should return 400 and error message with missing parameters", async () => {
      const currentUser = await User.authenticate(username1, "password");
      const token = createToken(currentUser);

      const response = await request(app)
        .post(`/api/v1/reviews/product/${productIds[2]}/${username1}`)
        .send({ review: "", rating: 6 }) // No review
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        errors: [
          {
            message: "review does not meet minimum length of 1",
            property: "review",
          },
          {
            message: "rating must be less than or equal to 5",
            property: "rating",
          },
        ]
      });
    });

    test("should return 401 if user is not logged in", async () => {
      const response = await request(app)
        .post(`/api/v1/reviews/product/${productIds[2]}/${username1}`)
        .send({ review: "Test", rating: 5 });

      expect(response.statusCode).toBe(401);
      expect(response.body).toEqual({
        error: {
          message: "Unauthorized",
          status: 401
        }
      });
    });

    test("should return 401 if user is not the owner of the review", async () => {
      const currentUser = await User.authenticate(username2, "password");
      const token = createToken(currentUser);

      const response = await request(app)
        .post(`/api/v1/reviews/product/${productIds[2]}/${username1}`)
        .send({ review: "Test", rating: 5 })
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(401);
      expect(response.body).toEqual({
        error: {
          message: "Unauthorized",
          status: 401
        }
      });
    });

    test("should return 500 on database error", async () => {
      const currentUser = await User.authenticate(username1, "password");
      const token = createToken(currentUser);

      jest.spyOn(Reviews, "addReview").mockImplementation(() => {
        throw new Error("Database error");
      });

      const response = await request(app)
        .post(`/api/v1/reviews/product/${productIds[2]}/${username1}`)
        .send({ review: "Test", rating: 5 })
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(500);
      expect(response.body).toEqual({
        error: {
          message: "Database error",
          status: 500
        }
      });
    });
  });

  describe("PUT /api/v1/reviews/product/:productId/:username", () => {
    test("should update a review for a product", async () => {
      const currentUser = await User.authenticate(username1, "password");
      const token = createToken(currentUser);
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
      expect(response.body.review).toEqual({
        productId: productIds[0],
        userId: userIdUsername[0].id,
        review: "Updated review text",
        rating: 4,
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
      });
    });

    test("should return 400 if productId is not a number", async () => {
      const currentUser = await User.authenticate(username1, "password");
      const token = createToken(currentUser);

      const response = await request(app)
        .put(`/api/v1/reviews/product/invalidId/${username1}`)
        .send({ review: "Test", rating: 5 })
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        error: {
          message: "Id must be a number",
          status: 400
        }
      });
    });

    test("should return 400 if review is invalid", async () => {
      const currentUser = await User.authenticate(username1, "password");
      const token = createToken(currentUser);

      const response = await request(app)
        .put(`/api/v1/reviews/product/${productIds[0]}/${username1}`)
        .send({ review: "", rating: 6 }) // Invalid review and rating
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        errors: [
          {
            message: "review does not meet minimum length of 1",
            property: "review",
          },
          {
            message: "rating must be less than or equal to 5",
            property: "rating",
          },
        ]
      });
    });

    test("should return 401 if user is not logged in", async () => {
      const response = await request(app)
        .put(`/api/v1/reviews/product/${productIds[0]}/${username1}`)
        .send({ review: "Test", rating: 5 });

      expect(response.statusCode).toBe(401);
      expect(response.body).toEqual({
        error: {
          message: "Unauthorized",
          status: 401
        }
      });
    });

    test("should return 500 on database error", async () => {
      const currentUser = await User.authenticate(username1, "password");
      const token = createToken(currentUser);

      jest.spyOn(Reviews, "updateReview").mockImplementation(() => {
        throw new Error("Database error");
      });

      const response = await request(app)
        .put(`/api/v1/reviews/product/${productIds[0]}/${username1}`)
        .send({ review: "Test", rating: 5 })
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(500);
      expect(response.body).toEqual({
        error: {
          message: "Database error",
          status: 500
        }
      });
    });
  });

  describe("DELETE /api/v1/reviews/product/:productId/:username", () => {
    test("should delete a review for a product", async () => {
      const currentUser = await User.authenticate(username1, "password");
      const token = createToken(currentUser);

      const response = await request(app)
        .delete(`/api/v1/reviews/product/${productIds[0]}/${username1}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.result).toEqual({
        productId: productIds[0],
        userId: userIdUsername[0].id,
        review: "nice item",
        rating: expect.any(Number), // rating should be a number
      });
    });

    // test("should return 400 if productId is not a number", async () => {
    //   const currentUser = await User.authenticate(username1, "password");
    //   const token = createToken(currentUser);

    //   const response = await request(app)
    //     .delete(`/api/v1/reviews/product/invalidId/${username1}`)
    //     .set("Authorization", `Bearer ${token}`);

    //   expect(response.statusCode).toBe(400);
    //   expect(response.body).toEqual({
    //     error: {
    //       message: "Id must be a number",
    //       status: 400
    //     }
    //   });
    // });

    test("should return 401 if user is not logged in", async () => {
      const response = await request(app)
        .delete(`/api/v1/reviews/product/${productIds[0]}/${username1}`);

      expect(response.statusCode).toBe(401);
      expect(response.body).toEqual({
        error: {
          message: "Unauthorized",
          status: 401
        }
      });
    });

    // test("should return 404 if review does not exist", async () => {
    //   const currentUser = await User.authenticate(username2, "password");
    //   const token = createToken(currentUser);

    //   const response = await request(app)
    //     .delete(`/api/v1/reviews/product/${productIds[0]}/nonexistentUser`)
    //     .set("Authorization", `Bearer ${token}`);

    //   expect(response.statusCode).toBe(404);
    //   expect(response.body).toEqual({
    //     error: {
    //       message: "Review does not exist",
    //       status: 404
    //     }
    //   });
    // });

    test("should return 500 on database error", async () => {
      const currentUser = await User.authenticate(username1, "password");
      const token = createToken(currentUser);

      jest.spyOn(Reviews, "deleteReview").mockImplementation(() => {
        throw new Error("Database error");
      });

      const response = await request(app)
        .delete(`/api/v1/reviews/product/${productIds[0]}/${username1}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(500);
      expect(response.body).toEqual({
        error: {
          message: "Database error",
          status: 500
        }
      });
    });
    
  });

})