"use strict";

const request = require("supertest");
const app = require("../../app.js");
const Auth = require("../../models/Auth.js");
const createToken = require("../../helpers/tokens.js");
const { BadRequestError } = require("../../AppError.js");
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

describe("Orders routes", () => {
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
            sku: rawProducts[0].sku,
            productName: rawProducts[0].item,
            unitPrice: Number(rawProducts[0].price),
            quantity: 1,
            totalAmount: Number(rawProducts[0].price),
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
        expect(response.body.success).toBe(true);
        expect(response.body.count).toBe(response.body.data.length);
        expect(response.body.count).toBeGreaterThan(0);
        expect(response.body.data).toEqual(expect.arrayContaining([
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
      
      const orderItems = response.body.data.flatMap(order => order.orderItems);
      expect(orderItems).toEqual(expect.arrayContaining([
        expect.objectContaining({
          productId: expect.any(Number),
          quantity: expect.any(Number),
          productName: expect.any(String),
          productDescription: expect.any(String),
          productPrice: expect.any(Number),
          productTotalAmount: expect.any(Number),
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

  describe("updateOrderStatus", () => {
    test("updates order status when the current state allows the transition", async () => {
      const currentUser = await Auth.authenticate(username1, "password");
      const token = await createToken(currentUser);
      const response = await request(app)
        .patch(`/api/v1/orders/${currentUser.username}/${orderIds[0]}/status`)
        .set("authorization", `Bearer ${token}`)
        .send({ status: "paid" });

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: {
          orderId: orderIds[0],
          orderStatus: "paid",
          updatedAt: expect.any(String),
        },
      });
    });

    test("rejects an invalid order status", async () => {
      const currentUser = await Auth.authenticate(username1, "password");
      const token = await createToken(currentUser);
      const response = await request(app)
        .patch(`/api/v1/orders/${currentUser.username}/${orderIds[0]}/status`)
        .set("authorization", `Bearer ${token}`)
        .send({ status: "processing" });

      expect(response.statusCode).toBe(400);
      expect(response.body.error.message)
        .toBe("Status must be paid, shipped, delivered, cancelled, or refunded");
    });

    test("rejects a status transition that does not match the current order status", async () => {
      const currentUser = await Auth.authenticate(username1, "password");
      const token = await createToken(currentUser);
      const response = await request(app)
        .patch(`/api/v1/orders/${currentUser.username}/${orderIds[0]}/status`)
        .set("authorization", `Bearer ${token}`)
        .send({ status: "shipped" });

      expect(response.statusCode).toBe(409);
      expect(response.body.error.message)
        .toBe(`No order matched this ID with status "paid"`);
    });
  });
});