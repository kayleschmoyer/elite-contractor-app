// backend/src/validations/auth.validations.js
import { z } from 'zod';

// Schema for the registration request body
export const registerSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email is required' })
      .email('Invalid email address'),
    password: z
      .string({ required_error: 'Password is required' })
      .min(8, 'Password must be at least 8 characters long'),
    name: z
      .string()
      .min(1, 'Name cannot be empty')
      .optional(), // Name is optional
    // Role and companyId are NOT expected from public registration
    // They would be added for an admin creating a user schema
  }).strict() // Use .strict() to fail if extra fields are provided in body
});

// Schema for the login request body
export const loginSchema = z.object({
   body: z.object({
    email: z
      .string({ required_error: 'Email is required' })
      .email('Invalid email address'),
    password: z
      .string({ required_error: 'Password is required' })
      .min(1, 'Password cannot be empty'), // Or min(8) depending on requirements
  }).strict()
});
