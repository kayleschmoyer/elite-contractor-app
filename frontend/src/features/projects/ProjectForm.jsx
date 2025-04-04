// frontend/src/features/projects/ProjectForm.jsx
import React, { useState, useEffect } from 'react';

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
const selectStyle = { ...inputStyle }; // Style for select dropdown
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
 * A form for creating or editing projects, now including client selection.
 * @param {object} props
 * @param {function} props.onSubmit - Called with form data on valid submission.
 * @param {function} props.onCancel - Called when cancel button is clicked.
 * @param {boolean} [props.isSubmitting=false] - Disables form during submission.
 * @param {object} [props.initialData={}] - Data for pre-filling the form (editing).
 * @param {Array<object>} [props.clients=[]] - List of available clients for dropdown.
 */
function ProjectForm({
    onSubmit,
    onCancel,
    isSubmitting = false,
    initialData = {},
    clients = [] // <-- Accept clients prop
}) {
    const [formData, setFormData] = useState({
        name: initialData.name || '',
        status: initialData.status || 'Planning',
        address: initialData.address || '',
        notes: initialData.notes || '',
        clientId: initialData.clientId || '', // <-- Initialize clientId state
    });
    const [errors, setErrors] = useState({});

    // Reset form if initialData changes
    useEffect(() => {
        setFormData({
            name: initialData.name || '',
            status: initialData.status || 'Planning',
            address: initialData.address || '',
            notes: initialData.notes || '',
            clientId: initialData.clientId || '', // Handle null/undefined from initialData
        });
        setErrors({});
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value,
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = "Project name is required.";
        if (!formData.status) newErrors.status = "Status is required.";
        // No validation needed for optional clientId select
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            // Prepare data to submit, ensuring clientId is null if empty string
            const dataToSubmit = {
                ...formData,
                clientId: formData.clientId || null, // Convert "" back to null for API/DB
            };
            onSubmit(dataToSubmit);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={formStyle}>
            <h3>{initialData.id ? 'Edit Project' : 'Create New Project'}</h3>

            {/* Name Input */}
            <div style={inputGroupStyle}>
                <label htmlFor="name" style={labelStyle}>Project Name:</label>
                <input
                    type="text" id="name" name="name" value={formData.name}
                    onChange={handleChange} style={inputStyle} disabled={isSubmitting} required
                    aria-invalid={!!errors.name} aria-describedby={errors.name ? "name-error" : undefined}
                />
                {errors.name && <p id="name-error" style={errorTextStyle}>{errors.name}</p>}
            </div>

            {/* --- Client Selection Dropdown (NEW) --- */}
            <div style={inputGroupStyle}>
                <label htmlFor="clientId" style={labelStyle}>Client (Optional):</label>
                <select
                    id="clientId"
                    name="clientId"
                    value={formData.clientId} // Bind value to state
                    onChange={handleChange}
                    style={selectStyle}
                    disabled={isSubmitting || clients.length === 0} // Disable if no clients fetched
                >
                    <option value="">-- Select a Client --</option>
                    {/* Map over the clients prop passed down from ProjectList */}
                    {clients.map(client => (
                        <option key={client.id} value={client.id}>
                            {client.name}
                        </option>
                    ))}
                </select>
                {/* Show message if no clients are available */}
                {clients.length === 0 && !isSubmitting && <p style={{...errorTextStyle, color: 'var(--color-text-secondary)'}}>(No clients available. Add clients on the Clients page first.)</p>}
                 {/* Add specific error display for clientId if needed */}
            </div>
            {/* --- End Client Selection --- */}


            {/* Status Selection */}
            <div style={inputGroupStyle}>
                <label htmlFor="status" style={labelStyle}>Status:</label>
                <select
                     id="status" name="status" value={formData.status}
                     onChange={handleChange} style={selectStyle} disabled={isSubmitting} required
                >
                     {/* Default option (useful if status wasn't pre-filled) */}
                     {!formData.status && <option value="" disabled>-- Select Status --</option>}
                     <option value="Planning">Planning</option>
                     <option value="Lead">Lead</option>
                     <option value="In Progress">In Progress</option>
                     <option value="Completed">Completed</option>
                     <option value="On Hold">On Hold</option>
                     <option value="Cancelled">Cancelled</option>
                </select>
                 {errors.status && <p style={errorTextStyle}>{errors.status}</p>}
            </div>

             {/* Address Input */}
            <div style={inputGroupStyle}>
                <label htmlFor="address" style={labelStyle}>Address:</label>
                <input
                    type="text" id="address" name="address" value={formData.address}
                    onChange={handleChange} style={inputStyle} disabled={isSubmitting}
                />
            </div>

            {/* Notes Input */}
            <div style={inputGroupStyle}>
                <label htmlFor="notes" style={labelStyle}>Notes:</label>
                <textarea
                    id="notes" name="notes" value={formData.notes}
                    onChange={handleChange} rows="3" style={inputStyle} disabled={isSubmitting}
                ></textarea>
            </div>

            {/* Action Buttons */}
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