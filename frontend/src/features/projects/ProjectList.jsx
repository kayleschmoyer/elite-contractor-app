// frontend/src/features/projects/ProjectList.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom'; // <-- Import Link for navigation
// Import Project APIs
import { getProjects, deleteProject, createProject, updateProject } from '../../api/projectApi';
// Import Client API
import { getCompanyClients } from '../../api/clientApi';
// Import Components
import ProjectForm from './ProjectForm'; // Assuming ProjectForm is in the same directory
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx'; // Adjust path if needed

// --- Basic Styles (Keep existing styles or move to CSS) ---
const itemButtonStyle = {
    marginLeft: 'var(--spacing-sm)',
    padding: 'var(--spacing-xs) var(--spacing-sm)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--border-radius)',
    cursor: 'pointer',
    fontSize: 'var(--font-size-sm)',
    backgroundColor: 'transparent',
    lineHeight: 1.2,
};
const deleteButtonStyle = { ...itemButtonStyle, borderColor: 'var(--color-error)', color: 'var(--color-error)'};
const editButtonStyle = { ...itemButtonStyle, borderColor: 'var(--color-accent-secondary)', color: 'var(--color-accent-secondary)'};
const createButtonStyle = {
    padding: 'var(--spacing-sm) var(--spacing-md)',
    border: 'none',
    borderRadius: 'var(--border-radius)',
    cursor: 'pointer',
    fontSize: 'inherit',
    backgroundColor: 'var(--color-accent-primary)',
    color: 'white',
    marginBottom: 'var(--spacing-lg)',
 };
 const errorBoxStyle = {
    color: 'var(--color-error)',
    marginBottom: 'var(--spacing-md)',
    padding: 'var(--spacing-md)',
    border: '1px solid var(--color-error)',
    borderRadius: 'var(--border-radius)',
    backgroundColor: 'rgba(220, 53, 69, 0.1)'
 };
 const listItemStyle = {
    marginBottom: 'var(--spacing-md)',
    padding: 'var(--spacing-md)',
    border: `1px solid var(--color-border)`,
    borderRadius: 'var(--border-radius)',
    backgroundColor: 'var(--color-background-primary)',
 };
 const listHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 'var(--spacing-sm)'
 };
 const listTitleStyle = {
    fontSize: 'var(--font-size-lg)',
    margin: 0
 };
 // Style for the link to make it look like the heading
 const titleLinkStyle = {
    textDecoration: 'none',
    color: 'inherit'
 };
 const listMetaStyle = {
    color: 'var(--color-text-secondary)',
    marginBottom: 'var(--spacing-xs)',
    fontSize: 'var(--font-size-sm)'
 };
 const listNotesStyle = {
    color: 'var(--color-text-secondary)',
    marginBottom: 'var(--spacing-sm)',
    fontSize: 'var(--font-size-sm)',
    whiteSpace: 'pre-wrap'
 };
 const listStatusStyle = {
    fontStyle: 'italic',
    fontSize: 'var(--font-size-sm)'
 };
// --- End Styles ---


function ProjectList() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true); // For initial projects load
    const [error, setError] = useState(null); // For project list/CUD errors
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false); // For form CUD submission
    const [editingProject, setEditingProject] = useState(null);

    // --- State for Clients Dropdown ---
    const [clients, setClients] = useState([]);
    const [clientsLoading, setClientsLoading] = useState(false);
    const [clientsError, setClientsError] = useState(null); // Specific error for client fetching

    // --- Fetch Projects ---
    const fetchProjects = useCallback(async () => {
        try {
            setError(null);
            const data = await getProjects();
            setProjects(data);
        } catch (err) {
            const message = err.response?.data?.message || err.message || 'Failed to load projects.';
            setError(`Failed to load projects. Please ensure the backend is running. (${message})`);
            console.error("Fetch Projects Error:", err);
        } finally {
             if (loading) setLoading(false); // Turn off initial load flag
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading]); // Re-run only if loading state flag changes (effectively runs once after mount)

    // Initial project fetch on component mount
    useEffect(() => {
        setLoading(true); // Set loading true only before the *initial* projects fetch
        fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run only once

    // --- Function to Fetch Clients (called before showing form) ---
    const fetchClientsForForm = useCallback(async () => {
        // Don't proceed if already loading clients
        if (clientsLoading) return false;

        setClientsLoading(true);
        setClientsError(null); // Clear previous client errors
        try {
            console.log("Fetching clients for form..."); // Debug log
            const clientData = await getCompanyClients();
            setClients(clientData || []);
            console.log("Clients fetched:", clientData); // Debug log
            return true; // Indicate success
        } catch (error) {
            const message = error.message || 'Could not load client list.';
            setClientsError(`Error loading clients for dropdown: ${message}`);
            console.error("Fetch Clients Error:", error);
            setClients([]); // Reset clients on error
            return false; // Indicate failure
        } finally {
            setClientsLoading(false);
        }
    }, [clientsLoading]); // Depend on clientsLoading to prevent race conditions

    // --- Open Create Form Handler ---
    const handleShowCreateForm = async () => {
        setError(null); // Clear main errors
        const success = await fetchClientsForForm(); // Fetch clients first
        if (success) {
            setEditingProject(null); // Ensure edit mode is off
            setShowCreateForm(true); // Show the form only if clients fetched ok
        } else {
            // Show client fetch error instead of form
            setError(clientsError || "Failed to load data needed for the form.");
        }
    };

    // --- Edit Click Handler ---
    const handleEditClick = async (project) => {
        setError(null); // Clear main errors
        const success = await fetchClientsForForm(); // Fetch clients first
        if (success) {
            setEditingProject(project); // Set editing state AFTER clients are fetched
            setShowCreateForm(false);
        } else {
             setError(clientsError || "Failed to load data needed for the form.");
        }
    };

     // --- Form Submit/Cancel Handlers ---
    const handleCreateSubmit = async (formData) => {
        // formData from ProjectForm now includes clientId (null if none selected)
        setIsSubmitting(true);
        setError(null);
        try {
            const newProject = await createProject(formData);
            setProjects(prevProjects => [newProject, ...prevProjects]);
            setShowCreateForm(false);
            setClients([]); // Clear potentially stale client list cache
        } catch (err) {
             const message = err.response?.data?.message || err.message || 'Please check input and try again.';
             setError(`Failed to create project. (${message})`);
             console.error("Create Error:", err);
        } finally {
             setIsSubmitting(false);
        }
    };

    const handleUpdateSubmit = async (formData) => {
        // formData from ProjectForm now includes clientId (null if none selected)
        if (!editingProject) return;
        setIsSubmitting(true);
        setError(null);
        try {
            const updatedProjectData = await updateProject(editingProject.id, formData);
            setProjects(prevProjects =>
                prevProjects.map(p =>
                    p.id === editingProject.id ? updatedProjectData : p
                )
            );
            setEditingProject(null);
            setClients([]); // Clear potentially stale client list cache
        } catch (err) {
             const message = err.response?.data?.message || err.message || 'Please check input and try again.';
             setError(`Failed to update project. (${message})`);
             console.error("Update Error:", err);
        } finally {
             setIsSubmitting(false);
        }
    };

    const handleCancelForm = () => {
        setError(null);
        setClientsError(null);
        setShowCreateForm(false);
        setEditingProject(null);
        setClients([]); // Clear clients list when form is cancelled
    };

     // --- Delete Handler ---
     const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) return;
        if (editingProject || showCreateForm || isSubmitting || clientsLoading) return; // Prevent delete while form active/submitting/loading clients
        try { setError(null); await deleteProject(id); setProjects(prev => prev.filter(p => p.id !== id)); }
        catch (err) { const message = err.response?.data?.message || err.message || 'Please try again.'; setError(`Failed to delete project. (${message})`); console.error("Delete Error:", err); }
     };

    // --- Rendering Logic ---
    if (loading && projects.length === 0) return <LoadingSpinner />; // Initial page load spinner

    const isFormActive = showCreateForm || !!editingProject;

    return (
        <div>
            {/* Centralized Error Display Area */}
            {error && <div style={errorBoxStyle}>{error}</div>}
            {clientsError && !isFormActive && <div style={errorBoxStyle}>{clientsError}</div>} {/* Show client fetch error if form couldn't open */}


            {/* Show Create Button only if no form is active */}
            {!isFormActive && (
                <button onClick={handleShowCreateForm} style={createButtonStyle} disabled={clientsLoading}>
                    {clientsLoading ? 'Loading Clients...' : '+ Create New Project'}
                </button>
            )}

            {/* Render Form (Create or Edit) if active - Pass clients list */}
            {isFormActive && (
                 // Show specific loading state while clients are being fetched for the form
                clientsLoading ? <LoadingSpinner /> : (
                    <ProjectForm
                        key={editingProject ? editingProject.id : 'create'}
                        initialData={editingProject || {}}
                        onSubmit={editingProject ? handleUpdateSubmit : handleCreateSubmit}
                        onCancel={handleCancelForm}
                        isSubmitting={isSubmitting}
                        clients={clients}
                    />
                )
            )}


            {/* Project List Display */}
            {!isFormActive && <h2>Projects</h2>}

            {projects.length === 0 && !loading && !isFormActive ? (
                 <p>No projects found. Create one using the button above!</p>
            ) : (
                 <ul style={{ listStyle: 'none', padding: 0 }}>
                    {projects.map((project) => (
                        // Don't render the list item if it's the one being edited
                        editingProject?.id === project.id ? null : (
                            <li key={project.id} style={listItemStyle}>
                                <div style={listHeaderStyle}>
                                    {/* === MODIFIED PART: Project Name is now a Link === */}
                                    <h3 style={listTitleStyle}>
                                        <Link to={`/projects/${project.id}`} style={titleLinkStyle}>
                                            {project.name}
                                        </Link>
                                    </h3>
                                    {/* === END MODIFIED PART === */}
                                    <div>
                                        <button
                                            onClick={() => handleEditClick(project)}
                                            style={editButtonStyle}
                                            title="Edit Project"
                                            disabled={isFormActive || isSubmitting || clientsLoading} // Disable if any form might open or is submitting
                                        >
                                            ✏️
                                        </button>
                                        <button
                                             onClick={() => handleDelete(project.id)}
                                             style={deleteButtonStyle}
                                             title="Delete Project"
                                             disabled={isFormActive || isSubmitting || clientsLoading} // Disable if any form might open or is submitting
                                         >
                                             🗑️
                                         </button>
                                    </div>
                                </div>
                                {/* Project Details - Client name already updated previously */}
                                <p style={listMetaStyle}>
                                    Client: {project.client?.name || 'N/A'}
                                </p>
                                {project.address && <p style={listMetaStyle}>Address: {project.address}</p>}
                                {project.notes && <p style={listNotesStyle}>Notes: {project.notes}</p>}
                                <p style={listStatusStyle}>Status: {project.status}</p>
                            </li>
                        )
                    ))}
                </ul>
             )}
        </div>
    );
}

export default ProjectList;