// backend/src/middleware/errorHandler.js
import logger from '../utils/logger.js';
import config from '../config/index.js';

const errorHandler = (err, req, res, next) => {
    logger.error(err.stack);

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        status: 'error',
        statusCode,
        message,
        // Only include stack trace in development
        ...(config.env === 'development' && { stack: err.stack }),
    });
};

export default errorHandler;