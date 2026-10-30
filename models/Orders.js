"use strict";

const db = require("../db");
const { BadRequestError } = require("../AppError");
const Users = require("./Users");
const Queries = require("../queries/orderQueries");
const { clearCart } = require("../queries/cartQueries");
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
      return address.length > 0 ? address[0].id : 0;
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
      const userId = await Users.getUserId(username);

        // Wait for the materialized view to refresh.
      await db.query( "REFRESH MATERIALIZED VIEW CONCURRENTLY mv_product_list" );
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
    if (!cart || cart.length === 0) {
      throw new BadRequestError("Cart cannot be empty");
    }
    // Get userId and addressId (or throw error if no address)
    const userId = await Users.getUserId(username);
    
    // Resolve address
    let finalAddress;

    if (address) {
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
      // returns and array of address objects
      let tempAddressHolder = await Address.getAddress(username);
      finalAddress = tempAddressHolder[0]

      if (!finalAddress) {
        throw new BadRequestError("No address provided and no address on file");
      }
    }

    // Extract productIds
    const productIds = cart.map(
      item => item.productId
    );

    /** get a dedicated connection
    *   to the database for this transaction
    */

    const client = await db.connect();

    try {
      await client.query("BEGIN");
      /**
       * Fetch trusted producti information
       * never from frontend
       *  */
      const productRes = await db.query(Queries.getProductsForOrder(), [productIds] );

      const productMap = new Map();

      productRes.rows.forEach(p => {
        productMap.set(
          p.productId, 
          {
            sku: p.sku,
            productName: p.productName,
            price: Number(p.price)
          }
        );
      });

      // Validate cart
      let totalAmount = 0;
      const validatedCart = [];

      for (const item of cart) {
        const quantity = Number(item.quantity);

        if (!productMap.has(item.productId)) {
          throw new BadRequestError(`Invalid productId: ${item.productId}`);
        }

        if (
          !Number.isInteger(quantity) || 
          quantity <= 0
        ) {
          throw new BadRequestError("Invalid quantity");
        }

        const product = productMap.get(item.productId);

        const itemTotal = product.price * quantity;

        totalAmount += itemTotal;

        validatedCart.push({
          productId: item.productId,
          sku: product.sku,
          productName: product.productName,
          unitPrice: product.price,
          quantity,
          totalAmount: itemTotal
        });
      }

      // Insert order
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

      /**
       * Create order snapshot
       */
      const values = [];
      const placeholders = [];

      validatedCart.forEach((item, i) => {
        const idx = i * 7; // values per item
        placeholders.push(
          `(
            $${idx + 1}, 
            $${idx + 2}, 
            $${idx + 3}, 
            $${idx + 4},
            $${idx + 5},
            $${idx + 6},
            $${idx + 7}
          )`
        );
        values.push(
          orderId, 
          item.productId,
          item.sku,
          item.productName,
          item.unitPrice,
          item.quantity, 
          item.totalAmount
        );
      });

      await db.query( 
        Queries.insertIntoOrderProducts(
          placeholders.join(",")
        ), 
        values 
      );

      // Clear cart
      await db.query(
        clearCart(), 
        [userId]
      );

      await client.query("COMMIT");

      return {
        id: orderId,
        totalAmount,
        address: finalAddress,
        products: validatedCart
      };

    } catch (err) {
      await client.query("ROLLBACK");

      if (err instanceof BadRequestError) {
        throw err;
      }

      throw new BadRequestError(err.message);
    } finally {
      client.release();
    }
  }
};


module.exports = Orders;