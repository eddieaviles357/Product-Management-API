"use strict";

const Categories = require("../../models/Categories");
const { BadRequestError } = require("../../AppError");
const db = require("../../db");
const {
  userIdUsername,
  username1,
  productIds,
  orderIds,
  categoryIds,
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll
} = require("../helpers/_testCommon");

describe("Categories model tests", () => {
  beforeAll(commonBeforeAll);
  beforeEach(commonBeforeEach);
  afterEach(commonAfterEach);
  afterAll(commonAfterAll);

  describe("create Category", () => {
    test("works: adds a new category", async () => {
      const category = "Electronics";
      const newCategory = await Categories.addCategory(category);
      expect(newCategory).toBeDefined();
      expect(newCategory).toEqual(expect.objectContaining({
        id: expect.any(Number),
        category: expect.any(String)
      }));
    });
    
    test("throws BadRequestError for invalid category", async () => {
      await expect(Categories.addCategory(null)).rejects.toThrow(BadRequestError);
      await expect(Categories.addCategory("")).rejects.toThrow(BadRequestError);
      await expect(Categories.addCategory("A very long category name that exceeds limit")).rejects.toThrow(BadRequestError);
    });
    
    test("throws BadRequestError for invalid category type", async () => {
      await expect(Categories.addCategory(123)).rejects.toThrow(BadRequestError);
    });
  });

  describe("getAllCategories", () => {
    test("works: retrieves all categories", async () => {
      const categories = await Categories.getAllCategories();
      expect(categories).toBeDefined();
      expect(categories.length).toBeGreaterThan(0);
      expect(categories[0]).toEqual(expect.objectContaining({
        id: expect.any(Number),
        category: expect.any(String)
      }));
    });
  });

  describe("searchCategory", () => {
    test("works: retrieves category by search term", async () => {
      const searchTerm = "none";
      const categories = await Categories.searchCategory(searchTerm);
      expect(categories).toBeDefined();
      expect(categories.length).toBeGreaterThan(0);
    });

    test("throws BadRequestError for invalid search term", async () => {
      await expect(Categories.searchCategory(null)).rejects.toThrow(BadRequestError);
      await expect(Categories.searchCategory("")).rejects.toThrow(BadRequestError);
    });
  });

  describe("updateCategory", () => {
    test("works: updates a category", async () => {
      const updatedCategory = "updatedcategory";
      const updated = await Categories.updateCategory(categoryIds[1], updatedCategory);
      expect(updated).toBeDefined();
      expect(updated.id).toEqual(categoryIds[1]);
    });

    test("throws BadRequestError for invalid id", async () => {
      await expect(Categories.updateCategory("invalid", "Updated Category")).rejects.toThrow(BadRequestError);
    });
  });

  describe("getAllCategoryProducts", () => {
    test("works: retrieves all products for a category", async () => {
      const products = await Categories.getAllCategoryProducts(categoryIds[0]);
      expect(products).toBeDefined();
      expect(products).toBeInstanceOf(Array);
    });

    test("throws BadRequestError for invalid id", async () => {
      await expect(Categories.getAllCategoryProducts("invalid")).rejects.toThrow(BadRequestError);
    });
  });

  describe("removeCategory", () => {
    test("works: removes a category", async () => {
      const removed = await Categories.removeCategory(categoryIds[2]);
      expect(removed).toBeDefined();
      expect(removed.success).toBe(true);
    });

    test("throws BadRequestError for invalid id", async () => {
      await expect(Categories.removeCategory("invalid")).rejects.toThrow(BadRequestError);
    });
  });

  describe("getMultipleCategoryProducts", () => {
    test("works: retrieves products from multiple categories", async () => {
      const products = await Categories.getMultipleCategoryProducts([categoryIds[0], categoryIds[1]]);
      expect(products).toBeInstanceOf(Array);
    });

    test("throws BadRequestError for empty array", async () => {
      await expect(Categories.getMultipleCategoryProducts([])).rejects.toThrow(BadRequestError);
    });
  });
});