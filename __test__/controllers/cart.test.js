"use strict";

const request = require("supertest");
const app = require("../../app");
const createToken = require("../../helpers/tokens");
const { BadRequestError } = require("../../AppError");
const Cart = require("../../models/Cart");
const User = require("../../models/Users");
const {
  productIds,
  categoryIds,
  userIdUsername,
  addressIds,
  username1,
  username2,
  orderIds,
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll
} = require("../helpers/_testCommon");
const db = require("../../db.js");

// _getPrice *private method
// get

// clear
// addToCart
// updateCartItemQty
// removeCartItem
describe("Cart Routes", () => {
  beforeAll(commonBeforeAll);
  beforeEach(() => jest.resetAllMocks(), commonBeforeEach);
  afterEach(commonAfterEach);
  afterAll(commonAfterAll);

  describe("POST /cart", () => {
    // ✅
    test("works for logged in user", async () => {
      const currentUser = await User.authenticate(username1, "password");
      const token = createToken(currentUser);
      const response = await request(app)
        .post(`/api/v1/cart/${currentUser.username}/${productIds[0]}`)
        .set("authorization", `Bearer ${token}`)
        .send({
          quantity: 2
        });
      expect(response.statusCode).toBe(201);
      expect(response.body).toEqual({
        success: true,
        result: {
          userId: expect.any(Number),
          productId: productIds[0],
          quantity: 1, // we have limited stock to be 1 when posting a product in order to update the quantity we need to use PUT
          price: expect.any(String),
        },
      });
    });
    // ✅
    test("works for logged in user with no quantity", async () => {
      const currentUser = await User.authenticate(username1, "password");
      const token = createToken(currentUser);
      const response = await request(app)
        .post(`/api/v1/cart/${currentUser.username}/${productIds[0]}`)
        .set("authorization", `Bearer ${token}`)
        .send();
      expect(response.statusCode).toBe(201);
      expect(response.body).toEqual({
        success: true,
        result: {
          userId: expect.any(Number),
          productId: productIds[0],
          quantity: 1, // we have limited stock to be 1 when posting a product in order to update the quantity we need to use PUT
          price: expect.any(String),
        },
      });
    });

    // ✅
    test("throws errro if no product id is given", async () => {
      const currentUser = await User.authenticate(username1, "password");
      const token = createToken(currentUser);
      const response = await request(app)
        .post(`/api/v1/cart/${currentUser.username}/`)
        .set("authorization", `Bearer ${token}`)
        .send();
      expect(response.statusCode).toBe(404);
      expect(response.body).toEqual({
        error: {
          message: "Not Found",
          status: 404
        }
      });
    });
  })
}); 