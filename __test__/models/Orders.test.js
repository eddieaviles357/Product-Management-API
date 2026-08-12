"use strict";

const Orders = require('../../models/Orders');
const { BadRequestError } = require("../../AppError");
const {
  username1,
  username2,
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
      expect(order).toBeInstanceOf(Object);
      expect(order).toBeDefined();
      expect(order).toHaveProperty("id");
      expect(order).toHaveProperty("totalAmount");
      expect(order.address).toEqual(expect.objectContaining({
        id: expect.any(Number),
        userId: expect.any(Number),
        address1: expect.any(String),
        city: expect.any(String),
        state: expect.any(String),
        zipcode: expect.any(String)
      }));
      expect(order.address.address2).toBeNull();
      expect(order.products).toBeInstanceOf(Array);
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
      const orderId = orderIds[0];
      
      const order = await Orders.getOrderById(orderId);
      
      expect(order).toBeInstanceOf(Object);
      expect(order.orderItems.length).toBeGreaterThan(0);
      expect(order).toHaveProperty("orderId");
      expect(order).toHaveProperty("orderStatus");
      expect(order).toHaveProperty("totalAmount");
      expect(order).toHaveProperty("createdAt");
      expect(order).toHaveProperty("updatedAt");
      expect(order).toHaveProperty("address1");
      expect(order).toHaveProperty("city");
      expect(order).toHaveProperty("state");
      expect(order).toHaveProperty("zipcode");
      expect(order).toHaveProperty("orderItems");
      expect(order.orderItems).toBeInstanceOf(Array);
      expect(order.orderItems.length).toBeGreaterThan(0);
      expect(order.orderItems[0]).toEqual(expect.objectContaining({
        productId: expect.any(Number),
        quantity: expect.any(Number),
        productName: expect.any(String),
        productDescription: expect.any(String),
        productPrice: expect.any(Number),
        imageURL: expect.any(String)
      }));
      expect(order.address2).toBeNull();
    });
    
    test("does not fail even with invalid order id", async () => {
      const orderId = 99999;
      
      const result = await Orders.getOrderById(orderId);
      expect(result).toEqual({});
    });

  });

  describe("getAllOrdersByUsername", () => {
    test("works: retrieves all orders for a given username", async () => {
      const username = username1;
      
      const orders = await Orders.getAllOrdersByUsername(username);
      
      expect(orders).toBeInstanceOf(Array);
      expect(orders.length).toBeGreaterThan(0);
      orders.forEach(order => {
        expect(order).toHaveProperty("orderId");
        expect(order).toHaveProperty("orderStatus");
        expect(order).toHaveProperty("totalAmount");
        expect(order).toHaveProperty("address1");
        expect(order).toHaveProperty("city");
        expect(order).toHaveProperty("state");
        expect(order).toHaveProperty("zipcode");
        expect(order).toHaveProperty("orderItems");
        expect(order.orderItems).toBeInstanceOf(Array);
      });
    });

    test("returns empty array with invalid username", async () => {
      const username = "invalidUsername";
      
      const orders = await Orders.getAllOrdersByUsername(username);
      expect(orders).toBeInstanceOf(Array);
      expect(orders.length).toBe(0);
    });
  });
});