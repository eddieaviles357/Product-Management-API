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
});