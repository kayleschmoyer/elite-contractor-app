// frontend/src/pages/ClientListPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
// Import ALL Client API functions
import { getCompanyClients, createClient, updateClient, deleteClient } from '../api/clientApi';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ClientForm from '../components/forms/ClientForm'; // Import ClientForm

// --- Styles (Keep existing styles or move to CSS) ---
const buttonStyle = { padding: 'var(--spacing-sm) var(--spacing-md)', border: 'none', borderRadius: 'var(--border-radius)', cursor: 'pointer', fontSize: 'inherit', marginBottom: 'var(--spacing-lg)'};
const addButtonStyle = { ...buttonStyle, backgroundColor: 'var(--color-accent-primary)', color: 'white' };
const itemButtonStyle = { marginLeft: 'var(--spacing-sm)', padding: 'var(--spacing-xs) var(--spacing-sm)', border: '1px solid var(--color-border)', borderRadius: 'var(--border-radius)', cursor: 'pointer', fontSize: 'var(--font-size-sm)', backgroundColor: 'transparent', lineHeight: 1.2 };
const editItemButtonStyle = { ...itemButtonStyle, borderColor: 'var(--color-accent-secondary)', color: 'var(--color-accent-secondary)'};
const deleteItemButtonStyle = { ...itemButtonStyle, borderColor: 'var(--color-error)', color: 'var(--color-error)'};
const tableStyle = { width: '100%', borderCollapse: 'collapse', marginTop: 'var(--spacing-lg)' };
const thStyle = { borderBottom: '2px solid var(--color-border)', padding: 'var(--spacing-sm)', textAlign: 'left', backgroundColor: 'var(--color-background-secondary)' };
const tdStyle = { borderBottom: '1px solid var(--color-border)', padding: 'var(--spacing-sm)' };
const errorBoxStyle = { color: 'var(--color-error)', marginBottom: 'var(--spacing-md)', padding: 'var(--spacing-md)', border: '1px solid var(--color-error)', borderRadius: 'var(--border-radius)', backgroundColor: 'rgba(220, 53, 69, 0.1)' };
// --- End Styles ---

function ClientListPage() {
    const [clients, setClients] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    // --- State for Editing ---
    const [editingClient, setEditingClient] = useState(null); // Holds the client object being edited

    // --- Fetch Clients Function ---
    const fetchClients = useCallback(async (showLoading = false) => {
        if (showLoading) setIsLoading(true); // Only set true for initial load
        setError(null);
        try {
            const data = await getCompanyClients();
            setClients(data);
        } catch (err) {
            const message = err.message || 'Failed to load clients.';
            setError(`Error loading clients: ${message}`);
            console.error("Fetch Clients Error:", err);
        } finally {
            if (isLoading || showLoading) setIsLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoading]); // Depend on isLoading for initial load logic

    // Initial fetch
    useEffect(() => {
        fetchClients(true); // Pass true to set initial loading
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run once

    // --- Add Client Handler ---
    const handleAddClientSubmit = async (formData) => {
        setIsSubmitting(true); setError(null);
        try {
            const newClient = await createClient(formData);
            // Add to list and hide form
            setClients(prevClients => [newClient, ...prevClients]);
            setShowAddForm(false);
        } catch (err) {
            const message = err.message || 'Failed to add client.';
            setError(`Error adding client: ${message}. Please check details and try again.`);
            console.error("Create Client Error:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Edit Handlers ---
    const handleEditClick = (client) => {
        setError(null); // Clear errors
        setEditingClient(client); // Set the client to edit mode
        setShowAddForm(false); // Ensure add form is closed
    };

    const handleCancelEdit = () => {
        setError(null);
        setEditingClient(null); // Exit edit mode
    };

    const handleUpdateSubmit = async (formData) => {
        if (!editingClient) return;
        setIsSubmitting(true); setError(null);
        try {
            const updatedClient = await updateClient(editingClient.id, formData);
            // Update the client in the list state
            setClients(prevClients =>
                prevClients.map(c => (c.id === editingClient.id ? updatedClient : c))
            );
            setEditingClient(null); // Exit edit mode
        } catch (err) {
            const message = err.message || 'Failed to update client.';
            setError(`Error updating client: ${message}. Please check details and try again.`);
            console.error("Update Client Error:", err);
            // Keep form open
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
        if (editingClient || showAddForm || isSubmitting) return;

        setError(null);
        // Maybe add a specific deleting state: setDeletingId(clientId);
        try {
            await deleteClient(clientId);
            // Remove from list state
            setClients(prevClients => prevClients.filter(c => c.id !== clientId));
        } catch (err) {
            const message = err.message || 'Failed to delete client.';
            setError(`Error deleting client: ${message}.`);
            console.error("Delete Client Error:", err);
        } finally {
            // setDeletingId(null);
        }
    };

    // --- Cancel Add Form Handler ---
     const handleCancelAddClient = () => {
        setShowAddForm(false);
        setError(null);
    };

    // --- Rendering ---
    const isFormActive = showAddForm || !!editingClient;

    return (
        <div>
            <h2>Clients</h2>

            {/* Conditionally show Add button or Add/Edit Form */}
            {!isFormActive ? (
                <button onClick={() => {setError(null); setShowAddForm(true);}} style={addButtonStyle}>
                    + Add New Client
                </button>
            ) : showAddForm ? (
                // Render Add Form
                <ClientForm
                    onSubmit={handleAddClientSubmit}
                    onCancel={handleCancelAddClient}
                    isSubmitting={isSubmitting}
                    key="add-client-form" // Key to reset form when switching modes
                />
            ) : ( // editingClient must be set
                // Render Edit Form
                <ClientForm
                    onSubmit={handleUpdateSubmit}
                    onCancel={handleCancelEdit}
                    isSubmitting={isSubmitting}
                    initialData={editingClient} // Pass current client data
                    key={editingClient.id} // Key to reset form when editing different clients
                />
            )}

            {/* Display general errors if form isn't active */}
            {error && !isFormActive && <div style={errorBoxStyle}>{error}</div>}

            <hr style={{ margin: 'var(--spacing-lg) 0', display: isFormActive ? 'none' : 'block' }}/>

            <h3>Existing Clients</h3>
            {isLoading && <LoadingSpinner />}

            {!isLoading && error && !isFormActive && <div style={errorBoxStyle}>{error}</div>}

            {!isLoading && !error && (
                 <table style={tableStyle}>
                    <thead>
                        <tr>
                            <th style={thStyle}>Name</th>
                            <th style={thStyle}>Email</th>
                            <th style={thStyle}>Phone</th>
                            <th style={thStyle}>Joined</th>
                            <th style={thStyle}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {clients.length === 0 ? (
                            <tr><td colSpan="5" style={{ ...tdStyle, textAlign: 'center', fontStyle: 'italic' }}>No clients found.</td></tr>
                        ) : (
                            clients.map(client => (
                                // Don't render list item if it's being edited
                                editingClient?.id === client.id ? null : (
                                <tr key={client.id}>
                                    <td style={tdStyle}>{client.name}</td>
                                    <td style={tdStyle}>{client.email || '-'}</td>
                                    <td style={tdStyle}>{client.phone || '-'}</td>
                                    <td style={tdStyle}>{new Date(client.createdAt).toLocaleDateString()}</td>
                                    <td style={tdStyle}>
                                        {/* --- Enable and Wire Up Buttons --- */}
                                        <button
                                            onClick={() => handleEditClick(client)}
                                            style={editItemButtonStyle}
                                            disabled={isFormActive || isSubmitting} // Disable if any form is open
                                            title="Edit Client"
                                        >
                                            Edit
                                        </button>
                                        <button
                                             onClick={() => handleDeleteClick(client.id, client.name)}
                                             style={deleteItemButtonStyle}
                                             disabled={isFormActive || isSubmitting} // Disable if any form is open
                                             title="Delete Client"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                                )
                            ))
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default ClientListPage;