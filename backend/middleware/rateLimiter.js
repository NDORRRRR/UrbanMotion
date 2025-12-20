const rateLimit = require('express-rate-limit');

// General API rate limiter - 100 requests per 15 minutes
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        message: 'Terlalu banyak request dari IP ini, coba lagi nanti.'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Strict limiter for authentication endpoints - 5 attempts per 15 minutes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        message: 'Terlalu banyak percobaan login, coba lagi setelah 15 menit.'
    },
    skipSuccessfulRequests: true, // Don't count successful requests
});

// Payment endpoints limiter - 10 requests per 15 minutes
const paymentLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: {
        message: 'Terlalu banyak transaksi, coba lagi nanti.'
    },
});

module.exports = {
    apiLimiter,
    authLimiter,
    paymentLimiter
};
