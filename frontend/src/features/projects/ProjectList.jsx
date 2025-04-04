// frontend/src/features/projects/ProjectList.jsx
import React, { useState, useEffect, useCallback } from 'react';
// Import API functions and the ProjectForm component
import { getProjects, deleteProject, createProject, updateProject } from '../../api/projectApi'; // Import updateProject
import ProjectForm from './ProjectForm';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';

// Basic styles (Consider moving to CSS files)
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
const editButtonStyle = { ...itemButtonStyle, borderColor: 'var(--color-accent-secondary)', color: 'var(--color-accent-secondary)'}; // Adjusted style
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


function ProjectList() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    // --- New State for Editing ---
    // Stores the project object being edited, or null if not editing
    const [editingProject, setEditingProject] = useState(null);

    // --- Fetch Projects ---
    const fetchProjects = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getProjects();
            setProjects(data);
        } catch (err) {
            const message = err.response?.data?.message || err.message || 'Failed to load projects.';
            setError(`Failed to load projects. Please ensure the backend is running. (${message})`);
            console.error("Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    // --- Delete Handler ---
    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
            return;
        }
        // Prevent delete if currently editing/submitting another form
        if (editingProject || isSubmitting) return;

        try {
            setError(null);
            await deleteProject(id);
            setProjects(prevProjects => prevProjects.filter(p => p.id !== id));
        } catch (err) {
             const message = err.response?.data?.message || err.message || 'Please try again.';
             setError(`Failed to delete project. (${message})`);
             console.error("Delete Error:", err);
        }
    };

    // --- Create Handler ---
    const handleCreateSubmit = async (formData) => {
        setIsSubmitting(true);
        setError(null);
        try {
            const newProject = await createProject(formData);
            setProjects(prevProjects => [newProject, ...prevProjects]); // Add to list
            setShowCreateForm(false); // Hide form
        } catch (err) {
             const message = err.response?.data?.message || err.message || 'Please check input and try again.';
             setError(`Failed to create project. (${message})`);
             console.error("Create Error:", err);
        } finally {
             setIsSubmitting(false);
        }
    };

    // --- Edit Handlers ---
    const handleEditClick = (project) => {
        setError(null); // Clear any previous errors
        setEditingProject(project); // Set the project to be edited
        setShowCreateForm(false); // Ensure create form is hidden
    };

    const handleCancelEdit = () => {
        setError(null);
        setEditingProject(null); // Clear editing state
    };

    const handleUpdateSubmit = async (formData) => {
        if (!editingProject) return; // Should not happen if form is shown

        setIsSubmitting(true);
        setError(null);
        try {
            const updatedProjectData = await updateProject(editingProject.id, formData);
            // Update the project list state
            setProjects(prevProjects =>
                prevProjects.map(p =>
                    p.id === editingProject.id ? updatedProjectData : p
                )
            );
            setEditingProject(null); // Exit editing mode on success
        } catch (err) {
             const message = err.response?.data?.message || err.message || 'Please check input and try again.';
             setError(`Failed to update project. (${message})`);
             console.error("Update Error:", err);
             // Keep form open on error so user can fix input
        } finally {
             setIsSubmitting(false);
        }
    };

    // --- Rendering Logic ---

    if (loading && projects.length === 0) {
        return <LoadingSpinner />;
    }

    // Determine if any form (Create or Edit) is active
    const isFormActive = showCreateForm || !!editingProject;

    return (
        <div>
            {/* Centralized Error Display Area */}
            {error && <div style={errorBoxStyle}>{error}</div>}

            {/* Show Create Button OR the active Form (Create or Edit) */}
            {!isFormActive && (
                <button onClick={() => {setError(null); setShowCreateForm(true);}} style={createButtonStyle}>
                    + Create New Project
                </button>
            )}

            {/* Render Create Form if active */}
            {showCreateForm && (
                <ProjectForm
                    onSubmit={handleCreateSubmit}
                    onCancel={() => {setError(null); setShowCreateForm(false);}}
                    isSubmitting={isSubmitting}
                    // No initialData for create mode
                />
            )}

            {/* Render Edit Form if active */}
            {editingProject && (
                 <ProjectForm
                    // Key prop helps React reset form state when editingProject changes
                    key={editingProject.id}
                    initialData={editingProject} // Pass the project data to pre-fill the form
                    onSubmit={handleUpdateSubmit}
                    onCancel={handleCancelEdit}
                    isSubmitting={isSubmitting}
                />
            )}


            {/* Project List Display */}
            {/* Only show the header if not actively editing/creating */}
            {!isFormActive && <h2>Projects</h2>}

            {/* Handle case where loading finished but no projects exist */}
            {projects.length === 0 && !loading && !isFormActive ? (
                <p>No projects found. Create one using the button above!</p>
            ) : (
                // Render the list if projects exist
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {projects.map((project) => (
                        // Don't render the list item if it's the one being edited
                        editingProject?.id === project.id ? null : (
                            <li key={project.id} style={listItemStyle}>
                                <div style={listHeaderStyle}>
                                    <h3 style={listTitleStyle}>{project.name}</h3>
                                    {/* Action Buttons - disable if any form is active/submitting */}
                                    <div>
                                        <button
                                            onClick={() => handleEditClick(project)}
                                            style={editButtonStyle}
                                            title="Edit Project"
                                            disabled={isFormActive || isSubmitting} // Disable if any form is shown or submitting
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            onClick={() => handleDelete(project.id)}
                                            style={deleteButtonStyle}
                                            title="Delete Project"
                                            disabled={isFormActive || isSubmitting} // Disable if any form is shown or submitting
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                                {/* Project Details */}
                                <p style={listMetaStyle}>Client: {project.client}</p>
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