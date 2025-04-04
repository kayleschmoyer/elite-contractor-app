// frontend/src/features/projects/ProjectForm.jsx (or components/forms/...)
import React, { useState, useEffect } from 'react';

// --- Basic Styles ---
const formStyle = { padding: 'var(--spacing-lg)', border: '1px solid var(--color-border)', borderRadius: 'var(--border-radius)', marginBottom: 'var(--spacing-lg)', backgroundColor: 'var(--color-background-secondary)', maxWidth: '500px' };
const inputGroupStyle = { marginBottom: 'var(--spacing-md)' };
const labelStyle = { display: 'block', marginBottom: 'var(--spacing-xs)', fontWeight: 'bold' };
const inputStyle = { width: '100%', padding: 'var(--spacing-sm)', border: '1px solid var(--color-border)', borderRadius: 'var(--border-radius)', fontSize: 'inherit' };
const selectStyle = { ...inputStyle };
const buttonGroupStyle = { display: 'flex', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-lg)' };
const buttonStyle = { padding: 'var(--spacing-sm) var(--spacing-md)', border: 'none', borderRadius: 'var(--border-radius)', cursor: 'pointer', fontSize: 'inherit' };
const submitButtonStyle = { ...buttonStyle, backgroundColor: 'var(--color-accent-primary)', color: 'white' };
const cancelButtonStyle = { ...buttonStyle, backgroundColor: 'var(--color-background-secondary)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' };
const errorTextStyle = { color: 'var(--color-error)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--spacing-xs)' };
// --- End Styles ---

/**
 * Form for creating/editing projects, includes client select and dates.
 * @param {object} props
 * @param {function} props.onSubmit
 * @param {function} props.onCancel
 * @param {boolean} [props.isSubmitting=false]
 * @param {object} [props.initialData={}] - Includes potential date strings like "YYYY-MM-DDTHH:mm:ss.sssZ"
 * @param {Array<object>} [props.clients=[]]
 */
function ProjectForm({
    onSubmit,
    onCancel,
    isSubmitting = false,
    initialData = {},
    clients = []
}) {
    // Function to format ISO date string to YYYY-MM-DD for input[type=date]
    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        try {
            return dateString.split('T')[0]; // Takes the date part from "YYYY-MM-DDTHH:mm:ss.sssZ"
        } catch (e) {
            return ''; // Handle potential errors
        }
    };

    const [formData, setFormData] = useState({
        name: initialData.name || '',
        status: initialData.status || 'Planning',
        address: initialData.address || '',
        notes: initialData.notes || '',
        clientId: initialData.clientId || '',
        startDate: formatDateForInput(initialData.startDate), // <-- Format initial date
        endDate: formatDateForInput(initialData.endDate),     // <-- Format initial date
    });
    const [errors, setErrors] = useState({});

    // Reset form if initialData changes
    useEffect(() => {
        setFormData({
            name: initialData.name || '',
            status: initialData.status || 'Planning',
            address: initialData.address || '',
            notes: initialData.notes || '',
            clientId: initialData.clientId || '',
            startDate: formatDateForInput(initialData.startDate), // <-- Format here too
            endDate: formatDateForInput(initialData.endDate),     // <-- Format here too
        });
        setErrors({});
        // Add relevant fields from initialData to dependency array
    }, [initialData]); // Simple dependency on object ref; consider specific fields if issues arise


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
        // Optional: Add validation for date logic (e.g., end date after start date)
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            // Prepare data, ensuring empty dates become null
            const dataToSubmit = {
                name: formData.name.trim(),
                status: formData.status,
                address: formData.address.trim() || null,
                notes: formData.notes.trim() || null,
                clientId: formData.clientId || null,
                startDate: formData.startDate || null, // Send null if empty string
                endDate: formData.endDate || null,     // Send null if empty string
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
                <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} style={inputStyle} disabled={isSubmitting} required aria-invalid={!!errors.name} aria-describedby={errors.name ? "name-error" : undefined} />
                {errors.name && <p id="name-error" style={errorTextStyle}>{errors.name}</p>}
            </div>

            {/* Client Selection */}
            <div style={inputGroupStyle}>
                <label htmlFor="clientId" style={labelStyle}>Client (Optional):</label>
                <select id="clientId" name="clientId" value={formData.clientId} onChange={handleChange} style={selectStyle} disabled={isSubmitting || clients.length === 0} >
                    <option value="">-- Select a Client --</option>
                    {clients.map(client => (<option key={client.id} value={client.id}>{client.name}</option>))}
                </select>
                {clients.length === 0 && !isSubmitting && <p style={{...errorTextStyle, color: 'var(--color-text-secondary)'}}>(No clients available)</p>}
            </div>

            {/* Status Selection */}
            <div style={inputGroupStyle}>
                <label htmlFor="status" style={labelStyle}>Status:</label>
                <select id="status" name="status" value={formData.status} onChange={handleChange} style={selectStyle} disabled={isSubmitting} required>
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

            {/* --- NEW: Start Date Input --- */}
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

            {/* --- NEW: End Date Input --- */}
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

             {/* Address Input */}
            <div style={inputGroupStyle}>
                <label htmlFor="address" style={labelStyle}>Address:</label>
                <input type="text" id="address" name="address" value={formData.address} onChange={handleChange} style={inputStyle} disabled={isSubmitting}/>
            </div>

            {/* Notes Input */}
            <div style={inputGroupStyle}>
                <label htmlFor="notes" style={labelStyle}>Notes:</label>
                <textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} rows="3" style={inputStyle} disabled={isSubmitting}></textarea>
            </div>

            {/* Action Buttons */}
            <div style={buttonGroupStyle}>
                 <button type="submit" style={submitButtonStyle} disabled={isSubmitting}>{isSubmitting ? 'Saving...' : (initialData.id ? 'Save Changes' : 'Create Project')}</button>
                <button type="button" onClick={onCancel} style={cancelButtonStyle} disabled={isSubmitting}>Cancel</button>
            </div>
        </form>
    );
}

export default ProjectForm;