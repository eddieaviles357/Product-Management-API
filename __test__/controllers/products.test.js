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
  username1,
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll
} = require("../helpers/_testCommon");

describe("Products Controller", () => {
  beforeAll(commonBeforeAll);
  beforeEach(commonBeforeEach);
  afterEach(commonAfterEach);
  afterAll(commonAfterAll);

  describe("GET /api/v1/products", () => {
    test("should return paginated products", async () => {
      const response = await request(app).get("/api/v1/products");
      
      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.products).toBeInstanceOf(Array);
      expect(response.body.pagination).toEqual({
        currentPage: 1,
        pageSize: 10,
        total: expect.any(Number),
        totalPages: expect.any(Number)
      });
    });

    test("should return products with custom page and limit", async () => {
      const response = await request(app).get("/api/v1/products?page=1&limit=5");
      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.products.length).toBeLessThanOrEqual(5);
      expect(response.body.pagination.pageSize).toBe(5);
    });

    test("should return 400 for limit exceeding max", async () => {
      const response = await request(app).get("/api/v1/products?limit=101");
      
      expect(response.statusCode).toBe(400);
      expect(response.body.error.message).toContain("Limit must be between 1 and 100");
    });
  });

  describe("GET /api/v1/products/:id", () => {
    test("should return a product by id", async () => {
      const response = await request(app).get(`/api/v1/products/${productIds[0]}`);
      
      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.product).toBeDefined();
    });

    test("should return 400 for invalid id", async () => {
      const response = await request(app).get("/api/v1/products/invalid");
      
      expect(response.statusCode).toBe(400);
      expect(response.body.error.message).toContain("Product id");
    });

    test("should return 400 for product not found", async () => {
      const response = await request(app).get("/api/v1/products/999999");
      
      expect(response.statusCode).toBe(400);
      expect(response.body.error.message).toContain("not found");
    });
  });

  describe("POST /api/v1/products", () => {
    test("should add a new product", async () => {
      const newProduct = {
        sku: "newsku12",
        name: "New Product",
        description: "This is a new product",
        price: 100,
        stock: 50,
        imageURL: "http://example.com/image.jpg"
      };
      const currentUser = await User.authenticate(username1, "password");
      const token = await createToken(currentUser);

      const response = await request(app)
        .post("/api/v1/products")
        .send(newProduct)
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.product).toBeDefined();
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
  });

  describe("PUT /api/v1/products/:id", () => {
    test("should update a product", async () => {
      const updatedProduct = {
        name: "Updated Product",
        price: 150,
        description: "Updated description",
        imageURL: "http://example.com/updated.jpg"
      };
      const currentUser = await User.authenticate(username1, "password");
      const token = await createToken(currentUser);

      const response = await request(app)
        .put(`/api/v1/products/${productIds[0]}`)
        .send(updatedProduct)
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test("should return 400 for invalid id", async () => {
      const currentUser = await User.authenticate(username1, "password");
      const token = await createToken(currentUser);

      const response = await request(app)
        .put("/api/v1/products/invalid")
        .send({ name: "Test" })
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(400);
    });

    test("should return 401 for unauthorized user", async () => {
      const response = await request(app)
        .put(`/api/v1/products/${productIds[0]}`)
        .send({ name: "Test" });
      
      expect(response.statusCode).toBe(401);
    });
  });

  describe("DELETE /api/v1/products/:id", () => {
    test("should delete a product", async () => {
      const currentUser = await User.authenticate(username1, "password");
      const token = await createToken(currentUser);

      const response = await request(app)
        .delete(`/api/v1/products/${productIds[0]}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test("should return 400 for invalid id", async () => {
      const currentUser = await User.authenticate(username1, "password");
      const token = await createToken(currentUser);

      const response = await request(app)
        .delete("/api/v1/products/invalid")
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(400);
    });

    test("should return 401 for unauthorized user", async () => {
      const response = await request(app)
        .delete(`/api/v1/products/${productIds[0]}`);

      expect(response.statusCode).toBe(401);
    });
  });

  describe("POST /api/v1/products/:productId/category/:categoryId", () => {
    test("should add category to product", async () => {
      const currentUser = await User.authenticate(username1, "password");
      const token = await createToken(currentUser);

      const response = await request(app)
        .post(`/api/v1/products/${productIds[0]}/category/${categoryIds[1]}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(201);
      expect(response.body.success).toBe(true);
    });

    test("should return 400 for invalid ids", async () => {
      const currentUser = await User.authenticate(username1, "password");
      const token = await createToken(currentUser);

      const response = await request(app)
        .post("/api/v1/products/invalid/category/invalid")
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(400);
    });

    test("should return 401 for unauthorized user", async () => {
      const response = await request(app)
        .post(`/api/v1/products/${productIds[0]}/category/${categoryIds[0]}`);

      expect(response.statusCode).toBe(401);
    });
  });

  describe("DELETE /api/v1/products/:productId/category/:categoryId", () => {
    test("should delete category from product", async () => {
      const currentUser = await User.authenticate(username1, "password");
      const token = await createToken(currentUser);

      const response = await request(app)
        .delete(`/api/v1/products/${productIds[0]}/category/${categoryIds[0]}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test("should return 400 for invalid ids", async () => {
      const currentUser = await User.authenticate(username1, "password");
      const token = await createToken(currentUser);

      const response = await request(app)
        .delete("/api/v1/products/invalid/category/invalid")
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(400);
    });

    test("should return 401 for unauthorized user", async () => {
      const response = await request(app)
        .delete(`/api/v1/products/${productIds[0]}/category/${categoryIds[0]}`);

      expect(response.statusCode).toBe(401);
    });
  });

  describe("Error Handling", () => {
    test("should handle unexpected errors", async () => {
      jest.spyOn(Products, "getProducts").mockImplementation(() => {
        throw new Error("Unexpected error");
      });

      const response = await request(app).get("/api/v1/products");
      
      expect(response.statusCode).toBe(500);
      expect(response.body.error).toBeDefined();
    });
  });
});
