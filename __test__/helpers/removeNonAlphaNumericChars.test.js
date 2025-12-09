"use strict";

const removeNonAlphaNumericChars = require("../../helpers/removeNonAlphaNumericChars");

describe("remove non-alphanumeric chars", () => {
  test("works", () => {
    const input = "This++123 should__123 remove123 #@* non-alphanumeric#@123 characters123";
    const output = removeNonAlphaNumericChars(input);
   
    expect(output).toBe("This123should123remove123nonalphanumeric123characters123");
  });
});