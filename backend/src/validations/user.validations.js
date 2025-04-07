// backend/src/validations/user.validations.js
import { z } from 'zod';

// Define Role enum for Zod matching Prisma schema
const RoleEnum = z.enum(['ADMIN', 'USER'], {
    errorMap: () => ({ message: "Invalid role specified. Must be 'ADMIN' or 'USER'." })
});

// --- Schema for User ID in Request Parameters ---
// Used for PUT /:id, DELETE /:id
export const userIdParamSchema = z.object({
  params: z.object({
    id: z.string().cuid({ message: "Invalid User ID format" }),
  }),
});

// --- Schema for Admin Creating a User ---
// Validates the request body for POST /api/users
export const createUserAdminSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email is required' })
      .email({ message: "Invalid email address format" }),
    password: z
      .string({ required_error: 'Password is required' })
      .min(8, { message: "Password must be at least 8 characters long" }),
    name: z
      .string()
      .trim()
      .min(1, { message: "Name cannot be empty if provided" }) // Ensures non-empty if string given
      .optional()
      .nullable(), // Allow null or omit
    role: RoleEnum
        .optional(), // Role is optional, service defaults to USER if omitted
  }).strict(), // Disallow extra fields
});


// --- Schema for Admin Updating a User ---
// Validates params and body for PUT /api/users/:id
export const updateUserAdminSchema = z.object({
  // Validate URL parameters
  params: userIdParamSchema.shape.params,

  // Validate request body - Allow partial updates of specific fields
  body: z.object({
      name: z
          .string()
          .trim()
          .min(1, { message: "Name cannot be empty if provided" })
          .optional()
          .nullable(), // Allow setting name to null or omitting
      password: z // Password is optional on update
          .string()
          .min(8, { message: "Password must be at least 8 characters long" })
          .optional(), // Optional: only include if changing password
      role: RoleEnum
          .optional(), // Role is optional on update
  })
  .partial() // Makes all fields in this object optional
  .strict() // Disallow fields other than name, password, role
  .refine(obj => Object.keys(obj).length > 0, { // Ensure at least one field provided
      message: "No update data provided. Must provide name, password, or role.",
  }),
});

// Note: We intentionally disallow updating email or companyId via this schema/endpoint.