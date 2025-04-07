// frontend/src/pages/SchedulePage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom'; // Use alias for router link
import { getProjects } from '../api/projectApi';
import { getCompanyScheduleTasks } from '../api/taskApi';
import { getCompanyUsers } from '../api/userApi';
import LoadingSpinner from '../components/common/LoadingSpinner';

// --- MUI Imports ---
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button'; // Keep Button import for Clear button placeholder if needed
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import ClearIcon from '@mui/icons-material/Clear';
import IconButton from '@mui/material/IconButton';
// --- End MUI Imports ---

// --- react-big-calendar imports ---
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
// --- END react-big-calendar imports ---

// --- Styles ---
const calendarContainerStyle = { height: '70vh', marginTop: 'var(--spacing-md)', width: '100%' };
// --- End Styles ---

// Setup date-fns localizer
const locales = { 'en-US': enUS, };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales, });

// Function to determine event style
const eventStyleGetter = (event, start, end, isSelected) => {
    let newStyle = { borderRadius: '3px', opacity: 0.9, color: 'white', border: '0px', display: 'block', fontSize: '0.75em', padding: '1px 3px', cursor: 'pointer' };
    let backgroundColor = '#0d6efd'; // Default Project Blue
    const eventType = event.resource?.type; const eventStatus = event.resource?.status;
    if (eventType === 'task') { switch (eventStatus) { case 'DONE': backgroundColor = '#198754'; break; case 'IN_PROGRESS': backgroundColor = '#ffc107'; newStyle.color = '#333'; break; case 'BLOCKED': backgroundColor = '#dc3545'; break; case 'TODO': default: backgroundColor = '#6c757d'; break; } }
    else if (eventType === 'project') { switch (eventStatus) { case 'Completed': backgroundColor = '#20c997'; break; case 'Lead': backgroundColor = '#adb5bd'; newStyle.color = '#333'; break; case 'On Hold': case 'Cancelled': backgroundColor = '#fd7e14'; break; case 'In Progress': case 'Planning': default: backgroundColor = '#0d6efd'; break; } }
    newStyle.backgroundColor = backgroundColor; return { style: newStyle };
};

function SchedulePage() {
    // --- State (Copied from your version) ---
    const [allProjects, setAllProjects] = useState([]);
    const [allTasks, setAllTasks] = useState([]);
    const [companyUsers, setCompanyUsers] = useState([]);
    const [calendarEvents, setCalendarEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterAssigneeId, setFilterAssigneeId] = useState('');
    const [filterStartDate, setFilterStartDate] = useState(''); // Date filters
    const [filterEndDate, setFilterEndDate] = useState('');     // Date filters
    const [currentDate, setCurrentDate] = useState(new Date());
    const [currentView, setCurrentView] = useState('month');
    const navigate = useNavigate();
    // --- End State ---


    // --- Data Fetching (Copied from your version) ---
    const loadInitialData = useCallback(async () => {
        setIsLoading(true); setError(null); setAllProjects([]); setAllTasks([]); setCompanyUsers([]); setCalendarEvents([]);
        try { const [projectsResult, tasksResult, usersResult] = await Promise.all([ getProjects(), getCompanyScheduleTasks(), getCompanyUsers() ]); setAllProjects(projectsResult || []); setAllTasks(tasksResult || []); setCompanyUsers(usersResult || []); console.log("Initial data fetched"); }
        catch (err) { const message = err.message || 'Failed.'; setError(`Error loading data: ${message}`); console.error("Fetch Schedule/Users Data Error:", err); }
        finally { setIsLoading(false); }
    }, []);
    useEffect(() => { loadInitialData(); }, [loadInitialData]);


    // --- Effect for Filtering, Processing, and Sorting Data (Copied from your version, includes date filter logic) ---
    useEffect(() => {
        if (isLoading) return;
        setError(null);
        console.log("Processing data. Filters:", { filterAssigneeId, filterStartDate, filterEndDate });

        try {
            // 1. Map Projects
            const datedProjects = allProjects.filter(p => p.startDate).map(p => {const start = new Date(p.startDate); let end = p.endDate ? new Date(p.endDate) : new Date(start); if (isNaN(end.getTime()) || end < start) { end = new Date(start); } if (end >= start) {end.setDate(end.getDate() + 1);} return { id: `proj-${p.id}`, title: `P: ${p.name}`, start, end, allDay: true, resource: { ...p, type: 'project' } };}).filter(e => !isNaN(e.start.getTime()));
            // 2. Map Tasks
            const datedTasks = allTasks.filter(t => t.startDate).map(t => { const start = new Date(t.startDate); let end = t.endDate ? new Date(t.endDate) : new Date(start); if (isNaN(end.getTime()) || end < start) { end = new Date(start); } if (end >= start) {end.setDate(end.getDate() + 1);} return { id: `task-${t.id}`, title: `T: ${t.title}`, start, end, allDay: true, resource: { ...t, type: 'task' } };}).filter(e => !isNaN(e.start.getTime()));
            // 3. Combine items
            let combinedItems = [...datedProjects, ...datedTasks];
            console.log("Combined items before filters:", combinedItems.length);
            // 4. Apply Assignee Filter
            if (filterAssigneeId) { combinedItems = combinedItems.filter(item => (item.resource?.type === 'project' && item.resource.authorId === filterAssigneeId) || (item.resource?.type === 'task' && item.resource.assigneeId === filterAssigneeId)); console.log("Items after assignee filter:", combinedItems.length); }
            // 5. Apply Date Range Filter
            if (filterStartDate || filterEndDate) {
                 const fStart = filterStartDate ? new Date(filterStartDate + 'T00:00:00Z').getTime() : null; const fEnd = filterEndDate ? new Date(filterEndDate + 'T23:59:59Z').getTime() : null;
                 console.log("Filtering with dates:", { fStart: fStart ? new Date(fStart) : null, fEnd: fEnd ? new Date(fEnd) : null });
                 combinedItems = combinedItems.filter(item => {
                     const iStart = item.start?.getTime(); const originalEndDateStr = item.resource?.endDate?.split('T')[0]; const originalStartDateStr = item.resource?.startDate?.split('T')[0]; const effectiveEndDate = originalEndDateStr || originalStartDateStr; const iEnd = effectiveEndDate ? new Date(effectiveEndDate + 'T23:59:59Z').getTime() : iStart;
                     if (!iStart || isNaN(iStart)) return false; const endsBeforeFilterStarts = fStart && iEnd && (iEnd < fStart); const startsAfterFilterEnds = fEnd && (iStart > fEnd); return !(endsBeforeFilterStarts || startsAfterFilterEnds);
                 });
                 console.log("Items after DATE filter:", combinedItems.length);
            }
            // 6. Sort the FINAL list
            combinedItems.sort((a, b) => a.start - b.start);
            console.log("Final sorted/filtered events:", combinedItems);
            setCalendarEvents(combinedItems);
        } catch (processError) { console.error("Error processing schedule data:", processError); setError("Could not process schedule data."); setCalendarEvents([]); }
    }, [allProjects, allTasks, filterAssigneeId, filterStartDate, filterEndDate, isLoading]);


    // --- Calendar Interaction Handlers (Copied from your version) ---
    const handleSelectEvent = useCallback((event) => { const resource = event.resource; const projectId = resource?.type === 'project' ? resource.id : resource?.projectId; if (projectId) navigate(`/projects/${projectId}`); else console.warn("Missing projectId", event); }, [navigate]);
    const handleNavigate = useCallback((newDate) => { setCurrentDate(newDate); }, []);
    const handleViewChange = useCallback((newView) => { setCurrentView(newView); }, []);
    // --- End Handlers ---

    // --- Clear Date Filters (Copied from previous correct version) ---
    const clearDateFilters = () => {
        setFilterStartDate('');
        setFilterEndDate('');
    };

    // --- Render Logic ---
    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Schedule Calendar
            </Typography>

             {/* --- MUI Filter Controls --- */}
            <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                     {/* Assignee Filter (Copied from your version) */}
                     <FormControl size="small" sx={{ minWidth: 180 }}>
                        <InputLabel id="assignee-filter-label">Assigned To / Author</InputLabel>
                        <Select
                            labelId="assignee-filter-label" id="filterAssignee" value={filterAssigneeId}
                            label="Assigned To / Author" onChange={(e) => setFilterAssigneeId(e.target.value)}
                            disabled={isLoading || companyUsers.length === 0} >
                            <MenuItem value=""><em>All Users</em></MenuItem>
                            {companyUsers.map(user => (<MenuItem key={user.id} value={user.id}>{user.name || user.email}</MenuItem>))}
                        </Select>
                     </FormControl>

                     {/* --- Date Range Filters (Modified) --- */}
                     <TextField
                        label="Items Starting From" // Changed label slightly
                        type="date" size="small"
                        InputLabelProps={{ shrink: true }}
                        id="filterStart" name="filterStart"
                        value={filterStartDate}
                        onChange={(e) => setFilterStartDate(e.target.value)} // <-- Added onChange
                        disabled={isLoading} // <-- Removed hardcoded disabled
                        sx={{ width: 160 }}
                     />
                      <TextField
                        label="Items Starting To" // Changed label slightly
                        type="date" size="small"
                        InputLabelProps={{ shrink: true }}
                        id="filterEnd" name="filterEnd"
                        value={filterEndDate}
                        onChange={(e) => setFilterEndDate(e.target.value)} // <-- Added onChange
                        disabled={isLoading} // <-- Removed hardcoded disabled
                        sx={{ width: 160 }}
                     />
                     {/* Use functional Clear button */}
                     <Tooltip title="Clear Date Filters">
                        <span> {/* Span helps with Tooltip when button is disabled */}
                            <IconButton onClick={clearDateFilters} size="small" disabled={!filterStartDate && !filterEndDate}>
                                <ClearIcon />
                            </IconButton>
                         </span>
                    </Tooltip>
                     {/* --- End Date Filters --- */}
                </Box>
            </Paper>

            {/* Loading / Error */}
            {isLoading && <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>}
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {/* Calendar Display */}
            {!isLoading && !error && (
                <div style={calendarContainerStyle}>
                    <Calendar /* Calendar props remain the same */
                         localizer={localizer} events={calendarEvents} startAccessor="start" endAccessor="end"
                         style={{ height: '100%' }} views={['month', 'week', 'day', 'agenda']} date={currentDate}
                         view={currentView} onNavigate={handleNavigate} onView={handleViewChange}
                         onSelectEvent={handleSelectEvent} tooltipAccessor={(event) => event.title}
                         eventPropGetter={eventStyleGetter}
                     />
                </div>
            )}
        </Container>
    );
}

export default SchedulePage;