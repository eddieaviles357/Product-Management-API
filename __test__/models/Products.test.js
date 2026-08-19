"use strict";

const Products = require('../../models/Products');
const { BadRequestError } = require("../../AppError");
const db = require("../../db");
const {
  productIds,
  categoryIds,
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll
} = require("../helpers/_testCommon");

describe("Products model tests", () => {
  beforeAll(commonBeforeAll);
  beforeEach(commonBeforeEach);
  afterEach(commonAfterEach);
  afterAll(commonAfterAll);

  describe("getProducts", () => {
    test("should return paginated products with metadata", async () => {
      const result = await Products.getProducts(1, 10);

      console.log("getProducts result:", result);
      const { data, pagination } = result
      
      expect(data).toBeInstanceOf(Array);
      expect(data.length).toBeLessThanOrEqual(3); // Assuming there are 3 products in the test database
      expect(data[0]).toBeInstanceOf(Object);
      expect(pagination).toEqual({
        currentPage: 1,
        pageSize: 10,
        total: 3, // Assuming there are 3 products in the test database
        totalPages: 1
      });
    });

    test("should return correct page size", async () => {
      const result = await Products.getProducts(1, 5);

      expect(result.data.length).toBeLessThanOrEqual(5);
      expect(result.pagination.pageSize).toBe(5);
    });

    test("should work clamping to valid range", async () => {
      const result = await Products.getProducts(-4, 10);

      expect(result.pagination.currentPage).toBe(1);
      expect(result.pagination.pageSize).toBe(10);
      expect(result.pagination.total).toBeGreaterThanOrEqual(3);
    });
  });

  describe("addProduct", () => {
    test("should successfully create a product", async () => {
      const newProduct = {
        sku: "12345678",
        name: "Test Product",
        description: "This is a test product",
        stock: 1,
        imageURL: "http://example.com/test.jpg",
        price: 19.99
      };

      const product = await Products.addProduct(newProduct);

      expect(product).toBeTruthy();
      expect(product).toHaveProperty("id");
      expect(product.productName).toEqual(newProduct.name);
    });

    test("should throw BadRequestError on database error", async () => {
      jest.spyOn(db, "query").mockImplementationOnce(() => {
        throw new Error("Database error");
      });

      await expect(Products.addProduct({
        sku: "test",
        name: "Test",
        description: "Test",
        stock: 1,
        price: 10,
        imageURL: "test.jpg"
      })).rejects.toThrow(BadRequestError);
    });
  });

  describe("findProductById", () => {
    test("should retrieve a product by ID", async () => {
      const product = await Products.findProductById(productIds[0]);

      expect(product).toBeTruthy();
      expect(product.id).toEqual(productIds[0]);
    });

    test("should return empty object for non-existent product", async () => {
      const product = await Products.findProductById(99999);

      expect(product).toEqual({});
    });

    test("should return an empty object for invalid ID", async () => {
      const product = await Products.findProductById(0);

      expect(product).toEqual({});
    });
  });

  describe("updateProduct", () => {
    test("should successfully update a product", async () => {
      const updatedProduct = {
        name: "Updated Product",
        description: "Updated description",
        price: 39.99,
        imageURL: "http://example.com/updated.jpg"
      };

      const product = await Products.updateProduct(productIds[0], updatedProduct);

      expect(product).toBeTruthy();
      expect(product.productName).toEqual(updatedProduct.name);
    });

    test("should throw BadRequestError for non-existent product", async () => {
      await expect(Products.updateProduct(99999, { name: "Test" }))
        .rejects.toThrow("Product with id 99999 not found");
    });
  });

  describe("addCategoryToProduct", () => {
    test("should add category to product", async () => {
      const result = await Products.addCategoryToProduct(productIds[0], categoryIds[1]);

      expect(result).toEqual({
        productId: productIds[0],
        categoryId: categoryIds[1]
      });
    });

    test("should throw BadRequestError for non-existent product", async () => {
      await expect(Products.addCategoryToProduct(99999, categoryIds[0]))
        .rejects.toThrow("Product with id 99999 not found");
    });

    test("should throw BadRequestError for non-existent category", async () => {
      await expect(Products.addCategoryToProduct(productIds[2], 99999))
        .rejects.toThrow("Category with id 99999 not found");
    });
  });

  describe("removeCategoryFromProduct", () => {
    test("should remove category from product", async () => {
      const result = await Products.removeCategoryFromProduct(productIds[0], categoryIds[0]);

      expect(result).toBe(true);
    });

    test("should return success false for non-existent product", async () => {
      const result = await Products.removeCategoryFromProduct(99999, categoryIds[0]);

      expect(result).toBe(false);
    });
  });

  describe("removeProduct", () => {
    test("should return true for existing product", async () => {
      const result = await Products.removeProduct(productIds[1]);

      expect(result).toBe(true);
    });

    test("should return false for non-existent product", async () => {
      const result = await Products.removeProduct(99999);

      expect(result).toBe(false);
    });
  });

  describe("updateProductStock", () => {
    test("should update product stock", async () => {
      const result = await Products.updateProductStock(productIds[1], 5);

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("stock");
      expect(result.stock).toBeGreaterThan(0);
    });

    test("should throw BadRequestError for invalid params", async () => {
      await expect(Products.updateProductStock(0, 5))
        .rejects.toThrow(BadRequestError);
    });
  });
});

