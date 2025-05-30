"use strict";
const request = require("supertest");
const app = require("../../app");
const Products = require("../../models/Products");
const User = require("../../models/Users");
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

  describe("POST /api/v1/products", () => {
    test("should add a new product", async () => {
      const newProduct = {
        sku: "newsku",
        name: "New Product",
        description: "This is a new product",
        price: 100,
        stock: 50,
        imageURL: "http://example.com/image.jpg"
      };
      const currentUser = await User.authenticate(username1, "password");
      const token = createToken(currentUser);

      const response = await request(app)
        .post("/api/v1/products")
        .send(newProduct)
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.product.productName).toBe(newProduct.name);
    });

    test("should return 401 for unauthorized user", async () => {
      const newProduct = {
        sku: "new-sku",
        name: "New Product",
        description: "This is a new product",
        price: 100,
        stock: 50,
        imageURL: "http://example.com/image.jpg"
      };

      const response = await request(app)
        .post("/api/v1/products")
        .send(newProduct);

      expect(response.statusCode).toBe(401);
    });

    test("should return 400 for invalid product data", async () => {
      const newProduct = {
        sku: "newsku",
        name: "New Product",
        description: "This is a new product",
        price: -100, // Invalid price
        stock: 50,
        imageURL: "http://example.com/image.jpg"
      };
      const currentUser = await User.authenticate(username1, "password");
      const token = createToken(currentUser);

      const response = await request(app)
        .post("/api/v1/products")
        .send(newProduct)
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        errors: [{
          message: "price must be greater than or equal to 0",
          property: "price",
        }]
      });
    });

    test("should return 400 for missing required fields", async () => {
      const newProduct = {
        sku: "newsku",
        name: "New Product",
        // Missing description, price, stock, imageURL
      };
      const currentUser = await User.authenticate(username1, "password");
      const token = createToken(currentUser);

      const response = await request(app)
        .post("/api/v1/products")
        .send(newProduct)
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        errors: [
          { message: "requires property \"description\"", property: "description" },
          { message: "requires property \"price\"", property: "price" },
          { message: "requires property \"stock\"", property: "stock" },
          { message: "requires property \"imageURL\"", property: "imageURL" }
        ]
      });
    });
  });
});
