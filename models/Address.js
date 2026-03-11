"use strict";

const db = require("../db");
const { BadRequestError, ConflictError, NotFoundError } = require("../AppError");
const getUserId = require("../helpers/getUserId");
const Queries = require("../helpers/sql/addressQueries");

class Address {

  /** Validates address data
   * @param {Object} addressData - The address data to validate
   * @throws {BadRequestError} If any validation fails
   */
  static #validateAddressData(addressData) {
    const { address1, address2, city, state, zipcode } = addressData;
    // Validate required fields
    if (!address1 || !city || !state || !zipcode) {
      throw new BadRequestError("address1, city, state, and zipcode are required");
    }
    // Validate state (2 character code)
    if (typeof state !== "string" || state.length !== 2) {
      throw new BadRequestError("State must be a 2-character code");
    }
    // Validate zipcode format (5 or 9 digits)
    if (!zipcode || !/^\d{5}(-\d{4})?$/.test(zipcode)) {
      throw new BadRequestError("Zipcode must be 5 digits or 5+4 format (e.g., 12345 or 12345-6789)");
    }
  }


  /**
   * Get address for a user
   * @param {string} username
   * @returns {object} address object
   * @throws {BadRequestError} if username is not provided
   * @throws {NotFoundError} if address not found for user
   */
  static async getAddress(username) {
    try {
      const userId = await getUserId(username);
      if (!userId) throw new BadRequestError("User does not exist");

      const result = await db.query(Queries.getAddressInfo(), [userId]);
      
      if (result.rows.length === 0) {
        throw new NotFoundError("Address not found for this user");
      }

      return result.rows[0];

    } catch (err) {
      throw new BadRequestError(err.message);
    }
  }

  /**
   * Create or update address for a user
   * @param {string} username
   * @param {object} addressData - {address1, address2, city, state, zipcode}
   * @returns {object} created/updated address
   * @throws {BadRequestError} if required fields missing or invalid
   */
  static async upsertAddress(username, addressData) {
    try {
      this.#validateAddressData(addressData);

      const { address1, address2, city, state, zipcode } = addressData;

      const userId = await getUserId(username);
      if (!userId) throw new BadRequestError("User does not exist");

      // Check if address exists for this user
      const checkResult = await db.query(Queries.getAddressId(), [userId]);

      let query, values;
      
      if (checkResult.rows.length > 0) {
        // Update existing address
        query = Queries.updateAddress();

        values = [address1, address2 || null, city, state.toUpperCase(), zipcode, userId];
      } else {
        // Create new address
        query = Queries.insertToAddress();

        values = [userId, address1, address2 || null, city, state.toUpperCase(), zipcode];
      }

      const result = await db.query(query, values);

      return result.rows[0];

    } catch (err) {
      if (err.constraint === "addresses_user_id_key") {
        throw new ConflictError("User already has an address");
      }
      throw new BadRequestError(err.message);
    }
  }

  /**
   * Delete address for a user
   * @param {string} username
   * @returns {object} {success, message}
   * @throws {BadRequestError} if username is not provided
   * @throws {NotFoundError} if address not found
   */
  static async deleteAddress(username) {
    try {
      const userId = await getUserId(username);
      if (!userId) throw new BadRequestError("User does not exist");

      const result = await db.query(Queries.deleteAddress(), [userId]);

      if (result.rows.length === 0) {
        throw new NotFoundError("Address not found for this user");
      }

      return { success: true, message: "Address deleted successfully" };
    } catch (err) {
      if (err instanceof NotFoundError) throw err;
      throw new BadRequestError(err.message);
    }
  }
}

module.exports = Address;
