// frontend/src/features/projects/ProjectList.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link as RouterLink } from 'react-router-dom'; // Use alias for router link
// Import Project APIs
import { getProjects, deleteProject, createProject, updateProject } from '../../api/projectApi';
// Import Client API
import { getCompanyClients } from '../../api/clientApi';
// Import Components
import ProjectForm from './ProjectForm'; // Assuming ProjectForm is in the same directory
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx'; // Adjust path if needed

// --- MUI Imports ---
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link'; // MUI Link
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert'; // For displaying errors
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
// --- End MUI Imports ---

// Style for the project title link
const titleLinkStyle = {
    textDecoration: 'none',
    color: 'inherit'
};

function ProjectList() {
    // --- State Variables ---
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [clients, setClients] = useState([]);
    const [clientsLoading, setClientsLoading] = useState(false);
    const [clientsError, setClientsError] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    // --- End State Variables ---

    // --- Fetch Projects ---
    const fetchProjects = useCallback(async () => {
        // No need to set loading here as initial load state handles it
        try {
            setError(null); // Clear previous errors
            const data = await getProjects();
            setProjects(data || []); // Ensure projects is always an array
        } catch (err) {
            const message = err.response?.data?.message || err.message || 'Failed to load projects.';
            setError(`Failed to load projects: ${message}`);
            console.error("Fetch Projects Error:", err);
            setProjects([]); // Set empty array on error
        } finally {
            // Only set initial loading false once
            if (loading) setLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading]); // Only run when loading flag changes (effectively once on mount)

    // Initial project fetch
    useEffect(() => {
        setLoading(true); // Trigger initial load
        fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run only once on mount

    // --- Function to Fetch Clients for Form ---
    const fetchClientsForForm = useCallback(async () => {
        if (clientsLoading) return false; // Prevent concurrent fetches
        setClientsLoading(true);
        setClientsError(null);
        try {
            console.log("Fetching clients for project form...");
            const clientData = await getCompanyClients();
            setClients(clientData || []);
            console.log("Clients fetched for project form:", clientData);
            return true; // Indicate success
        } catch (error) {
            const message = error.message || 'Could not load client list.';
            setClientsError(`Error loading clients for dropdown: ${message}`);
            console.error("Fetch Clients Error:", error);
            setClients([]);
            return false; // Indicate failure
        } finally {
            setClientsLoading(false);
        }
    }, [clientsLoading]); // Dependency array

    // --- Dialog/Form Open/Close Handlers ---
    const handleOpenDialog = async (projectToEdit = null) => {
        setError(null); // Clear list errors
        setClientsError(null); // Clear previous form errors
        const success = await fetchClientsForForm(); // Fetch clients first
        if (success) {
            setEditingProject(projectToEdit); // Set null for 'Create', project obj for 'Edit'
            setDialogOpen(true); // THEN open the dialog
        } else {
            // Show client fetch error in main error display if we couldn't open dialog
            setError(clientsError || "Failed to load data needed for the form.");
        }
    };

    // This single function handles closing the dialog for ANY reason (cancel, submit success, backdrop click)
    const handleCloseDialog = () => {
        setDialogOpen(false);
        // Short delay allows dialog close animation before clearing data/state
        setTimeout(() => {
             setEditingProject(null);
             setClientsError(null);
             setClients([]);
             setIsSubmitting(false); // Ensure submitting state is reset
        }, 300); // Adjust timing if needed
    };

    // --- Form Submit Handlers ---
    const handleCreateSubmit = async (formData) => {
        setIsSubmitting(true); setClientsError(null); // Use clientsError for form errors
        try {
            const newProject = await createProject(formData);
            setProjects(prevProjects => [newProject, ...prevProjects]);
            handleCloseDialog(); // Close dialog on success
        } catch (err) {
             const message = err.response?.data?.message || err.message || 'Check input.';
             setClientsError(`Failed to create project: ${message}`); // Show error inside dialog
             console.error("Create Error:", err);
        } finally {
             setIsSubmitting(false);
        }
    };

    const handleUpdateSubmit = async (formData) => {
        if (!editingProject) return;
        setIsSubmitting(true); setClientsError(null); // Use clientsError for form errors
        try {
            const updatedProjectData = await updateProject(editingProject.id, formData);
            setProjects(prevProjects =>
                prevProjects.map(p => p.id === editingProject.id ? updatedProjectData : p)
            );
            handleCloseDialog(); // Close dialog on success
        } catch (err) {
             const message = err.response?.data?.message || err.message || 'Check input.';
             setClientsError(`Failed to update project: ${message}`); // Show error inside dialog
             console.error("Update Error:", err);
        } finally {
             setIsSubmitting(false);
        }
    };

    // --- Delete Handler ---
     const handleDelete = async (id, name) => {
        if (!window.confirm(`Are you sure you want to delete project: "${name}"?`)) return;
        // Prevent delete if dialog is open or loading clients for it
        if (dialogOpen || clientsLoading || isSubmitting) return;
        setError(null); // Clear main page errors
        try {
             await deleteProject(id);
             setProjects(prev => prev.filter(p => p.id !== id));
        } catch (err) {
             const message = err.response?.data?.message || err.message || 'Try again.';
             // Show delete error in main page error area
             setError(`Failed to delete project: ${message}`);
             console.error("Delete Error:", err);
        }
     };

    // --- Rendering Logic ---
    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" component="h1">
                    Projects
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog(null)} // Open dialog for create
                    disabled={clientsLoading || dialogOpen}
                >
                    {clientsLoading ? 'Loading...' : 'Create Project'}
                </Button>
            </Box>

            {/* Display general page errors */}
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {/* Loading indicator */}
            {loading && <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>}

            {/* Grid container for project cards */}
            {!loading && !error && projects.length === 0 && (
                <Typography sx={{ mt: 3 }}>No projects found. Create one using the button above!</Typography>
            )}
            {!loading && !error && projects.length > 0 && (
                <Grid container spacing={3}>
                    {projects.map((project) => (
                        <Grid item xs={12} sm={6} md={4} key={project.id}>
                            {/* Removed the 'item' prop as it's deprecated/unnecessary */}
                            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Typography gutterBottom variant="h6" component="h2">
                                        <Link component={RouterLink} to={`/projects/${project.id}`} sx={titleLinkStyle}>
                                            {project.name}
                                        </Link>
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        Client: {project.client?.name || 'N/A'}
                                    </Typography>
                                     <Typography variant="body2" color="text.secondary" >
                                        Status: {project.status}
                                    </Typography>
                                     {/* Optional date display */}
                                     {(project.startDate || project.endDate) &&
                                         <Typography variant="caption" display="block" color="text.secondary" sx={{mt: 1}}>
                                             {project.startDate ? `Start: ${new Date(project.startDate).toLocaleDateString()}` : ''}
                                             {(project.startDate && project.endDate) ? ` | ` : ''}
                                             {project.endDate ? `End: ${new Date(project.endDate).toLocaleDateString()}` : ''}
                                         </Typography>
                                      }
                                </CardContent>
                                <CardActions sx={{ justifyContent: 'flex-end' }}>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleOpenDialog(project)} // Open dialog for edit
                                        disabled={clientsLoading || dialogOpen}
                                        title="Edit Project"
                                    >
                                        <EditIcon fontSize="small"/>
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleDelete(project.id, project.name)}
                                        disabled={clientsLoading || dialogOpen || isSubmitting}
                                        title="Delete Project"
                                        color="error"
                                    >
                                        <DeleteIcon fontSize="small"/>
                                    </IconButton>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Dialog for Create/Edit Project Form */}
            {/* Render Dialog only when needed, controlled by dialogOpen state */}
            {dialogOpen && (
                 <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                    <DialogTitle>{editingProject ? 'Edit Project' : 'Create New Project'}</DialogTitle>
                    <DialogContent>
                        {/* Display form-specific errors */}
                        {clientsError && <Alert severity="error" sx={{ mb: 2 }}>{clientsError}</Alert>}
                        {/* Show spinner if clients are loading FOR the form */}
                        {clientsLoading ? (
                             <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>
                        ) : (
                            // Render the form when clients are loaded
                            <ProjectForm
                                key={editingProject ? editingProject.id : 'create'} // Important for form reset
                                initialData={editingProject || {}}
                                onSubmit={editingProject ? handleUpdateSubmit : handleCreateSubmit}
                                onCancel={handleCloseDialog} // Use handleCloseDialog for cancel button
                                isSubmitting={isSubmitting}
                                clients={clients}
                            />
                        )}
                    </DialogContent>
                    {/* DialogActions can be added here if form doesn't have own buttons */}
                 </Dialog>
            )}

        </Container>
    );
}

export default ProjectList;