"use strict";

const jwt = require("jsonwebtoken");
const { UnauthorizedError } = require("../../../AppError");
const {
  authenticateJWT,
  ensureLoggedIn,
  ensureUser,
  ensureAdmin,
  ensureUserOrAdmin,
} = require("../../../middleware/auth/auth");

const { SECRET_KEY } = require("../../../config");
const TEST_USER = "testWithSecret"
const goodJwt = jwt.sign({ username: TEST_USER, isAdmin: false }, SECRET_KEY);
const badJwt = jwt.sign({ username: TEST_USER, isAdmin: false }, "wrong");

describe("authenticateJWT", () => {
  test("works: via header", () => {
    expect.assertions(2);
    // pass token to header
    const req = { headers: { authorization: `Bearer ${goodJwt}` } };
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

  test("works: no header", () => {
    expect.assertions(2);
    const req = {};
    const res = { locals: {} };
    
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({});
  });
  
  test("works: invalid token", () => {
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

describe("ensureUser", () => {
  test("works", () => {
    expect.assertions(2);
    const req = { params: { username: TEST_USER } };
    const res = { locals: { user: { username: TEST_USER, is_admin: false } } };

    const next = function (err) {
      expect(err).toBeFalsy();
    }
    ensureUser(req, res, next);
    expect(res.locals).toEqual({ user: { username: TEST_USER, is_admin: false } });
  });

  test("unauth if not user", () => {
    expect.assertions(1);
    const req = {};
    const res = { locals: {} };

    const next = function (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    }
    ensureUser(req, res, next);
  })
})

describe("ensureLoggedIn", () => {
  test("works", () => {
    expect.assertions(1);
    const req = {};
    const res = { locals: { user: { username: TEST_USER, is_admin: false } } };

    const next = function (err) {
      expect(err).toBeFalsy();
    };
    ensureLoggedIn(req, res, next);
  });

  test("unauth if no login", () => {
    expect.assertions(1);
    const req = {};
    const res = { locals: {} };

    const next = function (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    };

    ensureLoggedIn(req, res, next);
  });

  describe("ensureAdmin", () => {
    test("works", () => {
      expect.assertions(1);
      const req = {};
      const res = { locals: { user: { username: TEST_USER, isAdmin: true } } };

      const next = function (err) {
        expect(err).toBeFalsy();
      };

      ensureAdmin(req, res, next);
    });
    
    test("unauth if not admin", () => {
      expect.assertions(1);
      const req = {};
      const res = { locals: { user: { username: TEST_USER, isAdmin: false } } };
      
      const next = function (err) {
        expect(err instanceof UnauthorizedError).toBeTruthy();
      };
      
      ensureAdmin(req, res, next);
    });
    
    test("unauth if anon", () => {
      expect.assertions(1);
      const req = {};
      const res = { locals: {} };
      
      const next = function (err) {
        expect(err instanceof UnauthorizedError).toBeTruthy();
      };
      
      ensureAdmin(req, res, next);
    });
    
  });
  describe("ensureUserOrAdmin", () => {
    test("works: admin", () => {
      expect.assertions(1);
      const req = { params: { username: TEST_USER } };
      const res = { locals: { user: { username: TEST_USER, isAdmin: true } } };

      const next = function (err) {
        expect(err).toBeFalsy();
      };
      ensureUserOrAdmin(req, res, next);
    });
  
    test("works: same user", () => {
      expect.assertions(1);
      const req = { params: { username: TEST_USER } };
      const res = { locals: { user: { username: TEST_USER, isAdmin: false } } };

      const next = function (err) {
        expect(err).toBeFalsy();
      };
      ensureUserOrAdmin(req, res, next);
    });
  
    test("unauth: mismatch", () => {
      expect.assertions(1);
      const req = { params: { username: "wrong" } };
      const res = { locals: { user: { username: TEST_USER, isAdmin: false } } };

      const next = function (err) {
        expect(err instanceof UnauthorizedError).toBeTruthy();
      };
      ensureUserOrAdmin(req, res, next);
    });
  
    test("unauth: if anon", () => {
      expect.assertions(1);
      const req = { params: { username: TEST_USER } };
      const res = { locals: {} };

      const next = function (err) {
        expect(err instanceof UnauthorizedError).toBeTruthy();
      };
      ensureUserOrAdmin(req, res, next);
    });
  });
})