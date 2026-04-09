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
  rawProducts,
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
      const currentUser = await User.authenticate(username1, "password");
      const token = await createToken(currentUser);
      const response = await request(app)
        .post(`/api/v1/orders/${currentUser.username}/createorder`)
        .set("authorization", `Bearer ${token}`)
        .send({
            "cart": [
                {
                    "id": 11,
                    "userId": currentUser.id,
                    "productId": productIds[0],
                    "quantity": 1,
                    "price": rawProducts[0].price,
                },
                {
                    "id": 12,
                    "userId": currentUser.id,
                    "productId": productIds[1],
                    "quantity": 1,
                    "price": rawProducts[1].price,
                }
            ]
        });
        
      expect(response.statusCode).toBe(200);
      expect(response.body.data).toEqual({
        id: expect.any(Number),
        totalAmount: expect.any(Number),
        products: [
          {
            id: 11,
            userId: currentUser.id,
            productId: productIds[0],
            quantity: 1,
            price: rawProducts[0].price,
          },
          {
            id: 12,
            userId: currentUser.id,
            productId: productIds[1],
            quantity: 1,
            price: rawProducts[1].price,
          }
        ]
      });
    });

    test("fails: with invalid username", async () => {
      const currentUser = await User.authenticate(username1, "password");
      const token = await createToken(currentUser);
      const response = await request(app)
        .post(`/api/v1/orders/fakeuser/createorder`)
        .set("authorization", `Bearer ${token}`)
        .send({
            "cart": [
                {
                    "id": 11,
                    "userId": currentUser.id,
                    "productId": productIds[0],
                    "quantity": 1,
                    "price": rawProducts[0].price,
                }
            ]
        });
      
        expect(response.statusCode).toBe(401);
        expect(response.body.error.message).toBe("Unauthorized");
    });
  });

  describe("getOrderById", () => {
    test("works: retrieves order by id successfully", async () => {
      const currentUser = await User.authenticate(username1, "password");
      const token = await createToken(currentUser);
      const response = await request(app)
        .get(`/api/v1/orders/${currentUser.username}/getorder/${orderIds[0]}`)
        .set("authorization", `Bearer ${token}`)

      expect(response.statusCode).toBe(200);
      expect(response.body.data).toEqual({
        totalAmount: expect.any(Number),
        orderItems: expect.any(Array)
      });
    });
    
    test("fails: with invalid order id", async () => {
      const currentUser = await User.authenticate(username1, "password");
      const token = await createToken(currentUser);
      const response = await request(app)
        .get(`/api/v1/orders/${currentUser.username}/getorder/${orderIds[999]}`) // non-existing order id
        .set("authorization", `Bearer ${token}`)

      expect(response.statusCode).toBe(400);
    });

    test("fails: with non-numeric order id", async () => {
      const currentUser = await User.authenticate(username1, "password");
      const token = await createToken(currentUser);
      const response = await request(app)
        .get(`/api/v1/orders/${currentUser.username}/getorder/abc`)
        .set("authorization", `Bearer ${token}`)

      expect(response.statusCode).toBe(400);
    });
  });
  
  describe("getAllOrders", () => {
    test("works: retrieves all orders for a user successfully", async () => {
      const currentUser = await User.authenticate(username1, "password");
      const token = await createToken(currentUser);
      const response = await request(app)
        .get(`/api/v1/orders/${currentUser.username}`)
        .set("authorization", `Bearer ${token}`)

      expect(response.statusCode).toBe(200);
      expect(response.body.data).toEqual(expect.any(Array));
    });

    test("fails: with invalid username", async () => {
      const currentUser = await User.authenticate(username1, "password");
      const token = await createToken(currentUser);
      const response = await request(app)
        .get(`/api/v1/orders/fakeuser`)
        .set("authorization", `Bearer ${token}`)
      
      expect(response.statusCode).toBe(401);
    });
  });
});