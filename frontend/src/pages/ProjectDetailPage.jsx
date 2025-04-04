// frontend/src/pages/ProjectDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom'; // useParams to get ID from URL
import { getProjectById } from '../api/projectApi'; // API to get project details
import { getTasksByProjectId } from '../api/taskApi'; // API to get tasks
import LoadingSpinner from '../components/common/LoadingSpinner'; // Adjust path

// --- Styles --- (Add basic styles as needed)
const errorBoxStyle = { /* ... copy from other pages ... */ };
const taskListStyle = { listStyle: 'none', padding: 0, marginTop: 'var(--spacing-md)' };
const taskItemStyle = { border: '1px solid var(--color-border)', padding: 'var(--spacing-md)', marginBottom: 'var(--spacing-sm)', borderRadius: 'var(--border-radius)'};
// ---

function ProjectDetailPage() {
    const { id: projectId } = useParams(); // Get the project ID from the URL parameter ':id'
    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [isLoadingProject, setIsLoadingProject] = useState(true);
    const [isLoadingTasks, setIsLoadingTasks] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            if (!projectId) {
                setError("Project ID not found in URL.");
                setIsLoadingProject(false);
                setIsLoadingTasks(false);
                return;
            }

            setIsLoadingProject(true);
            setIsLoadingTasks(true);
            setError(null);

            try {
                // Fetch project details and tasks in parallel
                const [projectData, taskData] = await Promise.all([
                    getProjectById(projectId),
                    getTasksByProjectId(projectId)
                ]);
                setProject(projectData);
                setTasks(taskData);
            } catch (err) {
                const message = err.message || 'Failed to load project data or tasks.';
                setError(message);
                console.error("Error loading project detail/tasks:", err);
                setProject(null); // Clear project data on error
                setTasks([]); // Clear tasks on error
            } finally {
                setIsLoadingProject(false);
                setIsLoadingTasks(false);
            }
        };

        loadData();
    }, [projectId]); // Re-run if projectId changes

    // --- Render Logic ---
    if (isLoadingProject) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <div style={errorBoxStyle}>{error}</div>;
    }

    if (!project) {
        // Handle case where project fetch succeeded but returned null (e.g., not found, or auth error caught by API service)
        return <div><h2>Project Not Found</h2><p>Could not load details for this project.</p><Link to="/projects">Back to Projects</Link></div>;
    }

    // Display Project Details and Task List
    return (
        <div>
            <h2>Project: {project.name}</h2>
            <p><strong>Status:</strong> {project.status}</p>
            <p><strong>Client:</strong> {project.client?.name || 'N/A'}</p>
            {project.address && <p><strong>Address:</strong> {project.address}</p>}
            {project.notes && <p><strong>Notes:</strong> <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{project.notes}</pre></p>}
            {/* Add other project details */}

            <hr style={{ margin: 'var(--spacing-xl) 0' }} />

            <h3>Tasks for this Project</h3>
            {/* TODO: Add "Add Task" Button Here */}
            <button disabled>+ Add New Task</button>

            {isLoadingTasks ? (
                <LoadingSpinner />
            ) : tasks.length === 0 ? (
                <p>No tasks found for this project yet.</p>
            ) : (
                <ul style={taskListStyle}>
                    {tasks.map(task => (
                        <li key={task.id} style={taskItemStyle}>
                            <strong>{task.title}</strong> <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>({task.status})</span>
                            {task.assignee && <span style={{ fontSize: 'var(--font-size-sm)', fontStyle: 'italic' }}> - Assigned to: {task.assignee.name}</span>}
                            {task.dueDate && <span style={{ fontSize: 'var(--font-size-sm)' }}> - Due: {new Date(task.dueDate).toLocaleDateString()}</span>}
                            {task.notes && <p style={{ fontSize: 'var(--font-size-sm)', margin: 'var(--spacing-xs) 0 0 0' }}>{task.notes}</p>}
                            {/* TODO: Add Edit/Delete buttons for tasks */}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default ProjectDetailPage;