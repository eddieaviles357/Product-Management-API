"use stric";

const Categories = require("../../models/Categories");
const { BadRequestError } = require("../../AppError");
const db = require("../../db");
const {
  userIdUsername,
  username1,
  productIds,
  orderIds,
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll
} = require("../helpers/_testCommon");

// getAllCategories
// searchCategory
// addCategory
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
});