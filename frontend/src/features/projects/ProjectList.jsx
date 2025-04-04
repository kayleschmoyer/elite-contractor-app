// frontend/src/features/projects/ProjectList.jsx
import React, { useState, useEffect } from 'react';
import { getProjects } from '../../api/projectApi';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx'; // Create this later

function ProjectList() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await getProjects();
                setProjects(data);
            } catch (err) {
                setError('Failed to load projects. Please try again later.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []); // Empty dependency array means this runs once on mount

    if (loading) {
        // You'll need to create a LoadingSpinner component
        // return <LoadingSpinner />;
        return <div>Loading projects...</div>;
    }

    if (error) {
        return <div style={{ color: 'var(--color-error)' }}>{error}</div>;
    }

    return (
        <div>
            <h2>Projects</h2>
            {projects.length === 0 ? (
                <p>No projects found.</p>
            ) : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {projects.map((project) => (
                        <li key={project.id} style={{ marginBottom: 'var(--spacing-md)', padding: 'var(--spacing-md)', border: `1px solid var(--color-border)`, borderRadius: 'var(--border-radius)' }}>
                            <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-xs)' }}>{project.name}</h3>
                            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-xs)'}}>Client: {project.client}</p>
                            <p style={{ fontStyle: 'italic' }}>Status: {project.status}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default ProjectList;