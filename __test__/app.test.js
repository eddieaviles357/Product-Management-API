"use strict";
const request = require("supertest");

const app = require("../app");
const db = require("../db");


// test("not found for site 404", async function () {
//   const resp = await request(app).get("/non-existent-path");
//   expect(resp.statusCode).toEqual(404);
// });

// test("not found for site 404 (test stack print)", async function () {
//   process.env.NODE_ENV = "";
//   const resp = await request(app).get("/non-existent-path");
//   expect(resp.statusCode).toEqual(404);
//   delete process.env.NODE_ENV;
// });

test('test', () => expect(true).toBe(true) )

afterAll(function () {
  db.end();
});