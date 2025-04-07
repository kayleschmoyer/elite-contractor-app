// backend/src/middleware/validationMiddleware.js
import logger from '../utils/logger.js';
// No need to import 'z' here, the schema is passed in

/**
 * Higher-order function to create an Express middleware for validating
 * request data against a Zod schema.
 * @param {z.ZodObject<any>} schema - The Zod schema (e.g., { body: ..., params: ..., query: ... }).
 * @returns Express middleware function
 */
export const validate = (schema) => async (req, res, next) => {
    try {
        // Prepare object with parts of request defined in the schema shape
        const requestDataToValidate = {};
        if (schema.shape.body) {
            requestDataToValidate.body = req.body;
        }
        if (schema.shape.params) {
            requestDataToValidate.params = req.params;
        }
        if (schema.shape.query) {
            requestDataToValidate.query = req.query;
        }

        // Validate asynchronously
        const validationResult = await schema.safeParseAsync(requestDataToValidate);

        if (!validationResult.success) {
            // Format errors using Zod's flatten() for field-specific errors
            const formattedErrors = validationResult.error.flatten().fieldErrors;
            logger.warn('Request validation failed:', {
                 path: req.originalUrl,
                 errors: formattedErrors
                 });
            return res.status(400).json({
                message: "Validation failed",
                errors: formattedErrors,
            });
        }

        // --- Overwrite request parts with VALIDATED data ---
        // This ensures type coercion and defaults from Zod are used downstream
        if (validationResult.data.body) {
            req.body = validationResult.data.body;
        }
        if (validationResult.data.params) {
            req.params = validationResult.data.params;
        }

        // --- CORRECTED QUERY HANDLING ---
        if (validationResult.data.query) {
            // Instead of replacing req.query, merge validated properties onto it
            // This avoids the "Cannot set property query...getter" error
            Object.assign(req.query, validationResult.data.query);

            // Alternative (more explicit loop):
            // for (const key in validationResult.data.query) {
            //     if (Object.hasOwnProperty.call(validationResult.data.query, key)) {
            //          req.query[key] = validationResult.data.query[key];
            //     }
            //  }
        }
        // --- END CORRECTION ---

        // Proceed to the next middleware or route handler
        return next();

    } catch (error) {
         // Catch unexpected errors during validation/parsing
         logger.error('Error in validation middleware:', error);
         // Pass to the global error handler
         next(error);
    }
};