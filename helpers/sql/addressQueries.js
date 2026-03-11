"use strict";

function getAddressInfo() {
  return `
    SELECT 
      id,
      user_id AS "userId",
      address_1 AS "address1",
      address_2 AS "address2",
      city,
      state,
      zipcode
    FROM addresses
    WHERE user_id = $1
  `;
}

function getAddressId() {
  return `
    SELECT id FROM addresses WHERE user_id = $1
  `;
}

function updateAddress() {
  return `
    UPDATE addresses 
    SET address_1 = $1, address_2 = $2, city = $3, state = $4, zipcode = $5
    WHERE user_id = $6
    RETURNING id, user_id AS "userId", address_1 AS "address1", 
            address_2 AS "address2", city, state, zipcode
  `;
}

function insertToAddress() {
  return `
    INSERT INTO addresses (user_id, address_1, address_2, city, state, zipcode)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, user_id AS "userId", address_1 AS "address1", 
            address_2 AS "address2", city, state, zipcode
  `;
}

function deleteAddress() {
  return `
    DELETE FROM addresses WHERE user_id = $1 
    RETURNING id
  `;
}

module.exports = {
  getAddressInfo,
  getAddressId,
  updateAddress,
  insertToAddress,
  deleteAddress,
}