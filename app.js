"use strict";

const express = require('express');
const cors = require('cors');
const app = express();
const { authenticateJWT } = require("./middleware/auth/auth")
const productsRoutes = require("./routes/products");
const categoriesRoutes = require("./routes/categories");
const reviewsRoutes = require("./routes/reviews");
const authRoutes = require("./routes/auth");
const wishlistRoutes = require("./routes/wishlist");
const cartRoutes = require("./routes/cart");
const orderRoutes = require("./routes/checkout");
const { NotFoundError } = require("./AppError");
const {globalLimiter} = require("./middleware/limiter");
const helmet = require('helmet');

// Middleware
app.use(helmet()); // Adds security headers
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON bodies
app.use(authenticateJWT); // Authenticate JWT for protected routes
app.use(globalLimiter); // Apply rate limiting globally

// Routes
app.use("/api/v1/products", productsRoutes); // Products routes
app.use("/api/v1/categories", categoriesRoutes); // Categories routes
app.use("/api/v1/reviews", reviewsRoutes); // Reviews routes
app.use("/api/v1/auth", authRoutes); // Authentication routes
app.use("/api/v1/wishlist", wishlistRoutes); // Wishlist routes
app.use("/api/v1/cart", cartRoutes); // Cart routes
app.use("/api/v1/checkout", orderRoutes); // Checkout routes


/** Handle 404 errors -- this matches everything */
app.use(function (req, res, next) {
    return next(new NotFoundError());
});

/** Generic error handler. Anything unhandled goes here. */
app.use(function (err, req, res, next) {
    // switch (err.code) {
    //     case '23505': 
    //         err.message = 'already exist';
    //         break;
    //     case '22001': 
    //         err.message = 'Value too long';
    //         break;
    //     case '22003': 
    //         err.message = 'Price needs to be a Number no greater than 5 digits';
    //         break;
    // }
    // if (process.env.NODE_ENV !== "test") console.error(err.stack);
    const status = err.status || 500;
    const message = err.message;
    console.log(`STATUS:::::${status}\nMESSAGE:::::${message}`);

    return res.status(status).json({
        error: { message, status },
    });
});

module.exports = app;