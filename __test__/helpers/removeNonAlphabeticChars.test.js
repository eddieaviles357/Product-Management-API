"use strict";

const removeNonAlphabeticChars = require("../../helpers/removeNonAlphabeticChars");

describe("remove non-alphabetic chars", () => {
  test("works", () => {
    const input = "This++ should__ remove #@* non-alphabetic#@ characters";
    const output = removeNonAlphabeticChars(input);
   
    expect(output).toBe("Thisshouldremovenonalphabeticcharacters");
  });
});