"use strict"

const jwt = require("jsonwebtoken");
const createToken = require("../../helpers/tokens");
const { SECRET_KEY } = require("../../config");

describe("token creations", () => {
  test("not admin", async () => {
    let username = "meow"
    const token = await createToken({ username, isAdmin: false});
    const payload = jwt.verify(token, SECRET_KEY);
    
    expect(payload).toEqual({
      exp: expect.any(Number),
      iat: expect.any(Number),
      jti: expect.any(String),
      username,
      isAdmin: false
    })
  });

  test("admin", async () => {
    let username = "meow"
    const token = await createToken({ username, isAdmin: true});
    const payload = jwt.verify(token, SECRET_KEY);
    
    expect(payload).toEqual({
      exp: expect.any(Number),
      iat: expect.any(Number),
      jti: expect.any(String),
      username,
      isAdmin: true
    })
  });

  test("default no admin", async () => {
    expect(async() => {
      await createToken({ username: "meow" });
    }).rejects.toThrow(); // rejects.toThrow() used now for async functions createToken
  });

  test("missing username", async () => {
    expect(async() => {
      await createToken({ isAdmin: true });
    }).rejects.toThrow();
  });
})