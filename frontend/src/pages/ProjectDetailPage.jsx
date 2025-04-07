// frontend/src/pages/ProjectDetailPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom'; // Import RouterLink

// --- MUI Imports ---
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link'; // MUI Link
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
// --- End MUI Imports ---

// API Imports
import { getProjectById } from '../api/projectApi';
import { getTasksByProjectId, createTask, updateTask, deleteTask } from '../api/taskApi';
import { getCompanyUsers } from '../api/userApi';

// Component Imports
import LoadingSpinner from '../components/common/LoadingSpinner'; // Keep for main load
import TaskForm from '../components/forms/TaskForm'; // Use the MUI-refactored TaskForm

// --- Remove old style constants ---
// const errorBoxStyle = { ... };
// const taskListStyle = { ... };
// const taskItemStyle = { ... };
// const addButtonStyle = { ... };
// const itemButtonStyle = { ... };
// const editItemButtonStyle = { ... };
// const deleteItemButtonStyle = { ... };
// const notesContainerStyle = { ... };
// const notesPreStyle = { ... };
// const detailTextStyle = { ... };
// const taskMetaStyle = { ... };
// const taskNotesStyle = { ... };
// --- End Remove Styles ---

function ProjectDetailPage() {
    const { id: projectId } = useParams();
    // --- State Variables (Keep existing state) ---
    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [isLoadingProject, setIsLoadingProject] = useState(true);
    const [isLoadingTasks, setIsLoadingTasks] = useState(true);
    const [error, setError] = useState(null);
    const [editingTask, setEditingTask] = useState(null);
    const [isSubmittingTask, setIsSubmittingTask] = useState(false);
    const [companyUsers, setCompanyUsers] = useState([]);
    const [formError, setFormError] = useState(null);
    const [usersLoading, setUsersLoading] = useState(false);
    // NEW: Dialog state for tasks
    const [taskDialogOpen, setTaskDialogOpen] = useState(false);
    // --- End State ---


    // --- Fetch Initial Project and Task Data (Keep existing logic) ---
    const loadData = useCallback(async () => {
        if (!projectId) { setError("Project ID not found."); setIsLoadingProject(false); setIsLoadingTasks(false); return; }
        setIsLoadingProject(true); setIsLoadingTasks(true); setError(null); setFormError(null);
        setProject(null); setTasks([]); setCompanyUsers([]); setTaskDialogOpen(false); setEditingTask(null); // Reset all
        try {
            const [projectData, taskData] = await Promise.all([ getProjectById(projectId), getTasksByProjectId(projectId) ]);
            setProject(projectData); setTasks(taskData || []);
        } catch (err) { const msg = err.message || 'Failed load.'; setError(msg); console.error("Load Data Error:", err); }
        finally { setIsLoadingProject(false); setIsLoadingTasks(false); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [projectId]);

    useEffect(() => { loadData(); }, [loadData]);

    // --- Fetch Users for Assignee Dropdown (Keep existing logic) ---
    const fetchUsersForForm = useCallback(async () => {
        if (usersLoading) return false; setUsersLoading(true); setFormError(null);
        try { const d = await getCompanyUsers(); setCompanyUsers(d || []); return true; }
        catch (e) { setFormError(e.message||'Could not load users.'); console.error("Fetch Users Error:",e); setCompanyUsers([]); return false; }
        finally { setUsersLoading(false); }
    }, [usersLoading]);

    // --- Task Dialog/Form Handlers ---
    const handleOpenTaskDialog = async (taskToEdit = null) => {
        setError(null); setFormError(null); // Clear errors
        const success = await fetchUsersForForm(); // Fetch users first
        if (success) {
            setEditingTask(taskToEdit); // Set null for Add, task obj for Edit
            setTaskDialogOpen(true); // Open dialog
        } else {
            setError(formError || "Failed to load data needed for task form."); // Show general error if user fetch fails
        }
    };

    const handleCloseTaskDialog = () => {
        setTaskDialogOpen(false);
        setTimeout(() => { // Delay allows animation
            setEditingTask(null);
            setFormError(null);
            setIsSubmittingTask(false);
            setCompanyUsers([]); // Clear user cache
        }, 300);
    };

    // Submit handler for BOTH Add and Edit Task form submission (called by form's onSubmit)
    const handleTaskFormSubmit = async (formData) => {
        setIsSubmittingTask(true); setFormError(null); setError(null);
        try {
            if (editingTask) { // UPDATE logic
                const { projectId: ignoredProjectId, ...updateData } = formData; // Exclude projectId
                const updatedTask = await updateTask(editingTask.id, updateData);
                setTasks(prev => prev.map(t => (t.id === editingTask.id ? updatedTask : t)));
                console.log("Task updated successfully");
            } else { // CREATE logic
                const newTask = await createTask(formData); // formData includes projectId from form
                setTasks(prev => [newTask, ...prev]); // Add to list
                console.log("Task created successfully");
            }
            handleCloseTaskDialog(); // Close dialog on success
        } catch (err) {
            const message = err.message || `Failed to ${editingTask ? 'update' : 'create'} task.`;
            setFormError(`Error: ${message}`); // Show error inside dialog
            console.error("Task Submit Error:", err);
        } finally {
            setIsSubmittingTask(false);
        }
    };

    // --- Delete Task Handler (Keep existing logic) ---
    const handleDeleteTaskClick = async (taskId, taskTitle) => {
        if (!window.confirm(`Are you sure you want to delete task: "${taskTitle}"?`)) return;
        if (taskDialogOpen || isSubmittingTask || usersLoading) return;
        setError(null); setFormError(null);
        try { await deleteTask(taskId); setTasks(prev => prev.filter(t => t.id !== taskId)); }
        catch (err) { const message = err.message || 'Failed.'; setError(`Error deleting task: ${message}`); console.error("Delete Task Error:", err); }
    };


    // --- Render Logic ---
    if (isLoadingProject) return <Container sx={{ textAlign: 'center', mt: 5 }}><CircularProgress /></Container>;
    if (error && !project) return <Container sx={{ mt: 4 }}><Alert severity="error">{error}</Alert></Container>;
    if (!project) return (
        <Container sx={{ mt: 4 }}>
            <Typography variant="h5" component="h2">Project Not Found</Typography>
            <Typography>Could not load details for this project.</Typography>
            <Button component={RouterLink} to="/projects" sx={{ mt: 2 }}>Back to Projects</Button>
        </Container>
    );

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {/* Display general page errors (e.g., delete error) */}
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {/* --- Project Details Section --- */}
            <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Project: {project.name}
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2, mb: 1 }}>
                     <Typography variant="body1"><strong>Status:</strong> {project.status}</Typography>
                     <Typography variant="body1"><strong>Client:</strong> {project.client?.name || 'N/A'}</Typography>
                     <Typography variant="body1">
                         <strong>Start Date:</strong> {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Not Set'}
                     </Typography>
                     <Typography variant="body1">
                         <strong>End Date:</strong> {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Not Set'}
                     </Typography>
                 </Box>
                 {project.address && <Typography variant="body1" sx={{mb:1}}><strong>Address:</strong> {project.address}</Typography>}
                 {project.notes &&
                    <Box sx={{ mb: 1 }}>
                        <Typography variant="body1"><strong>Notes:</strong></Typography>
                        {/* Use Typography for notes, respecting whitespace */}
                        <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', color: 'text.secondary' }}>
                            {project.notes}
                        </Typography>
                    </Box>
                 }
                {/* Add other project details using Typography */}
            </Paper>
            {/* --- End Project Details Section --- */}


            {/* --- Tasks Section --- */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, mt: 4 }}>
                 <Typography variant="h5" component="h2">Tasks</Typography>
                 <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenTaskDialog(null)} // Open dialog for create
                    disabled={taskDialogOpen || usersLoading}
                >
                   {usersLoading ? 'Loading...' : 'Add Task'}
                </Button>
            </Box>

            {/* Display Task form errors here */}
             {formError && !taskDialogOpen && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}

            {/* Task List Area */}
            {isLoadingTasks ? ( <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box> ) :
             tasks.length === 0 ? ( <Typography sx={{ mt: 2, fontStyle: 'italic' }}>No tasks found for this project yet.</Typography> ) :
             (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {tasks.map(task => (
                        // Hide task if its form is open in the dialog
                         editingTask?.id === task.id ? null : (
                        <Paper variant="outlined" sx={{ p: 2 }} key={task.id}>
                             <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                 <Box>
                                     <Typography variant="subtitle1" component="div" sx={{ fontWeight: 'bold' }}>{task.title}</Typography>
                                     <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>({task.status.replace('_', ' ')})</Typography>
                                     {task.assignee && <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>Assignee: {task.assignee.name || task.assignee.email}</Typography>}
                                     {task.startDate && <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>Start: {new Date(task.startDate).toLocaleDateString()}</Typography>}
                                     {task.endDate && <Typography variant="caption" color="text.secondary">End/Due: {new Date(task.endDate).toLocaleDateString()}</Typography>}
                                 </Box>
                                 <Box sx={{ whiteSpace: 'nowrap', mt: -1, mr: -1 }}> {/* Keep buttons together */}
                                      <IconButton size="small" onClick={() => handleEditTaskClick(task)} disabled={taskDialogOpen || isSubmittingTask || usersLoading} title="Edit Task"> <EditIcon fontSize="small"/> </IconButton>
                                      <IconButton size="small" onClick={() => handleDeleteTaskClick(task.id, task.title)} disabled={taskDialogOpen || isSubmittingTask || usersLoading} title="Delete Task" color="error"> <DeleteIcon fontSize="small"/> </IconButton>
                                 </Box>
                             </Box>
                             {task.notes && <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>{task.notes}</Typography>}
                        </Paper>
                         )
                    ))}
                </Box>
             )}
            {/* --- End Tasks Section --- */}

            {/* Dialog for Add/Edit Task Form */}
            {/* Render Dialog only when needed */}
            <Dialog open={taskDialogOpen} onClose={handleCloseTaskDialog} maxWidth="sm" fullWidth>
                <DialogTitle>{editingTask ? 'Edit Task' : 'Add New Task'}</DialogTitle>
                <DialogContent>
                     {/* Display form-specific errors */}
                    {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
                     {/* Show spinner if users are loading specifically FOR the form */}
                    {usersLoading ? (
                         <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>
                    ) : (
                        <TaskForm
                            key={editingTask ? editingTask.id : 'add-task'} // Reset form on change
                            initialData={editingTask || {}}
                            onSubmit={handleTaskFormSubmit} // Unified submit handler
                            onCancel={handleCloseTaskDialog} // Unified close handler
                            isSubmitting={isSubmittingTask}
                            companyUsers={companyUsers}
                            projectId={projectId} // Always pass project ID
                        />
                    )}
                </DialogContent>
            </Dialog>

        </Container>
    );
}

export default ProjectDetailPage;