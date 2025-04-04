// frontend/src/components/forms/TaskForm.jsx
import React, { useState, useEffect } from 'react';

// --- Basic Styles ---
const formStyle = { padding: 'var(--spacing-lg)', border: '1px solid var(--color-border)', borderRadius: 'var(--border-radius)', marginBottom: 'var(--spacing-lg)', backgroundColor: 'var(--color-background-secondary)', maxWidth: '600px' };
const inputGroupStyle = { marginBottom: 'var(--spacing-md)' };
const labelStyle = { display: 'block', marginBottom: 'var(--spacing-xs)', fontWeight: 'bold' };
const inputStyle = { width: '100%', padding: 'var(--spacing-sm)', border: '1px solid var(--color-border)', borderRadius: 'var(--border-radius)', fontSize: 'inherit' };
const selectStyle = { ...inputStyle };
const textareaStyle = { ...inputStyle, fontFamily: 'inherit' };
const buttonGroupStyle = { display: 'flex', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-lg)' };
const buttonStyle = { padding: 'var(--spacing-sm) var(--spacing-md)', border: 'none', borderRadius: 'var(--border-radius)', cursor: 'pointer', fontSize: 'inherit' };
const submitButtonStyle = { ...buttonStyle, backgroundColor: 'var(--color-accent-primary)', color: 'white' };
const cancelButtonStyle = { ...buttonStyle, backgroundColor: 'var(--color-background-secondary)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' };
const errorTextStyle = { color: 'var(--color-error)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--spacing-xs)' };
// --- End Styles ---

const taskStatusOptions = ['TODO', 'IN_PROGRESS', 'DONE', 'BLOCKED'];

// Function to format ISO date string to YYYY-MM-DD for input[type=date]
const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try { return dateString.split('T')[0]; } catch (e) { return ''; }
};

/**
 * Form for creating or editing Tasks, includes dates and assignee.
 * @param {object} props
 * // ... other props (onSubmit, onCancel, isSubmitting, initialData, companyUsers)
 * @param {string} props.projectId - Required projectId.
 */
function TaskForm({
    onSubmit,
    onCancel,
    isSubmitting = false,
    initialData = {},
    companyUsers = [],
    projectId // Expect projectId to be passed for creating task context
}) {
    const [formData, setFormData] = useState({
        title: initialData.title || '',
        status: initialData.status || 'TODO',
        notes: initialData.notes || '',
        startDate: formatDateForInput(initialData.startDate), // <-- Add startDate
        endDate: formatDateForInput(initialData.endDate),   // <-- Add endDate (was dueDate)
        priority: initialData.priority || '',
        assigneeId: initialData.assigneeId || '',
    });
    const [errors, setErrors] = useState({});

    // Reset form if initialData (identified by ID) changes
    const {
        id: initialId,
        title: initialTitle,
        status: initialStatus,
        notes: initialNotes,
        startDate: initialStartDate, // <-- Get initial start date
        endDate: initialEndDate,     // <-- Get initial end date
        priority: initialPriority,
        assigneeId: initialAssigneeId
    } = initialData;

    useEffect(() => {
        setFormData({
             title: initialTitle || '',
             status: initialStatus || 'TODO',
             notes: initialNotes || '',
             startDate: formatDateForInput(initialStartDate), // <-- Format start date
             endDate: formatDateForInput(initialEndDate),     // <-- Format end date
             priority: initialPriority || '',
             assigneeId: initialAssigneeId || '',
        });
        setErrors({});
    // Depend on the specific primitive values from initialData
    }, [initialId, initialTitle, initialStatus, initialNotes, initialStartDate, initialEndDate, initialPriority, initialAssigneeId]);


    const handleChange = (e) => { /* ... same as before ... */
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    const validateForm = () => { /* ... same as before ... */
        const newErrors = {};
        if (!formData.title.trim()) newErrors.title = "Task title is required.";
        if (formData.priority && (isNaN(parseInt(formData.priority)) || formData.priority < 1 || formData.priority > 5) ) newErrors.priority = "Priority must be 1-5.";
        // Optional: Validate startDate <= endDate if both are provided
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            // Prepare data, ensuring empty dates/assignee/priority become null
            const dataToSubmit = {
                title: formData.title.trim(),
                status: formData.status,
                notes: formData.notes.trim() || null,
                startDate: formData.startDate || null, // <-- Add startDate
                endDate: formData.endDate || null,     // <-- Add endDate
                priority: formData.priority ? parseInt(formData.priority) : null,
                assigneeId: formData.assigneeId || null,
                projectId: projectId // Add the projectId from props
            };
            onSubmit(dataToSubmit);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={formStyle}>
            <h3>{initialData.id ? 'Edit Task' : 'Add New Task'}</h3>

            {/* Title Input */}
            <div style={inputGroupStyle}>
                <label htmlFor="title" style={labelStyle}>Title:</label>
                <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} style={inputStyle} disabled={isSubmitting} required aria-invalid={!!errors.title} aria-describedby={errors.title ? "title-error" : undefined}/>
                {errors.title && <p id="title-error" style={errorTextStyle}>{errors.title}</p>}
            </div>

            {/* Status Select */}
            <div style={inputGroupStyle}>
                <label htmlFor="status" style={labelStyle}>Status:</label>
                <select id="status" name="status" value={formData.status} onChange={handleChange} style={selectStyle} disabled={isSubmitting} required>
                    {taskStatusOptions.map(status => (<option key={status} value={status}>{status.replace('_', ' ')}</option>))}
                </select>
            </div>

            {/* Assignee Select */}
            <div style={inputGroupStyle}>
                <label htmlFor="assigneeId" style={labelStyle}>Assign To (Optional):</label>
                <select id="assigneeId" name="assigneeId" value={formData.assigneeId} onChange={handleChange} style={selectStyle} disabled={isSubmitting || companyUsers.length === 0}>
                    <option value="">-- Unassigned --</option>
                    {companyUsers.map(user => (<option key={user.id} value={user.id}>{user.name || user.email}</option>))}
                </select>
                {companyUsers.length === 0 && !isSubmitting && <p style={{...errorTextStyle, color: 'var(--color-text-secondary)'}}>(No users available)</p>}
            </div>

            {/* --- Start Date Input (NEW) --- */}
            <div style={inputGroupStyle}>
                <label htmlFor="startDate" style={labelStyle}>Start Date (Optional):</label>
                <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    style={inputStyle}
                    disabled={isSubmitting}
                />
            </div>

            {/* --- End Date Input (NEW - Replaces Due Date) --- */}
            <div style={inputGroupStyle}>
                <label htmlFor="endDate" style={labelStyle}>End Date (Optional):</label>
                <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    style={inputStyle}
                    disabled={isSubmitting}
                />
            </div>
            {/* --- End Date Inputs --- */}

            {/* Priority Input */}
             <div style={inputGroupStyle}>
                <label htmlFor="priority" style={labelStyle}>Priority (Optional, 1-5):</label>
                <input type="number" id="priority" name="priority" value={formData.priority} onChange={handleChange} style={inputStyle} disabled={isSubmitting} min="1" max="5" step="1" aria-invalid={!!errors.priority} aria-describedby={errors.priority ? "priority-error" : undefined}/>
                 {errors.priority && <p id="priority-error" style={errorTextStyle}>{errors.priority}</p>}
            </div>

            {/* Notes Textarea */}
            <div style={inputGroupStyle}>
                <label htmlFor="notes" style={labelStyle}>Notes (Optional):</label>
                <textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} style={textareaStyle} disabled={isSubmitting} rows="4"></textarea>
            </div>

            {/* Action Buttons */}
            <div style={buttonGroupStyle}>
                 <button type="submit" style={submitButtonStyle} disabled={isSubmitting}>{isSubmitting ? 'Saving...' : (initialData.id ? 'Save Task Changes' : 'Add Task')}</button>
                <button type="button" onClick={onCancel} style={cancelButtonStyle} disabled={isSubmitting}>Cancel</button>
            </div>
        </form>
    );
}

export default TaskForm;