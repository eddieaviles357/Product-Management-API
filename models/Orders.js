"use strict";

const db = require("../db");
const { BadRequestError } = require("../AppError");
const getUserId = require("../helpers/getUserId");
const Queries = require("../helpers/sql/orderQueries");
const { clearCart } = require("../helpers/sql/cartQueries");
const Address = require("./Address");

class Orders {
  /**
   * Gets the address_id for a user, or throws an error if no address exists
   * @param {string} username - the username of the user
   * @return {number} the address_id of the user's address
   * @throws {BadRequestError} - if user has no address
   */
  static async #getUserAddressId(username) {
    try {
      const address = await Address.getAddress(username);
      
      return address.length > 0 ? address.rows[0].id : 0;
    } catch (err) {
      throw new BadRequestError("User must have an address to place an order");
    }
  }

  /**
   * Inserts a product into the order_products table
   * @param {number} orderId - the ID of the order to which the product belongs
   * @param {CartItem[]} cart - array of cart items - contains an array of products with productId, quantity, and price
   * @returns {void}
   */
  static async #insertOrderProducts(orderId, cart) {
    const values = [];
    const placeholders = [];

    cart.forEach( (item, i) => {
      const idx = i * 4; // 4 values per item
      placeholders.push(
        `($${idx + 1}, $${idx + 2}, $${idx + 3}, $${idx + 4})`
      );
      values.push(orderId, item.productId, item.quantity, item.price);
    });

    const result = 
      await db.query(Queries.insertIntoOrderProducts(placeholders.join(",")), values);

    return result.rows;
  };

  /**
   * Retrieves an order by its ID
   * @param {number} orderId - the ID of the order to retrieve
   * @returns {number} - returns the total amount of the order
   */
  static async #getOrderTotalAmount(orderId) {
    const result = await db.query(Queries.getTotalAmount(), [orderId]);

    if (result.rows.length === 0) throw new BadRequestError("Order not found");

    return result.rows[0].totalAmount;
  };
  /**
   * @typedef {object} Data
   * @property {number} orderId
   * @property {string} orderStatus
   * @property {number} totalAmount
   * @property {object} address
     * @property {string} address.address1
     * @property {string} [address.address2]
     * @property {string} address.city
     * @property {string} address.state
     * @property {string} address.zipcode
   * @property {Array} orderItems
     * @property {number} orderItems.productId
     * @property {number} orderItems.quantity
     * @property {string} orderItems.productName
     * @property {string} orderItems.productDescription
     * @property {number} orderItems.productPrice
     * @property {string} orderItems.imageURL
   */
  /**
   * Retrieves an order by its ID, including the total amount, address, and order items
   * @param {number} orderId - the ID of the order to retrieve
   * @returns {Data} - returns an object containing order details, address, and order items
   */
  static async getOrderById(orderId) {
    try {
      const result = await db.query(Queries.getOrderById(), [orderId]);

      return result.rows[0] || {};
      
    } catch (err) {
      throw new BadRequestError(err.message);
    }
  };
  /**
   * @typedef {object} Data
   * @property {number} orderId
   * @property {string} orderStatus
   * @property {number} totalAmount
   * @property {object} address
     * @property {string} address.address1
     * @property {string} [address.address2]
     * @property {string} address.city
     * @property {string} address.state
     * @property {string} address.zipcode
   * @property {Array} orderItems
     * @property {number} orderItems.productId
     * @property {number} orderItems.quantity
     * @property {string} orderItems.productName
     * @property {string} orderItems.productDescription
     * @property {number} orderItems.productPrice
     * @property {string} orderItems.imageURL
   */
  /**
   * Retrieves all orders for a given username, including the total amount and order items for each order
   * @param {string} username - the username of the user whose orders to retrieve
   * @return {Array<Data>} - returns an array of objects containing order details, address, and order items for each order
   * 
   */
  static async getAllOrdersByUsername(username) {
    try {
      const userId = await getUserId(username);

      const result = await db.query(Queries.getAllOrdersByUsername(), [userId]);

      return result.rows || [];
      
    } catch (err) {
      throw new BadRequestError(err.message);
    }
  };

  /**
   * @typedef {object} CartItem
   * @property {number} productId
   * @property {number} quantity
   */
  /**
   * Creates a new order in the database
   * @param {string} username - the username of the user creating the order
   * @param {CartItem[]} cart - array of cart items - contains an array of products with productId, quantity, and price
   * @param {object} address - the address to use for the order, if user does not have an address on file
   * @returns {object} - returns an object containing the order ID, total amount, address, and order items
   * @throws {BadRequestError} - if there is an error in the query or if the user is not found  
   */
  static async create(username, {cart, address}) {
    try {
      if (!cart || cart.length === 0) {
        throw new BadRequestError("Cart cannot be empty");
      }
      // 1. Get userId and addressId (or throw error if no address)
      const userId = await getUserId(username);
      const addressId = await this.#getUserAddressId(username);

      // 2. Resolve address
      let finalAddress;

      if (addressId) {
        finalAddress = await Address.getAddressById(addressId);
        if (!finalAddress) {
          throw new BadRequestError("Invalid addressId");
        }
      } else if (address) {
        if (
          !address.address1 ||
          !address.city ||
          !address.state ||
          !address.zipcode
          ) {
            throw new BadRequestError("Missing required address fields");
          }

        finalAddress = address;
      } else {
        throw new BadRequestError("Address or addressId is required");
      }

      // 3. Extract productIds
      const productIds = cart.map(item => item.productId);

      // 4. Fetch trusted prices from DB
      const productRes = await db.query(Queries.getProductPrice(), [productIds] );

      const productMap = new Map();
      productRes.rows.forEach(p => {
        productMap.set(p.product_id, Number(p.price));
      });

      // 5. Validate cart + calculate total
      let totalAmount = 0;
      const validatedCart = [];

      for (const item of cart) {
        const quantity = Number(item.quantity);

        if (!productMap.has(item.productId)) {
          throw new BadRequestError(`Invalid productId: ${item.productId}`);
        }

        if (!quantity || quantity <= 0) {
          throw new BadRequestError("Invalid quantity");
        }

        const price = productMap.get(item.productId);

        totalAmount += price * quantity;

        validatedCart.push({
          productId: item.productId,
          quantity,
          price // ✅ trusted price from DB
        });
      }

      // 6. Insert order
      const orderResult = await db.query(
        Queries.insertIntoOrders(),
        [
          userId,
          finalAddress.address1,
          finalAddress.address2 || null,
          finalAddress.city,
          finalAddress.state,
          finalAddress.zipcode,
          totalAmount
        ]
      );

      const orderId = orderResult.rows[0].id;


      // 7. Insert order_products (using trusted prices)
      const values = [];
      const placeholders = [];

      validatedCart.forEach((item, i) => {
        const idx = i * 4;
        placeholders.push(
          `($${idx + 1}, $${idx + 2}, $${idx + 3}, $${idx + 4})`
        );
        values.push(orderId, item.productId, item.quantity, item.price);
      });

      await db.query( Queries.insertIntoOrderProducts(placeholders.join(",")), values );

      // 8. Clear cart
      await db.query(clearCart(), [userId]);

      return {
        id: orderId,
        totalAmount,
        address: finalAddress,
        products: validatedCart
      };

    } catch (err) {
      throw new BadRequestError(err.message);
    }
  }
};
      // // 1. Calculate total
      // const totalAmount = cart.reduce((sum, item) => {
      //   return sum + Number(item.price) * item.quantity;
      // }, 0);

      // // 2. Insert into orders table
      // const orderResult = await db.query(Queries.insertIntoOrders(), [userId, totalAmount, addressId]);
      // const orderId = orderResult.rows[0].id;

      // // 3. Insert into order_products table
      // await this.#insertOrderProducts(orderId, cart);

      // // 4. clear cart
      // await db.query(clearCart(), [userId]);

      // return {
      //   id: orderId,
      //   totalAmount,
      //   addressId,
      //   products: cart
      // };



module.exports = Orders;