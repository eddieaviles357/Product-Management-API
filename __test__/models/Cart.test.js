"use strict";

const Cart = require('../../models/Cart');
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

test("test", () => expect(true).toBe(true) )

// describe("get cart using username", () => {


//   test("works", async () => {
//     console.log('CART_TEST')
//     expect.assertions(1)
//     const cart = await Cart.get(username1);
//     console.log('CART_TEST', cart)
//     await expect(cart).toBeTruthy();
//   })
// })