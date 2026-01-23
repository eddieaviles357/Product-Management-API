"use strict";

const db = require("../db");
const { BadRequestError, ConflictError, NotFoundError } = require("../AppError");
const getUserId = require("../helpers/getUserId");

class Address {
  /**
   * Get address for a user
   * @param {string} username
   * @returns {object} address object
   * @throws {BadRequestError} if username is not provided
   * @throws {NotFoundError} if address not found for user
   */
  static async getAddress(username) {
    try {
      if (!username) throw new BadRequestError("Username is required");

      const userId = await getUserId(username);
      if (!userId) throw new BadRequestError("User does not exist");

      const query = `SELECT 
                      id,
                      user_id AS "userId",
                      address_1 AS "address1",
                      address_2 AS "address2",
                      city,
                      state,
                      zipcode
                    FROM addresses
                    WHERE user_id = $1`;
      
      const result = await db.query(query, [userId]);
      
      if (result.rows.length === 0) {
        throw new NotFoundError("Address not found for this user");
      }

      return result.rows[0];
    } catch (err) {
      if (err instanceof BadRequestError || err instanceof NotFoundError) throw err;
      throw new BadRequestError("Something went wrong retrieving address");
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
      if (!username) throw new BadRequestError("Username is required");
      if (!addressData) throw new BadRequestError("Address data is required");

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

      const userId = await getUserId(username);
      if (!userId) throw new BadRequestError("User does not exist");

      // Check if address exists
      const checkQuery = `SELECT id FROM addresses WHERE user_id = $1`;
      const checkResult = await db.query(checkQuery, [userId]);

      let query, values;
      
      if (checkResult.rows.length > 0) {
        // Update existing address
        query = `UPDATE addresses 
                 SET address_1 = $1, address_2 = $2, city = $3, state = $4, zipcode = $5
                 WHERE user_id = $6
                 RETURNING id, user_id AS "userId", address_1 AS "address1", 
                          address_2 AS "address2", city, state, zipcode`;
        values = [address1, address2 || null, city, state.toUpperCase(), zipcode, userId];
      } else {
        // Create new address
        query = `INSERT INTO addresses (user_id, address_1, address_2, city, state, zipcode)
                 VALUES ($1, $2, $3, $4, $5, $6)
                 RETURNING id, user_id AS "userId", address_1 AS "address1", 
                          address_2 AS "address2", city, state, zipcode`;
        values = [userId, address1, address2 || null, city, state.toUpperCase(), zipcode];
      }

      const result = await db.query(query, values);
      return result.rows[0];
    } catch (err) {
      if (err instanceof BadRequestError) throw err;
      if (err.constraint === "addresses_user_id_key") {
        throw new ConflictError("User already has an address");
      }
      throw new BadRequestError("Error saving address");
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
      if (!username) throw new BadRequestError("Username is required");

      const userId = await getUserId(username);
      if (!userId) throw new BadRequestError("User does not exist");

      const query = `DELETE FROM addresses WHERE user_id = $1 RETURNING id`;
      const result = await db.query(query, [userId]);

      if (result.rows.length === 0) {
        throw new NotFoundError("Address not found for this user");
      }

      return { success: true, message: "Address deleted successfully" };
    } catch (err) {
      if (err instanceof BadRequestError || err instanceof NotFoundError) throw err;
      throw new BadRequestError("Error deleting address");
    }
  }
}

module.exports = Address;
