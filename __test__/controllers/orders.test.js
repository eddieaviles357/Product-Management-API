"use strict";

const request = require("supertest");
const app = require("../../app.js");
const Wishlist = require("../../models/Wishlist.js");
const Auth = require("../../models/Auth.js");
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
  commonAfterAll,
  defaultAddress
} = require("../helpers/_testCommon.js");

describe("Orders model tests", () => {
  beforeAll(commonBeforeAll);
  beforeEach(commonBeforeEach);
  afterEach(commonAfterEach);
  afterAll(commonAfterAll);

  describe("create Order", () => {
    test("works: create a new order with a cart and address given", async () => {
        const dAddress = {
          "address1": "100 ham st",
          "address2": "null",
          "city": "san diego",
          "state": "CA",
          "zipcode": "92929"
          };  
      const currentUser = await Auth.authenticate(username1, "password");
      const token = await createToken(currentUser);
      const response = await request(app)
        .post(`/api/v1/orders/${currentUser.username}/createorder`)
        .set("authorization", `Bearer ${token}`)
        .send({
          "address": dAddress,
          "cart": [{
              "productId": productIds[0],
              "quantity": 1,
            }]
        });
        
      expect(response.statusCode).toBe(200);
      expect(response.body.data).toEqual({
        id: expect.any(Number),
        totalAmount: expect.any(Number),
        address: dAddress,
        products: [
          {
            productId: productIds[0],
            quantity: 1,
            price: Number(rawProducts[0].price),
          },
        ]
      });
    });

    test("fails: with invalid username", async () => {
      const currentUser = await Auth.authenticate(username1, "password");
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
      const currentUser = await Auth.authenticate(username1, "password");
      const token = await createToken(currentUser);
      const response = await request(app)
        .get(`/api/v1/orders/${currentUser.username}/getorder/${orderIds[0]}`)
        .set("authorization", `Bearer ${token}`)

      expect(response.statusCode).toBe(200);
      expect(response.body.data).toEqual({
        orderId: expect.any(Number),
        orderStatus: "pending",
        totalAmount: expect.any(Number),
        address1: defaultAddress.address1,
        address2: defaultAddress.address2,
        city: defaultAddress.city,
        state: defaultAddress.state,
        zipcode: defaultAddress.zipcode,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        orderItems: [
          {
            productId: productIds[0],
            quantity: 1,
            productName: rawProducts[0].item,
            productDescription: rawProducts[0].description,
            productPrice: Number(rawProducts[0].price),
            imageURL: rawProducts[0].imgURL,
          },
        ]
      });
  });
    
    test("fails: with invalid order id", async () => {
      const currentUser = await Auth.authenticate(username1, "password");
      const token = await createToken(currentUser);
      const response = await request(app)
        .get(`/api/v1/orders/${currentUser.username}/getorder/${orderIds[999]}`) // non-existing order id
        .set("authorization", `Bearer ${token}`)

      expect(response.statusCode).toBe(400);
    });

    test("fails: with non-numeric order id", async () => {
      const currentUser = await Auth.authenticate(username1, "password");
      const token = await createToken(currentUser);
      const response = await request(app)
        .get(`/api/v1/orders/${currentUser.username}/getorder/abc`)
        .set("authorization", `Bearer ${token}`)

      expect(response.statusCode).toBe(400);
    });
  });
  
  describe("getAllOrders", () => {
    test("works: retrieves all orders for a user successfully", async () => {
      const currentUser = await Auth.authenticate(username1, "password");
      const token = await createToken(currentUser);
      const response = await request(app)
        .get(`/api/v1/orders/${currentUser.username}`)
        .set("authorization", `Bearer ${token}`)

        expect(response.statusCode).toBe(200);
        expect(response.body.countdata).toEqual(expect.arrayContaining([
          expect.objectContaining({
            orderId: expect.any(Number),
            orderStatus: "pending",
            totalAmount: expect.any(Number),
            address1: defaultAddress.address1,
            address2: defaultAddress.address2,
            city: defaultAddress.city,
            state: defaultAddress.state,
            zipcode: defaultAddress.zipcode,
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            orderItems: expect.any(Array)
          }),
        ]));
      
      const orderItems = response.body.countdata.flatMap(order => order.orderItems);
      expect(orderItems).toEqual(expect.arrayContaining([
        expect.objectContaining({
          productId: expect.any(Number),
          quantity: expect.any(Number),
          productName: expect.any(String),
          productDescription: expect.any(String),
          productPrice: expect.any(Number),
          imageURL: expect.any(String)
        }),
      ]));
    });

    test("fails: with invalid username", async () => {
      const currentUser = await Auth.authenticate(username1, "password");
      const token = await createToken(currentUser);
      const response = await request(app)
        .get(`/api/v1/orders/fakeuser`)
        .set("authorization", `Bearer ${token}`)
      
      expect(response.statusCode).toBe(401);
    });
  });
});