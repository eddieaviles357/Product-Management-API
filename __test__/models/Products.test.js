"use strict";

const Products = require('../../models/Products');
const { BadRequestError, NotFoundError } = require("../../AppError");
const db = require("../../db");
const {
  productIds,
  categoryIds,
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll
} = require("../helpers/_testCommon");

// addProduct
// removeProduct
// getProducts
// findProductById
// updateProduct

// addCategoryToProduct 
// removeCategoryFromProduct

describe("Products model tests", () => {
  beforeAll(commonBeforeAll);
  beforeEach(commonBeforeEach);
  afterEach(commonAfterEach);
  afterAll(commonAfterAll);

  describe("create", () => {
    test("successfully creates a product", async () => {
      const newProduct = {
        sku: "12345678",
        name: "Test Product",
        description: "This is a test product",
        stock: '1',
        imageURL: "http://example.com/test-product.jpg",
        price: '19.99',
      };

      const product = await Products.addProduct(newProduct);

      newProduct.stock = Number(newProduct.stock); // cast to Number since db spits out a string representation of a number

      expect(product).toBeTruthy();
      expect(product).toHaveProperty("id");
      expect(product.productName).toEqual(newProduct.name);
      expect(product.productDescription).toEqual(newProduct.description);
      expect(product.stock).toEqual(newProduct.stock);
      expect(product.imageURL).toEqual(newProduct.imageURL);
      expect(product.price).toEqual(newProduct.price);
    });

    test("throws BadRequestError for missing fields", async () => {
      const invalidProduct = {
        name: "Invalid Product"
      };

      await expect(Products.addProduct(invalidProduct)).rejects.toThrow(BadRequestError);
    });
    test("successfully retrieves all products", async () => {
      const products = await Products.getProducts();
      expect(products).toBeTruthy();
      expect(products.length).toBeGreaterThan(0);
    });
  });
  
  describe("removeProduct", () => {
    test("successfully removes a product", async () => {
      const productId = productIds[0];
      const product = await Products.removeProduct(productId);
      expect(product).toBeTruthy();
      expect(product).toHaveProperty("message");
      expect(product).toHaveProperty("success");
      expect(product.success).toBe(true);
      expect(product.message).toMatch(/Removed product ([A-z])/);
    });
    
    test("successfully responds when no product exist in db to be removed", async () => {
      const invalidProductId = 99999;
      const product = await Products.removeProduct(invalidProductId);
      expect(product).toBeTruthy();
      expect(product).toHaveProperty("message");
      expect(product).toHaveProperty("success");
      expect(product.success).toBe(false);
      expect(product.message).toMatch(/Product with id (\d+) not found/);
    });

    test("throws BadRequestError for db error", async () => {
      jest.spyOn(db, "query").mockImplementationOnce(() => {
        throw new Error("Database error");
      });

      await expect(Products.removeProduct(productIds[0])).rejects.toThrow(BadRequestError);
    });
  });

  describe("getAllProducts", () => {
    test("successfully retrieves all products", async () => {
      const products = await Products.getProducts();
      expect(products).toBeTruthy();
      expect(products.length).toBeGreaterThan(0);
      expect(products).toBeInstanceOf(Array);
    });
      
    test("returns empty array when no products exist", async () => {
      await Promise.all(productIds.map(id => Products.removeProduct(id)));
      const products = await Products.getProducts();
      expect(products).toEqual([]);
    });
      
    test("throws BadRequestError for db error", async () => {
      jest.spyOn(db, "query").mockImplementationOnce(() => {
        throw new Error("Database error");
      });
        
        await expect(Products.getProducts()).rejects.toThrow(BadRequestError);
    });
  });

  describe("findProductById", () => {
    test("successfully retrieves a product by ID", async () => {
      const productId = productIds[0];
      const product = await Products.findProductById(productId);
      expect(product).toBeTruthy();
      expect(product).toHaveProperty("id");
      expect(product).toHaveProperty("sku");
      expect(product).toHaveProperty("name");
      expect(product).toHaveProperty("description");
      expect(product).toHaveProperty("price");
      expect(product).toHaveProperty("stock");
      expect(product).toHaveProperty("image_url");
      expect(product).toHaveProperty("createdAt");
      expect(product).toHaveProperty("updatedAt");
      expect(product).toHaveProperty("categories");
      expect(product.categories).toBeInstanceOf(Array);
      expect(product.id).toEqual(productId);
    });

    test("returns an empty object when no product is found", async () => {
      const invalidProductId = 99999;
      const product = await Products.findProductById(invalidProductId);
      expect(product).toEqual({});
    });

    test("throws BadRequestError for invalid ID", async () => {
      const invalidId = "invalid";
      await expect(Products.findProductById(invalidId)).rejects.toThrow(BadRequestError);
    });

    test("throws BadRequestError for db error", async () => {
      jest.spyOn(db, "query").mockImplementationOnce(() => {
        throw new Error("Database error");
      });

      await expect(Products.findProductById(productIds[0])).rejects.toThrow(BadRequestError);
    });
  });

  describe("updateProduct", () => { 
    test("successfully updates a product", async () => {
      const productId = productIds[0];
      const updatedProduct = {
        name: "Updated Product",
        description: "This is an updated product",
        stock: 2,
        imageURL: "http://example.com/updated-product.jpg",
        price: '39.99',
      };

      const product = await Products.updateProduct(productId, updatedProduct);

      expect(product).toBeTruthy();
      expect(product).toHaveProperty("id");
      expect(product.productName).toEqual(updatedProduct.name);
      expect(product.productDescription).toEqual(updatedProduct.description);
      expect(product.stock).toEqual(updatedProduct.stock + (product.stock - updatedProduct.stock));
      expect(product.imageURL).toEqual(updatedProduct.imageURL);
      expect(product.price).toEqual(updatedProduct.price);
    });

    test("throws BadRequestError for non-existent product ID", async () => {
      const invalidProductId = 99999;
      const updatedProduct = {
        name: "Updated Product",
        description: "This is an updated product",
        stock: '2',
        imageURL: "http://example.com/updated-product.jpg",
        price: '29.99',
      };

      await expect(Products.updateProduct(invalidProductId, updatedProduct)).rejects.toThrow(BadRequestError);
    });

    test("throws BadRequestError for db error", async () => {
      jest.spyOn(db, "query").mockImplementationOnce(() => {
        throw new Error("Database error");
      });

      await expect(Products.updateProduct(productIds[0], {})).rejects.toThrow(BadRequestError);
    });
  });

  describe("removeCategoryFromProduct", () => {
    test("successfully removes a category from a product", async () => {
      const productId = productIds[0];
      const categoryId = categoryIds[0];
      
      const result = await Products.removeCategoryFromProduct(productId, categoryId);

      expect(result).toBeTruthy();
      expect(result).toHaveProperty("message");
      expect(result).toHaveProperty("success");
      expect(result.success).toBe(true);
      expect(result.message).toMatch("Removed category");
    });
    
    test("successfully responds with message for non-existent product ID", async () => {
      const invalidProductId = 99999;
      const categoryId = categoryIds[0];
    
      const result = await Products.removeCategoryFromProduct(invalidProductId, categoryId);

      expect(result).toBeTruthy();
      expect(result).toHaveProperty("message");
      expect(result).toHaveProperty("success");
      expect(result.success).toBe(false);
      expect(result.message).toMatch("Nothing to remove");
    });

    test("throws BadRequestError for db error", async () => {
      jest.spyOn(db, "query").mockImplementationOnce(() => {
        throw new Error("Database error");
      });

      await expect(Products.removeCategoryFromProduct(productIds[0], categoryIds[0])).rejects.toThrow(BadRequestError);
    });
  });


});

