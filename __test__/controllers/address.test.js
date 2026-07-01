"use strict";

const request = require("supertest");
const app = require("../../app");
const createToken = require("../../helpers/tokens");
const { BadRequestError } = require("../../AppError");
const Categories = require("../../models/Address");
const {
  productIds,
  categoryIds,
  username1,
  username2,
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll
} = require("../helpers/_testCommon");
const db = require("../../db.js");

describe("Categories Routes", () => {
  beforeAll(commonBeforeAll);
  // beforeEach(() => {
  //   jest.clearAllMocks(); // clear mock history before each test
  //   jest.resetAllMocks() // restores original implementations
  // }, commonBeforeEach);
  beforeEach(commonBeforeEach);
  afterEach(commonAfterEach);
  afterAll(commonAfterAll);

  describe("GET /address/:username", () => {
    test("gets address", async () => {
      const token = await createToken({ username: username1 });
      const response = await request(app)
        .get(`/api/v1/address/${username1}`)
        .set("authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        success: true,
        address: expect.any(Array)
      });
    });

    test("throws BadRequestError if user does not exist", async () => {
      const token = await createToken({ username: "nonexistentuser" });
      const response = await request(app)
        .get(`/api/v1/address/nonexistentuser`)
        .set("authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        error: {
          message: "User does not exist",
          status: 400
        }
      });
    });
  });

  describe("POST /address/:username", () => {
    test("creates new address", async () => {
      const token = await createToken({ username: username2 });
      
      const newAddressData = {
        address1: "123 New St",
        address2: "Apt 4",
        city: "New City",
        state: "NC",
        zipcode: "12345"
      };

      const response = await request(app)
        .post(`/api/v1/address/${username2}`)
        .set("authorization", `Bearer ${token}`)
        .send(newAddressData);

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        success: true,
        address: {
          id: expect.any(Number),
          userId: expect.any(Number),
          ...newAddressData
        }
      });
    });

    test("updates existing address", async () => {
      const token = await createToken({ username: username1 });
      
      const updatedAddressData = {
        address1: "456 Updated St",
        address2: "Suite 8",
        city: "Updated City",
        state: "CA",
        zipcode: "54321"
      };

      const response = await request(app)
        .post(`/api/v1/address/${username1}`)
        .set("authorization", `Bearer ${token}`)
        .send(updatedAddressData);

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        success: true,
        address: {
          id: expect.any(Number),
          userId: expect.any(Number),
          ...updatedAddressData
        }
      });
    });

    test("throws BadRequestError if user does not exist", async () => {
      const token = await createToken({ username: "nonexistentuser" });
      
      const addressData = {
        address1: "789 Nonexistent St",
        city: "No City",
        state: "NC",
        zipcode: "67890"
      };

      const response = await request(app)
        .post(`/api/v1/address/nonexistentuser`)
        .set("authorization", `Bearer ${token}`)
        .send(addressData);

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        error: {
          message: "User does not exist",
          status: 400
        }
      });
    });

    test("throws BadRequestError if address is invalid", async () => {
      const token = await createToken({ username: username1 });
      
      const invalidAddressData = {
        address1: "789 Invalid St",
        city: "Invalid City",
        state: "ZZ", // Invalid state
        zipcode: "00000"
      };

      const response = await request(app)
        .post(`/api/v1/address/${username1}`)
        .set("authorization", `Bearer ${token}`)
        .send(invalidAddressData);

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        error: {
          message: "new row for relation \"addresses\" violates check constraint \"addresses_state_check\"",
          status: 400
        }
      });
    });

  });


});