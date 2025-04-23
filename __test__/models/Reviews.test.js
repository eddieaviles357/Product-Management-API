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
});