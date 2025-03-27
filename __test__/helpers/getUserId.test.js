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
    expect(id).toEqual(userId);
    expect(Number.isInteger(userId)).toBe(true);
  })

  test("no user exist should equal 0", async () => {
    const userId = await getUserId('fail');
    expect(userId).toEqual(0);
    expect(Number.isInteger(userId)).toBe(true);
  });
  
  // test("should throw", async () => {
  //   try {
  //     await getUserId();
  //     fail();
  //     } catch (err) {
  //       expect(err instanceof BadRequestError).toBeTruthy();
  //     }
  //   })
});
// test("test", () => expect(true).toBe(true) )