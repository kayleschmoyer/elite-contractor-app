// frontend/src/components/forms/UserForm.jsx
import React, { useState, useEffect } from 'react'; // Added useEffect import

// --- MUI Imports ---
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography'; // For Title if needed inside dialog
// --- End MUI Imports ---


/**
 * A form for creating or editing users by an Admin, using Material UI.
 * @param {object} props
 * @param {function} props.onSubmit - Function to call when form is submitted (receives form data).
 * @param {function} props.onCancel - Function to call when cancel button is clicked.
 * @param {boolean} [props.isSubmitting=false] - Flag to disable form during submission.
 * @param {object} [props.initialData={}] - Initial data for editing.
 */
function UserForm({ onSubmit, onCancel, isSubmitting = false, initialData = {} }) {
    // --- State Variables (Copied from your version) ---
    const [formData, setFormData] = useState({
        name: initialData.name || '',
        email: initialData.email || '',
        password: '', // Password should generally not be pre-filled for edit
        role: initialData.role || 'USER', // Default new users to 'USER' role
    });
    const [errors, setErrors] = useState({});
    // --- End State Variables ---

    // --- useEffect to reset form when initialData changes (for editing) ---
    useEffect(() => {
         setFormData({
             name: initialData.name || '',
             email: initialData.email || '',
             password: '', // Always clear password field when data changes
             role: initialData.role || 'USER',
         });
         setErrors({}); // Clear errors when switching user/mode
     }, [initialData]); // Depend only on initialData reference
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
        if (!formData.email.trim()) {
            newErrors.email = "Email is required.";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) { // Basic email format check
            newErrors.email = "Email address is invalid.";
        }
        // Password required only when creating (initialData doesn't have id yet)
        // Or if user explicitly types in password field during edit
        if (!initialData.id && !formData.password) {
            newErrors.password = "Password is required for new users.";
        } else if (formData.password && formData.password.length < 8) {
             // Validate password length only if a password was entered
             newErrors.password = "Password must be at least 8 characters long.";
        }
        if (!formData.role) newErrors.role = "Role is required.";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0; // True if no errors
    };

    // Handle form submission (Copied from your version)
    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            // Prepare data to submit - exclude password if editing and field is empty
             const dataToSubmit = {
                 name: formData.name.trim() || null, // Send null if empty? Or handle in service? Keep trim.
                 email: formData.email.trim(),
                 role: formData.role,
                 // Only include password if creating OR if editing AND it's been typed into
                 ...((!initialData.id || formData.password) && { password: formData.password })
             };
            onSubmit(dataToSubmit);
        }
    };
    // --- End Handlers ---


    // --- MUI Rendering ---
    return (
        // Use Box as the form container
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            {/* Title is usually handled by the DialogTitle containing this form */}
            {/* <Typography component="h3" variant="h6">{initialData.id ? 'Edit User' : 'Add New User'}</Typography> */}

            {/* Name TextField */}
            <TextField
                margin="normal"
                fullWidth
                id="name"
                label="Name"
                name="name"
                autoComplete="name"
                value={formData.name}
                onChange={handleChange}
                disabled={isSubmitting}
                error={!!errors.name}
                helperText={errors.name || ''}
            />

            {/* Email TextField */}
            <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                // Generally disable email editing, can be changed based on requirements
                disabled={isSubmitting || !!initialData.id}
                error={!!errors.email}
                helperText={errors.email || ''}
            />

            {/* Password TextField */}
            <TextField
                margin="normal"
                required={!initialData.id} // Only required when creating
                fullWidth
                name="password"
                label={initialData.id ? 'New Password (leave blank to keep unchanged)' : 'Password'}
                type="password"
                id="password"
                autoComplete="new-password" // Important for password managers
                value={formData.password}
                onChange={handleChange}
                disabled={isSubmitting}
                error={!!errors.password}
                helperText={errors.password || ''}
            />

            {/* Role Select */}
            <FormControl fullWidth margin="normal" required error={!!errors.role}>
                <InputLabel id="role-select-label">Role</InputLabel>
                <Select
                    labelId="role-select-label"
                    id="role-select"
                    name="role"
                    value={formData.role}
                    label="Role" // Required by InputLabel
                    onChange={handleChange}
                    disabled={isSubmitting}
                >
                    {/* Ensure these values match your Prisma Role Enum strings */}
                    <MenuItem value="USER">Standard User</MenuItem>
                    <MenuItem value="ADMIN">Administrator</MenuItem>
                </Select>
                {errors.role && <FormHelperText>{errors.role}</FormHelperText>}
            </FormControl>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}>
                <Button
                    onClick={onCancel} // Trigger cancel callback
                    disabled={isSubmitting}
                    variant="outlined" // Use outlined style for secondary action
                >
                    Cancel
                </Button>
                <Button
                    type="submit" // HTML form submission trigger
                    disabled={isSubmitting}
                    variant="contained" // Use contained style for primary action
                >
                    {isSubmitting ? <CircularProgress size={24} /> : (initialData.id ? 'Save Changes' : 'Add User')}
                </Button>
            </Box>
        </Box>
    );
}

export default UserForm;