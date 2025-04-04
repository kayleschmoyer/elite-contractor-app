// frontend/src/features/projects/ProjectForm.jsx
import React, { useState } from 'react';

// Basic form styles (can be moved to CSS later)
const formStyle = {
    padding: 'var(--spacing-lg)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--border-radius)',
    marginBottom: 'var(--spacing-lg)',
    backgroundColor: 'var(--color-background-secondary)',
};
const inputGroupStyle = { marginBottom: 'var(--spacing-md)' };
const labelStyle = { display: 'block', marginBottom: 'var(--spacing-xs)', fontWeight: 'bold' };
const inputStyle = {
    width: '100%',
    padding: 'var(--spacing-sm)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--border-radius)',
    fontSize: 'inherit', // Inherit font size from body
};
 const buttonGroupStyle = { display: 'flex', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-lg)'};
 const buttonStyle = {
    padding: 'var(--spacing-sm) var(--spacing-md)',
    border: 'none',
    borderRadius: 'var(--border-radius)',
    cursor: 'pointer',
    fontSize: 'inherit',
 };
 const submitButtonStyle = { ...buttonStyle, backgroundColor: 'var(--color-accent-primary)', color: 'white' };
 const cancelButtonStyle = { ...buttonStyle, backgroundColor: 'var(--color-background-secondary)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)'};


/**
 * A form for creating or editing projects.
 * @param {object} props
 * @param {object} [props.initialData={}] - Initial data for editing (optional).
 * @param {function} props.onSubmit - Function to call when form is submitted (receives form data).
 * @param {function} props.onCancel - Function to call when cancel button is clicked.
 * @param {boolean} [props.isSubmitting=false] - Flag to disable form during submission.
 */
function ProjectForm({ initialData = {}, onSubmit, onCancel, isSubmitting = false }) {
    // Initialize form state with initialData or defaults
    const [formData, setFormData] = useState({
        name: initialData.name || '',
        client: initialData.client || '',
        status: initialData.status || 'Planning', // Default status
        address: initialData.address || '',
        notes: initialData.notes || '',
    });
    const [errors, setErrors] = useState({}); // For basic validation later

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value,
        }));
         // Clear error for this field when user types
         if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
         }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = "Project name is required.";
        if (!formData.client.trim()) newErrors.client = "Client name is required.";
        // Add more validation rules as needed
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0; // Return true if valid
    };


    const handleSubmit = (e) => {
        e.preventDefault(); // Prevent default HTML form submission
        if (validateForm()) {
             // Pass validated data to the onSubmit handler passed via props
            onSubmit(formData);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={formStyle}>
            <h3>{initialData.id ? 'Edit Project' : 'Create New Project'}</h3>

            <div style={inputGroupStyle}>
                <label htmlFor="name" style={labelStyle}>Project Name:</label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    style={inputStyle}
                    disabled={isSubmitting}
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? "name-error" : undefined}
                />
                {errors.name && <p id="name-error" style={{ color: 'var(--color-error)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--spacing-xs)' }}>{errors.name}</p>}
            </div>

            <div style={inputGroupStyle}>
                <label htmlFor="client" style={labelStyle}>Client:</label>
                <input
                    type="text"
                    id="client"
                    name="client"
                    value={formData.client}
                    onChange={handleChange}
                    style={inputStyle}
                    disabled={isSubmitting}
                     aria-invalid={!!errors.client}
                     aria-describedby={errors.client ? "client-error" : undefined}
                />
                 {errors.client && <p id="client-error" style={{ color: 'var(--color-error)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--spacing-xs)' }}>{errors.client}</p>}
            </div>

             <div style={inputGroupStyle}>
                <label htmlFor="status" style={labelStyle}>Status:</label>
                <select
                     id="status"
                     name="status"
                     value={formData.status}
                     onChange={handleChange}
                     style={inputStyle}
                     disabled={isSubmitting}
                >
                     <option value="Planning">Planning</option>
                     <option value="In Progress">In Progress</option>
                     <option value="Completed">Completed</option>
                     <option value="On Hold">On Hold</option>
                     <option value="Cancelled">Cancelled</option>
                     {/* Add more statuses as needed */}
                </select>
            </div>

             <div style={inputGroupStyle}>
                <label htmlFor="address" style={labelStyle}>Address:</label>
                <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    style={inputStyle}
                    disabled={isSubmitting}
                />
            </div>

            <div style={inputGroupStyle}>
                <label htmlFor="notes" style={labelStyle}>Notes:</label>
                <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="3"
                    style={inputStyle}
                    disabled={isSubmitting}
                ></textarea>
            </div>

            <div style={buttonGroupStyle}>
                <button type="submit" style={submitButtonStyle} disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : (initialData.id ? 'Save Changes' : 'Create Project')}
                </button>
                <button type="button" onClick={onCancel} style={cancelButtonStyle} disabled={isSubmitting}>
                    Cancel
                </button>
            </div>
        </form>
    );
}

export default ProjectForm;