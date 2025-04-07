// frontend/src/features/projects/ProjectForm.jsx
import React, { useState, useEffect } from 'react';

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
import Typography from '@mui/material/Typography'; // Keep if using for internal titles/errors
// --- End MUI Imports ---


// --- Remove Old Style Constants ---
// const formStyle = { ... };
// const inputGroupStyle = { ... };
// const labelStyle = { ... };
// const inputStyle = { ... };
// const selectStyle = { ... };
// const buttonGroupStyle = { ... };
// const buttonStyle = { ... };
// const submitButtonStyle = { ... };
// const cancelButtonStyle = { ... };
// const errorTextStyle = { ... };
// --- End Remove Styles ---

/**
 * Form for creating/editing projects, includes client select and dates. Uses MUI.
 * @param {object} props
 * @param {function} props.onSubmit
 * @param {function} props.onCancel
 * @param {boolean} [props.isSubmitting=false]
 * @param {object} [props.initialData={}]
 * @param {Array<object>} [props.clients=[]]
 */
function ProjectForm({
    onSubmit,
    onCancel,
    isSubmitting = false,
    initialData = {},
    clients = []
}) {
    // Function to format ISO date string to yyyy-MM-dd for input[type=date]
    // (Keep this helper function as provided by you)
    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        try {
            return dateString.split('T')[0];
        } catch (e) {
            return '';
        }
    };

    // --- State Variables (Keep existing state logic) ---
    const [formData, setFormData] = useState({
        name: initialData.name || '',
        status: initialData.status || 'Planning',
        address: initialData.address || '',
        notes: initialData.notes || '',
        clientId: initialData.clientId || '',
        startDate: formatDateForInput(initialData.startDate),
        endDate: formatDateForInput(initialData.endDate),
    });
    const [errors, setErrors] = useState({});
    // --- End State Variables ---

    // --- useEffect for initialData (Keep existing logic) ---
    useEffect(() => {
        setFormData({
            name: initialData.name || '',
            status: initialData.status || 'Planning',
            address: initialData.address || '',
            notes: initialData.notes || '',
            clientId: initialData.clientId || '',
            startDate: formatDateForInput(initialData.startDate),
            endDate: formatDateForInput(initialData.endDate),
        });
        setErrors({});
    }, [initialData]); // Using the object reference dependency
    // --- End useEffect ---

    // --- Handlers (Keep existing logic) ---
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
        // Optional: Add date validation logic here if needed
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            const dataToSubmit = {
                name: formData.name.trim(),
                status: formData.status,
                address: formData.address.trim() || null,
                notes: formData.notes.trim() || null,
                clientId: formData.clientId || null,
                startDate: formData.startDate || null,
                endDate: formData.endDate || null,
            };
            onSubmit(dataToSubmit);
        }
    };
    // --- End Handlers ---

    // --- MUI Rendering ---
    return (
        // Use Box as the form container, pass onSubmit, noValidate prevents browser validation
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            {/* Title is usually handled by DialogTitle, no need for h3 here */}

            {/* Name TextField */}
            <TextField
                margin="normal"
                required
                fullWidth
                id="name"
                label="Project Name"
                name="name"
                autoComplete="off"
                value={formData.name}
                onChange={handleChange}
                disabled={isSubmitting}
                error={!!errors.name}
                helperText={errors.name || ''}
                autoFocus // Focus this field when form opens
            />

            {/* Client Select */}
            <FormControl fullWidth margin="normal" disabled={isSubmitting || clients.length === 0}>
                <InputLabel id="client-select-label">Client (Optional)</InputLabel>
                <Select
                    labelId="client-select-label"
                    id="clientId-select" // Changed ID slightly
                    name="clientId"
                    value={formData.clientId}
                    label="Client (Optional)" // Required for label positioning
                    onChange={handleChange}
                >
                    <MenuItem value="">
                        <em>-- Select a Client --</em>
                    </MenuItem>
                    {clients.map(client => (
                        <MenuItem key={client.id} value={client.id}>
                            {client.name}
                        </MenuItem>
                    ))}
                </Select>
                {/* Helper text can go here if needed */}
                {clients.length === 0 && <FormHelperText>No clients available</FormHelperText>}
            </FormControl>

            {/* Status Select */}
            <FormControl fullWidth margin="normal" required error={!!errors.status} disabled={isSubmitting}>
                <InputLabel id="status-select-label">Status</InputLabel>
                <Select
                    labelId="status-select-label"
                    id="status-select"
                    name="status"
                    value={formData.status}
                    label="Status" // Required by InputLabel
                    onChange={handleChange}
                >
                    {/* Provide options explicitly */}
                    <MenuItem value="Planning">Planning</MenuItem>
                    <MenuItem value="Lead">Lead</MenuItem>
                    <MenuItem value="In Progress">In Progress</MenuItem>
                    <MenuItem value="Completed">Completed</MenuItem>
                    <MenuItem value="On Hold">On Hold</MenuItem>
                    <MenuItem value="Cancelled">Cancelled</MenuItem>
                </Select>
                {errors.status && <FormHelperText>{errors.status}</FormHelperText>}
            </FormControl>

            {/* Start Date */}
            <TextField
                margin="normal"
                fullWidth
                id="startDate"
                label="Start Date (Optional)"
                name="startDate"
                type="date" // Use date type
                InputLabelProps={{ shrink: true }} // Keep label shrunk for date type
                value={formData.startDate}
                onChange={handleChange}
                disabled={isSubmitting}
                error={!!errors.startDate}
                helperText={errors.startDate || ''}
            />

            {/* End Date */}
            <TextField
                margin="normal"
                fullWidth
                id="endDate"
                label="End Date (Optional)"
                name="endDate"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={formData.endDate}
                onChange={handleChange}
                disabled={isSubmitting}
                error={!!errors.endDate}
                helperText={errors.endDate || ''}
            />

            {/* Address */}
             <TextField
                margin="normal"
                fullWidth
                id="address"
                label="Address"
                name="address"
                autoComplete="street-address" // Hint for browsers
                value={formData.address}
                onChange={handleChange}
                disabled={isSubmitting}
                error={!!errors.address}
                helperText={errors.address || ''}
            />

            {/* Notes */}
            <TextField
                margin="normal"
                fullWidth
                id="notes"
                label="Notes"
                name="notes"
                multiline // Make it a textarea
                rows={4} // Set default number of rows
                value={formData.notes}
                onChange={handleChange}
                disabled={isSubmitting}
                error={!!errors.notes}
                helperText={errors.notes || ''}
            />

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}>
                <Button
                    onClick={onCancel} // Use the onCancel prop passed from parent
                    disabled={isSubmitting}
                    variant="outlined" // Secondary action style
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    variant="contained" // Primary action style
                    sx={{ minWidth: 100 }} // Give button some min width
                >
                    {/* Show loading indicator or text */}
                    {isSubmitting ? <CircularProgress size={24} color="inherit" /> : (initialData.id ? 'Save Changes' : 'Create Project')}
                </Button>
            </Box>
        </Box> // End form Box
    );
}

export default ProjectForm;