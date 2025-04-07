// frontend/src/pages/ClientListPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
// Removed Link import as we use Buttons/IconButtons now
// import { Link } from 'react-router-dom';

// Import ALL Client API functions
import { getCompanyClients, createClient, updateClient, deleteClient } from '../api/clientApi';
import LoadingSpinner from '../components/common/LoadingSpinner'; // Keep for initial load maybe
import ClientForm from '../components/forms/ClientForm'; // Import ClientForm

// --- MUI Imports ---
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
// --- End MUI Imports ---

// --- Remove old style constants ---
// const buttonStyle = { ... };
// const addButtonStyle = { ... };
// const itemButtonStyle = { ... };
// const editItemButtonStyle = { ... };
// const deleteItemButtonStyle = { ... };
// const tableStyle = { ... };
// const thStyle = { ... };
// const tdStyle = { ... };
// const errorBoxStyle = { ... };
// --- End Remove Styles ---

function ClientListPage() {
    const [clients, setClients] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // For initial client list load
    const [error, setError] = useState(null); // For list load or delete errors
    const [isSubmitting, setIsSubmitting] = useState(false); // For form CUD submission
    const [editingClient, setEditingClient] = useState(null); // null or client object
    const [dialogOpen, setDialogOpen] = useState(false); // State for Dialog visibility
    const [formError, setFormError] = useState(null); // Specific errors for Add/Edit form

    // --- Fetch Clients Function ---
    const fetchClients = useCallback(async (showLoading = false) => {
        // Ensure isLoading reflects the current fetch attempt if showLoading is true
        if (showLoading) setIsLoading(true);
        setError(null); // Clear previous list errors
        setFormError(null); // Clear previous form errors
        try {
            const data = await getCompanyClients();
            setClients(data || []); // Ensure it's always an array
        } catch (err) {
            const message = err.message || 'Failed to load clients.';
            setError(`Error loading clients: ${message}`); // Set list error
            console.error("Fetch Clients Error:", err);
            setClients([]); // Clear data on error
        } finally {
            // Only set initial loading false once
            if (isLoading || showLoading) setIsLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoading]); // Include isLoading dependency

    // Initial fetch
    useEffect(() => {
        fetchClients(true); // Pass true for initial load
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run once

    // --- Dialog/Form Open/Close Handlers ---
    const handleOpenDialog = (clientToEdit = null) => {
        setError(null); // Clear list errors
        setFormError(null); // Clear form errors
        setEditingClient(clientToEdit); // Set null for 'Create', client obj for 'Edit'
        setDialogOpen(true); // Open the dialog
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        // Use timeout to allow closing animation before clearing potentially visible data
        setTimeout(() => {
            setEditingClient(null);
            setFormError(null);
            setIsSubmitting(false); // Reset submitting state
        }, 300);
    };

    // --- Form Submit Handlers ---
    const handleAddClientSubmit = async (formData) => {
        setIsSubmitting(true); setFormError(null); setError(null);
        try {
            const newClient = await createClient(formData);
            // Add to list (or refetch) and close dialog
            // Option 1: Add locally
             setClients(prevClients => [newClient, ...prevClients].sort((a, b) => a.name.localeCompare(b.name))); // Keep sorted
            // Option 2: Refetch list
            // await fetchClients(); // Refetch might be simpler if sorting/pagination added later
            handleCloseDialog();
        } catch (err) {
            const message = err.message || 'Failed to add client.';
            setFormError(`Error adding client: ${message}. Please check details.`);
            console.error("Create Client Error:", err);
            // Keep dialog open, error displayed inside
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateSubmit = async (formData) => {
        if (!editingClient) return;
        setIsSubmitting(true); setFormError(null); setError(null);
        try {
            const updatedClient = await updateClient(editingClient.id, formData);
            // Update the client in the list state
            setClients(prevClients =>
                prevClients.map(c => (c.id === editingClient.id ? updatedClient : c))
                           .sort((a, b) => a.name.localeCompare(b.name)) // Keep sorted
            );
            handleCloseDialog(); // Exit edit mode & close dialog
        } catch (err) {
            const message = err.message || 'Failed to update client.';
            setFormError(`Error updating client: ${message}. Please check details.`);
            console.error("Update Client Error:", err);
            // Keep dialog open, error displayed inside
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Delete Handler ---
    const handleDeleteClick = async (clientId, clientName) => {
        if (!window.confirm(`Are you sure you want to delete client: ${clientName}? This may affect related projects.`)) {
            return;
        }
        // Prevent action if a form is active/submitting
        if (dialogOpen || isSubmitting) return;

        setError(null); setFormError(null);
        // You could add a specific deleting indicator state here if needed
        try {
            await deleteClient(clientId);
            // Remove from list state
            setClients(prevClients => prevClients.filter(c => c.id !== clientId));
        } catch (err) {
            const message = err.message || 'Failed to delete client.';
            setError(`Error deleting client: ${message}`); // Show error in main page area
            console.error("Delete Client Error:", err);
        } finally {
            // Reset deleting state if used
        }
    };

    // --- Rendering ---
    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
             <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" component="h1">
                    Clients
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog(null)} // Open dialog for create mode
                    disabled={dialogOpen || isLoading} // Disable if already open or loading list
                >
                   Add New Client
                </Button>
            </Box>

             {/* Display general page errors (list load or delete errors) */}
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {/* Loading indicator for initial client list load */}
            {isLoading && <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>}

            {/* Client Table */}
            {!isLoading && !error && (
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 650 }} aria-label="clients table">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Phone</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Joined</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {clients.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                                        No clients found. Use the button above to add one!
                                    </TableCell>
                                </TableRow>
                            ) : (
                                clients.map((client) => (
                                    <TableRow
                                        key={client.id}
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                        hover // Add hover effect
                                    >
                                        <TableCell component="th" scope="row">{client.name}</TableCell>
                                        <TableCell>{client.email || '-'}</TableCell>
                                        <TableCell>{client.phone || '-'}</TableCell>
                                        <TableCell>{new Date(client.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell align="right">
                                            <IconButton
                                                size="small"
                                                onClick={() => handleOpenDialog(client)} // Open dialog for edit
                                                disabled={dialogOpen || isSubmitting} // Disable if form open
                                                title="Edit Client"
                                                sx={{ mr: 1 }} // Add margin between buttons
                                            >
                                                <EditIcon fontSize="small"/>
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleDeleteClick(client.id, client.name)}
                                                disabled={dialogOpen || isSubmitting} // Disable if form open
                                                title="Delete Client"
                                                color="error" // Use theme's error color
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

            {/* Dialog for Create/Edit Client Form */}
            {/* Render Dialog only when needed, using dialogOpen state */}
            <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>{editingClient ? 'Edit Client' : 'Add New Client'}</DialogTitle>
                <DialogContent>
                    {/* Display form-specific errors */}
                    {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
                    {/* Pass the correct props to ClientForm */}
                    <ClientForm
                        key={editingClient ? editingClient.id : 'add-client'} // Ensure form resets correctly
                        initialData={editingClient || {}}
                        onSubmit={editingClient ? handleUpdateSubmit : handleAddClientSubmit}
                        onCancel={handleCloseDialog} // Close dialog on cancel
                        isSubmitting={isSubmitting}
                    />
                </DialogContent>
                {/* Actions can be in the form or here if needed */}
                {/* <DialogActions> <Button onClick={handleCloseDialog}>Cancel</Button> </DialogActions> */}
            </Dialog>

        </Container>
    );
}

export default ClientListPage;