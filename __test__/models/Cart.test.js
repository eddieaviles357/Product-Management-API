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

describe("get cart using username", () => {

  beforeAll(commonBeforeAll);
  beforeEach(commonBeforeEach);
  afterEach(commonAfterEach);
  afterAll(commonAfterAll);
  
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
  })
})