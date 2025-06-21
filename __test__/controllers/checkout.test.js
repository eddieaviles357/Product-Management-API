"use strict";

const request = require("supertest");
const app = require("../../app");
const Wishlist = require("../../models/Wishlist");
const User = require("../../models/Users");
const Orders = require('../../models/Orders');
const createToken = require("../../helpers/tokens");
const { BadRequestError, ConflictError } = require("../../AppError");
const db = require("../../db.js");
const {
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
      expect(order[0]).toBeDefined();
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

  describe("getOrderTotalAmount", () => {
    test("works: retrieves total amount for a valid order id", async () => {
      const orderId = orderIds[0]; // assuming this is a valid order id
      
      const totalAmount = await Orders._getOrderTotalAmount(orderId);
      expect(totalAmount).toBeDefined();
      expect(typeof totalAmount).toBe("string"); // db returns numeric as string
      expect(Number(totalAmount)).toBeGreaterThan(0);
    });

    test("fails: with invalid order id", async () => {
      const orderId = 99999; // non-existing order id
      await expect(Orders._getOrderTotalAmount(orderId))
        .rejects.toThrow(BadRequestError);
    });

    test("fails: with non-numeric order id", async () => {
      const orderId = "invalidId"; // non-numeric order id
      await expect(Orders._getOrderTotalAmount(orderId))
        .rejects.toThrow(BadRequestError);
    });
  });

  describe("_insertOrderProducts", () => {
    test("works: inserts order products successfully", async () => {
      const orderId = orderIds[0]; // assuming this is a valid order id
      const product = { productId: productIds[0], quantity: 2, price: 10.00 }
      
      const insertedProducts = await Orders._insertOrderProducts(orderId, product);
      expect(typeof insertedProducts).toBe("number");
      expect(insertedProducts).toBeDefined();
    });

    test("fails: with invalid order id", async () => {
      const orderId = 99999; // non-existing order id
      const products = [
        { productId: productIds[0], quantity: 2, price: 10.00 }
      ];
      
      await expect(Orders._insertOrderProducts(orderId, products))
        .rejects.toThrow(BadRequestError);
    });

    test("fails: with empty products array", async () => {
      const orderId = orderIds[0]; // assuming this is a valid order id
      const products = [];
      
      await expect(Orders._insertOrderProducts(orderId, products))
        .rejects.toThrow(BadRequestError);
    });
  });
  
});