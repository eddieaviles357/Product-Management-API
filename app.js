"use strict";

const express = require('express');

const app = express();

const { authenticateJWT } = require("./middleware/auth/auth")
const productsRoutes = require("./routes/products");
const categoriesRoutes = require("./routes/categories");
const reviewsRoutes = require("./routes/reviews");
const authRoutes = require("./routes/auth");
const wishlistRoutes = require("./routes/wishlist");

app.use(express.json());
app.use(authenticateJWT);

app.use("/api/v1/products", productsRoutes);
app.use("/api/v1/categories", categoriesRoutes);
app.use("/api/v1/reviews", reviewsRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/wishlist", wishlistRoutes);

/** Handle 404 errors -- this matches everything */
app.use(function (req, res, next) {
    return next(new Error("NOT FOUND"));
});

/** Generic error handler. Anything unhandled goes here. */
app.use(function (err, req, res, next) {
    switch (err.code) {
        case '23505': 
            err.message = 'already exist';
            break;
        case '22001': 
            err.message = 'Value too long';
            break;
        case '22003': 
            err.message = 'Price needs to be a Number no greater than 5 digits';
            break;
    }
    if (process.env.NODE_ENV !== "test") console.error(err.stack);
    const status = err.status || 500;
    const message = err.message;
    console.log("STATUS:::::", status, "MESSAGE:::::", message);

    return res.status(status).json({
        error: { message, status },
    });
});

module.exports = app;