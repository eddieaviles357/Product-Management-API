"use strict";

const Address = require("../../models/Address");
const { BadRequestError, UnauthorizedError, ConflictError } = require("../../AppError");
const {
  username1,
  username2,
  userIdUsername,
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll
} = require("../helpers/_testCommon");

describe("Address Model", () => {
  beforeAll(commonBeforeAll);
  beforeEach(commonBeforeEach);
  afterEach(commonAfterEach);
  afterAll(commonAfterAll);

  describe("gets address", () => {
    test("works", async () => {
      const address = await Address.getAddress(username1);

      expect(address[0]).toEqual({
        id: expect.any(Number),
        userId: userIdUsername[0].id,
        address1: expect.any(String),
        address2: expect.any(String),
        city: expect.any(String),
        state: expect.any(String),
        zipcode: expect.any(String)
      });
    });
  });
});