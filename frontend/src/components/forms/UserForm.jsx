// frontend/src/components/forms/UserForm.jsx
import React, { useState } from 'react';

// --- Basic Styles (Consider moving to CSS) ---
const formStyle = {
    padding: 'var(--spacing-lg)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--border-radius)',
    marginBottom: 'var(--spacing-lg)',
    backgroundColor: 'var(--color-background-secondary)',
    maxWidth: '500px', // Limit form width
};
const inputGroupStyle = { marginBottom: 'var(--spacing-md)' };
const labelStyle = { display: 'block', marginBottom: 'var(--spacing-xs)', fontWeight: 'bold' };
const inputStyle = {
    width: '100%',
    padding: 'var(--spacing-sm)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--border-radius)',
    fontSize: 'inherit',
};
const selectStyle = { ...inputStyle }; // Use same base style for select
const buttonGroupStyle = { display: 'flex', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-lg)' };
const buttonStyle = {
    padding: 'var(--spacing-sm) var(--spacing-md)',
    border: 'none',
    borderRadius: 'var(--border-radius)',
    cursor: 'pointer',
    fontSize: 'inherit',
};
const submitButtonStyle = { ...buttonStyle, backgroundColor: 'var(--color-accent-primary)', color: 'white' };
const cancelButtonStyle = { ...buttonStyle, backgroundColor: 'var(--color-background-secondary)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' };
const errorTextStyle = { color: 'var(--color-error)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--spacing-xs)' };
// --- End Styles ---


/**
 * A form for creating (and potentially editing) users by an Admin.
 * @param {object} props
 * @param {function} props.onSubmit - Function to call when form is submitted (receives form data).
 * @param {function} props.onCancel - Function to call when cancel button is clicked.
 * @param {boolean} [props.isSubmitting=false] - Flag to disable form during submission.
 * @param {object} [props.initialData={}] - Initial data for editing (not used yet).
 */
function UserForm({ onSubmit, onCancel, isSubmitting = false, initialData = {} }) {
    // Initialize form state (using initialData for future edit functionality)
    const [formData, setFormData] = useState({
        name: initialData.name || '',
        email: initialData.email || '',
        password: '', // Password should generally not be pre-filled for edit
        role: initialData.role || 'USER', // Default new users to 'USER' role
    });
    const [errors, setErrors] = useState({});

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value,
        }));
        // Clear error for the field being changed
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    // Basic Validation (expand as needed)
    const validateForm = () => {
        const newErrors = {};
        if (!formData.email.trim()) {
            newErrors.email = "Email is required.";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) { // Basic email format check
            newErrors.email = "Email address is invalid.";
        }
        // Password required only when creating (initialData.id doesn't exist)
        // Add complexity checks later if needed
        if (!initialData.id && !formData.password) {
            newErrors.password = "Password is required for new users.";
        } else if (!initialData.id && formData.password.length < 8) {
             newErrors.password = "Password must be at least 8 characters long.";
        }
        if (!formData.role) newErrors.role = "Role is required.";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0; // True if no errors
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            // Pass the validated form data up to the parent component's onSubmit handler
            onSubmit(formData);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={formStyle}>
            {/* Adapt title based on whether we are editing or creating */}
            <h3>{initialData.id ? 'Edit User' : 'Add New User'}</h3>

            {/* Name Input */}
            <div style={inputGroupStyle}>
                <label htmlFor="name" style={labelStyle}>Name:</label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    style={inputStyle}
                    disabled={isSubmitting}
                />
                {/* Optional validation message */}
                 {errors.name && <p style={errorTextStyle}>{errors.name}</p>}
            </div>

            {/* Email Input */}
            <div style={inputGroupStyle}>
                <label htmlFor="email" style={labelStyle}>Email:</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    style={inputStyle}
                    disabled={isSubmitting || initialData.id} // Disable email editing for now
                    required
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : undefined}
                />
                 {errors.email && <p id="email-error" style={errorTextStyle}>{errors.email}</p>}
            </div>

            {/* Password Input (only required for new users) */}
            {/* Conditionally render or just change label/required status for edit later */}
            <div style={inputGroupStyle}>
                <label htmlFor="password" style={labelStyle}>
                    {initialData.id ? 'New Password (optional):' : 'Password:'}
                </label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    style={inputStyle}
                    disabled={isSubmitting}
                    required={!initialData.id} // Required only when creating
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? "password-error" : undefined}
                />
                 {errors.password && <p id="password-error" style={errorTextStyle}>{errors.password}</p>}
            </div>

            {/* Role Selection */}
            <div style={inputGroupStyle}>
                <label htmlFor="role" style={labelStyle}>Role:</label>
                <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    style={selectStyle}
                    disabled={isSubmitting}
                    required
                >
                    {/* Ensure values match the Role enum strings defined in Prisma */}
                    <option value="USER">Standard User</option>
                    <option value="ADMIN">Administrator</option>
                    {/* Add other roles if defined */}
                </select>
                 {errors.role && <p style={errorTextStyle}>{errors.role}</p>}
            </div>

            {/* Action Buttons */}
            <div style={buttonGroupStyle}>
                <button type="submit" style={submitButtonStyle} disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : (initialData.id ? 'Save Changes' : 'Add User')}
                </button>
                {/* Provide a cancel callback */}
                <button type="button" onClick={onCancel} style={cancelButtonStyle} disabled={isSubmitting}>
                    Cancel
                </button>
            </div>
        </form>
    );
}

export default UserForm;