"use strict";

const db = require("../../db");
const {BadRequestError} = require("../../AppError");
const getUserId = require("../../helpers/getUserId");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  userIdUsername
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
  });

  test("no user exist should equal 0", async () => {
    const userId = await getUserId('fail');
    expect(userId).toEqual(0);
    expect(Number.isInteger(userId)).toBe(true);
  });
  
  test("should throw BadRequestError for invalid input", async () => {
    jest.spyOn(db, "query").mockImplementationOnce(() => {
      throw new Error("Database error");
    });

    try {
      await getUserId("failedquery");
    } catch (err) {
      expect(err).toBeInstanceOf(BadRequestError);
      expect(err.message).toBe("Database error");
    }
  });

  test("should handle SQL injection", async () => {
    const maliciousInput = "'; DROP TABLE users; --";
    const userId = await getUserId(maliciousInput);
    expect(userId).toEqual(0);
  });
});