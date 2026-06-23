"use strict";

const Address = require("../../models/Address");
const { BadRequestError, UnauthorizedError, ConflictError } = require("../../AppError");
const {
  username1,
  username2,
  userIdUsername,
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll
} = require("../helpers/_testCommon");

describe("Address Model", () => {
  beforeAll(commonBeforeAll);
  beforeEach(commonBeforeEach);
  afterEach(commonAfterEach);
  afterAll(commonAfterAll);

  describe("gets address", () => {
    test("works", async () => {
      const address = await Address.getAddress(username1);

      expect(address[0]).toEqual({
        id: expect.any(Number),
        userId: userIdUsername[0].id,
        address1: expect.any(String),
        address2: expect.any(String),
        city: expect.any(String),
        state: expect.any(String),
        zipcode: expect.any(String)
      });
    });

    test("throws BadRequestError if user does not exist", async () => {
      try {
        await Address.getAddress("nonexistentuser");
        fail();
      } catch (err) {
        expect(err).toBeInstanceOf(BadRequestError);
      }
    });
  });

  describe("insert or update address", () => {
    test("works for new address", async () => {
      const newAddressData = {
        address1: "123 New St",
        address2: "Apt 4",
        city: "New City",
        state: "NC",
        zipcode: "12345"
      };

      const newAddress = await Address.upsertAddress(username2, newAddressData);

      expect(newAddress).toEqual({
        id: expect.any(Number),
        userId: userIdUsername[1].id,
        ...newAddressData
      });
    })

    test("works for updating existing address", async () => {
      const updatedAddressData = {
        address1: "456 Updated St",
        address2: "Suite 8",
        city: "Updated City",
        state: "CA",
        zipcode: "54321"
      };

      const updatedAddress = await Address.upsertAddress(username1, updatedAddressData);

      expect(updatedAddress).toEqual({
        id: expect.any(Number),
        userId: userIdUsername[0].id,
        ...updatedAddressData
      });
    });

    test("throws BadRequestError if user does not exist", async () => {
      const addressData = {
        address1: "789 Fake St",
        city: "Fake City",
        state: "CA",
        zipcode: "92249"
      };

      try {
      const data = await Address.upsertAddress("nonexistentuser", addressData);
      } catch (err) {
      expect(err).toBeInstanceOf(BadRequestError);
      }
    });

    test("throws BadRequestError if address is invalid", async () => {
      const addressData = {
        address1: "789 Fake St",
        city: "Fake City",
        state: "FK",
        zipcode: "00000"
      };

      try {
          await Address.upsertAddress(username1, addressData);
      } catch (err) {
        expect(err.message).toEqual("new row for relation \"addresses\" violates check constraint \"addresses_state_check\"");
        expect(err).toBeInstanceOf(BadRequestError);
      }
    });
  });

  describe("delete address", () => {
    test("works", async () => {
      // Verify that there's an address for the user before deletion
      const addressBeforeDeletion = await Address.getAddress(username1);
      expect(addressBeforeDeletion.length).toBe(1);

      const isAddressDeleted = await Address.deleteAddress(username1);
      expect(isAddressDeleted).toBe(true);
    });

    test("throws BadRequestError if user does not exist", async () => {
      try {
        await Address.deleteAddress("nonexistentuser");
      } catch (err) {
        expect(err).toBeInstanceOf(BadRequestError);
      }
    });
  });
  
});