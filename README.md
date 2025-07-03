# Product Management API

The **Product Management API** is a RESTful API that supports full CRUD operations for managing products, categories, reviews, users, shopping carts, and checkout functionality. It is designed to serve as the backend for e-commerce or inventory management applications.

---

## 🚀 Features

- **Products**: Create, read, update, and delete product listings.
- **Categories**: Organize products into categories with full CRUD support.
- **Reviews**: Users can post and manage reviews on products.
- **Users**: User management with full CRUD operations.
- **Cart**: Add, remove, and update items in a user's shopping cart.
- **Checkout**: Process cart contents into orders with checkout functionality.

---

## 📦 Installation

```bash
git clone https://github.com/your-username/product-management-api.git
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

- **Reviews**:  
  Authenticated users can leave reviews on products, including ratings and comments. Reviews can be created, updated, retrieved, and deleted, allowing for community feedback and product quality assessment.

- **Cart**:  
  Each user has a shopping cart where they can add, update, or remove products before checkout. The cart maintains product quantities and calculates totals.

- **Checkout & Orders**:  
  The checkout process converts the contents of a user's cart into an order. Orders are persisted and can be retrieved for order history and tracking.

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

### Example Endpoints

- `POST /api/v1/auth/register` — Register a new user
- `POST /api/v1/auth/authenticate` — Authenticate and receive a JWT
- `GET /api/v1/products` — List all products
- `POST /api/v1/products` — Create a new product (admin only)
- `GET /api/v1/categories` — List all categories
- `POST /api/v1/cart` — Add an item to the user's cart
- `POST /api/v1/checkout` — Checkout and create an order

### Technologies Used

- **Node.js** & **Express** for the server and routing
- **PostgreSQL** for persistent data storage
- **JWT** for authentication
- **Jest** and **Supertest** for testing
- **JSON Schema** for request validation
