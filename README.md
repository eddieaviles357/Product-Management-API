# Product Management API

The **Product Management API** is a RESTful API that supports full CRUD operations for managing products, categories, reviews, users, shopping carts, and checkout functionality. It is designed to serve as the backend for e-commerce or inventory management applications.

---

## 🚀 Features

- **Products**: Create, read, update, and delete product listings.
- **Categories**: Organize products into categories with full CRUD support.
- **Reviews**: Users can post and manage reviews on products.
- **Users**: User management with full CRUD operations.
- **Addresses**: Store and manage a customer's address for checkout and order history.
- **Cart**: Add, remove, and update items in a user's shopping cart.
- **Checkout**: Process cart contents into orders with checkout functionality.

---

## 📦 Installation

```bash
git clone https://github.com/eddieaviles357/product-management-api.git
cd product-management-api
npm install
```

---

## 📖 API Overview

The Product Management API is a comprehensive backend solution for e-commerce and inventory management systems. It exposes a set of RESTful endpoints that allow clients to interact with various resources such as products, categories, users, reviews, shopping carts, and orders. The API is designed with modularity, security, and scalability in mind.

### Core Resources

- **Products**:  
  Products are the main items available for sale. Each product has attributes such as name, description, price, category, inventory count, and optional images. Endpoints allow for listing all products, retrieving a single product, creating new products, updating existing products, and deleting products.

- **Categories**:  
  Categories help organize products into logical groups (e.g., Electronics, Clothing). The API supports CRUD operations for categories, enabling dynamic organization of the product catalog.

- **Users**:  
  Users can register, authenticate, and manage their profiles. User roles (such as admin or customer) are supported, allowing for role-based access control. Passwords are securely hashed, and authentication is handled via JWT tokens.

- **Addresses**:
  Each user can have one saved address. The address can be created or updated before checkout and is automatically associated with new orders.

- **Reviews**:  
  Authenticated users can leave reviews on products, including ratings and comments. Reviews can be created, updated, retrieved, and deleted, allowing for community feedback and product quality assessment.

- **Cart**:  
  Each user has a shopping cart where they can add, update, or remove products before checkout. The cart maintains product quantities and calculates totals.

- **Checkout & Orders**:  
  The checkout process converts the contents of a user's cart into an order. The user's saved address is attached to the order automatically, so the order keeps a reference to the address used at checkout. Orders are persisted and can be retrieved for order history and tracking.

### Authentication & Authorization

- **JWT Authentication**:  
  All protected routes require a valid JWT token. Users must log in to receive a token, which must be included in the `Authorization` header for subsequent requests.

- **Role-Based Access**:  
  Certain endpoints (such as product or category creation) are restricted to admin users. The API enforces these restrictions based on the user's role encoded in the JWT.

### Validation & Error Handling

- **Schema Validation**:  
  Incoming request bodies are validated against JSON schemas to ensure data integrity and prevent malformed requests.

- **Consistent Error Responses**:  
  Errors are returned in a consistent JSON format, including an error message and HTTP status code.

### Endpoints Description

Below is a detailed list of the main API endpoints, grouped by resource:

#### Auth

- `POST /api/v1/auth/authenticate`  
  Authenticate a user and receive a JWT.  
  **Body:** `{ username, password }`  
  **Returns:** `{ token }`

- `POST /api/v1/auth/verify-email?token=${token}`
  Verify email (defaults to 24 hours).

- `POST /api/v1/auth/resend-verification`
  Resend verification.

#### Products

- `GET /api/v1/products`  
  List all products.  
  `GET /api/v1/products?page={int}&limit={int}`
  **Query params:** Optional filters (page {int}, limit {int})

- `GET /api/v1/products/:id`  
  Get details for a single product by ID.

- `POST /api/v1/products`  
  Create a new product (admin only).  
  **Body:** `{ sku, name, description, price, stock, imageUrl }`

- `PATCH /api/v1/products/:id`  
  Update an existing product (admin only).  
  **Body:** Any updatable product fields.

- `DELETE /api/v1/products/:id`  
  Delete a product (admin only).

- `POST /api/v1/products/:productId/category/:categoryId`
  Add product category using productId and a catgoryId

- `DELETE /api/v1/products/:productId/category/:categoryId`
  Delete a product category using productId and categoryId

#### Categories

- `GET /api/v1/categories`  
  List all categories.
  `GET /api/v1/categories?page={int}&limit={int}`
  **Query params:** Optional filters (page {int}, limit {int}).

- `POST /api/v1/categories`  
  Create a new category (admin only).  
  **Body:** `{ category }`

- `PATCH /api/v1/categories/:id`  
  Update a category (admin only).  
  **Body:** { category }.

- `DELETE /api/v1/categories/:id`  
  Delete a category (admin only).

- `GET /api/v1/categories/:categoryId/products`
  Gets all products associated with given category

- `GET /api/v1/categories/search/:searchTerm`  
  Get filtered categories using the search term.

- `GET /api/v1/categories/products/filter?ids={1 ,3 ,5}`
  Gets all products associated with given category id(s)

#### Users

- `POST /api/v1/users/register`
  Register a new user.  
  **Body:** `{ username, password, firstName, lastName, email }`  
  **Returns:** `{ token }`

- `DELETE /api/v1/users/me`
  Delete a user (self or admin).

#### Addresses

- `GET /api/v1/address/:username`
  Get the user's saved address.

- `POST /api/v1/address/:username`
  Create or update the user's saved address.
  **Body:** `{ address1, address2, city, state, zipcode }`
  `address2` is optional. `state` must be a two-letter US state code, and `zipcode` must be in `12345` or `12345-6789` format.

- `DELETE /api/v1/address/:username`
  Delete the user's saved address.

#### Reviews

- `GET /api/v1/reviews/products/:productId`
  List all reviews for a product.
  `GET /api/v1/reviews/products?page={int}&limit={int}`
  **Query params:** Optional filters (page {int}, limit {int}).

- `POST /api/v1/reviews/products/:productId/:username`
  Add a review to a product (authenticated user).  
  **Body:** `{ rating, review }`

- `PATCH /api/v1/reviews/product/:productId/:username`  
  Update a review (author or admin).  
  **Body:** Any updatable review fields.

- `DELETE /api/v1/reviews/product/:productId/:username`
  Delete a review (author or admin).

#### Wishlist

- `GET /api/v1/wishlist/:username`
  Gets users wishlist.

- `DELETE /api/v1/wishlist/:username`
  Clears users wishlist.

- `POST /api/v1/wishlist/:username/:productId`
  Adds to users wishlist.

- `DELETE /api/v1/wishlist/:username/:productId`
  Removed a single product from users wishlist

#### Cart

- `GET /api/v1/cart/:username`  
  Get the current user's cart.

- `DELETE /api/v1/cart/:username`
  Clears all items in cart

- `POST /api/v1/cart/:username/:productId`  
  Add an item to the cart.  
  **Body:** `{ quantity }`

- `PATCH /api/v1/cart/:username/:productId`  
  Update quantity of a cart item.  
  **Body:** `{ quantity }`

- `DELETE /api/v1/cart/:username/:productId`  
  Remove an item from the cart.

#### Checkout & Orders

- `POST /api/v1/orders/:username/createorder`
  Checkout the user's cart and create an order. The user must have a saved address before placing the order. The saved address is linked automatically; do not send `addressId` in the request body.
  **Body:** `{ address, cart: [{ productId, quantity }] }`

- `GET /api/v1/orders/:username`
  List all orders for a user, including the saved address associated with each order.

- `GET /api/v1/orders/:username/getorder/:orderId`
  Get details for a specific order, including its address and order items.

  Order responses include an `addressId` when an order is created and address fields such as `address1`, `address2`, `city`, `state`, and `zipcode` when the order is retrieved.

---

## 🛠 Technologies Used

- **Node.js** & **Express** for the server and routing
- **PostgreSQL** for persistent data storage
- **JWT** for authentication
- **Jest** and **Supertest** for testing
- **JSON Schema** for request validation
