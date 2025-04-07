// frontend/src/pages/admin/UserManagementPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
// Import User APIs
import { getCompanyUsers, createUser, updateUser, deleteUser } from '../../api/userApi';
import { useAuth } from '../../contexts/AuthContext'; // Import useAuth to check current user ID
// Import MUI Components
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper'; // For Table container background
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
// Import Forms
import UserForm from '../../components/forms/UserForm'; // Import the MUI-refactored UserForm
import LoadingSpinner from '../../components/common/LoadingSpinner'; // Keep for initial load


function UserManagementPage() {
    // --- State Variables ---
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null); // General list/delete errors
    const [isSubmitting, setIsSubmitting] = useState(false); // Form submission state
    const [formError, setFormError] = useState(null); // Specific form errors
    const [editingUser, setEditingUser] = useState(null); // User object being edited
    const [dialogOpen, setDialogOpen] = useState(false); // Dialog visibility
    // --- End State Variables ---

    // Get current user info to prevent self-deletion/editing restrictions
    const { user: currentUser } = useAuth();

    // --- Fetch Users Function ---
    const fetchUsers = useCallback(async (showLoading = false) => {
        if (showLoading) setIsLoading(true);
        setError(null); setFormError(null); // Clear errors on fetch
        try {
            const data = await getCompanyUsers();
            setUsers(data || []); // Ensure it's always an array
        } catch (err) {
            const message = err.message || 'Failed to load users.';
            setError(`Error loading users: ${message}`);
            console.error("Fetch Users Error:", err);
            setUsers([]); // Clear data on error
        } finally {
            if (isLoading || showLoading) setIsLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoading]); // Depend on isLoading for initial load state mgmt

    // Initial fetch
    useEffect(() => {
        fetchUsers(true); // Pass true for initial load
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run once

    // --- Dialog/Form Open/Close Handlers ---
    const handleOpenDialog = (userToEdit = null) => {
        setError(null); setFormError(null); // Clear errors
        setEditingUser(userToEdit); // Set null for 'Create', user obj for 'Edit'
        setDialogOpen(true); // Open the dialog
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        // Use timeout to allow closing animation before clearing potentially visible data
        setTimeout(() => {
            setEditingUser(null);
            setFormError(null);
            setIsSubmitting(false); // Reset submitting state
        }, 300);
    };


    // --- Add User Submit Handler ---
    const handleAddUserSubmit = async (formData) => {
        setIsSubmitting(true); setFormError(null); setError(null);
        try {
            const newUser = await createUser(formData);
            setUsers(prevUsers => [newUser, ...prevUsers].sort((a,b) => a.email.localeCompare(b.email))); // Add and sort
            handleCloseDialog(); // Close dialog on success
        } catch (err) {
            const message = err.message || 'Failed.';
            setFormError(`Error creating user: ${message}`); // Show error inside dialog
            console.error("Create User Error:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Update User Submit Handler ---
    const handleUpdateUserSubmit = async (formData) => {
        if (!editingUser) return;
        setIsSubmitting(true); setFormError(null); setError(null);

        // Prepare data: only send password if it's actually entered in the form
        const dataToUpdate = {
            name: formData.name,
            role: formData.role,
            ...(formData.password && { password: formData.password }) // Conditionally include password
        };

        try {
            const updatedUser = await updateUser(editingUser.id, dataToUpdate);
            // Update user in the list state
            setUsers(prevUsers =>
                prevUsers.map(u => (u.id === editingUser.id ? updatedUser : u))
                           .sort((a,b) => a.email.localeCompare(b.email)) // Keep sorted
            );
            handleCloseDialog(); // Exit edit mode & close dialog
        } catch (err) {
            const message = err.message || 'Failed.';
            setFormError(`Error updating user: ${message}`); // Show error inside dialog
            console.error("Update User Error:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Delete User Handler ---
    const handleDeleteUserClick = async (userId, userEmail) => {
        // Prevent deleting self (redundant check as button is disabled, but good practice)
        if (currentUser && userId === currentUser.id) {
             alert("Error: You cannot delete your own account.");
             return;
        }
        if (!window.confirm(`Are you sure you want to delete user: ${userEmail}? This action cannot be undone.`)) {
            return;
        }
        // Prevent action if another form is active
        if (dialogOpen || isSubmitting) return;

        setError(null); setFormError(null); // Clear errors
        // Consider a row-specific loading state if needed
        try {
            await deleteUser(userId);
            // Remove from list state
            setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
        } catch (err) {
            const message = err.message || 'Failed to delete user.';
            setError(`Error deleting user: ${message}`); // Show error in main page area
            console.error("Delete User Error:", err);
        } finally {
            // Reset loading state if used
        }
    };

    // --- Rendering ---
    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" component="h1">
                    Manage Users
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog(null)} // Open dialog for create mode
                    disabled={dialogOpen || isLoading} // Disable if dialog open or list loading
                >
                   Add New User
                </Button>
            </Box>

            {/* Display general page errors (list load or delete errors) */}
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {/* Loading indicator for initial user list load */}
            {isLoading && <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>}

            {/* User Table */}
            {!isLoading && !error && (
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 650 }} aria-label="company users table">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Role</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Joined</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                                        No users found in this company (besides yourself).
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((user) => (
                                    <TableRow
                                        key={user.id}
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                        hover
                                    >
                                        <TableCell component="th" scope="row">{user.name || '-'}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>{user.role}</TableCell>
                                        <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell align="right">
                                            <IconButton
                                                size="small"
                                                onClick={() => handleOpenDialog(user)} // Open dialog for edit
                                                disabled={dialogOpen || isSubmitting}
                                                title="Edit User"
                                                sx={{ mr: 1 }}
                                            >
                                                <EditIcon fontSize="small"/>
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleDeleteUserClick(user.id, user.email)}
                                                disabled={dialogOpen || isSubmitting || (currentUser && currentUser.id === user.id)}
                                                title={currentUser && currentUser.id === user.id ? "Cannot delete yourself" : "Delete User"}
                                                color="error"
                                            >
                                                <DeleteIcon fontSize="small"/>
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Dialog for Create/Edit User Form */}
            {/* Render Dialog only when needed, controlled by dialogOpen state */}
            {dialogOpen && (
                 <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                    <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
                    <DialogContent>
                        {/* Display form-specific errors */}
                        {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
                        {/* Pass the correct props to UserForm */}
                        <UserForm
                            key={editingUser ? editingUser.id : 'add-user'} // Ensure form resets
                            initialData={editingUser || {}} // Pass user data for edit, empty for add
                            onSubmit={editingUser ? handleUpdateUserSubmit : handleAddUserSubmit}
                            onCancel={handleCloseDialog} // Use the unified close handler
                            isSubmitting={isSubmitting}
                        />
                    </DialogContent>
                    {/* Optional DialogActions if form didn't have buttons */}
                 </Dialog>
            )}

        </Container>
    );
}

export default UserManagementPage;