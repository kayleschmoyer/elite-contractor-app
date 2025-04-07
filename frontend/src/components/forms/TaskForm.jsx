// frontend/src/components/forms/TaskForm.jsx
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
// --- End MUI Imports ---

// --- Remove old style constants ---
// const formStyle = { ... };
// const inputGroupStyle = { ... };
// const labelStyle = { ... };
// const inputStyle = { ... };
// const selectStyle = { ... };
// const textareaStyle = { ... };
// const buttonGroupStyle = { ... };
// const buttonStyle = { ... };
// const submitButtonStyle = { ... };
// const cancelButtonStyle = { ... };
// const errorTextStyle = { ... };
// --- End Remove Styles ---

const taskStatusOptions = ['TODO', 'IN_PROGRESS', 'DONE', 'BLOCKED'];

// Function to format ISO date string to YYYY-MM-DD for input[type=date]
// (Keep this helper function as provided by you)
const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try { return dateString.split('T')[0]; } catch (e) { return ''; }
};

/**
 * Form for creating or editing Tasks, using MUI components.
 * @param {object} props
 * @param {function} props.onSubmit - Receives validated form data object.
 * @param {function} props.onCancel - Called when cancel button is clicked.
 * @param {boolean} [props.isSubmitting=false] - Disables form during submission.
 * @param {object} [props.initialData={}] - Pre-fills form for editing.
 * @param {Array<object>} [props.companyUsers=[]] - List of users for assignee dropdown {id, name}.
 * @param {string} props.projectId - ID of the project this task belongs to (needed for submission).
 */
function TaskForm({
    onSubmit,
    onCancel,
    isSubmitting = false,
    initialData = {},
    companyUsers = [],
    projectId // Expect projectId to be passed for creating task context
}) {
    // --- State Variables (Keep existing state logic) ---
    const [formData, setFormData] = useState({
        title: initialData.title || '',
        status: initialData.status || 'TODO', // Default to 'TODO'
        notes: initialData.notes || '',
        startDate: formatDateForInput(initialData.startDate),
        endDate: formatDateForInput(initialData.endDate),
        priority: initialData.priority || '',
        assigneeId: initialData.assigneeId || '', // Default to unassigned ('')
    });
    const [errors, setErrors] = useState({});
    // --- End State Variables ---

    // --- useEffect for initialData (Keep existing logic) ---
    // Reset form if initialData (identified by ID) changes
    const {
        id: initialId, title: initialTitle, status: initialStatus,
        notes: initialNotes, startDate: initialStartDate, endDate: initialEndDate,
        priority: initialPriority, assigneeId: initialAssigneeId
    } = initialData;

    useEffect(() => {
        setFormData({
             title: initialTitle || '',
             status: initialStatus || 'TODO',
             notes: initialNotes || '',
             startDate: formatDateForInput(initialStartDate),
             endDate: formatDateForInput(initialEndDate),
             priority: initialPriority || '',
             assigneeId: initialAssigneeId || '',
        });
        setErrors({});
    // Depend on the specific primitive values from initialData
    }, [initialId, initialTitle, initialStatus, initialNotes, initialStartDate, initialEndDate, initialPriority, initialAssigneeId]);
    // --- End useEffect ---

    // --- Handlers (Keep existing logic) ---
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.title.trim()) newErrors.title = "Task title is required.";
        // Use formData.priority directly as it's string from input
        const priorityVal = formData.priority;
        if (priorityVal && (isNaN(parseInt(priorityVal)) || +priorityVal < 1 || +priorityVal > 5)) {
             newErrors.priority = "Priority must be a number between 1 and 5 (optional).";
        }
        // Add other validations if needed (e.g., start date <= end date)
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            // Prepare data for submission
            const dataToSubmit = {
                title: formData.title.trim(),
                status: formData.status,
                notes: formData.notes.trim() || null,
                startDate: formData.startDate || null,
                endDate: formData.endDate || null,
                priority: formData.priority ? parseInt(formData.priority) : null, // Convert to number or null
                assigneeId: formData.assigneeId || null, // Convert '' to null
                projectId: projectId // Add the projectId from props
            };
            onSubmit(dataToSubmit);
        }
    };
    // --- End Handlers ---

    // --- MUI Rendering ---
    return (
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            {/* Title is usually handled by DialogTitle */}
            {/* <h3>{initialData.id ? 'Edit Task' : 'Add New Task'}</h3> */}

            {/* Title TextField */}
            <TextField
                margin="normal"
                required
                fullWidth
                id="title"
                label="Task Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                disabled={isSubmitting}
                error={!!errors.title}
                helperText={errors.title || ''}
                autoFocus
            />

            {/* Status Select */}
            <FormControl fullWidth margin="normal" required disabled={isSubmitting}>
                <InputLabel id="status-select-label">Status</InputLabel>
                <Select
                    labelId="status-select-label"
                    id="status-select"
                    name="status"
                    value={formData.status}
                    label="Status" // Required by InputLabel
                    onChange={handleChange}
                >
                    {taskStatusOptions.map(status => (
                        <MenuItem key={status} value={status}>
                            {status.replace('_', ' ')} {/* Replace underscores for display */}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            {/* Assignee Select */}
            <FormControl fullWidth margin="normal" disabled={isSubmitting || companyUsers.length === 0}>
                 <InputLabel id="assignee-select-label">Assign To (Optional)</InputLabel>
                <Select
                    labelId="assignee-select-label"
                    id="assigneeId-select"
                    name="assigneeId"
                    value={formData.assigneeId}
                    label="Assign To (Optional)" // Required by InputLabel
                    onChange={handleChange}
                >
                    <MenuItem value="">
                        <em>-- Unassigned --</em>
                    </MenuItem>
                    {companyUsers.map(user => (
                        <MenuItem key={user.id} value={user.id}>
                            {user.name || user.email}
                        </MenuItem>
                    ))}
                </Select>
                {companyUsers.length === 0 && <FormHelperText>No users available</FormHelperText>}
            </FormControl>

            {/* Start Date */}
            <TextField
                margin="normal"
                fullWidth
                id="startDate"
                label="Start Date (Optional)"
                name="startDate"
                type="date"
                InputLabelProps={{ shrink: true }} // Keep label shrunk
                value={formData.startDate}
                onChange={handleChange}
                disabled={isSubmitting}
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
            />

            {/* Priority */}
             <TextField
                margin="normal"
                fullWidth
                id="priority"
                label="Priority (Optional, 1-5)"
                name="priority"
                type="number" // Use number type
                InputProps={{ inputProps: { min: 1, max: 5, step: 1 } }} // HTML5 constraints
                value={formData.priority}
                onChange={handleChange}
                disabled={isSubmitting}
                error={!!errors.priority}
                helperText={errors.priority || ''}
            />

            {/* Notes */}
            <TextField
                margin="normal"
                fullWidth
                id="notes"
                label="Notes (Optional)"
                name="notes"
                multiline
                rows={4}
                value={formData.notes}
                onChange={handleChange}
                disabled={isSubmitting}
            />

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}>
                <Button onClick={onCancel} disabled={isSubmitting} variant="outlined">
                    Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} variant="contained" sx={{ minWidth: 100 }}>
                    {isSubmitting ? <CircularProgress size={24} color="inherit" /> : (initialData.id ? 'Save Task Changes' : 'Add Task')}
                </Button>
            </Box>
        </Box> // End Form Box
    );
}

export default TaskForm;