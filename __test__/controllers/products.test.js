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

  describe("PUT /api/v1/products/:id", () => {
    test("should update a product", async () => {
      const updatedProduct = {
        name: "Updated Product",
        price: 150,
        description: '',
        imageURL: '',
      };
      const currentUser = await User.authenticate(username1, "password");
      const token = createToken(currentUser);

      const response = await request(app)
        .put(`/api/v1/products/${productIds[0]}`)
        .send(updatedProduct)
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.updatedProduct.productName).toBe(updatedProduct.name);
    });

    test("should return 400 for invalid id", async () => {
      const updatedProduct = {
        name: "Updated Product",
        price: 150,
        description: '',
        imageURL: '',
      };
      const currentUser = await User.authenticate(username1, "password");
      const token = createToken(currentUser);

      const response = await request(app)
        .put("/api/v1/products/invalid")
        .send(updatedProduct)
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        error: {
          message: "Invalid id",
          status: 400
        }
      });
    });

    test("should return 401 for unauthorized user", async () => {
      const updatedProduct = {
        name: "Updated Product",
        price: 150
      };

      const response = await request(app)
        .put(`/api/v1/products/${productIds[0]}`)
        .send(updatedProduct);
      expect(response.statusCode).toBe(401);
      expect(response.body).toEqual({
        error: {
          message: "Unauthorized",
          status: 401
        }
      })
    });

    test("should return 400 for invalid product data", async () => {
      const updatedProduct = {
        name: "Updated Product",
        price: -150, // Invalid price
        description: '',
        imageURL: '',
      };
      const currentUser = await User.authenticate(username1, "password");
      const token = createToken(currentUser);

      const response = await request(app)
        .put(`/api/v1/products/${productIds[0]}`)
        .send(updatedProduct)
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
      const updatedProduct = {
        // Missing name, description, price, imageURL
      };
      const currentUser = await User.authenticate(username1, "password");
      const token = createToken(currentUser);

      const response = await request(app)
        .put(`/api/v1/products/${productIds[0]}`)
        .send(updatedProduct)
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        errors: [
          { message: "requires property \"name\"", property: "name" },
          { message: "requires property \"description\"", property: "description" },
          { message: "requires property \"price\"", property: "price" },
          { message: "requires property \"imageURL\"", property: "imageURL" }
        ]
      });
    });
  });

  describe("DELETE /api/v1/products/:id", () => {
    test("should delete a product", async () => {
      const currentUser = await User.authenticate(username1, "password");
      const token = createToken(currentUser);

      const response = await request(app)
        .delete(`/api/v1/products/${productIds[0]}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test("should return 400 for invalid id", async () => {
      const currentUser = await User.authenticate(username1, "password");
      const token = createToken(currentUser);

      const response = await request(app)
        .delete("/api/v1/products/invalid")
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        error: {
          message: "id must be a number",
          status: 400
        }
      });
    });

    test("should return 401 for unauthorized user", async () => {
      const response = await request(app)
        .delete(`/api/v1/products/${productIds[0]}`);

      expect(response.statusCode).toBe(401);
      expect(response.body).toEqual({
        error: {
          message: "Unauthorized",
          status: 401
        }
      });
    });

    test("should return 404 for non-existing product", async () => {
      const currentUser = await User.authenticate(username1, "password");
      const token = createToken(currentUser);

      const response = await request(app)
        .delete("/api/v1/products/9999999") // Assuming this ID does not exist
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        error: {
          message: "Product with id 9999999 does not exist",
          status: 400
        }
      });
    });
  });

  describe("POST /api/v1/products/:productId/category/:categoryId", () => {
    test("should add category to product", async () => {
      const currentUser = await User.authenticate(username1, "password");
      const token = createToken(currentUser);

      const response = await request(app)
        .post(`/api/v1/products/${productIds[0]}/category/${categoryIds[1]}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual({
        productId: productIds[0],
        categoryId: categoryIds[1]
      });
    });

    test("should return 400 for invalid ids", async () => {
      const currentUser = await User.authenticate(username1, "password");
      const token = createToken(currentUser);

      const response = await request(app)
        .post("/api/v1/products/invalid/category/invalid")
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        error: {
          message: "ids must be a number",
          status: 400
        }
      });
    });

    test("should return 401 for unauthorized user", async () => {
      const response = await request(app)
        .post(`/api/v1/products/${productIds[0]}/category/${categoryIds[0]}`);

      expect(response.statusCode).toBe(401);
      expect(response.body).toEqual({
        error: {
          message: "Unauthorized",
          status: 401
        }
      });
    });
  });

  describe("DELETE /api/v1/products/:productId/category/:categoryId", () => {
    test("should delete category from product", async () => {
      const currentUser = await User.authenticate(username1, "password");
      const token = createToken(currentUser);

      const response = await request(app)
        .delete(`/api/v1/products/${productIds[0]}/category/${categoryIds[0]}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Removed category");
    });

    test("should return 400 for invalid ids", async () => {
      const currentUser = await User.authenticate(username1, "password");
      const token = createToken(currentUser);

      const response = await request(app)
        .delete("/api/v1/products/invalid/category/invalid")
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        error: {
          message: "ids must be a number",
          status: 400
        }
      });
    });

    test("should return 401 for unauthorized user", async () => {
      const response = await request(app)
        .delete(`/api/v1/products/${productIds[0]}/category/${categoryIds[0]}`);

      expect(response.statusCode).toBe(401);
      expect(response.body).toEqual({
        error: {
          message: "Unauthorized",
          status: 401
        }
      });
    });
  });

  describe("Error Handling", () => {
    test("should handle unexpected errors", async () => {
      jest.spyOn(Products, "getProducts").mockImplementation(() => {
        throw new Error("Unexpected error");
      });

      const response = await request(app).get("/api/v1/products");
      expect(response.statusCode).toBe(500);
      expect(response.body).toEqual({
        error: {
          message: "Unexpected error",
          status: 500
        }
      });
    });
  });
});
