"use strict";

const request = require("supertest");
const app = require("../../app");
const createToken = require("../../helpers/tokens");
const { BadRequestError } = require("../../AppError");
const Categories = require("../../models/Categories");
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
const db = require("../../db.js");
// getAllCategories
// addCategory
// updateCategory
// removeCategory
// getAllCategoryProducts

// searchCategory

describe("Categories Routes", () => {
  beforeAll(commonBeforeAll);
  beforeEach(() => jest.resetAllMocks(), commonBeforeEach);
  afterEach(commonAfterEach);
  afterAll(commonAfterAll);

  describe("GET /categories", () => {
    // ✅
    test("returns all categories", async () => {
      const response = await request(app).get("/api/v1/categories")

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        success: true,
        categories: [ // db is set to return items in descending order
          { id: categoryIds[2], category: "savy" },
          { id: categoryIds[1], category: "expensive" },
          { id: categoryIds[0], category: "none" },
        ],
      });
    });

    // ✅
    test("returns empty array when no categories found", async () => {
      const response = await request(app)
        .get("/api/v1/categories")
        .query({ cursor: 0 });
        
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        success: true,
        categories: [],
      });
    });

    test("returns categories (id) with cursor", async () => {
      const response = await request(app)
        .get("/api/v1/categories")
        .query({ cursor: categoryIds[1] });

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        success: true,
        categories: [
          { id: categoryIds[0], category: "none" },
        ],
      });
    });

    test("throws BadRequestError", async () => {
      jest.spyOn(Categories, "getAllCategories").mockImplementation(() => {
        throw new BadRequestError("something went wrong");
      });

      const response = await request(app)
        .get("/api/v1/categories")
        .query({ cursor: "invalid" });

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        error: { 
          message: 'something went wrong', 
          status: 400
        }
      });
    });
  });

  describe("POST /categories", () => {
    // ✅
    test("creates a new category, works with admin privilage", async () => {
      const response = await request(app)
        .post("/api/v1/categories")
        .set("Authorization", `Bearer ${createToken({ username: username1, isAdmin: true })}`)
        .send({ category: "newCategory" });

      expect(response.statusCode).toBe(201);
      expect(response.body).toEqual({
        success: true,
        newCategory: {
          id: expect.any(Number),
          category: "newcategory", // category will be lowercase
        }
      });
    });
    // ✅
    test("throws ConflictError when category already exists", async () => {
      const response = await request(app)
        .post("/api/v1/categories")
        .set("Authorization", `Bearer ${createToken({ username: username1, isAdmin: true })}`)
        .send({ category: "none" });

      expect(response.statusCode).toBe(409);
      expect(response.body).toEqual({
        error: { 
          message: 'Review for this product already exists', 
          status: 409
        }
      });
    });
    // ✅
    test("throws BadRequestError when no category is provided", async () => {
      const response = await request(app)
        .post("/api/v1/categories")
        .set("Authorization", `Bearer ${createToken({ username: username1, isAdmin: true })}`)
        .send({});

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        errors: [{
          message: "requires property \"category\"",
          property: "category",
        }],
      });
    });
    // ✅
    test("throws BadRequestError when invalid data type is provided", async () => {
      const response = await request(app)
        .post("/api/v1/categories")
        .set("Authorization", `Bearer ${createToken({ username: username1, isAdmin: true })}`)
        .send({ category: 12345 });

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        errors: [{ 
          message: "category is not of a type(s) string", 
          property: "category"
        }]
      });
    });
    // ✅
    test("throws BadRequestError when category is too long", async () => {
      const response = await request(app)
        .post("/api/v1/categories")
        .set("Authorization", `Bearer ${createToken({ username: username1, isAdmin: true })}`)
        .send({ category: "a".repeat(21) });

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        errors: [{ 
          message: "category does not meet maximum length of 20", 
          property: "category"
        }]
      });
    });
    // ✅
    test("throws BadRequestError when user is not an admin", async () => {
      const response = await request(app)
        .post("/api/v1/categories")
        .set("Authorization", `Bearer ${createToken({ username: username2 })}`)
        .send({ category: "newCategory" });

      expect(response.statusCode).toBe(401);
      expect(response.body).toEqual({
        error: { 
          message: 'Unauthorized', 
          status: 401
        }
      });
    });
    // ✅
    test("throws BadRequestError when no token is provided", async () => {
      const response = await request(app)
        .post("/api/v1/categories")
        .send({ category: "newCategory" });

      expect(response.statusCode).toBe(401);
      expect(response.body).toEqual({
        error: { 
          message: 'Unauthorized',
          status: 401
        }
      });
    });
  });

  describe("PUT /categories/:categoryId", () => {
    // ✅
    test("updates a category, works with admin privilage", async () => {
      const response = await request(app)
        .put(`/api/v1/categories/${categoryIds[2]}`)
        .set("Authorization", `Bearer ${createToken({ username: username1, isAdmin: true })}`)
        .send({ category: "updatedCategory" });

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        success: true,
        category: {
          id: categoryIds[2],
          category: "updatedcategory",
        }
      });
    });

    // ✅
    test("throws NotFoundError when category does not exist", async () => {
      const response = await request(app)
        .put("/api/v1/categories/99999")
        .set("Authorization", `Bearer ${createToken({ username: username1, isAdmin: true })}`)
        .send({ category: "updatedCat" });

      expect(response.statusCode).toBe(404);
      expect(response.body).toEqual({
        error: { 
          message: 'updatedCat does not exist', 
          status: 404
        }
      });
    });
    // ✅
    test("throws BadRequestError when categoryId is not a number", async () => {
      const response = await request(app)
        .put("/api/v1/categories/invalid")
        .set("Authorization", `Bearer ${createToken({ username: username1, isAdmin: true })}`)
        .send({ category: "updatedCat" });

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        error: { 
          message: 'category id must be a number', 
          status: 400
        }
      });
    });
    // ✅
    test("throws BadRequestError when no category is provided", async () => {
      const response = await request(app)
        .put(`/api/v1/categories/${categoryIds[0]}`)
        .set("Authorization", `Bearer ${createToken({ username: username1, isAdmin: true })}`)
        .send({});

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        errors: [{
          message: "requires property \"category\"",
          property: "category",
        }],
      });
    });
    // ✅
    test("throws BadRequestError when invalid data type is provided", async () => {
      const response = await request(app)
        .put(`/api/v1/categories/${categoryIds[0]}`)
        .set("Authorization", `Bearer ${createToken({ username: username1, isAdmin: true })}`)
        .send({ category: 12345 });

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        errors: [{ 
          message: "category is not of a type(s) string", 
          property: "category"
        }]
      });
    });
    // ✅
    test("throws BadRequestError when category is too long", async () => {
      const response = await request(app)
        .put(`/api/v1/categories/${categoryIds[0]}`)
        .set("Authorization", `Bearer ${createToken({ username: username1, isAdmin: true })}`)
        .send({ category: "a".repeat(21) });

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        errors: [{ 
          message: "category does not meet maximum length of 20", 
          property: "category"
        }]
      });
    });
    // ✅
    test("throws BadRequestError when user is not an admin", async () => {
      const response = await request(app)
        .put(`/api/v1/categories/${categoryIds[0]}`)
        .set("Authorization", `Bearer ${createToken({ username: username2 })}`)
        .send({ category: "updatedCategory" });

      expect(response.statusCode).toBe(401);
      expect(response.body).toEqual({
        error: { 
          message: 'Unauthorized', 
          status: 401
        }
      });
    });
  });

  describe("DELETE /categories/:categoryId", () => {
    // ✅
    test("deletes a category, works with admin privilage", async () => {
      const response = await request(app)
        .delete(`/api/v1/categories/${categoryIds[2]}`)
        .set("Authorization", `Bearer ${createToken({ username: username1, isAdmin: true })}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        success: true,
        result: {
          category: "updatedcategory",
        }
      });
    });

    // // ✅
    test("throws NotFoundError when category does not exist", async () => {
      const response = await request(app)
        .delete("/api/v1/categories/99999")
        .set("Authorization", `Bearer ${createToken({ username: username1, isAdmin: true })}`);

      expect(response.statusCode).toBe(404);
      expect(response.body).toEqual({
        error: { 
          message: 'Category with id 99999 not found', 
          status: 404
        }
      });
    });

    // // ✅
    test("throws BadRequestError when categoryId is not a number", async () => {
      const response = await request(app)
        .delete("/api/v1/categories/invalid")
        .set("Authorization", `Bearer ${createToken({ username: username1, isAdmin: true })}`);

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        error: { 
          message: 'category id must be a number', 
          status: 400
        }
      });
    });

    // ✅
    test("throws BadRequestError when category is 'none'", async () => {
      const response = await request(app)
        .delete(`/api/v1/categories/${categoryIds[0]}`)
        .set("Authorization", `Bearer ${createToken({ username: username1, isAdmin: true })}`);

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        error: { 
          message: `Category with id ${categoryIds[0]} cannot be deleted`, 
          status: 400
        }
      });
    });

    // ✅
    test("throws BadRequestError when user is not an admin", async () => {
      const response = await request(app)
        .delete(`/api/v1/categories/${categoryIds[0]}`)
        .set("Authorization", `Bearer ${createToken({ username: username2 })}`);

      expect(response.statusCode).toBe(401);
      expect(response.body).toEqual({
        error: { 
          message: 'Unauthorized', 
          status: 401
        }
      });
    });

    // ✅
    test("throws BadRequestError when no token is provided", async () => {
      const response = await request(app)
        .delete(`/api/v1/categories/${categoryIds[0]}`);

      expect(response.statusCode).toBe(401);
      expect(response.body).toEqual({
        error: { 
          message: 'Unauthorized', 
          status: 401
        }
      });
    });
  });

  describe("GET /categories/:categoryId/products", () => {
    // ✅
    test("returns all products in a category", async () => {
      const response = await request(app)
        .get(`/api/v1/categories/${categoryIds[0]}/products`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        success: true,
        categoryProducts: [
          { id: productIds[0],
            sku: "MC10SSMM",
            productName: 'shirt',
            productDescription: 'white short',
            price: '10.99',
            stock: 3,
            imageURL: 'https://image.product-management.com/1283859',
            createdAt: expect.any(String), // date is returned as strings dates
            updatedAt: expect.any(String),
            categories: ["none"],
          }
        ],
      });
    });

    // ✅
    test("throws NotFoundError when category does not exist", async () => {
      const response = await request(app)
        .get("/api/v1/categories/99999/products");

      expect(response.statusCode).toBe(404);
      expect(response.body).toEqual({
        error: { 
          message: 'Category with id 99999 not found', 
          status: 404
        }
      });
    });
    
    // ✅
    test("throws BadRequestError when categoryId is not a number", async () => {
      const response = await request(app)
        .get("/api/v1/categories/invalid/products");

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        error: { 
          message: 'category id must be a number', 
          status: 400
        }
      });
    });

    // ✅
    test("throws BadRequestError when no products are found in category", async () => {
      const response = await request(app)
        .get(`/api/v1/categories/${categoryIds[2]}/products`);

      expect(response.statusCode).toBe(404);
      expect(response.body).toEqual({
        error: {
          message: `Category with id ${categoryIds[2]} not found`, 
          status: 404
        }
      });
    });

    // ✅
    test("throws BadRequestError when no categoryId is provided", async () => {
      const response = await request(app)
        .get("/api/v1/categories/invalid/products");

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        error: { 
          message: 'category id must be a number', 
          status: 400
        }
      });
    });
  });

  describe("GET /categories/search", () => {
    // ✅
    test("returns all categories that match search term", async () => {
      const response = await request(app)
        .get("/api/v1/categories/search/none")

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        success: true,
        categories: [
          { id: categoryIds[0], category: "none" },
        ],
      });
    });

    // ✅
    test("returns empty array when no categories match search term", async () => {
      const response = await request(app)
        .get("/api/v1/categories/search/invalid")

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        success: true,
        categories: [],
      });
    });

    // ✅
    test("throws BadRequestError when no search term is provided", async () => {
      const response = await request(app)
        .get("/api/v1/categories/search");

      expect(response.statusCode).toBe(404);
      expect(response.body).toEqual({ // will use fallback error handler
        error: { 
          message: 'Not Found', 
          status: 404
        }
      });
    });

    // ✅
    test("throws BadRequestError when search term is not a string", async () => {
      const response = await request(app)
        .get("/api/v1/categories/search/12345");

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        error: { 
          message: 'search term must be a string', 
          status: 400
        }
      });
    });

    // ✅
    test("throws BadRequestError when search term is too long", async () => {
      const response = await request(app)
        .get(`/api/v1/categories/search/${'a'.repeat(21)}`);

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        error: { 
          message: 'Search term must be less than 20 characters', 
          status: 400
        }
      });
    });
  });
  
});