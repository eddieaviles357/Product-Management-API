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
  userIdUsername,
  addressIds
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("helper get user id from db", () => {
  test("testing", async () => {
    const {id, username} = userIdUsername[0];
    const userId = await getUserId(username);
    expect(id).toEqual(userId)
  })

  test("throws error", async () => {
    await expect( () => getUserId("test") ).rejects.toThrow();
  })
});
// test("test", () => expect(true).toBe(true) )