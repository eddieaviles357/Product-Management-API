"use strict";

const sanitizePagination = require("../../helpers/sanitizePagination");

describe("sanitize pagination", () => {
  test("works", () => {
    const input = {
      page: "2",
      limit: "10"
    };
    const output = sanitizePagination(input);

    expect(output).toEqual({
      page: 1,
      limit: 10,
      offset: 0
    });
  });

  test("should not throw error for invalid page", () => {
    const input = {
      page: "abc",
      limit: "10"
    };
    const sanitizeResult = sanitizePagination(input);

    expect(sanitizeResult).toEqual({
      page: 1, // default page
      limit: 10,
      offset: 0
    });
  });

  test("should not throw error for invalid limit", () => {
    const input = {
      page: "2",
      limit: "-5"
    };

    const sanitizeResult = sanitizePagination(input);

    expect(sanitizeResult).toEqual({
      page: 1, // default page
      limit: 1,
      offset: 0
    })
  });
});