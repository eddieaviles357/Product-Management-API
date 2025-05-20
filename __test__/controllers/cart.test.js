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

describe("Cart Routes", () => {
  beforeAll(commonBeforeAll);
  beforeEach(() => jest.resetAllMocks(), commonBeforeEach);
  afterEach(commonAfterEach);
  afterAll(commonAfterAll);

  describe("POST /cart", () => {
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
      console.log(response.body);
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
  })
}); 