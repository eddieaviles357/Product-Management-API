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
// addToCart
// get
// updateCartItemQty
// removeCartItem
// get

// clear
describe("Cart Routes", () => {
  beforeAll(commonBeforeAll);
  beforeEach(() => jest.resetAllMocks(), commonBeforeEach);
  afterEach(commonAfterEach);
  afterAll(commonAfterAll);

  describe("POST /cart adds to cart", () => {
    // ✅
    test("works for logged in user", async () => {
      const currentUser = await User.authenticate(username1, "password");
      const token = await createToken(currentUser);
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
      const token = await createToken(currentUser);
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
      const token = await createToken(currentUser);
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

    // ✅
    test("throws error if no username is given", async () => {
      const currentUser = await User.authenticate(username1, "password");
      const token = await createToken(currentUser);
      const response = await request(app)
        .post(`/api/v1/cart//${productIds[0]}`)
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

    // ✅
    test("throws error if no token is given", async () => {
      const response = await request(app)
        .post(`/api/v1/cart/${username1}/${productIds[0]}`)
        .send();
      expect(response.statusCode).toBe(401);
      expect(response.body).toEqual({
        error: {
          message: "Unauthorized",
          status: 401
        }
      });
    });

    // ✅
    test("throws error if user does not exist", async () => {
      const currentUser = await User.authenticate(username1, "password");
      const token = await createToken(currentUser);
      const response = await request(app)
        .post(`/api/v1/cart/${'doesnexist'}/${productIds[0]}`)
        .set("authorization", `Bearer ${token}`)
        .send();
      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        error: {
          message: "User does not exist",
          status: 400
        }
      });
    });

    // ✅
    test("throws error if product does not exist", async () => {
      const currentUser = await User.authenticate(username1, "password");
      const token = await createToken(currentUser);
      const fakeProduct = 99999
      const response = await request(app)
        .post(`/api/v1/cart/${currentUser.username}/${99999}`)
        .set("authorization", `Bearer ${token}`)
        .send();
      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        error: {
          message: `Product ${fakeProduct} does not exist`,
          status: 400
        }
      });
    });
  });

  describe("PUT /cart updates cart item", () => {
    // ✅
    test("works for logged in user", async () => {
      const currentUser = await User.authenticate(username1, "password");
      const token = await createToken(currentUser);
      const response = await request(app)
        .put(`/api/v1/cart/${currentUser.username}/${productIds[0]}`)
        .set("authorization", `Bearer ${token}`)
        .send({
          quantity: 2
        });
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        success: true,
        result: {
          userId: expect.any(Number),
          productId: productIds[0],
          quantity: 3, // there is already 1 in the cart so we add 2 more
          price: expect.any(String),
        },
      });
    });

    // ✅
    test("works for logged in user with no quantity", async () => {
      const currentUser = await User.authenticate(username1, "password");
      const token = await createToken(currentUser);
      const response = await request(app)
        .put(`/api/v1/cart/${currentUser.username}/${productIds[0]}`)
        .set("authorization", `Bearer ${token}`)
        .send();
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        success: true,
        result: {
          userId: expect.any(Number),
          productId: productIds[0],
          quantity: 3, // there are no changes in cart quantity ( qty = 3 since our previous test added 2 more)
          price: expect.any(String),
        },
      });
    });

    // ✅
    test("throws error if no product id is given", async () => {
      const currentUser = await User.authenticate(username1, "password");
      const token = await createToken(currentUser);
      const response = await request(app)
        .put(`/api/v1/cart/${currentUser.username}/`)
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

    // ✅
    test("throws error if no username is given", async () => {
      const currentUser = await User.authenticate(username1, "password");
      const token = await createToken(currentUser);
      const response = await request(app)
        .put(`/api/v1/cart//${productIds[0]}`)
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

    // ✅
    test("throws error if no token is given", async () => {
      const response = await request(app)
        .put(`/api/v1/cart/${username1}/${productIds[0]}`)
        .send();
      expect(response.statusCode).toBe(401);
      expect(response.body).toEqual({
        error: {
          message: "Unauthorized",
          status: 401
        }
      });
    });

    // ✅
    test("throws error if user does not exist", async () => {
      const currentUser = await User.authenticate(username1, "password");
      const token = await createToken(currentUser);
      const response = await request(app)
        .put(`/api/v1/cart/${'doesnexist'}/${productIds[0]}`)
        .set("authorization", `Bearer ${token}`)
        .send();
      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        error: {
          message: "User does not exist",
          status: 400
        }
      });
    });

    // ✅
    test("throws error if product does not exist", async () => {
      const currentUser = await User.authenticate(username1, "password");
      const token = await createToken(currentUser);
      const fakeProduct = 99999
      const response = await request(app)
        .put(`/api/v1/cart/${currentUser.username}/${99999}`)
        .set("authorization", `Bearer ${token}`)
        .send();
      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        error: {
          message: `Product ${fakeProduct} does not exist`,
          status: 400
        }
      });
    });

    // ✅
    test("throws error if nothing to update", async () => {
      const currentUser = await User.authenticate(username1, "password");
      const token = await createToken(currentUser);
      const response = await request(app)
        .put(`/api/v1/cart/${currentUser.username}/${productIds[1]}`)
        .set("authorization", `Bearer ${token}`)
        .send({
          quantity: 2
        });
      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        error: {
          message: `Nothing to update`,
          status: 400
        }
      });
    });
  });

  describe("DELETE /cart removes cart item", () => {
    // ✅
    test("works for logged in user", async () => {
      const currentUser = await User.authenticate(username1, "password");
      const token = await createToken(currentUser);
      const response = await request(app)
        .delete(`/api/v1/cart/${currentUser.username}/${productIds[0]}`)
        .set("authorization", `Bearer ${token}`);
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        success: true,
        result: productIds[0]
      });
    });

    // ✅
    test("throws error if no username is given", async () => {
      const currentUser = await User.authenticate(username1, "password");
      const token = await createToken(currentUser);
      const response = await request(app)
        .delete(`/api/v1/cart//${productIds[0]}`)
        .set("authorization", `Bearer ${token}`);
      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        error: {
          message: "User does not exist",
          status: 400
        }
      });
    });

    // ✅
    test("throws error if no token is given", async () => {
      const response = await request(app)
        .delete(`/api/v1/cart/${username1}/${productIds[0]}`);
      expect(response.statusCode).toBe(401);
      expect(response.body).toEqual({
        error: {
          message: "Unauthorized",
          status: 401
        }
      });
    });
  });

  describe("GET /cart gets cart items", () => {
    // ✅
    test("works for logged in user", async () => {
      const currentUser = await User.authenticate(username1, "password");
      const token = await createToken(currentUser);
      const response = await request(app)
        .get(`/api/v1/cart/${currentUser.username}`)
        .set("authorization", `Bearer ${token}`);
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        success: true,
        result: expect.any(Array)
      });
    });

    // ✅
    test("throws error if no username is given", async () => {
      const currentUser = await User.authenticate(username1, "password");
      const token = await createToken(currentUser);
      const response = await request(app)
        .get(`/api/v1/cart//`)
        .set("authorization", `Bearer ${token}`);
      expect(response.statusCode).toBe(404);
      expect(response.body).toEqual({
        error: {
          message: "Not Found",
          status: 404
        }
      });
    });

    // ✅
    test("throws error if no token is given", async () => {
      const response = await request(app)
        .get(`/api/v1/cart/${username1}`);
      expect(response.statusCode).toBe(401);
      expect(response.body).toEqual({
        error: {
          message: "Unauthorized",
          status: 401
        }
      });
    });

    // ✅
    test("throws error if user does not exist", async () => {
      const currentUser = await User.authenticate(username1, "password");
      const token = await createToken(currentUser);
      const response = await request(app)
        .get(`/api/v1/cart/${'doesnexist'}`)
        .set("authorization", `Bearer ${token}`);
      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        error: {
          message: "User does not exist",
          status: 400
        }
      });
    });
  });

  describe("DELETE /cart clears cart", () => {
    // ✅
    test("works for logged in user", async () => {
      const currentUser = await User.authenticate(username1, "password");
      const token = await createToken(currentUser);
      const addProductToCartResponse = await request(app)
        .post(`/api/v1/cart/${currentUser.username}/${productIds[1]}`)
        .set("authorization", `Bearer ${token}`)
        .send({
          quantity: 2
        });
      expect(addProductToCartResponse.statusCode).toBe(201);
      const response = await request(app)
        .delete(`/api/v1/cart/${currentUser.username}`)
        .set("authorization", `Bearer ${token}`);
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: "Cart cleared"
      });
    });

    // ✅
    test("throws error if no username is given", async () => {
      const currentUser = await User.authenticate(username1, "password");
      const token = await createToken(currentUser);
      const response = await request(app)
        .delete(`/api/v1/cart//`)
        .set("authorization", `Bearer ${token}`);
      expect(response.statusCode).toBe(404);
      expect(response.body).toEqual({
        error: {
          message: "Not Found",
          status: 404
        }
      });
    });

    // ✅
    test("throws error if no token is given", async () => {
      const response = await request(app)
        .delete(`/api/v1/cart/${username1}`);
      expect(response.statusCode).toBe(401);
      expect(response.body).toEqual({
        error: {
          message: "Unauthorized",
          status: 401
        }
      });
    });

    // ✅
    test("throws error if user does not exist", async () => {
      const currentUser = await User.authenticate(username1, "password");
      const token = await createToken(currentUser);
      const response = await request(app)
        .delete(`/api/v1/cart/${'doesnexist'}`)
        .set("authorization", `Bearer ${token}`);
      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        error: {
          message: "User does not exist",
          status: 400
        }
      });
    });
  });
}); 