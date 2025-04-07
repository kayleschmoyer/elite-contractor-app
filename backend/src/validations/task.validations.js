// backend/src/validations/task.validations.js
import { z } from 'zod';

// Re-define the enum for Zod validation (matches Prisma's TaskStatus)
const TaskStatusEnum = z.enum([
    'TODO',
    'IN_PROGRESS',
    'DONE',
    'BLOCKED'
]);

// --- Schema for Task ID in Request Parameters ---
export const taskIdParamSchema = z.object({
    params: z.object({
        id: z.string().cuid({ message: "Invalid Task ID format" }),
    }),
});

// --- Schema for Query Parameters when fetching tasks (e.g., GET /api/tasks?projectId=...) ---
export const getTasksQuerySchema = z.object({
    query: z.object({
        // Allow filtering by projectId, must be a valid CUID if provided
        projectId: z.string().cuid({ message: "Invalid Project ID format" }).optional(),
        // Add other potential query params here later (e.g., status, assigneeId)
    }).strict(), // Disallow unexpected query parameters
});

// --- Base Schema for Task Body Fields (used by Create and Update) ---
const taskBodyBaseSchema = z.object({
    title: z
        .string({ required_error: 'Task title is required' })
        .trim()
        .min(1, { message: 'Task title cannot be empty' }),
    projectId: z // Required on create, but not updatable later
        .string({ required_error: 'Project ID is required' })
        .cuid({ message: "Invalid Project ID format" }),
    status: TaskStatusEnum
        .optional(), // Status is optional on create/update, defaults in Prisma
    notes: z
        .string()
        .trim()
        .optional()
        .nullable()
        .or(z.literal('')), // Allow null or empty string
    startDate: z
        .coerce // Automatically convert string/number to Date if possible
        .date({ invalid_type_error: "Invalid start date format" })
        .optional()
        .nullable(), // Allow null
    endDate: z
        .coerce // Automatically convert string/number to Date if possible
        .date({ invalid_type_error: "Invalid end date format" })
        .optional()
        .nullable(), // Allow null
    priority: z
        .coerce // Convert string to number if possible
        .number({ invalid_type_error: "Priority must be a number"})
        .int({ message: "Priority must be a whole number"})
        .min(1, { message: "Priority must be between 1 and 5" })
        .max(5, { message: "Priority must be between 1 and 5" })
        .optional()
        .nullable(), // Allow null
    assigneeId: z
        .string()
        .cuid({ message: "Invalid Assignee User ID format" })
        .optional()
        .nullable(), // Allow null or unassigned
}).strict(); // Disallow extra fields not defined here

// --- Refinement: Ensure endDate is not before startDate if both are provided ---
const dateRefinement = {
    message: "End date cannot be earlier than start date",
    path: ["endDate"], // Error reported against endDate field
    refine: (data) => !data.startDate || !data.endDate || data.endDate >= data.startDate,
};

// --- Schema for Creating a Task ---
export const createTaskSchema = z.object({
    body: taskBodyBaseSchema.refine(dateRefinement.refine, {
        message: dateRefinement.message,
        path: dateRefinement.path,
    }),
});

// --- Schema for Updating a Task ---
export const updateTaskSchema = z.object({
    // Validate URL parameters
    params: taskIdParamSchema.shape.params,

    // Validate request body
    body: taskBodyBaseSchema
        .omit({ projectId: true }) // Prevent changing the project association
        .partial() // Make all fields optional for update
        .refine(dateRefinement.refine, { // Apply date refinement to partial schema too
            message: dateRefinement.message,
            path: dateRefinement.path,
        })
        .refine(obj => Object.keys(obj).length > 0, { // Ensure at least one field is provided
            message: "No update data provided. Must provide at least one field to update.",
        }),
});