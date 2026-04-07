"use strict";

const request = require("supertest");
const app = require("../../app.js");
const Wishlist = require("../../models/Wishlist.js");
const User = require("../../models/Users.js");
const Orders = require('../../models/Orders.js');
const createToken = require("../../helpers/tokens.js");
const { BadRequestError, ConflictError } = require("../../AppError.js");
const db = require("../../db.js");
const {
  username1,
  productIds,
  orderIds,
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll
} = require("../helpers/_testCommon.js");

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
      console.log("Created order:", order); // Debug log
      expect(order).toBeInstanceOf(Object);
      expect(order).toBeDefined();
      expect(order.products).toHaveLength(2);
      expect(order.id).toEqual(expect.any(Number));
      expect(order.totalAmount).toEqual(40.00); // 2*10 + 1*20
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
  describe("getOrderById", () => {
    test("works: retrieves order by id successfully", async () => {
      const orderId = orderIds[0]; // assuming this is a valid order id
      
      const order = await Orders.getOrderById(orderId);
      expect(order).toBeInstanceOf(Object);
      expect(order.orderItems).toBeInstanceOf(Array);
      expect(order).toBeDefined();
      expect(order.orderItems.length).toBeGreaterThan(0);
      expect(order.orderItems[0].orderId).toBe(orderId); // check if the returned order id matches
    });
    
    test("fails: with invalid order id", async () => {
      const orderId = 99999; // non-existing order id
      await expect(Orders.getOrderById(orderId))
        .rejects.toThrow(BadRequestError);
    });

    test("fails: with non-numeric order id", async () => {
      const orderId = "invalidId"; // non-numeric order id
      await expect(Orders.getOrderById(orderId))
        .rejects.toThrow(BadRequestError);
    });
  });
  
});