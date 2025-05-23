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

describe("get cart using username", () => {

  
  test("works", async () => {
    expect.assertions(3)
    const cart = await Cart.get(username1);
    expect(cart).toBeTruthy();
    expect(cart).not.toHaveLength(0);

    const {id, userId, productId, quantity, price} = cart[0];
    expect(userId).toEqual(userIdUsername[0].id);
  });

  test("throws instance BadRequestError for non existing user", async () => {
    await expect(Cart.get('Janai')).rejects.toThrow(BadRequestError);
  });

  test("throws instance BadRequestError for invalid username", async () => {
    await expect(Cart.get(null)).rejects.toThrow(BadRequestError); 
  });
  
});

describe("add item to cart", () => {
  test("successfully adds item", async () => {
    // expect.assertions(2)
    const newItem = {
      username: userIdUsername[0].username,
      userId: userIdUsername[0].id,
      productId: productIds[0],
      quantity: 1
    };
    
    // First check the cart before adding
    let cartBefore = await Cart.get(newItem.username);
    expect(cartBefore).not.toHaveLength(0); // ensure cart exists then add item to cart
    
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
    const invalidItem = {
      username: userIdUsername[0].username,
      productId: productIds[0]
    };
    await expect(Cart.addToCart(invalidItem.username, 0)).rejects.toThrow(BadRequestError);
  });

  test("throws BadRequestError for invalid username", async () => {
    // Test for invalid username
    await expect(Cart.addToCart(null, productIds[0])).rejects.toThrow(BadRequestError);
  });

  test("successfully adds item with default quantity of 1 when no quantity is provided", async () => {
    const newItem = {
      username: userIdUsername[0].username,
      userId: userIdUsername[0].id,
      productId: productIds[1] // use a different product id for this test
    };

    // First check the cart before adding
    let cartBefore = await Cart.get(newItem.username);
    expect(cartBefore).not.toHaveLength(0); // ensure cart exists then add item to cart
    expect(cartBefore).toBeInstanceOf(Array);

    const addedItem = await Cart.addToCart(newItem.username, newItem.productId); // no quantity provided, should default to 1
    expect(addedItem).toBeTruthy();

    const objToCheckAgainst = {
      userId: newItem.userId,
      productId: newItem.productId,
      quantity: 1, // since we did not provide a quantity it should default to 1

    };
    expect(addedItem).toEqual(expect.objectContaining(objToCheckAgainst));
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
    expect(updatedCart.find(item => item.productId === productId)).toBeUndefined();
  });

  test("returns Nothing to delete when no item exist in db", async () => {
    const result = await Cart.removeCartItem(username1, 99999999); // non-existent productId
    // When trying to delete a non-existent item, it should return 'Nothing to delete'
    expect(result).toEqual("Nothing to delete");
  });

  describe("update item in cart", () => {
    test("successfully updates item quantity", async () => {
      const cart = await Cart.get(username1);
      expect(cart).toBeTruthy();
      const productId = cart[0].productId; // get the productId in the cart to update
      const cartQuantityBeforeUpdate = cart[0].quantity; // save the current quantity for comparison

      const updatedItem = await Cart.updateCartItemQty(username1, productId, 5); // update the quantity by 5
      expect(updatedItem).toBeTruthy(); // should return the updated item
      expect(updatedItem).toEqual(expect.objectContaining({
        userId: expect.any(Number),
        productId: productId,
        quantity: cartQuantityBeforeUpdate + 5 // should be the updated quantity plus the original quantity
      }));
    });

    test("successfully updates item quantity to 0 and removes it from the cart", async () => {
      const cart = await Cart.get(username1); // quantity is 1 to test removal
      expect(cart).toBeTruthy();
      expect(cart).toBeInstanceOf(Array);
      const productId = cart[0].productId; // get the productId in the cart to update
      
      const updatedItem = await Cart.updateCartItemQty(username1, productId, -1); // reduce by 1
      expect(updatedItem).toEqual({}); // should return an empty object since it was removed from the cart

      const item = await Cart.get(username1);
      expect(item).not.toContainEqual(expect.objectContaining({productId})); // should no longer be in the cart
    });

    test("throws BadRequestError for invalid username", async () => {
      await expect(Cart.updateCartItemQty(null, productIds[0], 1)).rejects.toThrow(BadRequestError);
    });

    test("throws BadRequestError when trying to update a non-existent productId", async () => {
      await expect(Cart.updateCartItemQty(username1, 99999999, 1)).rejects.toThrow("Nothing to update");
    });
  });

  describe("clear cart", () => {
    test("successfully clears the cart for a valid user", async () => {
      // Ensure the cart has items before clearing
      const cartBefore = await Cart.get(username1);
      expect(cartBefore[0]).toBeTruthy(); // Cart should not be empty
  
      // Clear the cart
      const result = await Cart.clear(username1);
      expect(result).toBe(true); // Should return true indicating the cart was cleared
  
      // Verify the cart is now empty
      const cartAfter = await Cart.get(username1);
      expect(cartAfter).toHaveLength(0); // Cart should now be empty
    });
  
    test("returns false when clearing an already empty cart", async () => {
      // Ensure the cart is empty
      await Cart.clear(username1);
      const cartBefore = await Cart.get(username1);
      expect(cartBefore).toBeInstanceOf(Array);
      expect(cartBefore).toHaveLength(0); // Cart should already be empty
  
      // Attempt to clear the empty cart
      const result = await Cart.clear(username1);
      expect(result).toBe(false); // Should return false indicating no items were present to clear
    });
  
    test("throws BadRequestError for invalid username", async () => {
      await expect(Cart.clear(null)).rejects.toThrow(BadRequestError);
    });
  });
  
  describe("_getPrice", () => {
    test("successfully retrieves price for a valid productId", async () => {
      const price = await Cart._getPrice(productIds[0]); // Use a valid productId
      expect(price).toBeDefined();
      expect(price).toBeGreaterThan(0); // Ensure the price is greater than 0
    });

    test("returns undefined for a non-existent productId", async () => {
      const price = await Cart._getPrice(99999999); // Non-existent productId
      expect(price).toBeNull(); // Should return undefined for non-existent products
    });

    test("throws an error when called with invalid input", async () => {
      await expect(Cart._getPrice(null)).rejects.toThrow();
    });
  });
});