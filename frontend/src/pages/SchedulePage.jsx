// frontend/src/pages/SchedulePage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { getProjects } from '../api/projectApi';
import { getCompanyScheduleTasks } from '../api/taskApi';
import { getCompanyUsers } from '../api/userApi';
import LoadingSpinner from '../components/common/LoadingSpinner';

// --- MUI Imports ---
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button'; // <-- Added Button Import
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField'; // <-- Added TextField Import
import Typography from '@mui/material/Typography';
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
const errorBoxStyle = { /* Can likely remove this now using Alert */ };
const calendarContainerStyle = { height: '70vh', marginTop: 'var(--spacing-md)', width: '100%' };
// --- End Styles ---

// Setup date-fns localizer
const locales = { 'en-US': enUS, };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales, });

// Function to determine event style
const eventStyleGetter = (event, start, end, isSelected) => { /* ... function body same as before ... */ };

function SchedulePage() {
    // State variables remain the same
    const [allProjects, setAllProjects] = useState([]);
    const [allTasks, setAllTasks] = useState([]);
    const [companyUsers, setCompanyUsers] = useState([]);
    const [calendarEvents, setCalendarEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterAssigneeId, setFilterAssigneeId] = useState('');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [currentView, setCurrentView] = useState('month');
    const navigate = useNavigate();

    // Data Fetching and Processing Effects remain the same
    const loadInitialData = useCallback(async () => { /* ... function body same as before ... */ }, []);
    useEffect(() => { loadInitialData(); }, [loadInitialData]);
    useEffect(() => { /* ... processing effect logic remains the same ... */ }, [allProjects, allTasks, filterAssigneeId, isLoading]);

    // Calendar Interaction Handlers remain the same
    const handleSelectEvent = useCallback((event) => { /* ... function body same as before ... */ }, [navigate]);
    const handleNavigate = useCallback((newDate) => { setCurrentDate(newDate); }, []);
    const handleViewChange = useCallback((newView) => { setCurrentView(newView); }, []);


    // --- Render Logic ---
    return (
        // Use Container for overall padding and max-width
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Schedule Calendar
            </Typography>

             {/* --- MUI Filter Controls --- */}
            <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}> {/* Added flexWrap */}
                     <FormControl size="small" sx={{ minWidth: 180 }}>
                        <InputLabel id="assignee-filter-label">Assigned To</InputLabel>
                        <Select
                            labelId="assignee-filter-label"
                            id="filterAssignee"
                            value={filterAssigneeId}
                            label="Assigned To"
                            onChange={(e) => setFilterAssigneeId(e.target.value)}
                            disabled={isLoading || companyUsers.length === 0}
                        >
                            <MenuItem value=""><em>All Users</em></MenuItem> {/* Use em for italics */}
                            {companyUsers.map(user => (
                                <MenuItem key={user.id} value={user.id}>{user.name || user.email}</MenuItem>
                            ))}
                        </Select>
                     </FormControl>
                     {/* Placeholders for Date filter inputs using MUI TextField */}
                      <TextField label="Start Date From" type="date" size="small" InputLabelProps={{ shrink: true }} disabled sx={{ width: 160 }}/>
                      <TextField label="Start Date To" type="date" size="small" InputLabelProps={{ shrink: true }} disabled sx={{ width: 160 }}/>
                      <Button size="small" disabled>Filter Dates</Button>
                </Box>
            </Paper>
            {/* --- End Filter Controls --- */}


            {/* Loading / Error */}
            {isLoading && <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>}
            {/* Use Alert for errors */}
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {/* Calendar Display */}
            {!isLoading && !error && (
                <div style={calendarContainerStyle}>
                    <Calendar
                         localizer={localizer}
                         events={calendarEvents}
                         startAccessor="start"
                         endAccessor="end"
                         style={{ height: '100%' }}
                         views={['month', 'week', 'day', 'agenda']}
                         date={currentDate}
                         view={currentView}
                         onNavigate={handleNavigate}
                         onView={handleViewChange}
                         onSelectEvent={handleSelectEvent}
                         tooltipAccessor={(event) => event.title}
                         eventPropGetter={eventStyleGetter}
                     />
                </div>
            )}
        </Container>
    );
}

export default SchedulePage;