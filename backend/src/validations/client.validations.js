// backend/src/validations/client.validations.js
import { z } from 'zod';

// --- Schema for Request Parameters containing a Client ID ---
// Used for GET /:id (if added), PUT /:id, DELETE /:id
export const clientIdParamSchema = z.object({
  params: z.object({
    id: z.string().cuid({ message: "Invalid Client ID format" }), // Validate CUID format
  }),
});

// --- Schema for Creating a Client ---
// Validates the request body for POST /api/clients
export const createClientSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Client name is required' })
      .trim()
      .min(1, { message: 'Client name cannot be empty' }),
    email: z
      .string()
      .trim()
      .email({ message: "Invalid email address format" })
      .optional() // Email is optional
      .nullable() // Allow explicit null
      .or(z.literal('')), // Allow empty string, handle in service/submit logic
    phone: z
      .string()
      .trim()
      .optional()
      .nullable()
      .or(z.literal('')),
    address: z
      .string()
      .trim()
      .optional()
      .nullable()
      .or(z.literal('')),
    // companyId is NOT expected in the body, it comes from req.user
  }).strict(), // Disallow any fields not defined in the schema body
});


// --- Schema for Updating a Client ---
// Combines parameter validation and body validation for PUT /api/clients/:id
export const updateClientSchema = z.object({
  // Validate URL parameters
  params: clientIdParamSchema.shape.params, // Reuse the params schema part

  // Validate request body - Allow partial updates
  body: createClientSchema.shape.body // Get the shape from createSchema...
    .partial() // ...make all fields optional
    .strict() // ...still disallow extra fields
    .refine(obj => Object.keys(obj).length > 0, { // ...ensure at least one field provided
        message: "No update data provided. Must provide at least one field to update.",
        // path: [] // Optional: path for the error, empty means form level error
    }),
});