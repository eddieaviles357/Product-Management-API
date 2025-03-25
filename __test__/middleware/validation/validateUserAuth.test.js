"use strict";

const { BadRequestError } = require("../../../AppError");
const validateUserAuth = require("../../../middleware/validation/validateUserAuth");

describe("validateUserAuth Middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(), // used to return this for chaining
      json: jest.fn()
    };
    next = jest.fn();
  });

  test("should call next() if schema is valid", () => {
    req.body = { username: "testuser", password: "Test@1234" };

    validateUserAuth(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  test("should return 400 if schema is invalid", () => {
    req.body = { username: "testuser" }; // Missing password field

    validateUserAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      errors: expect.any(Array)
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("should return 400 and provide error message that requires password", () => {
    req.body = { username: "testuser" }; // Missing password field

    validateUserAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      errors: expect.arrayContaining([
        expect.objectContaining({
          property: expect.any(String),
          message: "requires property \"password\""
        })
      ])
    });
    expect(next).not.toHaveBeenCalled();
  }); 

  test("should privide detail error for exceeding username length max 20 characters", () => {
    req.body = { username: "morethan20+morethan20", password: "Test@1234" };
// 20 password 60
    validateUserAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      errors: expect.arrayContaining([
        expect.objectContaining({
          property: "username",
          message: "username does not meet maximum length of 20"
        })
      ])
    });
    expect(next).not.toHaveBeenCalled();
  }); 
});