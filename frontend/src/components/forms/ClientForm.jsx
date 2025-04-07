// frontend/src/components/forms/ClientForm.jsx
import React, { useState, useEffect } from 'react'; // Added useEffect

// --- MUI Imports ---
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
// --- End MUI Imports ---

// --- Remove old style constants ---
// const formStyle = { ... };
// const inputGroupStyle = { ... };
// const labelStyle = { ... };
// const inputStyle = { ... };
// const buttonGroupStyle = { ... };
// const buttonStyle = { ... };
// const submitButtonStyle = { ... };
// const cancelButtonStyle = { ... };
// const errorTextStyle = { ... };
// --- End Remove Styles ---

/**
 * A form for creating or editing clients, using Material UI.
 * @param {object} props
 * @param {function} props.onSubmit - Function to call when form is submitted (receives form data).
 * @param {function} props.onCancel - Function to call when cancel button is clicked.
 * @param {boolean} [props.isSubmitting=false] - Flag to disable form during submission.
 * @param {object} [props.initialData={}] - Initial data for editing (optional).
 */
function ClientForm({ onSubmit, onCancel, isSubmitting = false, initialData = {} }) {
    // --- State Variables (Copied from your version) ---
    const [formData, setFormData] = useState({
        name: initialData.name || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        address: initialData.address || '',
    });
    const [errors, setErrors] = useState({});
    // --- End State Variables ---

    // --- useEffect to reset form when initialData changes (for consistency) ---
    useEffect(() => {
        setFormData({
            name: initialData.name || '',
            email: initialData.email || '',
            phone: initialData.phone || '',
            address: initialData.address || '',
        });
        setErrors({}); // Clear errors when switching client/mode
    }, [initialData]); // Depend on initialData reference
    // --- End useEffect ---


    // --- Handlers (Copied from your version) ---
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

    // Basic Validation (Copied from your version)
    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) {
            newErrors.name = "Client name is required.";
        }
        if (formData.email.trim() && !/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Email address is invalid.";
        }
        // Add other validations if needed
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0; // True if no errors
    };

    // Handle form submission (Copied from your version)
    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
             // Prepare data, trimming optional fields or sending null
            const dataToSubmit = {
                 name: formData.name.trim(),
                 email: formData.email.trim() || null,
                 phone: formData.phone.trim() || null,
                 address: formData.address.trim() || null,
            };
            onSubmit(dataToSubmit);
        }
    };
    // --- End Handlers ---

    // --- MUI Rendering ---
    return (
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            {/* Title is usually handled by the DialogTitle */}
            {/* <Typography variant="h6">{initialData.id ? 'Edit Client' : 'Add New Client'}</Typography> */}

            {/* Name TextField (Required) */}
            <TextField
                margin="normal"
                required
                fullWidth
                id="name"
                label="Client Name"
                name="name"
                autoComplete="organization" // Hint for browser
                value={formData.name}
                onChange={handleChange}
                disabled={isSubmitting}
                error={!!errors.name}
                helperText={errors.name || ''}
                autoFocus // Focus name field first
            />

            {/* Email TextField (Optional) */}
            <TextField
                margin="normal"
                fullWidth
                id="email"
                label="Email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                disabled={isSubmitting}
                error={!!errors.email}
                helperText={errors.email || ''}
            />

            {/* Phone TextField (Optional) */}
            <TextField
                margin="normal"
                fullWidth
                id="phone"
                label="Phone"
                name="phone"
                type="tel" // Use 'tel' type
                autoComplete="tel"
                value={formData.phone}
                onChange={handleChange}
                disabled={isSubmitting}
                error={!!errors.phone} // If you add phone validation
                helperText={errors.phone || ''}
            />

            {/* Address TextField (Optional, Multiline) */}
            <TextField
                margin="normal"
                fullWidth
                id="address"
                label="Address"
                name="address"
                multiline
                rows={4}
                value={formData.address}
                onChange={handleChange}
                disabled={isSubmitting}
                error={!!errors.address} // If you add address validation
                helperText={errors.address || ''}
            />

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}>
                <Button
                    onClick={onCancel} // Trigger cancel callback from parent
                    disabled={isSubmitting}
                    variant="outlined"
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    variant="contained"
                    sx={{ minWidth: 100 }}
                >
                    {isSubmitting ? <CircularProgress size={24} color="inherit" /> : (initialData.id ? 'Save Changes' : 'Add Client')}
                </Button>
            </Box>
        </Box> // End Form Box
    );
}

export default ClientForm;