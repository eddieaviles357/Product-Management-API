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
      console.log("REVIEW", review);
      expect(review).toEqual({
        productId: productIds[0],
        userId: testUserId,
        review: "nice item",
        rating: 1,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      });
    });
  });
});