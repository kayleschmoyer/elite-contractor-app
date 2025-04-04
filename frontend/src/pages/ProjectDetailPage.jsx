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
// --- End Styles ---

function ProjectDetailPage() {
    const { id: projectId } = useParams();
    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [isLoadingProject, setIsLoadingProject] = useState(true);
    const [isLoadingTasks, setIsLoadingTasks] = useState(true);
    const [error, setError] = useState(null); // General page/list error

    // --- Form State ---
    const [showAddTaskForm, setShowAddTaskForm] = useState(false);
    const [editingTask, setEditingTask] = useState(null); // <-- State for editing task object
    const [isSubmittingTask, setIsSubmittingTask] = useState(false);
    const [companyUsers, setCompanyUsers] = useState([]);
    const [formError, setFormError] = useState(null);
    const [usersLoading, setUsersLoading] = useState(false);

    // --- Fetch Initial Project and Task Data ---
    const loadData = useCallback(async () => {
        // ... (same as before) ...
        if (!projectId) { setError("Project ID not found in URL."); setIsLoadingProject(false); setIsLoadingTasks(false); return; }
        setIsLoadingProject(true); setIsLoadingTasks(true); setError(null); setFormError(null);
        setProject(null); setTasks([]); setCompanyUsers([]); setShowAddTaskForm(false); setEditingTask(null); // Reset all on load
        try { const [projectData, taskData] = await Promise.all([ getProjectById(projectId), getTasksByProjectId(projectId) ]); setProject(projectData); setTasks(taskData || []); }
        catch (err) { const message = err.message || 'Failed to load project data or tasks.'; setError(message); console.error("Error loading project detail/tasks:", err); }
        finally { setIsLoadingProject(false); setIsLoadingTasks(false); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [projectId]);

    useEffect(() => { loadData(); }, [loadData]);

    // --- Fetch Users for Assignee Dropdown ---
    const fetchUsersForForm = useCallback(async () => { /* ... same as before ... */
        if (usersLoading) return false; setUsersLoading(true); setFormError(null);
        try { const usersData = await getCompanyUsers(); setCompanyUsers(usersData || []); return true; }
        catch (error) { const message = error.message || 'Could not load user list.'; setFormError(message); console.error("Fetch Users Error:", error); setCompanyUsers([]); return false; }
        finally { setUsersLoading(false); }
    }, [usersLoading]);

    // --- Show Add Task Form ---
    const handleShowAddTaskForm = async () => {
        setError(null); setFormError(null); setEditingTask(null); // Ensure edit mode is off
        const success = await fetchUsersForForm();
        if (success) setShowAddTaskForm(true);
    };

    // --- Add Task Submit ---
    const handleAddTaskSubmit = async (formData) => { /* ... same as before ... */
        setIsSubmittingTask(true); setFormError(null);
        try { const newTask = await createTask(formData); setTasks(prev => [newTask, ...prev]); setShowAddTaskForm(false); setCompanyUsers([]); }
        catch (err) { const message = err.message || 'Failed.'; setFormError(`Error creating task: ${message}`); console.error("Create Task Error:", err); }
        finally { setIsSubmittingTask(false); }
    };

    // --- Cancel Add Task ---
    const handleCancelAddTask = () => { /* ... same as before ... */
        setShowAddTaskForm(false); setFormError(null); setCompanyUsers([]);
    };

    // --- Edit Task Handlers ---
    const handleEditTaskClick = async (task) => {
        setError(null); setFormError(null); setShowAddTaskForm(false); // Ensure add mode is off
        const success = await fetchUsersForForm(); // Fetch users for assignee dropdown
        if (success) {
            setEditingTask(task); // Set the task to edit AFTER users are fetched
        }
    };

    const handleUpdateTaskSubmit = async (formData) => {
        if (!editingTask) return;
        setIsSubmittingTask(true); setFormError(null);
        try {
            // Don't send projectId on update, backend uses taskId
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
            // Keep form open
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
        if (!window.confirm(`Are you sure you want to delete task: "${taskTitle}"?`)) return;
        if (showAddTaskForm || editingTask || isSubmittingTask || usersLoading) return; // Prevent overlapping actions

        setError(null); setFormError(null);
        // Optional: Add a specific deleting state for this task ID?
        try {
            await deleteTask(taskId);
            // Remove from list state
            setTasks(prevTasks => prevTasks.filter(t => t.id !== taskId));
        } catch (err) {
            const message = err.message || 'Failed to delete task.';
            setError(`Error deleting task: ${message}`); // Show general error for delete
            console.error("Delete Task Error:", err);
        } finally {
            // Reset deleting state if used
        }
    };

    // --- Render Logic ---
    if (isLoadingProject) return <LoadingSpinner />;
    if (error && !project) return <div style={errorBoxStyle}>{error}</div>; // Show error only if project failed to load
    if (!project) return <div><h2>Project Not Found</h2><p>Could not load project details.</p><Link to="/projects">Back to Projects</Link></div>;

    const isFormActive = showAddTaskForm || !!editingTask; // Is either Add or Edit form shown?

    return (
        <div>
            {/* Project Details */}
            <h2>Project: {project.name}</h2>
            {/* ... other project details ... */}
            <p><strong>Status:</strong> {project.status}</p>
            <p><strong>Client:</strong> {project.client?.name || 'N/A'}</p>
            {project.address && <p><strong>Address:</strong> {project.address}</p>}
            {project.notes && <div style={notesContainerStyle}><strong>Notes:</strong><pre style={notesPreStyle}>{project.notes}</pre></div>}

            <hr style={{ margin: 'var(--spacing-xl) 0' }} />

            {/* Tasks Section */}
            <h3>Tasks for this Project</h3>

            {/* Add Task Button / Add Form / Edit Form */}
            {!isFormActive && ( // Show button only if no form is active
                 <button onClick={handleShowAddTaskForm} style={addButtonStyle} disabled={usersLoading}>
                    {usersLoading ? 'Loading Users...' : '+ Add New Task'}
                </button>
            )}

            {showAddTaskForm && !usersLoading && ( // Render Add form
                <TaskForm
                    onSubmit={handleAddTaskSubmit}
                    onCancel={handleCancelAddTask}
                    isSubmitting={isSubmittingTask}
                    companyUsers={companyUsers}
                    projectId={projectId} // Pass projectId
                    key="add-task-form"
                />
            )}

            {editingTask && !usersLoading && ( // Render Edit form
                 <TaskForm
                    onSubmit={handleUpdateTaskSubmit}
                    onCancel={handleCancelEditTask}
                    isSubmitting={isSubmittingTask}
                    initialData={editingTask} // Pass task data to edit
                    companyUsers={companyUsers}
                    projectId={projectId} // Pass projectId (though form might not need it for update)
                    key={editingTask.id} // Ensure form remounts when editingTask changes
                />
            )}

            {/* Display form-specific errors */}
            {formError && <div style={errorBoxStyle}>{formError}</div>}
            {/* Display users loading state if trying to open form */}
            {usersLoading && isFormActive && <LoadingSpinner />}

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
                            <strong>{task.title}</strong> <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>({task.status.replace('_', ' ')})</span>
                            {task.assignee && <span style={{ fontSize: 'var(--font-size-sm)', fontStyle: 'italic' }}> - Assigned to: {task.assignee.name || task.assignee.email}</span>}
                            {task.dueDate && <span style={{ fontSize: 'var(--font-size-sm)' }}> - Due: {new Date(task.dueDate).toLocaleDateString()}</span>}
                            {task.notes && <p style={{ fontSize: 'var(--font-size-sm)', margin: 'var(--spacing-xs) 0 0 0', whiteSpace: 'pre-wrap' }}>{task.notes}</p>}

                             {/* Task Action Buttons */}
                             <div style={{marginTop: 'var(--spacing-sm)'}}>
                                <button
                                    onClick={() => handleEditTaskClick(task)}
                                    style={editItemButtonStyle}
                                    disabled={isFormActive || isSubmittingTask || usersLoading} // Disable if form open
                                    title="Edit Task"
                                >
                                    Edit
                                </button>
                                <button
                                     onClick={() => handleDeleteTaskClick(task.id, task.title)}
                                     style={deleteItemButtonStyle}
                                     disabled={isFormActive || isSubmittingTask || usersLoading} // Disable if form open
                                     title="Delete Task"
                                >
                                    Delete
                                </button>
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