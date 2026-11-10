# Product Management API

The **Product Management API** is a RESTful API that supports full CRUD operations for managing products, categories, reviews, users, shopping carts, and checkout functionality. It is designed to serve as the backend for e-commerce or inventory management applications.

---

## 🚀 Features

- **Products**: Create, read, update, and soft-delete product listings with admin restore support.
- **Categories**: Organize products into categories with full CRUD support and product/category filtering.
- **Reviews**: Users can post, update, and remove product reviews with authenticated ownership checks.
- **Users**: User registration, account management, email verification, and password reset flows.
- **Addresses**: Store and manage a customer's address for checkout and order history.
- **Cart**: Add, remove, and update items in a user's shopping cart.
- **Checkout**: Process cart contents into orders with transactional checkout logic.
- **Security**: JWT-based authentication, admin authorization, rate limiting, and secure password handling.

---

## 📦 Installation

```bash
git clone https://github.com/eddieaviles357/product-management-api.git
cd product-management-api
npm install
```

Create a `.env` file in the project root with the following values:

```env
PORT=3001
SECRET_KEY=your-secret-key
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/product_management
FRONTEND_URL=http://localhost:3001

SMTP_HOST=smtp.example.com
SMTP_PORT=465
SMTP_USER=your-email@example.com
SMTP_PASS=your-email-password
PASSWORD_RESET_TOKEN_TTL_HOURS=1
```

If `NODE_ENV=test`, the app will default to the `product_management_test` database when `DATABASE_URL` is not provided.

---

## 📖 API Overview

The Product Management API is a comprehensive backend solution for e-commerce and inventory management systems. It exposes a set of RESTful endpoints that allow clients to interact with various resources such as products, categories, users, reviews, shopping carts, and orders. The API is designed with modularity, security, and scalability in mind.

### Core Resources

- **Authentication**:
  Users can register, log in, verify their email, reset their password, and manage secure JWT-based sessions. Auth endpoints handle account creation, login, token issuance, email verification, and password recovery workflows.

- **Products**:  
  Products are the main items available for sale. Each product has attributes such as name, description, price, category, inventory count, and optional images. Endpoints allow for listing all products, retrieving a single product, creating new products, updating existing products, soft-deleting products, and restoring them when needed.

- **Categories**:  
  Categories help organize products into logical groups (e.g., Electronics, Clothing). The API supports CRUD operations for categories, enabling dynamic organization of the product catalog.

- **Users**:  
  Users can manage their profiles, access account details, and interact with protected resources. User roles (such as admin or customer) are supported, allowing for role-based access control. Passwords are securely hashed, and authentication is handled via JWT tokens.

- **Addresses**:
  Each user can have one saved address. The address can be created or updated before checkout and is automatically associated with new orders.

- **Reviews**:  
  Authenticated users can leave reviews on products, including ratings and comments. Reviews can be created, updated, retrieved, and deleted, allowing for community feedback and product quality assessment.

- **Wishlist**:
  Users can save products to a wishlist for later purchase. Wishlist items can be added, listed, and removed independently from the cart.

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
  Resend verification email to the user.

- `POST /api/v1/auth/forgot-password`  
  Initiate a password reset flow and send a reset link via email.

- `POST /api/v1/auth/reset-password`  
  Reset a user's password using a valid reset token.

#### Products

- `GET /api/v1/products`  
  List all products.  
  `GET /api/v1/products?page={int}&limit={int}`  
  **Query params:** Optional filters (page {int}, limit {int})

- `GET /api/v1/products/:id`  
  Get details for a single product by ID.

- `POST /api/v1/products`  
  Create a new product (admin only).  
  **Body:** `{ sku, name, description, price, stock, imageURL }`

- `PATCH /api/v1/products/:id`  
  Update an existing product (admin only).  
  **Body:** Any updatable product fields.

- `DELETE /api/v1/products/:id`  
  Soft-delete a product (admin only).

- `PATCH /api/v1/products/:id/restore`  
  Restore a soft-deleted product (admin only).

- `POST /api/v1/products/:productId/category/:categoryId`  
  Add a category to a product.

- `DELETE /api/v1/products/:productId/category/:categoryId`  
  Remove a category from a product.

#### Categories

- `GET /api/v1/categories`  
  List all categories.
  `GET /api/v1/categories?page={int}&limit={int}`  
  **Query params:** Optional filters (page {int}, limit {int}).

- `POST /api/v1/categories`  
  Create a new category (admin only).  
  **Body:** `{ category }`

- `PUT /api/v1/categories/:categoryId`  
  Update a category (admin only).  
  **Body:** `{ category }`

- `DELETE /api/v1/categories/:categoryId`  
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

- `GET /api/v1/reviews/product/:id`  
  List all reviews for a product.
  `GET /api/v1/reviews/product/:id?page={int}&limit={int}`  
  **Query params:** Optional filters (page {int}, limit {int}).

- `GET /api/v1/reviews/:username`  
  Get all reviews created by a user.

- `GET /api/v1/reviews/product/:productId/:username`  
  Get a single review for a product by the user.

- `POST /api/v1/reviews/product/:productId/:username`  
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

- `PATCH /api/v1/orders/:username/:orderId/status`  
  Update the status of an order (admin only).

  Order responses include address fields such as `address1`, `address2`, `city`, `state`, and `zipcode` when the order is retrieved.

---

## 🛠 Technologies Used

- **Node.js** & **Express** for the server and routing
- **PostgreSQL** for persistent data storage
- **JWT** for authentication
- **Jest** and **Supertest** for testing
- **JSON Schema** for request validation
