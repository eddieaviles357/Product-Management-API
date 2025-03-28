"use strict";

const removeNonAlphabeticChars = require("../../helpers/removeNonAlphabeticChars");

describe("remove non-alphabetic chars", () => {
  test("works", () => {
    // Test a string with various non-alphabetic characters
    const input = "This++ should__ remove #@* non-alphabetic#@ characters";
    const output = removeNonAlphabeticChars(input);
   
    expect(output).toBe("Thisshouldremovenonalphabeticcharacters");
  })
});