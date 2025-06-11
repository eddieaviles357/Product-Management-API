"use strict";

const request = require("supertest");
const app = require("../../app");
const Wishlist = require("../../models/Wishlist");
const User = require("../../models/Users");
const createToken = require("../../helpers/tokens");
const { BadRequestError, ConflictError } = require("../../AppError");
const db = require("../../db.js");
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

const testuser = "testuser";
const addTestUser = async () => {
  await db.query(`INSERT INTO users (first_name, last_name, username, password, join_at, last_login_at, email, is_admin)
                  VALUES 
                  ('test', 'tes', $1, '$2a$12$S8vO5lapyxXiUUVk2e5WXeQQCyugjUo5J9DWD9mTmfefkbQSdQc9q', '2025-02-25 20:11:06.339921-08', '2025-02-25 20:11:06.339921-08', 'testuser@testuser.com', true)
                  RETURNING id, username`, [testuser]);
};
describe("Wishlist Model", function () {
  beforeAll(commonBeforeAll);
  beforeEach(commonBeforeEach);
  afterEach(commonAfterEach);
  afterAll(commonAfterAll);

  describe("getWishlist", function () {

    test("works", async function () {
      const currentUser = await User.authenticate(username1, "password");
      const token = createToken(currentUser);

      const result = await request(app)
        .get(`/api/v1/wishlist/${username1}`)
        .set("Authorization", `Bearer ${token}`);

      expect(result.statusCode).toBe(200);
      expect(result.body).toEqual({
        success: true,
        wishlist: [
          {
            productId: productIds[0],
            productName: "shirt",
            productPrice: "10.99",
            productImageUrl: "https://image.product-management.com/1283859"
          },
          {
            productId: productIds[1],
            productName: "pants",
            productPrice: "19.99",
            productImageUrl: "https://image.product-management.com/1283859"
          }
        ]
      });
    });

    test("unauthorized", async function () {
      const currentUser = await User.authenticate(username1, "password");
      const token = createToken(currentUser);

      const result = await request(app)
        .get(`/api/v1/wishlist/nonexistentuser`)
        .set("Authorization", `Bearer ${token}`);

      expect(result.statusCode).toBe(401);
      expect(result.body).toEqual({
        error: { 
          message: "Unauthorized", 
          status: 401 
        }
      });
    });


    test("no products in wishlist", async function () {
      addTestUser();
      const currentUser = await User.authenticate(testuser, "password");
      const token = createToken(currentUser);

      const result = await request(app)
        .get(`/api/v1/wishlist/${testuser}`)
        .set("Authorization", `Bearer ${token}`);

      expect(result.statusCode).toBe(400);
      expect(result.body).toEqual({
        error: { 
          message: "No products found in wishlist", 
          status: 400 
        }
      });
    });

    test("missing username", async function () {
      const currentUser = await User.authenticate(username1, "password");
      const token = createToken(currentUser);

      const result = await request(app)
        .get(`/api/v1/wishlist/`)
        .set("Authorization", `Bearer ${token}`);

      expect(result.statusCode).toBe(404);
      expect(result.body).toEqual({
        error: { 
          message: "Not Found", 
          status: 404
        }
      });
    });

    test("invalid username", async function () {
      const currentUser = await User.authenticate(username1, "password");
      const token = createToken(currentUser);

      const result = await request(app)
        .get(`/api/v1/wishlist/invalidusername`)
        .set("Authorization", `Bearer ${token}`);

      expect(result.statusCode).toBe(401);
      expect(result.body).toEqual({
        error: { 
          message: "Unauthorized", 
          status: 401
        }
      });
    });
  });

  describe("addToWishlist", function () {
    test("works", async function () {
      addTestUser();
      const currentUser = await User.authenticate(testuser, "password");
      const token = createToken(currentUser);

      const result = await request(app)
        .post(`/api/v1/wishlist/${testuser}/${productIds[2]}`)
        .set("Authorization", `Bearer ${token}`);

      expect(result.statusCode).toBe(200);
      expect(result.body).toEqual({
        success: true,
        wishlist: 
          {
            userId: currentUser.id,
            productId: productIds[2]
          }
        
      });
    });

    test("unauthorized", async function () {
      const currentUser = await User.authenticate(username1, "password");
      const token = createToken(currentUser);

      const result = await request(app)
        .post(`/api/v1/wishlist/nonexistentuser/${productIds[2]}`)
        .set("Authorization", `Bearer ${token}`);

      expect(result.statusCode).toBe(401);
      expect(result.body).toEqual({
        error: { 
          message: "Unauthorized", 
          status: 401 
        }
      });
    });

    test("invalid username", async function () {
      const currentUser = await User.authenticate(username1, "password");
      const token = createToken(currentUser);

      const result = await request(app)
        .post(`/api/v1/wishlist/invalidusername/${productIds[2]}`)
        .set("Authorization", `Bearer ${token}`);

      expect(result.statusCode).toBe(401);
      expect(result.body).toEqual({
        error: { 
          message: "Unauthorized", 
          status: 401 
        }
      });
    });

    test("missing username", async function () {
      const currentUser = await User.authenticate(username1, "password");
      const token = createToken(currentUser);
      const result = await request(app)
        .post(`/api/v1/wishlist/${productIds[2]}`)
        .set("Authorization", `Bearer ${token}`);

      expect(result.statusCode).toBe(404);
      expect(result.body).toEqual({
        error: { 
          message: "Not Found", 
          status: 404 
        }
      });
    }
  );
    test("product already exists in wishlist", async function () {
      const currentUser = await User.authenticate(username1, "password");
      const token = createToken(currentUser);

      const result = await request(app)
        .post(`/api/v1/wishlist/${username1}/${productIds[0]}`)
        .set("Authorization", `Bearer ${token}`);

      expect(result.statusCode).toBe(400);
      console.log(result.body);
      expect(result.body).toEqual({
        error: { 
          message: "Product already exists in wishlist", 
          status: 400 
        }
      });
    });
  });
})