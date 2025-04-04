// frontend/src/pages/admin/UserManagementPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
// Import User APIs (assuming they exist in userApi.js)
import { getCompanyUsers, createUser, updateUser, deleteUser } from '../../api/userApi';
import { useAuth } from '../../contexts/AuthContext'; // Import useAuth to check current user ID
import LoadingSpinner from '../../components/common/LoadingSpinner';
import UserForm from '../../components/forms/UserForm'; // Import UserForm

// --- Styles ---
const addButtonStyle = { padding: 'var(--spacing-sm) var(--spacing-md)', border: 'none', borderRadius: 'var(--border-radius)', cursor: 'pointer', fontSize: 'inherit', backgroundColor: 'var(--color-accent-primary)', color: 'white', marginBottom: 'var(--spacing-lg)' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', marginTop: 'var(--spacing-lg)' };
const thStyle = { borderBottom: '2px solid var(--color-border)', padding: 'var(--spacing-sm)', textAlign: 'left', backgroundColor: 'var(--color-background-secondary)' };
const tdStyle = { borderBottom: '1px solid var(--color-border)', padding: 'var(--spacing-sm)' };
const errorBoxStyle = { color: 'var(--color-error)', marginBottom: 'var(--spacing-md)', padding: 'var(--spacing-md)', border: '1px solid var(--color-error)', borderRadius: 'var(--border-radius)', backgroundColor: 'rgba(220, 53, 69, 0.1)' };
const itemButtonStyle = { marginLeft: 'var(--spacing-sm)', padding: 'var(--spacing-xs) var(--spacing-sm)', border: '1px solid var(--color-border)', borderRadius: 'var(--border-radius)', cursor: 'pointer', fontSize: 'var(--font-size-sm)', backgroundColor: 'transparent', lineHeight: 1.2 };
const editItemButtonStyle = { ...itemButtonStyle, borderColor: 'var(--color-accent-secondary)', color: 'var(--color-accent-secondary)'};
const deleteItemButtonStyle = { ...itemButtonStyle, borderColor: 'var(--color-error)', color: 'var(--color-error)'};
// --- End Styles ---


function UserManagementPage() {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // For initial user list load
    const [error, setError] = useState(null); // General list/delete errors
    const [showAddForm, setShowAddForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false); // For Add/Edit form submission
    const [formError, setFormError] = useState(null); // Specific errors for Add/Edit form

    // --- State for Editing ---
    const [editingUser, setEditingUser] = useState(null); // Holds the user object being edited

    // Get current user info to prevent self-deletion
    const { user: currentUser } = useAuth();

    // --- Fetch Users Function ---
    const fetchUsers = useCallback(async (showLoading = false) => {
        if (showLoading) setIsLoading(true);
        setError(null); setFormError(null); // Clear errors on fetch
        try {
            const data = await getCompanyUsers();
            setUsers(data);
        } catch (err) {
            const message = err.message || 'Failed to load users.';
            setError(`Error loading users: ${message}`);
            console.error("Fetch Users Error:", err);
        } finally {
            if (isLoading || showLoading) setIsLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoading]); // Depend on isLoading for initial load state mgmt

    // Initial fetch
    useEffect(() => {
        fetchUsers(true); // Pass true for initial load
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // --- Add User Handlers ---
    const handleAddUserSubmit = async (formData) => {
        setIsSubmitting(true); setFormError(null); setError(null);
        try {
            const newUser = await createUser(formData);
            setUsers(prevUsers => [newUser, ...prevUsers]); // Add to list
            setShowAddForm(false); // Hide form
        } catch (err) {
            const message = err.message || 'Failed.';
            setFormError(`Error creating user: ${message}`);
            console.error("Create User Error:", err);
        } finally {
            setIsSubmitting(false);
        }
    };
    const handleCancelAddUser = () => {
        setShowAddForm(false); setFormError(null);
    };

    // --- Edit User Handlers ---
    const handleEditUserClick = (user) => {
        setError(null); setFormError(null);
        setEditingUser(user); // Set user data for the form
        setShowAddForm(false); // Ensure add form is hidden
    };

    const handleUpdateUserSubmit = async (formData) => {
        if (!editingUser) return;
        setIsSubmitting(true); setFormError(null); setError(null);

        // Prepare data: only send password if it's actually entered
        const dataToUpdate = {
            name: formData.name,
            role: formData.role,
            // Only include password if the field has a value
            ...(formData.password && { password: formData.password })
        };

        try {
            const updatedUser = await updateUser(editingUser.id, dataToUpdate);
            // Update user in the list state
            setUsers(prevUsers =>
                prevUsers.map(u => (u.id === editingUser.id ? updatedUser : u))
            );
            setEditingUser(null); // Exit edit mode
        } catch (err) {
            const message = err.message || 'Failed.';
            setFormError(`Error updating user: ${message}`);
            console.error("Update User Error:", err);
            // Keep form open
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancelEditUser = () => {
        setEditingUser(null);
        setFormError(null);
    };

    // --- Delete User Handler ---
    const handleDeleteUserClick = async (userId, userEmail) => {
        // Prevent deleting self
        if (currentUser && userId === currentUser.id) {
             alert("You cannot delete your own account.");
             return;
        }
        if (!window.confirm(`Are you sure you want to delete user: ${userEmail}? This action cannot be undone.`)) {
            return;
        }
        // Prevent action if another form is active
        if (showAddForm || editingUser || isSubmitting) return;

        setError(null); setFormError(null);
        // Optional: Set a loading state for the specific row? For now, just general error.
        try {
            await deleteUser(userId);
            // Remove from list state
            setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
        } catch (err) {
            const message = err.message || 'Failed to delete user.';
            setError(`Error deleting user: ${message}`); // Show error in main error area
            console.error("Delete User Error:", err);
        } finally {
            // Reset specific loading state if used
        }
    };

    // --- Rendering ---
    const isFormActive = showAddForm || !!editingUser;

    return (
        <div>
            <h2>User Management (Admin Only)</h2>
            <p>Manage users within your company.</p>

            {/* Add User Button or Edit/Add Form */}
            {!isFormActive ? (
                <button onClick={() => {setError(null); setFormError(null); setShowAddForm(true);}} style={addButtonStyle}>
                    + Add New User
                </button>
            ) : showAddForm ? (
                // Render Add Form
                <UserForm
                    onSubmit={handleAddUserSubmit}
                    onCancel={handleCancelAddUser}
                    isSubmitting={isSubmitting}
                    key="add-user-form"
                />
            ) : ( // editingUser must be set
                // Render Edit Form
                <UserForm
                    onSubmit={handleUpdateUserSubmit}
                    onCancel={handleCancelEditUser}
                    isSubmitting={isSubmitting}
                    initialData={editingUser} // Pass user data to edit
                    key={editingUser.id} // Reset form when editing user changes
                />
            )}

             {/* Display form-specific errors */}
            {formError && <div style={errorBoxStyle}>{formError}</div>}

            <hr style={{ margin: 'var(--spacing-lg) 0', display: isFormActive ? 'none' : 'block' }}/>

            <h3>Existing Users</h3>
            {isLoading && <LoadingSpinner />}
            {!isLoading && error && !isFormActive && <div style={errorBoxStyle}>{error}</div>}

            {!isLoading && !error && (
                <table style={tableStyle}>
                    <thead>
                        <tr>
                            <th style={thStyle}>Name</th>
                            <th style={thStyle}>Email</th>
                            <th style={thStyle}>Role</th>
                            <th style={thStyle}>Joined</th>
                            <th style={thStyle}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length === 0 ? (
                             <tr><td colSpan="5" style={{ ...tdStyle, textAlign: 'center', fontStyle: 'italic' }}>No users found.</td></tr>
                        ) : (
                            users.map(user => (
                                // Hide list item if it's being edited
                                editingUser?.id === user.id ? null : (
                                <tr key={user.id}>
                                    <td style={tdStyle}>{user.name || '-'}</td>
                                    <td style={tdStyle}>{user.email}</td>
                                    <td style={tdStyle}>{user.role}</td>
                                    <td style={tdStyle}>{new Date(user.createdAt).toLocaleDateString()}</td>
                                    <td style={tdStyle}>
                                        {/* --- Enable and Wire Up Buttons --- */}
                                        <button
                                            onClick={() => handleEditUserClick(user)}
                                            style={editItemButtonStyle}
                                            disabled={isFormActive || isSubmitting}
                                            title="Edit User"
                                        >
                                            Edit
                                        </button>
                                        <button
                                             onClick={() => handleDeleteUserClick(user.id, user.email)}
                                             style={deleteItemButtonStyle}
                                             // Disable delete for the currently logged-in admin
                                             disabled={isFormActive || isSubmitting || (currentUser && currentUser.id === user.id)}
                                             title={currentUser && currentUser.id === user.id ? "Cannot delete yourself" : "Delete User"}
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

export default UserManagementPage;