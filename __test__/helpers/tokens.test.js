"use strict"

const jwt = require("jsonwebtoken");
const createToken = require("../../helpers/tokens");
const { SECRET_KEY } = require("../../config");

describe("token creations", () => {
  test("not admin", async () => {
    let username = "meow"
    const token = createToken({ username, isAdmin: false});
    const payload = jwt.verify(token, SECRET_KEY);
    
    expect(payload).toEqual({
      iat: expect.any(Number),
      username,
      isAdmin: false
    })
  });

  test("admin", async () => {
    let username = "meow"
    const token = createToken({ username, isAdmin: true});
    const payload = jwt.verify(token, SECRET_KEY);
    
    expect(payload).toEqual({
      iat: expect.any(Number),
      username,
      isAdmin: true
    })
  });

  test("default no admin", async () => {
    let username = "meow"
    const token = createToken({ username});
    const payload = jwt.verify(token, SECRET_KEY);
    
    expect(payload).toEqual({
      iat: expect.any(Number),
      username,
      isAdmin: false
    })
  });
})