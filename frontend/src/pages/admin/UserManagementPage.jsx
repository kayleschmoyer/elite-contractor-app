// frontend/src/pages/admin/UserManagementPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { getCompanyUsers, createUser } from '../../api/userApi'; // <-- Import createUser
import UserForm from '../../components/forms/UserForm'; // <-- Import UserForm
import LoadingSpinner from '../../components/common/LoadingSpinner'; // Adjust path if needed

// --- Styles (Consider moving to CSS) ---
const buttonStyle = { // Generic button style
    padding: 'var(--spacing-sm) var(--spacing-md)',
    border: 'none',
    borderRadius: 'var(--border-radius)',
    cursor: 'pointer',
    fontSize: 'inherit',
    marginBottom: 'var(--spacing-lg)',
};
const addButtonStyle = { ...buttonStyle, backgroundColor: 'var(--color-accent-primary)', color: 'white' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', marginTop: 'var(--spacing-lg)' };
const thStyle = { borderBottom: '2px solid var(--color-border)', padding: 'var(--spacing-sm)', textAlign: 'left', backgroundColor: 'var(--color-background-secondary)' };
const tdStyle = { borderBottom: '1px solid var(--color-border)', padding: 'var(--spacing-sm)' };
const errorBoxStyle = { color: 'var(--color-error)', marginBottom: 'var(--spacing-md)', padding: 'var(--spacing-md)', border: '1px solid var(--color-error)', borderRadius: 'var(--border-radius)', backgroundColor: 'rgba(220, 53, 69, 0.1)' };
// --- End Styles ---

function UserManagementPage() {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // For initial user list load
    const [error, setError] = useState(null);
    // --- State for Add User Form ---
    const [showAddForm, setShowAddForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false); // For form submission state

    // --- Fetch Users Function ---
    const fetchUsers = useCallback(async () => {
        // Don't show main loading spinner during refetch, only initial load
        // setIsLoading(true);
        setError(null);
        try {
            const data = await getCompanyUsers();
            setUsers(data);
        } catch (err) {
            const message = err.message || 'Failed to load users.';
            setError(`Error loading users: ${message}`);
            console.error(err);
        } finally {
            // Only set loading to false after initial load
            if (isLoading) setIsLoading(false);
        }
    }, [isLoading]); // Include isLoading dependency for the initial load logic

    // Initial fetch on component mount
    useEffect(() => {
        fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run only once on mount

    // --- Add User Submit Handler ---
    const handleAddUserSubmit = async (formData) => {
        setIsSubmitting(true);
        setError(null); // Clear previous errors
        try {
            // Call the API function to create the user
            const newUser = await createUser(formData);
            // Add the newly created user to the top of the list in state
            setUsers(prevUsers => [newUser, ...prevUsers]);
            setShowAddForm(false); // Hide the form upon successful creation
            // Optional: Show a success notification/toast
        } catch (err) {
            const message = err.message || 'Failed to create user.';
            setError(`Error creating user: ${message}. Please check details and try again.`);
            console.error("Create User Error:", err);
            // Keep form open on error
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Cancel Add User Handler ---
    const handleCancelAddUser = () => {
        setShowAddForm(false);
        setError(null); // Clear any errors when cancelling
    };

    // --- Rendering ---
    return (
        <div>
            <h2>User Management (Admin Only)</h2>
            <p>Manage users within your company.</p>

            {/* --- Add User Button and Form --- */}
            {!showAddForm ? (
                // Show button only if form is not visible
                <button onClick={() => {setError(null); setShowAddForm(true);}} style={addButtonStyle}>
                    + Add New User
                </button>
            ) : (
                // Show form when showAddForm is true
                <UserForm
                    onSubmit={handleAddUserSubmit}
                    onCancel={handleCancelAddUser}
                    isSubmitting={isSubmitting}
                    // initialData is empty for create mode
                />
            )}

            {/* Display general errors here */}
            {error && !showAddForm && <div style={errorBoxStyle}>{error}</div>}
            {/* Note: UserForm also displays its own validation errors */}

            <hr style={{ margin: 'var(--spacing-lg) 0' }}/>

            <h3>Existing Users</h3>
            {/* Show loading spinner only during the initial load */}
            {isLoading && <LoadingSpinner />}

            {/* Show error only if not loading */}
            {!isLoading && error && <div style={errorBoxStyle}>{error}</div>}

            {/* Show table only if not loading and no error fetching list */}
            {!isLoading && !error && (
                <table style={tableStyle}>
                    <thead>
                        <tr>
                            <th style={thStyle}>Name</th>
                            <th style={thStyle}>Email</th>
                            <th style={thStyle}>Role</th>
                            <th style={thStyle}>Joined</th>
                            {/* Add Actions column later */}
                        </tr>
                    </thead>
                    <tbody>
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan="4" style={{ ...tdStyle, textAlign: 'center', fontStyle: 'italic' }}>No users found in this company.</td>
                            </tr>
                        ) : (
                            users.map(user => (
                                <tr key={user.id}>
                                    <td style={tdStyle}>{user.name || '-'}</td>
                                    <td style={tdStyle}>{user.email}</td>
                                    <td style={tdStyle}>{user.role}</td>
                                    <td style={tdStyle}>{new Date(user.createdAt).toLocaleDateString()}</td>
                                    {/* TODO: Add Edit/Delete buttons here later */}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default UserManagementPage;