"use strict";

const Wishlist = require("../../models/Wishlist");
const { BadRequestError, ConflictError } = require("../../AppError");
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
const db = require("../../db.js");

// getWishList
// addProduct
// removeProduct
// removeAll

describe("Wishlist Model", function () {
  beforeAll(commonBeforeAll);
  beforeEach(commonBeforeEach);
  afterEach(commonAfterEach);
  afterAll(commonAfterAll);

  describe("get wish list", function () {
    test("works: get wishlist for user1", async function () {
      const wishlist = await Wishlist.getWishlist(username1);
      expect(wishlist).toEqual([
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
      ]);
    });

    test("works: get wishlist for user2", async function () {
      const wishlist = await Wishlist.getWishlist(username2);
      expect(wishlist).toEqual([
        {
          productId: productIds[0],
          productName: "shirt",
          productPrice: "10.99",
          productImageUrl: "https://image.product-management.com/1283859"
        }
      ]);
    });

    test("fails: no username provided", async function () {
      await expect(Wishlist.getWishlist()).rejects.toThrow(BadRequestError);
    });

    test("fails: user does not exist", async function () {
      await expect(Wishlist.getWishlist("nonexistentuser")).rejects.toThrow(BadRequestError);
    });

    test("fails: no products found in wishlist", async function () {
      await db.query(`DELETE FROM wishlist WHERE user_id = $1`, [userIdUsername[0].id]);
      await expect(Wishlist.getWishlist(username1)).rejects.toThrow(BadRequestError);
    });
    test("fails: error in query", async function () {
      jest.spyOn(db, "query").mockImplementationOnce(() => {
        throw new Error("Database error");
      });
      await expect(Wishlist.getWishlist(username1)).rejects.toThrow(BadRequestError);
    });
  });

  describe("add product to wishlist", function () {
    test("works: add product to wishlist", async function () {
      const result = await Wishlist.addProduct(username1, productIds[2]);
      expect(result).toEqual({
        userId: userIdUsername[0].id,
        productId: productIds[2],
      });
    });

    test("fails: no username provided", async function () {
      await expect(Wishlist.addProduct()).rejects.toThrow(BadRequestError);
    });

    test("fails: user does not exist", async function () {
      await expect(Wishlist.addProduct("nonexistentuser", productIds[0])).rejects.toThrow(BadRequestError);
    });

    test("fails: product does not exist", async function () {
      await expect(Wishlist.addProduct(username1, 999)).rejects.toThrow(BadRequestError);
    });

    test("fails: product already exists in wishlist", async function () {
      await expect(Wishlist.addProduct(username1, productIds[0])).rejects.toThrow(ConflictError);
    }
    );
  });

  describe("remove product from wishlist", function () {
    test("works: remove product from wishlist", async function () {
      const result = await Wishlist.removeProduct(username1, productIds[0]);
      expect(result).toEqual({
        product: productIds[0],
        success: true
      });
    });

    test("fails: no username provided", async function () {
      await expect(Wishlist.removeProduct()).rejects.toThrow(BadRequestError);
    });

    test("fails: user does not exist", async function () {
      await expect(Wishlist.removeProduct("nonexistentuser", productIds[0])).rejects.toThrow(BadRequestError);
    });

    test("fails: product does not exist in wishlist", async function () {
      const result = await Wishlist.removeProduct(username1, productIds[2]);
      expect(result).toEqual({
        product: productIds[2],
        success: false
      });
    });
  });

  describe("remove all products from wishlist", function () {
    test("works: remove all products from wishlist", async function () {
      const result = await Wishlist.removeAll(username1);
      expect(result).toBe(true);
    });

    test("fails: no username provided", async function () {
      await expect(Wishlist.removeAll()).rejects.toThrow(BadRequestError);
    });

    test("fails: user does not exist", async function () {
      await expect(Wishlist.removeAll("nonexistentuser")).rejects.toThrow(BadRequestError);
    });
  });
});