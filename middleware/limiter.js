"use strict";

const rateLimiter = require("express-rate-limit");
const { TooManyRequestsError } = require("../AppError");

const GLOBAL_MINUTES = 60;
const AUTH_MINUTES = 15;


const globalLimiter = rateLimiter({
    windowMs: GLOBAL_MINUTES * 60 * 1000, // 1 hour
    max: 115, // limit each IP to 115 requests per windowMs
    message: "Too many requests, please try again later.",
    handler: (req, res, next) => {
        return next(new TooManyRequestsError(`Try again in ${GLOBAL_MINUTES} minutes`));
    }
});

const authLimiter = rateLimiter({
    windowMs: AUTH_MINUTES * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 requests per windowMs
    message: "Too many authentication requests, please try again later.",
    handler: (req, res, next) => {
        return next(new TooManyRequestsError(`Try again in ${AUTH_MINUTES} minutes`));
    }
});

module.exports = {
    globalLimiter,
    authLimiter
};
