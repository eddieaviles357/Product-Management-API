"use strict";

const Orders = require('../../models/Orders');
const { BadRequestError } = require("../../AppError");
const {
  userIdUsername,
  username1,
  productIds,
  orderIds,
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
    test("works: create a new order with a cart", async () => {
      const username = username1;
      const cart = [
        { productId: productIds[0], quantity: 2, price: 10.00 },
        { productId: productIds[1], quantity: 1, price: 20.00 }
      ];
      
      const order = await Orders.create(username, { cart });
      expect(order).toBeInstanceOf(Array);
      expect(order).toBeDefined();
      expect(order).toHaveLength(2);
      expect(order[0].id).toBeDefined(); // check if order id is defined
    });

    test("fails: with invalid username", async () => {
      const username = "invalidUsername";
      const cart = [
        { productId: productIds[0], quantity: 2, price: 10.00 }
      ];
      
      await expect(Orders.create(username, { cart }))
        .rejects.toThrow(BadRequestError);
    });
  });
  describe("_insertOrderProducts", () => {

    test("works: inserts order products successfully", async () => {
      const orderId = orderIds[0]; // assuming this is a valid order id
      const queryValues = { productId: productIds[0], quantity: 2, price: 10.00 };
      
      const result = await Orders._insertOrderProducts(orderId, queryValues);
      expect(result).toBeDefined();
      expect(result.id).toBeDefined(); // check if the inserted row's id is defined
    });
    
    test("fails: with invalid order id", async () => {
      const orderId = 99999; // non-existing order id
      const queryValues = { productId: productIds[0], quantity: 2, price: 10.00 };
      
      await expect(Orders._insertOrderProducts(orderId, queryValues))
        .rejects.toThrow(BadRequestError);
    });
  });
});  