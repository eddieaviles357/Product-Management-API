"use strict";

const Products = require('../../models/Products');
const { BadRequestError, NotFoundError } = require("../../AppError");
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
    
  });
});