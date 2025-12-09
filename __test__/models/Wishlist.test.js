"use strict";

const Wishlist = require("../../models/Wishlist");
const { BadRequestError, ConflictError } = require("../../AppError");
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
const db = require("../../db.js");

describe("Wishlist Model", () => {
  beforeAll(commonBeforeAll);
  beforeEach(commonBeforeEach);
  afterEach(commonAfterEach);
  afterAll(commonAfterAll);

  describe("get wish list", () => {
    test("works: get wishlist for user1", async () => {
      const wishlist = await Wishlist.getWishlist(username1);
      expect(wishlist).toEqual(expect.arrayContaining([
        expect.objectContaining({
          productId: expect.any(Number),
          productName: expect.any(String)
        })
      ]));
    });

    test("works: get wishlist for user2", async () => {
      const wishlist = await Wishlist.getWishlist(username2);
      expect(wishlist).toBeInstanceOf(Array);
      expect(wishlist.length).toBeGreaterThan(0);
    });

    test("fails: no username provided", async () => {
      await expect(Wishlist.getWishlist()).rejects.toThrow(BadRequestError);
    });

    test("fails: user does not exist", async () => {
      await expect(Wishlist.getWishlist("nonexistentuser")).rejects.toThrow(BadRequestError);
    });

    test("fails: error in query", async () => {
      jest.spyOn(db, "query").mockImplementationOnce(() => {
        throw new Error("Database error");
      });
      await expect(Wishlist.getWishlist(username1)).rejects.toThrow(BadRequestError);
    });
  });

  describe("add product to wishlist", () => {
    test("works: add product to wishlist", async () => {
      const result = await Wishlist.addProduct(username1, productIds[2]);
      expect(result).toEqual({
        userId: userIdUsername[0].id,
        productId: productIds[2]
      });
    });

    test("fails: no username provided", async () => {
      await expect(Wishlist.addProduct()).rejects.toThrow(BadRequestError);
    });

    test("fails: user does not exist", async () => {
      await expect(Wishlist.addProduct("nonexistentuser", productIds[0])).rejects.toThrow(BadRequestError);
    });

    test("fails: product does not exist", async () => {
      await expect(Wishlist.addProduct(username1, 999)).rejects.toThrow(BadRequestError);
    });

    test("fails: product already exists in wishlist", async () => {
      await expect(Wishlist.addProduct(username1, productIds[0])).rejects.toThrow(ConflictError);
    });
  });

  describe("remove product from wishlist", () => {
    test("works: remove product from wishlist", async () => {
      const result = await Wishlist.removeProduct(username1, productIds[0]);
      expect(result).toEqual({
        product: productIds[0],
        success: true
      });
    });

    test("fails: no username provided", async () => {
      await expect(Wishlist.removeProduct()).rejects.toThrow(BadRequestError);
    });

    test("fails: user does not exist", async () => {
      await expect(Wishlist.removeProduct("nonexistentuser", productIds[0])).rejects.toThrow(BadRequestError);
    });

    test("fails: product does not exist in wishlist", async () => {
      const result = await Wishlist.removeProduct(username1, productIds[2]);
      expect(result).toEqual({
        product: productIds[2],
        success: false
      });
    });
  });

  describe("remove all products from wishlist", () => {
    test("works: remove all products from wishlist", async () => {
      const result = await Wishlist.removeAll(username1);
      expect(result).toBe(true);
    });

    test("fails: no username provided", async () => {
      await expect(Wishlist.removeAll()).rejects.toThrow(BadRequestError);
    });

    test("fails: user does not exist", async () => {
      await expect(Wishlist.removeAll("nonexistentuser")).rejects.toThrow(BadRequestError);
    });
  });
});