// backend/src/validations/project.validations.js
import { z } from 'zod';

// --- Schema for Request Parameters containing a Project ID ---
// Used for GET /:id, PUT /:id, DELETE /:id
export const projectIdParamSchema = z.object({
  params: z.object({
    id: z.string().cuid({ message: "Invalid Project ID format" }), // Validate CUID format
  }),
});

// --- Schema for Creating a Project ---
// Validates the request body for POST /api/projects
export const createProjectSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Project name is required' })
      .trim()
      .min(1, { message: 'Project name cannot be empty' }),
    status: z
      .string({ required_error: 'Status is required' })
      .min(1, { message: 'Status cannot be empty' }),
    // Optional fields, use nullable() if you want to allow explicit null
    // Use optional() if the field can be missing entirely
    clientId: z
      .string()
      .cuid({ message: "Invalid Client ID format" })
      .optional()
      .nullable(),
    address: z
      .string()
      .trim()
      .optional()
      .nullable(),
    notes: z
      .string()
      .trim()
      .optional()
      .nullable(),
    // Use coerce.date() to attempt conversion from string/number to Date object
    startDate: z
      .coerce.date({ invalid_type_error: "Invalid start date format" })
      .optional()
      .nullable(),
    endDate: z
      .coerce.date({ invalid_type_error: "Invalid end date format" })
      .optional()
      .nullable(),
  }).strict(), // Disallow any fields not defined in the schema body
});


// --- Schema for Updating a Project ---
// Combines parameter validation and body validation
export const updateProjectSchema = z.object({
  params: z.object({
    id: z.string().cuid({ message: "Invalid Project ID format" }),
  }),
  // Body schema reuses fields from create schema but makes them all optional
  body: createProjectSchema.shape.body // Get the body shape from createSchema
    .partial() // Make all fields optional
    .strict() // Still disallow extra fields
    .refine(obj => Object.keys(obj).length > 0, { // Ensure at least one field is being updated
        message: "No update data provided. Must provide at least one field to update.",
        // path: [] // Optional: path for the error, empty means form level
    }),
});


// --- Schema for Getting Projects (Optional - if query params were added) ---
// Example: If you added filtering later like GET /api/projects?status=Planning
// export const getProjectsSchema = z.object({
//   query: z.object({
//      status: z.string().optional(),
//      clientId: z.string().cuid().optional(),
//      // ... other potential query params
//   }).strict(),
// });

// Export Type aliases (Optional - useful if using TypeScript elsewhere)
// export type CreateProjectBody = z.infer<typeof createProjectSchema>['body'];
// export type UpdateProjectBody = z.infer<typeof updateProjectSchema>['body'];
// export type ProjectIdParams = z.infer<typeof projectIdParamSchema>['params'];