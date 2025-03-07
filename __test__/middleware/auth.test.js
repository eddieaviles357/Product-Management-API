"use strict";

const jwt = require("jsonwebtoken");
const { UnauthorizedError } = require("../../AppError");
const {
  authenticateJWT,
  ensureLoggedIn,
  ensureAdmin,
} = require("../../middleware/auth/auth");

const { SECRET_KEY } = require("../../config");
const TEST_USER = "testWithSecret"
const testJwt = jwt.sign({ username: TEST_USER, isAdmin: false }, SECRET_KEY);
const badJwt = jwt.sign({ username: TEST_USER, isAdmin: false }, "wrong");

describe("authenticateJWT", () => {
  test("works: via header", async () => {
    expect.assertions(2);
    // pass token to header
    const req = { headers: { authorization: `Bearer ${testJwt}` } };
    const res = { locals: {} };

    const next = function (err) {
      expect(err).toBeFalsy();
    };
    
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({
      user: {
        iat: expect.any(Number),
        username: TEST_USER,
        isAdmin: false,
      }
    })
  });

  test("works: no header", function () {
    expect.assertions(2);
    const req = {};
    const res = { locals: {} };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({});
  });
  
  test("works: invalid token", function () {
    expect.assertions(2);
    const req = { headers: { authorization: `Bearer ${badJwt}` } };
    const res = { locals: {} };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({});
  });
})

describe("ensureLoggedIn", function () {
  test("works", function () {
    expect.assertions(1);
    const req = {};
    const res = { locals: { user: { username: TEST_USER, is_admin: false } } };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    ensureLoggedIn(req, res, next);
  });

  test("unauth if no login", function () {
    expect.assertions(1);
    const req = {};
    const res = { locals: {} };

    const next = function (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    };

    ensureLoggedIn(req, res, next);
  });

  describe("ensureAdmin", function () {
    test("works", function () {
      expect.assertions(1);
      const req = {};
      const res = { locals: { user: { username: TEST_USER, isAdmin: true } } };

      const next = function (err) {
        expect(err).toBeFalsy();
      };

      ensureAdmin(req, res, next);
    });
  });

  test("unauth if not admin", function () {
    expect.assertions(1);
    const req = {};
    const res = { locals: { user: { username: TEST_USER, isAdmin: false } } };

    const next = function (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    };

    ensureAdmin(req, res, next);
  });

  test("unauth if anon", function () {
    expect.assertions(1);
    const req = {};
    const res = { locals: {} };

    const next = function (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    };
    
    ensureAdmin(req, res, next);
  });
  
  // describe("ensureCorrectUserOrAdmin", function () {
  //   test("works: admin", function () {
  //     expect.assertions(1);
  //     const req = { params: { username: TEST_USER } };
  //     const res = { locals: { user: { username: "admin", isAdmin: true } } };
  //     const next = function (err) {
  //       expect(err).toBeFalsy();
  //     };
  //     ensureCorrectUserOrAdmin(req, res, next);
  //   });
  
  //   test("works: same user", function () {
  //     expect.assertions(1);
  //     const req = { params: { username: TEST_USER } };
  //     const res = { locals: { user: { username: TEST_USER, isAdmin: false } } };
  //     const next = function (err) {
  //       expect(err).toBeFalsy();
  //     };
  //     ensureCorrectUserOrAdmin(req, res, next);
  //   });
  
  //   test("unauth: mismatch", function () {
  //     expect.assertions(1);
  //     const req = { params: { username: "wrong" } };
  //     const res = { locals: { user: { username: TEST_USER, isAdmin: false } } };
  //     const next = function (err) {
  //       expect(err instanceof UnauthorizedError).toBeTruthy();
  //     };
  //     ensureCorrectUserOrAdmin(req, res, next);
  //   });
  
  //   test("unauth: if anon", function () {
  //     expect.assertions(1);
  //     const req = { params: { username: TEST_USER } };
  //     const res = { locals: {} };
  //     const next = function (err) {
  //       expect(err instanceof UnauthorizedError).toBeTruthy();
  //     };
  //     ensureCorrectUserOrAdmin(req, res, next);
  //   });
  // });
})