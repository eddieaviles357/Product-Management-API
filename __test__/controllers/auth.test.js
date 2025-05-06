"use strict";

const request = require("supertest");
const app = require("../../app");
const { createToken } = require("../../helpers/tokens");
const { BadRequestError } = require("../../AppError");

const {
  productIds,
  categoryIds,
  userIdUsername,
  addressIds,
  username1,
  username2,
  orderIds,
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll
} = require("../helpers/_testCommon");
const db = require("../../db.js");

describe("Auth Middleware", () => {
  beforeAll(commonBeforeAll);
  beforeEach(commonBeforeEach);
  afterEach(commonAfterEach);
  afterAll(commonAfterAll);

  describe("Auth Routes", () => {
    describe("POST /auth/authenticate", () => {
      test("successful login", async () => {
        const response = await request(app)
          .post("/api/v1/auth/authenticate")
          .send({ username: "west123", password: "password" });

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
          token: expect.any(String),
        });
      });

      test("invalid credentials", async () => {
        const response = await request(app)
          .post("/api/v1/auth/authenticate")
          .send({ username: "testuser", password: "wrongpassword" });

        expect(response.statusCode).toBe(401);
        expect(response.body).toEqual({
          error: {
            message: "Please register",
            status: 401,
          },
        });
      });

      test("missing fields", async () => {
        const response = await request(app)
          .post("/api/v1/auth/authenticate")
          .send({ username: "testFail" });

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
          errors: [{
            message: "requires property \"password\"",
            property: "password",
          }]
        });
      });
    });
//
    describe("POST /auth/register", () => {
      test("successful registration", async () => {
        const response = await request(app)
          .post("/api/v1/auth/register")
          .send({
            username: "newuser",
            password: "password123",
            firstName: "New",
            lastName: "User",
            email: "newuser@example.com",
          });
          
        expect(response.statusCode).toBe(201);
        expect(response.body).toEqual({
          token: expect.any(String),
        });
      });

      test("missing fields", async () => {
        const str = "requires property"
        const pWord = "\"password\"";

        const response = await request(app)
          .post("/api/v1/auth/register")
          .send({ username: "newuser", firstName: "first", lastName: "last" });

        expect(response.statusCode).toBe(400);
        expect(response.body.errors).toBeInstanceOf(Array);
        expect(response.body.errors.length).toEqual(1);
        expect(response.body).toEqual({
          errors: [{
            message: `${str} ${pWord}`,
            property: pWord.slice(1, this.length).slice(this.length - 2, -1),
          }],
        });
      });

      test("missing fields", async () => {
        const str = "requires property"
        const lName = "\"lastName\"";
        const pWord = "\"password\"";

        const response = await request(app)
          .post("/api/v1/auth/register")
          .send({ username: "newuser", firstName: "first" });

        expect(response.statusCode).toBe(400);
        expect(response.body.errors).toBeInstanceOf(Array);
        expect(response.body.errors.length).toEqual(2);
        expect(response.body).toEqual({
          errors: [{
            message: `${str} ${lName}`,
            property: lName.slice(1, this.length).slice(this.length - 2, -1),
          },{
            message: `${str} ${pWord}`,
            property: pWord.slice(1, this.length).slice(this.length - 2, -1),
          }],
        });
      });

      test("missing fields", async () => {
        const str = "requires property"
        const fName = "\"firstName\"";
        const lName = "\"lastName\"";
        const pWord = "\"password\"";

        const response = await request(app)
          .post("/api/v1/auth/register")
          .send({ username: "newuser" });

        expect(response.statusCode).toBe(400);
        expect(response.body.errors).toBeInstanceOf(Array);
        expect(response.body.errors.length).toEqual(3);
        expect(response.body).toEqual({
          errors: [{
            message: `${str} ${fName}`,
            property: fName.slice(1, this.length).slice(this.length - 2, -1),
          }, {
            message: `${str} ${lName}`,
            property: lName.slice(1, this.length).slice(this.length - 2, -1),
          },{
            message: `${str} ${pWord}`,
            property: pWord.slice(1, this.length).slice(this.length - 2, -1),
          }],
        });
      });

      // test("duplicate username", async () => {
      //   const response = await request(app)
      //     .post("/auth/register")
      //     .send({
      //       username: "testuser",
      //       password: "password123",
      //       firstName: "Test",
      //       lastName: "User",
      //       email: "testuser@example.com",
      //     });

      //   expect(response.statusCode).toBe(409);
      //   expect(response.body).toEqual({
      //     error: {
      //       message: "Username already exists",
      //       status: 409,
      //     },
      //   });
      // });
    });
  });

});