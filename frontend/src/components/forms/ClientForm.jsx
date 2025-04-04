// frontend/src/components/forms/ClientForm.jsx
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
 * A form for creating (and potentially editing) clients.
 * @param {object} props
 * @param {function} props.onSubmit - Function to call when form is submitted (receives form data).
 * @param {function} props.onCancel - Function to call when cancel button is clicked.
 * @param {boolean} [props.isSubmitting=false] - Flag to disable form during submission.
 * @param {object} [props.initialData={}] - Initial data for editing (optional).
 */
function ClientForm({ onSubmit, onCancel, isSubmitting = false, initialData = {} }) {
    // Initialize form state
    const [formData, setFormData] = useState({
        name: initialData.name || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        address: initialData.address || '',
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

    // Basic Validation
    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) {
            newErrors.name = "Client name is required.";
        }
        // Optional: Add validation for email format if email is entered
        if (formData.email.trim() && !/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Email address is invalid.";
        }
        // Optional: Add validation for phone format if entered
        // ...

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0; // True if no errors
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            // Pass validated data up to the parent component's onSubmit handler
            onSubmit(formData);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={formStyle}>
            <h3>{initialData.id ? 'Edit Client' : 'Add New Client'}</h3>

            {/* Name Input (Required) */}
            <div style={inputGroupStyle}>
                <label htmlFor="name" style={labelStyle}>Client Name:</label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    style={inputStyle}
                    disabled={isSubmitting}
                    required
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? "name-error" : undefined}
                />
                {errors.name && <p id="name-error" style={errorTextStyle}>{errors.name}</p>}
            </div>

            {/* Email Input (Optional) */}
            <div style={inputGroupStyle}>
                <label htmlFor="email" style={labelStyle}>Email:</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    style={inputStyle}
                    disabled={isSubmitting}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : undefined}
                />
                {errors.email && <p id="email-error" style={errorTextStyle}>{errors.email}</p>}
            </div>

            {/* Phone Input (Optional) */}
            <div style={inputGroupStyle}>
                <label htmlFor="phone" style={labelStyle}>Phone:</label>
                <input
                    type="tel" // Use 'tel' type for potential mobile optimizations
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    style={inputStyle}
                    disabled={isSubmitting}
                />
                {/* Optional validation message */}
            </div>

            {/* Address Input (Optional) */}
            <div style={inputGroupStyle}>
                <label htmlFor="address" style={labelStyle}>Address:</label>
                <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows="3"
                    style={inputStyle}
                    disabled={isSubmitting}
                ></textarea>
                {/* Optional validation message */}
            </div>

            {/* Action Buttons */}
            <div style={buttonGroupStyle}>
                <button type="submit" style={submitButtonStyle} disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : (initialData.id ? 'Save Changes' : 'Add Client')}
                </button>
                <button type="button" onClick={onCancel} style={cancelButtonStyle} disabled={isSubmitting}>
                    Cancel
                </button>
            </div>
        </form>
    );
}

export default ClientForm;