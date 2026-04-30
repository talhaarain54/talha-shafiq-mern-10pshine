import logger from '../utils/logger.js';

const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
    error.name = err.name; 

    // Mongoose: Handle Duplicate Key (Code 11000)
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        error.message = `Account with that ${field} already exists.`;
        error.statusCode = 400;
    }

    // Mongoose: Handle Validation Errors
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message);
        error.message = message.join(', ');
        error.statusCode = 400;
    }

    // Mongoose: Handle Cast Error (Invalid IDs)
    if (err.name === 'CastError') {
        error.message = `Resource not found. Invalid ID format.`;
        error.statusCode = 404;
    }

    // JWT: Handle Expired/Invalid Tokens
    if (err.name === 'TokenExpiredError') {
        error.message = 'Your session has expired. Please log in again.';
        error.statusCode = 401;
    }

    if (err.name === 'JsonWebTokenError') {
        error.message = 'Invalid authentication token.';
        error.statusCode = 401;
    }

    // Logging Full Stack Trace
    if (error.statusCode >= 500 || !error.statusCode) {
        logger.error(err.stack); 
    } else {
        logger.warn(`${error.name}: ${error.message}`);
    }

    // Final Response
    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Internal Server Error',
    });
};

export default errorHandler;