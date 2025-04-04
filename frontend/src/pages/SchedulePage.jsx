// frontend/src/pages/SchedulePage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getProjects } from '../api/projectApi'; // API for projects
import { getCompanyScheduleTasks } from '../api/taskApi'; // API for dated tasks
import LoadingSpinner from '../components/common/LoadingSpinner';

// --- Styles ---
const errorBoxStyle = { color: 'var(--color-error)', marginBottom: 'var(--spacing-md)', padding: 'var(--spacing-md)', border: '1px solid var(--color-error)', borderRadius: 'var(--border-radius)', backgroundColor: 'rgba(220, 53, 69, 0.1)' };
const scheduleListStyle = { listStyle: 'none', padding: 0 };
const scheduleItemStyle = { border: '1px solid var(--color-border)', padding: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)', borderRadius: 'var(--border-radius)'};
const itemHeaderStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xs)'};
const itemTypeStyle = { fontWeight: 'bold', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginRight: 'var(--spacing-sm)'};
const itemTitleStyle = { fontSize: 'var(--font-size-lg)', fontWeight: 'bold'};
const itemLinkStyle = { textDecoration: 'none', color: 'inherit' };
const itemMetaStyle = { fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: 'var(--spacing-xs)'};
const dateStyle = { marginRight: 'var(--spacing-md)'};
// --- End Styles ---

function SchedulePage() {
    // State holds combined list of { type: 'project'|'task', ...data }
    const [scheduledItems, setScheduledItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch, process, and sort data
    const fetchScheduleData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Fetch projects and dated tasks concurrently
            const [projectsResult, tasksResult] = await Promise.all([
                getProjects(),
                getCompanyScheduleTasks() // Fetches only tasks with dates set
            ]);

            // 1. Process Projects: Filter for dates and map to common format
            const datedProjects = (projectsResult || [])
                .filter(p => p.startDate || p.endDate)
                .map(p => ({
                    id: p.id,
                    type: 'project',
                    title: p.name, // Use 'title' for common sorting/display
                    startDate: p.startDate,
                    endDate: p.endDate,
                    status: p.status, // Include status
                    related: { clientName: p.client?.name }, // Add related info
                }));

            // 2. Process Tasks: Map to common format (already filtered by date on backend)
            const datedTasks = (tasksResult || [])
                .map(t => ({
                    id: t.id,
                    type: 'task',
                    title: t.title,
                    startDate: t.startDate,
                    endDate: t.endDate, // Was dueDate in task model previously
                    status: t.status, // Include status
                    related: { // Add related info
                        projectId: t.projectId, // Need projectId for linking
                        projectName: t.project?.name,
                        assigneeName: t.assignee?.name || t.assignee?.email
                    }
                }));

            // 3. Combine Project and Task items
            const combinedItems = [...datedProjects, ...datedTasks];

            // 4. Sort combined list chronologically by start date (nulls last), then end date
            combinedItems.sort((a, b) => {
                const dateA = a.startDate ? new Date(a.startDate) : null;
                const dateB = b.startDate ? new Date(b.startDate) : null;

                if (dateA && dateB) { // Both have start dates
                    if (dateA.getTime() !== dateB.getTime()) return dateA - dateB;
                    // If start dates are same, sort by end date (nulls last)
                    const endDateA = a.endDate ? new Date(a.endDate) : null;
                    const endDateB = b.endDate ? new Date(b.endDate) : null;
                    if (endDateA && endDateB) return endDateA - endDateB;
                    if (endDateA && !endDateB) return -1;
                    if (!endDateA && endDateB) return 1;
                    return 0;
                }
                if (dateA && !dateB) return -1; // A comes first
                if (!dateA && dateB) return 1;  // B comes first

                // If neither has start date, sort by end date (nulls last)
                const endDateA = a.endDate ? new Date(a.endDate) : null;
                const endDateB = b.endDate ? new Date(b.endDate) : null;
                if (endDateA && endDateB) return endDateA - endDateB;
                if (endDateA && !endDateB) return -1;
                if (!endDateA && endDateB) return 1;
                return 0; // Keep original order if no dates differ
            });

            setScheduledItems(combinedItems);

        } catch (err) {
            const message = err.message || 'Failed to load schedule data.';
            setError(`Error loading schedule: ${message}`);
            console.error("Fetch Schedule Data Error:", err);
            setScheduledItems([]); // Clear data on error
        } finally {
            setIsLoading(false);
        }
    }, []); // useCallback with empty dependency array

    // Fetch data on component mount
    useEffect(() => {
        fetchScheduleData();
    }, [fetchScheduleData]); // Depend on the stable callback


    return (
        <div>
            <h2>Schedule / Dated Items</h2>

            {isLoading && <LoadingSpinner />}
            {error && <div style={errorBoxStyle}>{error}</div>}

            {!isLoading && !error && (
                <div>
                    {scheduledItems.length === 0 ? (
                        <p>No projects or tasks with start or end dates found.</p>
                    ) : (
                        <ul style={scheduleListStyle}>
                           {scheduledItems.map(item => (
                               <li key={`${item.type}-${item.id}`} style={scheduleItemStyle}> {/* Unique key */}
                                   <div style={itemHeaderStyle}>
                                        {/* Item Title (Link to Project Detail) */}
                                        <span style={itemTitleStyle}>
                                            {item.type === 'project' ? (
                                                <Link to={`/projects/${item.id}`} style={itemLinkStyle}>
                                                    {item.title}
                                                </Link>
                                            ) : (
                                                // Task links back to its project detail page for now
                                                <Link to={`/projects/${item.related.projectId}`} style={itemLinkStyle}>
                                                    {item.title}
                                                </Link>
                                            )}
                                        </span>
                                        {/* Item Type Badge */}
                                        <span style={itemTypeStyle}>
                                            {item.type === 'project' ? 'Project' : 'Task'}
                                        </span>
                                   </div>

                                   {/* Item Details (Client/Project/Assignee/Status) */}
                                   <div style={itemMetaStyle}>
                                        {item.type === 'project' && (
                                            <span>Client: {item.related.clientName || 'N/A'}</span>
                                        )}
                                        {item.type === 'task' && (
                                            <span>Project: {item.related.projectName || 'N/A'}</span>
                                        )}
                                        <span style={{ marginLeft: 'var(--spacing-md)' }}>Status: {item.status}</span>
                                        {item.type === 'task' && item.related.assigneeName && (
                                            <span style={{ marginLeft: 'var(--spacing-md)' }}>Assignee: {item.related.assigneeName}</span>
                                        )}
                                   </div>

                                   {/* Dates */}
                                   <div style={{marginTop: 'var(--spacing-sm)'}}>
                                       <span style={dateStyle}>
                                           Start: {item.startDate ? new Date(item.startDate).toLocaleDateString() : 'Not Set'}
                                       </span>
                                       <span style={dateStyle}>
                                           End: {item.endDate ? new Date(item.endDate).toLocaleDateString() : 'Not Set'}
                                       </span>
                                   </div>
                               </li>
                           ))}
                       </ul>
                    )}
                </div>
            )}
        </div>
    );
}

export default SchedulePage;