"use strict";

// const db = require("../../db.js");
const Reviews = require("../../models/Reviews");
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

// getSingleReview
// getReviewsForOneProduct
// addReview
// updateReview
// deleteReview


describe("Reviews Model", function () {
  beforeAll(commonBeforeAll);
  beforeEach(commonBeforeEach);
  afterEach(commonAfterEach);
  afterAll(commonAfterAll);

  describe("getSingleReview", function () {
    test("works", async function () {
      const testUserId = userIdUsername[0].id;
      const review = await Reviews.getSingleReview(productIds[0], username1);

      expect(review).toEqual({
        productId: productIds[0],
        userId: testUserId,
        review: "nice item",
        rating: 1,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      });
    });

    test("not found if no review exists", async function () {
      const noReviewResult = await Reviews.getSingleReview(productIds[1], username2);

      expect(noReviewResult).toEqual({});
      expect(noReviewResult).toBeInstanceOf(Object);
    });

    test("throws BadRequestError if productId or username is missing", async function () {
      await expect(Reviews.getSingleReview()).rejects.toThrow(BadRequestError);
      await expect(Reviews.getSingleReview(productIds[0])).rejects.toThrow(BadRequestError);
      await expect(Reviews.getSingleReview(null, username1)).rejects.toThrow(BadRequestError);
    });
  });

  describe("getReviewsForOneProduct", function () {
    test("works", async function () {
      const reviews = await Reviews.getReviewsForOneProduct(productIds[0]);
      expect(reviews).toBeInstanceOf(Array);
      expect(reviews.length).toEqual(2);
      expect(reviews).toEqual([
        {
          productId: productIds[0],
          userId: userIdUsername[0].id,
          firstName: "west",
          review: "nice item",
          rating: 1,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date)
        },
        {
          productId: productIds[0],
          userId: userIdUsername[1].id,
          firstName: "north",
          review: "horrible",
          rating: 5,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date)
        }
      ]);
    });

    test("not found if no reviews exist for product", async function () {
      const noReviewsResult = await Reviews.getReviewsForOneProduct(productIds[2]);
      expect(noReviewsResult).toEqual([]);
      expect(noReviewsResult).toBeInstanceOf(Array);
    });
    
    test("throws BadRequestError if prodId is missing", async function () {
      await expect(Reviews.getReviewsForOneProduct()).rejects.toThrow(BadRequestError);
    });
  });

  describe("addReview", function () {
    test("works", async function () {
      const newReview = await Reviews.addReview(productIds[2], username1, "awesome item", 5);
      expect(newReview).toBeInstanceOf(Object);
      expect(newReview).toHaveProperty("productId");
      expect(newReview).toHaveProperty("userId");
      expect(newReview).toHaveProperty("review");
      expect(newReview).toHaveProperty("rating");
      expect(newReview).toHaveProperty("createdAt");
      expect(newReview).toHaveProperty("updatedAt");
      expect(newReview).toEqual({
        productId: productIds[2],
        userId: userIdUsername[0].id,
        review: "awesome item",
        rating: 5,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      });
    });

    test("throws BadRequestError if productId or username is missing", async function () {
      await expect(Reviews.addReview()).rejects.toThrow(BadRequestError);
      await expect(Reviews.addReview(productIds[0])).rejects.toThrow(BadRequestError);
      await expect(Reviews.addReview(null, username1)).rejects.toThrow(BadRequestError);
    });

    test("throws BadRequestError if review or rating is missing", async function () {
      await expect(Reviews.addReview(productIds[0], username1)).rejects.toThrow(BadRequestError);
      await expect(Reviews.addReview(productIds[0], username1, null)).rejects.toThrow(BadRequestError);
      await expect(Reviews.addReview(productIds[0], username1, "awesome item")).rejects.toThrow(BadRequestError);
    });
    test("throws BadRequestError if rating is not a number", async function () {
      await expect(Reviews.addReview(productIds[0], username1, "awesome item", "five")).rejects.toThrow(BadRequestError);
    });
    test("throws BadRequestError if rating is not between 1 and 5", async function () {
      await expect(Reviews.addReview(productIds[0], username1, "awesome item", 6)).rejects.toThrow(BadRequestError);
      await expect(Reviews.addReview(productIds[0], username1, "awesome item", 0)).rejects.toThrow(BadRequestError);
    });
    test("throws BadRequestError if review is not a string", async function () {
      await expect(Reviews.addReview(productIds[0], username1, 5)).rejects.toThrow(BadRequestError);
    });
    test("throws BadRequestError if review is not between 1 and 500 characters", async function () {
      await expect(Reviews.addReview(productIds[0], username1, "a".repeat(501))).rejects.toThrow(BadRequestError);
      await expect(Reviews.addReview(productIds[0], username1, "a".repeat(0))).rejects.toThrow(BadRequestError);
    });
    test("throws BadRequestError if review already exists for product and user", async function () {
      await expect(Reviews.addReview(productIds[0], username1, "awesome item", 5)).rejects.toThrow(BadRequestError);
    });
  });

  describe("updateReview", function () {
    test("works", async function () {
      const updatedReview = await Reviews.updateReview(productIds[0], username1, "awesome item", 5);
      expect(updatedReview).toBeInstanceOf(Object);
      expect(updatedReview).toHaveProperty("productId");
      expect(updatedReview).toHaveProperty("userId");
      expect(updatedReview).toHaveProperty("review");
      expect(updatedReview).toHaveProperty("rating");
      expect(updatedReview).toHaveProperty("createdAt");
      expect(updatedReview).toHaveProperty("updatedAt");
      expect(updatedReview).toEqual({
        productId: productIds[0],
        userId: userIdUsername[0].id,
        review: "awesome item",
        rating: 5,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      });
    });

    test("throws BadRequestError if productId or username is missing", async function () {
      await expect(Reviews.updateReview()).rejects.toThrow(BadRequestError);
      await expect(Reviews.updateReview(productIds[0])).rejects.toThrow(BadRequestError);
      await expect(Reviews.updateReview(null, username1)).rejects.toThrow(BadRequestError);
    });

    test("throws BadRequestError if review or rating is missing", async function () {
      await expect(Reviews.updateReview(productIds[0], username1)).rejects.toThrow(BadRequestError);
      await expect(Reviews.updateReview(productIds[0], username1, null)).rejects.toThrow(BadRequestError);
      await expect(Reviews.updateReview(productIds[0], username1, "awesome item")).rejects.toThrow(BadRequestError);
    });

    test("throws BadRequestError if rating is not a number", async function () {
      await expect(Reviews.updateReview(productIds[0], username1, "awesome item", "five")).rejects.toThrow(BadRequestError);
    });

    test("throws BadRequestError if rating is not between 1 and 5", async function () {
      await expect(Reviews.updateReview(productIds[0], username1, "awesome item", 6)).rejects.toThrow(BadRequestError);
      await expect(Reviews.updateReview(productIds[0], username1, "awesome item", 0)).rejects.toThrow(BadRequestError);
    });

    test("throws BadRequestError if review is not a string", async function () {
      await expect(Reviews.updateReview(productIds[0], username1, 5)).rejects.toThrow(BadRequestError);
    });

    test("throws BadRequestError if review is not between 1 and 500 characters", async function () {
      await expect(Reviews.updateReview(productIds[0], username1, "a".repeat(501))).rejects.toThrow(BadRequestError);
      await expect(Reviews.updateReview(productIds[0], username1, "a".repeat(0))).rejects.toThrow(BadRequestError);
    });

    test("throws BadRequestError if review does not exist for product and user", async function () {
      await expect(Reviews.updateReview(productIds[2], username1, "awesome item", 5)).rejects.toThrow(BadRequestError);
    });
  });

  describe("deleteReview", function () {
    test("works", async function () {
      const deletedReview = await Reviews.deleteReview(productIds[0], username1);
      
      expect(deletedReview).toBeInstanceOf(Object);
      expect(deletedReview).toHaveProperty("review");
      expect(deletedReview).toHaveProperty("success");
      expect(deletedReview.success).toBe(true);
      expect(deletedReview.review).toEqual({ 
        userId: userIdUsername[0].id, 
        productId: productIds[0], 
        review: 'nice item' 
      });
    });

    test("throws BadRequestError if productId or username is missing", async function () {
      await expect(Reviews.deleteReview()).rejects.toThrow(BadRequestError);
      await expect(Reviews.deleteReview(productIds[0])).rejects.toThrow(BadRequestError);
      await expect(Reviews.deleteReview(null, username1)).rejects.toThrow(BadRequestError);
    });

    test("throws BadRequestError if review does not exist for product and user", async function () {
      await expect(Reviews.deleteReview(productIds[2], username1)).rejects.toThrow(BadRequestError);
    });
  });
});