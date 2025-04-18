"use stric";

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

// getAllCategories
// addCategory
// searchCategory
// updateCategory
// getAllCategoryProducts

// removeCategory
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
        category: `${category.charAt(0).toLowerCase()}${category.slice(1)}`
      }));
    });
    test("throws BadRequestError for invalid category", async () => {
      await expect(Categories.addCategory(null)).rejects.toThrow(BadRequestError);
      await expect(Categories.addCategory("")).rejects.toThrow(BadRequestError);
      await expect(Categories.addCategory("A very long category name")).rejects.toThrow(BadRequestError);
    });
    
    test("throws BadRequestError for invalid category type", async () => {
      await expect(Categories.addCategory(123)).rejects.toThrow(BadRequestError);
    });

    test("throws BadRequestError for empty category", async () => {
      await expect(Categories.addCategory("")).rejects.toThrow(BadRequestError);
    });
  });

  describe("getAllCategories", () => {
    test("works: retrieves all categories with pagination", async () => {
      const categories = await Categories.getAllCategories();
      expect(categories).toBeDefined();
      expect(categories.length).toBeGreaterThan(0);
      expect(categories[0]).toEqual(expect.objectContaining({
        id: expect.any(Number),
        category: expect.any(String)
      }));
    });
    test("throws BadRequestError for invalid id", async () => {
      await expect(Categories.getAllCategories("invalid")).rejects.toThrow(BadRequestError);
    });
  });

  describe("searchCategory", () => {
    test("works: retrieves category by search term", async () => {
      const category = "electronics"; // add category to db
      const newCategory = await Categories.addCategory(category);
      expect(newCategory).toBeDefined();

      const searchTerm = category.slice(1); // lectronics
      const categories = await Categories.searchCategory(searchTerm);
      expect(categories).toBeDefined();
      expect(categories.length).toBeGreaterThan(0);
      expect(categories[0]).toEqual(expect.objectContaining({
        id: expect.any(Number),
        category: expect.any(String)
      }));
    });

    test("throws BadRequestError for invalid search term", async () => {
      await expect(Categories.searchCategory(null)).rejects.toThrow(BadRequestError);
      await expect(Categories.searchCategory("")).rejects.toThrow(BadRequestError);
      await expect(Categories.searchCategory("A very long search term")).rejects.toThrow(BadRequestError);
    });
  });

  describe("updateCategory", () => {
    test("works: updates a category", async () => {
      const category = "awesome"; // add category to db
      const newCategory = await Categories.addCategory(category);
      expect(newCategory).toBeDefined();

      const updatedCategory = "updatedcategory"; // any capital letter will be converted to lowercase and spaces will be truncated
      const updatedCat = await Categories.updateCategory(newCategory.id, updatedCategory);
      expect(updatedCat).toBeDefined();
      expect(updatedCat).toEqual(expect.objectContaining({
        id: newCategory.id,
        category: `${updatedCategory.charAt(0).toLowerCase()}${updatedCategory.slice(1)}`
      }));
    });

    test("throws BadRequestError for invalid id", async () => {
      await expect(Categories.updateCategory("invalid", "Updated Category")).rejects.toThrow(BadRequestError);
    });
  });

  describe("getAllCategoryProducts", () => {
    test("works: retrieves all products for a category", async () => {
      const categoryProductId = categoryIds[0];
      const products = await Categories.getAllCategoryProducts(categoryProductId);

      expect(products).toBeDefined();
      expect(products).toBeInstanceOf(Array);
      expect(products.length).toBeGreaterThan(0);
      expect(products[0]).toEqual(expect.objectContaining({
        id: expect.any(Number),
        productName: expect.any(String)
      }));
    });

    test("throws BadRequestError for invalid id", async () => {
      await expect(Categories.getAllCategoryProducts("invalid")).rejects.toThrow(BadRequestError);
    });
  });

  describe("removeCategory", () => {
    test("works: removes a category", async () => {
      const category = "electronics"; // add category to db
      const newCategory = await Categories.addCategory(category);
      expect(newCategory).toBeDefined();

      const removedCat = await Categories.removeCategory(newCategory.id);
      expect(removedCat).toBeDefined();
      expect(removedCat.category).toEqual(expect.objectContaining({
        category
      }));
    });

    test("throws BadRequestError for invalid id", async () => {
      await expect(Categories.removeCategory("invalid")).rejects.toThrow(BadRequestError);
    });
  });
});