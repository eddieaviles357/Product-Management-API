"use strict";

const Cart = require('../../models/Cart');
const {BadRequestError} = require("../../AppError");
const {
  productIds,
  userIdUsername,
  username1,
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll
} = require("../helpers/_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("Cart Model Tests", () => {
  describe("get cart using username", () => {
    test("works", async () => {
      expect.assertions(3);
      const cart = await Cart.get(username1);
      expect(cart).toBeTruthy();
      expect(cart).not.toHaveLength(0);

      const {id, userId, productId, quantity, price} = cart[0];
      expect(userId).toEqual(userIdUsername[0].id);
    });

    test("throws BadRequestError for non existing user", async () => {
      await expect(Cart.get('nonexistent')).rejects.toThrow(BadRequestError);
    });

    test("throws BadRequestError for invalid username", async () => {
      await expect(Cart.get(null)).rejects.toThrow(BadRequestError); 
    });
  });

  describe("add item to cart", () => {
    test("successfully adds item", async () => {
      const newItem = {
        username: userIdUsername[0].username,
        userId: userIdUsername[0].id,
        productId: productIds[0],
        quantity: 1
      };
      
      let cartBefore = await Cart.get(newItem.username);
      expect(cartBefore).not.toHaveLength(0);
      
      const addedItem = await Cart.addToCart(newItem.username, newItem.productId, newItem.quantity);
      expect(addedItem).toBeTruthy();

      const objToCheckAgainst = {
        userId: newItem.userId, 
        productId: newItem.productId, 
        quantity: newItem.quantity
      };
      expect(addedItem).toEqual(expect.objectContaining(objToCheckAgainst));
    });

    test("throws error for invalid id", async () => {
      await expect(Cart.addToCart(userIdUsername[0].username, 0)).rejects.toThrow(BadRequestError);
    });

    test("throws BadRequestError for invalid username", async () => {
      await expect(Cart.addToCart(null, productIds[0])).rejects.toThrow(BadRequestError);
    });

    test("successfully adds item with default quantity", async () => {
      const newItem = {
        username: userIdUsername[0].username,
        userId: userIdUsername[0].id,
        productId: productIds[1]
      };

      const addedItem = await Cart.addToCart(newItem.username, newItem.productId);
      expect(addedItem).toBeTruthy();
      expect(addedItem.quantity).toEqual(1);
    });
  });

  describe("remove item from cart", () => {
    test("successfully removes item", async () => {
      const result = await Cart.removeCartItem(username1, productIds[0]);
      expect(result).toBeTruthy();
    });

    test("returns nothing to delete for non-existent product", async () => {
      const result = await Cart.removeCartItem(username1, 99999999);
      expect(result).toEqual("Nothing to delete");
    });
  });

  describe("update item in cart", () => {
    test("successfully updates item quantity", async () => {
      const cart = await Cart.get(username1);
      expect(cart).toBeTruthy();
      const productId = cart[0].productId;

      const updatedItem = await Cart.updateCartItemQty(username1, productId, 5);
      expect(updatedItem).toBeTruthy();
      expect(updatedItem.productId).toEqual(productId);
    });

    test("throws BadRequestError for invalid username", async () => {
      await expect(Cart.updateCartItemQty(null, productIds[0], 1)).rejects.toThrow(BadRequestError);
    });

    test("throws error for non-existent productId", async () => {
      const invalidProductId = 99999999;
      await expect(Cart.updateCartItemQty(username1, invalidProductId, 1)).rejects.toThrow();
    });
  });

  describe("clear cart", () => {
    test("successfully clears the cart", async () => {
      const cartBefore = await Cart.get(username1);
      expect(cartBefore[0]).toBeTruthy();
  
      const result = await Cart.clear(username1);
      expect(result).toBe(true);
  
      const cartAfter = await Cart.get(username1);
      expect(cartAfter).toHaveLength(0);
    });
  
    test("throws BadRequestError for invalid username", async () => {
      await expect(Cart.clear(null)).rejects.toThrow(BadRequestError);
    });
  });
  
  describe("_getPrice", () => {
    test("successfully retrieves price for a valid productId", async () => {
      const price = await Cart._getPrice(productIds[0]);
      expect(price).toBeDefined();
      expect(price).toBeGreaterThan(0);
    });

    test("returns null for non-existent productId", async () => {
      const price = await Cart._getPrice(99999999);
      expect(price).toBeNull();
    });

    test("throws error when called with invalid input", async () => {
      await expect(Cart._getPrice(null)).rejects.toThrow();
    });
  });
});