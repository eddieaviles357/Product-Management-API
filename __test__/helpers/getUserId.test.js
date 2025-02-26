"use strict";

const {BadRequestError} = require("../../AppError");
const getUserId = require("../../helpers/getUserId");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  productIds,
  categoryIds,
  userIds,
  addressIds
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("helper get user id from db", () => {
  test('testing', () => {
    console.log(productIds);
    expect(true).toEqual(true)
  }
  )
})