"use strict";

const request = require("supertest");
const app = require("../../app");
const Wishlist = require("../../models/Wishlist");
const User = require("../../models/Users");
const createToken = require("../../helpers/tokens");
const { BadRequestError, ConflictError } = require("../../AppError");
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

describe("Wishlist Model", function () {
  beforeAll(commonBeforeAll);
  beforeEach(commonBeforeEach);
  afterEach(commonAfterEach);
  afterAll(commonAfterAll);

  describe("getWishlist", function () {
    test("works", async function () {
      const currentUser = await User.authenticate(username1, "password");
      const token = createToken(currentUser);

      const result = await request(app)
        .get(`/api/v1/wishlist/${username1}`)
        .set("Authorization", `Bearer ${token}`);

      expect(result.statusCode).toBe(200);
      expect(result.body).toEqual({
        success: true,
        wishlist: [
          {
            productId: productIds[0],
            productName: "shirt",
            productPrice: "10.99",
            productImageUrl: "https://image.product-management.com/1283859"
          },
          {
            productId: productIds[1],
            productName: "pants",
            productPrice: "19.99",
            productImageUrl: "https://image.product-management.com/1283859"
          }
        ]
      });
    });
  });
})