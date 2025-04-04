// frontend/src/pages/ProjectDetailPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProjectById } from '../api/projectApi';
// Import ALL Task APIs
import { getTasksByProjectId, createTask, updateTask, deleteTask } from '../api/taskApi';
// Import User API for assignee dropdown
import { getCompanyUsers } from '../api/userApi';
// Import Components
import LoadingSpinner from '../components/common/LoadingSpinner';
import TaskForm from '../components/forms/TaskForm';

// --- Styles ---
const errorBoxStyle = { color: 'var(--color-error)', marginBottom: 'var(--spacing-md)', padding: 'var(--spacing-md)', border: '1px solid var(--color-error)', borderRadius: 'var(--border-radius)', backgroundColor: 'rgba(220, 53, 69, 0.1)' };
const taskListStyle = { listStyle: 'none', padding: 0, marginTop: 'var(--spacing-md)' };
const taskItemStyle = { border: '1px solid var(--color-border)', padding: 'var(--spacing-md)', marginBottom: 'var(--spacing-sm)', borderRadius: 'var(--border-radius)'};
const addButtonStyle = { padding: 'var(--spacing-sm) var(--spacing-md)', border: 'none', borderRadius: 'var(--border-radius)', cursor: 'pointer', fontSize: 'inherit', backgroundColor: 'var(--color-accent-primary)', color: 'white', marginBottom: 'var(--spacing-lg)' };
const itemButtonStyle = { marginLeft: 'var(--spacing-sm)', padding: 'var(--spacing-xs) var(--spacing-sm)', border: '1px solid var(--color-border)', borderRadius: 'var(--border-radius)', cursor: 'pointer', fontSize: 'var(--font-size-sm)', backgroundColor: 'transparent', lineHeight: 1.2 };
const editItemButtonStyle = { ...itemButtonStyle, borderColor: 'var(--color-accent-secondary)', color: 'var(--color-accent-secondary)'};
const deleteItemButtonStyle = { ...itemButtonStyle, borderColor: 'var(--color-error)', color: 'var(--color-error)'};
const notesContainerStyle = { marginBottom: 'var(--spacing-sm)' };
const notesPreStyle = { whiteSpace: 'pre-wrap', margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' };
const detailTextStyle = { fontSize: 'var(--font-size-base)', margin: 'var(--spacing-xs) 0'};
const taskMetaStyle = { fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' };
const taskNotesStyle = { fontSize: 'var(--font-size-sm)', margin: 'var(--spacing-xs) 0 0 0', whiteSpace: 'pre-wrap' };
// --- End Styles ---

function ProjectDetailPage() {
    const { id: projectId } = useParams();
    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [isLoadingProject, setIsLoadingProject] = useState(true);
    const [isLoadingTasks, setIsLoadingTasks] = useState(true);
    const [error, setError] = useState(null); // General page/list error
    const [showAddTaskForm, setShowAddTaskForm] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [isSubmittingTask, setIsSubmittingTask] = useState(false);
    const [companyUsers, setCompanyUsers] = useState([]);
    const [formError, setFormError] = useState(null); // Specific form errors
    const [usersLoading, setUsersLoading] = useState(false); // Loading users for form

    // --- Fetch Initial Project and Task Data ---
    const loadData = useCallback(async () => {
        if (!projectId) {
            setError("Project ID not found in URL.");
            setIsLoadingProject(false); setIsLoadingTasks(false); return;
        }
        // Reset everything on load or projectId change
        setIsLoadingProject(true); setIsLoadingTasks(true); setError(null); setFormError(null);
        setProject(null); setTasks([]); setCompanyUsers([]); setShowAddTaskForm(false); setEditingTask(null);

        try {
            // Fetch project details and tasks in parallel
            const [projectData, taskData] = await Promise.all([
                getProjectById(projectId),
                getTasksByProjectId(projectId)
            ]);
            setProject(projectData);
            setTasks(taskData || []); // Ensure tasks is always an array
        } catch (err) {
            const message = err.message || 'Failed to load project data or tasks.';
            setError(message); // Set general page error
            console.error("Error loading project detail/tasks:", err);
            setProject(null); // Clear project data on error
            setTasks([]); // Clear tasks on error
        } finally {
            setIsLoadingProject(false);
            setIsLoadingTasks(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [projectId]); // Re-run if projectId changes

    // Initial Load Effect
    useEffect(() => {
        loadData();
    }, [loadData]); // Depend on the stable loadData callback

    // --- Fetch Users for Assignee Dropdown ---
    const fetchUsersForForm = useCallback(async () => {
        if (usersLoading) return false; // Prevent concurrent fetches
        setUsersLoading(true);
        setFormError(null); // Clear previous form errors specifically
        try {
            console.log("Fetching users for task form...");
            const usersData = await getCompanyUsers(); // Fetch users
            setCompanyUsers(usersData || []); // Ensure it's an array
            console.log("Users fetched:", usersData);
            return true; // Indicate success
        } catch (error) {
            const message = error.message || 'Could not load user list for assignee dropdown.';
            setFormError(message); // Set specific form error
            console.error("Fetch Users Error:", error);
            setCompanyUsers([]); // Reset on error
            return false; // Indicate failure
        } finally {
            setUsersLoading(false);
        }
    }, [usersLoading]); // Dependency prevents race conditions

    // --- Show Add Task Form Handler ---
    const handleShowAddTaskForm = async () => {
        setError(null); setFormError(null); // Clear errors
        setEditingTask(null); // Ensure edit mode is off
        const success = await fetchUsersForForm(); // Fetch users first
        if (success) {
            setShowAddTaskForm(true); // Show form only if users loaded
        }
        // If fetch fails, formError state is set and will be displayed near the form
    };

    // --- Add Task Submit Handler ---
    const handleAddTaskSubmit = async (formData) => {
        setIsSubmittingTask(true);
        setFormError(null);
        try {
            const newTask = await createTask(formData);
            setTasks(prevTasks => [newTask, ...prevTasks]); // Add new task to list
            setShowAddTaskForm(false); // Hide form on success
            setCompanyUsers([]); // Clear user list cache
        } catch (err) {
            const message = err.message || 'Failed to create task.';
            setFormError(`Error creating task: ${message}. Please check details.`);
            console.error("Create Task Error:", err);
            // Keep form open on error
        } finally {
            setIsSubmittingTask(false);
        }
    };

    // --- Cancel Add Task Handler ---
    const handleCancelAddTask = () => {
        setShowAddTaskForm(false);
        setFormError(null);
        setCompanyUsers([]); // Clear user list cache
    };

    // --- Edit Task Handlers ---
    const handleEditTaskClick = async (task) => {
        setError(null); setFormError(null); // Clear errors
        setShowAddTaskForm(false); // Ensure add mode is off
        const success = await fetchUsersForForm(); // Fetch users for dropdown
        if (success) {
            setEditingTask(task); // Set task to edit AFTER users are fetched
        }
        // If fetch fails, formError state is set and will be displayed
    };

    const handleUpdateTaskSubmit = async (formData) => {
        if (!editingTask) return;
        setIsSubmittingTask(true);
        setFormError(null);
        try {
            // Exclude projectId as it shouldn't be updated
            const { projectId: ignoredProjectId, ...updateData } = formData;
            const updatedTask = await updateTask(editingTask.id, updateData);
            // Update the task list state
            setTasks(prevTasks =>
                prevTasks.map(t => (t.id === editingTask.id ? updatedTask : t))
            );
            setEditingTask(null); // Exit edit mode
            setCompanyUsers([]); // Clear user cache
        } catch (err) {
            const message = err.message || 'Failed to update task.';
            setFormError(`Error updating task: ${message}. Please check details.`);
            console.error("Update Task Error:", err);
            // Keep form open on error
        } finally {
            setIsSubmittingTask(false);
        }
    };

    const handleCancelEditTask = () => {
        setEditingTask(null);
        setFormError(null);
        setCompanyUsers([]); // Clear user cache
    };

    // --- Delete Task Handler ---
    const handleDeleteTaskClick = async (taskId, taskTitle) => {
        if (!window.confirm(`Are you sure you want to delete task: "${taskTitle}"?`)) {
            return;
        }
        // Prevent action if another form is active/submitting/loading users
        if (showAddTaskForm || editingTask || isSubmittingTask || usersLoading) return;

        setError(null); setFormError(null); // Clear errors
        // Consider adding a specific loading state for the row being deleted
        try {
            await deleteTask(taskId);
            // Remove from list state
            setTasks(prevTasks => prevTasks.filter(t => t.id !== taskId));
        } catch (err) {
            const message = err.message || 'Failed to delete task.';
            // Show delete errors in the main error area for now
            setError(`Error deleting task: ${message}`);
            console.error("Delete Task Error:", err);
        } finally {
            // Reset specific deleting state if used
        }
    };


    // --- Render Logic ---
    if (isLoadingProject) { return <LoadingSpinner />; }
    // Show general page error if project failed loading, before checking if project exists
    if (error && !project) { return <div style={errorBoxStyle}>{error}</div>; }
    if (!project) { return <div><h2>Project Not Found</h2><p>Could not load project details.</p><Link to="/projects">Back to Projects</Link></div>; }

    const isFormActive = showAddTaskForm || !!editingTask;

    return (
        <div>
            {/* --- Project Details --- */}
            <h2>Project: {project.name}</h2>
            <p style={detailTextStyle}><strong>Status:</strong> {project.status}</p>
            <p style={detailTextStyle}><strong>Client:</strong> {project.client?.name || 'N/A'}</p>
            <p style={detailTextStyle}>
                <strong>Start Date:</strong> {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Not Set'}
            </p>
            <p style={detailTextStyle}>
                <strong>End Date:</strong> {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Not Set'}
            </p>
            {project.address && <p style={detailTextStyle}><strong>Address:</strong> {project.address}</p>}
            {project.notes &&
                <div style={notesContainerStyle}> {/* Use div instead of p */}
                    <strong>Notes:</strong>
                    <pre style={notesPreStyle}>{project.notes}</pre>
                </div>
            }

            <hr style={{ margin: 'var(--spacing-xl) 0' }} />

            {/* --- Tasks Section --- */}
            <h3>Tasks for this Project</h3>

            {/* Add Task Button / Add Form / Edit Form */}
            {!isFormActive && (
                 <button onClick={handleShowAddTaskForm} style={addButtonStyle} disabled={usersLoading}>
                    {usersLoading ? 'Loading Users...' : '+ Add New Task'}
                </button>
            )}

            {/* Display form-specific errors first */}
            {formError && <div style={errorBoxStyle}>{formError}</div>}

            {/* Show loading spinner while users are loading for the form */}
            {usersLoading && isFormActive && <LoadingSpinner />}

            {/* Render Add Form (only if not loading users) */}
            {showAddTaskForm && !usersLoading && (
                <TaskForm
                    onSubmit={handleAddTaskSubmit}
                    onCancel={handleCancelAddTask}
                    isSubmitting={isSubmittingTask}
                    companyUsers={companyUsers}
                    projectId={projectId}
                    key="add-task-form" // Stable key for add form
                />
            )}

            {/* Render Edit Form (only if not loading users) */}
            {editingTask && !usersLoading && (
                 <TaskForm
                    onSubmit={handleUpdateTaskSubmit}
                    onCancel={handleCancelEditTask}
                    isSubmitting={isSubmittingTask}
                    initialData={editingTask}
                    companyUsers={companyUsers}
                    projectId={projectId}
                    key={editingTask.id} // Key changes when task changes
                />
            )}

            {/* Task List Area */}
            {isLoadingTasks ? (
                <LoadingSpinner />
            ) : tasks.length === 0 ? (
                <p style={{ marginTop: isFormActive ? 'var(--spacing-lg)' : '0' }}>
                    No tasks found for this project yet.
                </p>
            ) : (
                <ul style={taskListStyle}>
                    {tasks.map(task => (
                        // Hide list item if it's being edited
                        editingTask?.id === task.id ? null : (
                        <li key={task.id} style={taskItemStyle}>
                            {/* Task Content */}
                            <div>
                                <strong>{task.title}</strong>
                                <span style={{ ...taskMetaStyle, marginLeft: 'var(--spacing-sm)' }}>({task.status.replace('_', ' ')})</span>
                            </div>
                            {/* Task Meta Info (Assignee, Dates) */}
                            <div style={taskMetaStyle}>
                                {task.assignee && <span>Assigned to: {task.assignee.name || task.assignee.email}</span>}
                                {task.startDate && <span style={{ marginLeft: task.assignee ? 'var(--spacing-md)' : '0' }}>Start: {new Date(task.startDate).toLocaleDateString()}</span>}
                                {task.endDate && <span style={{ marginLeft: task.startDate || task.assignee ? 'var(--spacing-md)' : '0' }}>End/Due: {new Date(task.endDate).toLocaleDateString()}</span>}
                            </div>
                            {/* Task Notes */}
                            {task.notes && <p style={taskNotesStyle}>{task.notes}</p>}
                             {/* Task Action Buttons */}
                             <div style={{marginTop: 'var(--spacing-sm)'}}>
                                <button onClick={() => handleEditTaskClick(task)} style={editItemButtonStyle} disabled={isFormActive || isSubmittingTask || usersLoading} title="Edit Task">Edit</button>
                                <button onClick={() => handleDeleteTaskClick(task.id, task.title)} style={deleteItemButtonStyle} disabled={isFormActive || isSubmittingTask || usersLoading} title="Delete Task">Delete</button>
                             </div>
                        </li>
                        )
                    ))}
                </ul>
            )}
        </div>
    );
}

export default ProjectDetailPage;