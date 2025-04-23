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


});