"use strict";

const Cart = require('../../models/Cart');
const {BadRequestError} = require("../../AppError");
const {
  productIds,
  categoryIds,
  userIdUsername,
  addressIds,
  username1,
  username2,
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll
} = require("../helpers/_testCommon");
beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("get cart using username", () => {

  
  test("works", async () => {
    expect.assertions(3)
    const cart = await Cart.get(username1);
    expect(cart).toBeTruthy();
    expect(cart).not.toHaveLength(0);

    const {id, userId, productId, quantity, price} = cart[0];
    expect(userId).toEqual(userIdUsername[0].id);
  });

  test("no user exist should be empty array []", async () => {
    expect.assertions(2)
    const cart = await Cart.get('Janai');
    expect(cart).toBeInstanceOf(Array);
    expect(cart).toHaveLength(0);
  });

  test("throws instance BadRequestError for invalid username", async () => {
    try {
      const test = await Cart.get(null); // this should throw an error
    } catch (err) {
      expect(err).toBeInstanceOf(BadRequestError); 
    }
  });
  
});

describe("add item to cart", () => {
  test("successfully adds item", async () => {
    // expect.assertions(2)
    const newItem = {
      username: userIdUsername[0].username,
      user_id: userIdUsername[0].id,
      product_id: productIds[0],
      quantity: 1
    };
    
    // First check the cart before adding
    let cartBefore = await Cart.get(newItem.username);
    expect(cartBefore).not.toHaveLength(0); // ensure cart exists then add item to cart
    
    const addedItem = await Cart.addToCart(newItem.username, newItem.product_id, newItem.quantity);
    expect(addedItem).toBeTruthy();

    const objToCheckAgainst = {
      user_id: newItem.user_id, 
      product_id: newItem.product_id, 
      quantity: newItem.quantity
    };
    expect(addedItem).toEqual(expect.objectContaining(objToCheckAgainst));
  });

  test("throws error for invalid id", async () => {
    const invalidItem = {
      username: userIdUsername[0].username,
      productId: productIds[0]
    };
    await expect(Cart.addToCart(invalidItem.username, 0)).rejects.toThrow("Item 0 does not exist");
  });
});

describe("remove item from cart", () => {
  test("successfully removes item", async () => {
    const cart = await Cart.get(username1);
    const productId = cart[0].productId;
    const itemId = cart[0].id; // this is the id of the cart item to be deleted
    expect(cart).toBeTruthy();

    const result = await Cart.removeCartItem(username1, productId);
    expect(result).toEqual(itemId); // should return the id of the deleted item

    const item = await Cart.get(username1);
    expect(item).toBeTruthy();

    // Now check if the item is actually removed from the cart
    const updatedCart = await Cart.get(username1);
    console.log('UPDATED CART ', updatedCart)
    expect(updatedCart.find(item => item.productId === productId)).toBeUndefined();
  });

  // test("returns Nothing to delete when no item exist in db", async () => {
  //   await expect(Cart.removeCartItem(99999)).rejects.toThrow("Nothing to delete");
  // });
});