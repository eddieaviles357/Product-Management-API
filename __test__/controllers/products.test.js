"use strict";
const request = require("supertest");
const app = require("../../app");
const Products = require("../../models/Products");
const createToken = require("../../helpers/tokens");
const { BadRequestError } = require("../../AppError");
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

// getProducts

// addProduct
// removeProduct
// findProductById
// updateProduct
// addCategoryToProduct 
// removeCategoryFromProduct

describe("Products Controller", () => {
  beforeAll(commonBeforeAll);
  beforeEach(commonBeforeEach);
  afterEach(commonAfterEach);
  afterAll(commonAfterAll);

  describe("GET /api/v1/products", () => {
    test("should return all products", async () => {
      const response = await request(app).get("/api/v1/products");
      const res = await db.query("select * from products")
      console.log("Products in DB:", res.rows);
      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.products.length).toBeGreaterThan(0);
    });

    test("should return products with cursor", async () => {
      const response = await request(app).get("/api/v1/products?cursor=9999999");
      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.products.length).toBeGreaterThan(0);
    });
  });

  describe("GET /api/v1/products/:id", () => {
    test("should return a product by id", async () => {
      const response = await request(app).get(`/api/v1/products/${productIds[0]}`);
      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.product.id).toBe(productIds[0]);
    });

    test("should return 400 for invalid id", async () => {
      const response = await request(app).get("/api/v1/products/invalid");
      expect(response.statusCode).toBe(400);
    });
  });
});
