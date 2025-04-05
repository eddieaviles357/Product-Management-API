"use strict";

const Orders = require('../../models/Orders');
const { BadRequestError } = require("../../AppError");
const {
  userIdUsername,
  username1,
  productIds,
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll
} = require("../helpers/_testCommon");

describe("Orders model tests", () => {
  beforeAll(commonBeforeAll);
  beforeEach(commonBeforeEach);
  afterEach(commonAfterEach);
  afterAll(commonAfterAll);

  describe("create Order", () => {
    test("successfully creates an order", async () => {
      const orderData = {
        username: username1,
        cart: [
          { productId: productIds[0], quantity: 2, price: 10.00 },
          { productId: productIds[1], quantity: 1, price: 5.00 }
        ]
      };
      console.log(orderData.cart)
      const order = await Orders.create(orderData.username, orderData);
      expect(order).toBeTruthy();
      expect(order).toHaveProperty("id");
      expect(order.cart).toHaveLength(2);
    });

  });
});