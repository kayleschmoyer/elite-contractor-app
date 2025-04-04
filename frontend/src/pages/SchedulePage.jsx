// frontend/src/pages/SchedulePage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Use useNavigate for click handling
import { getProjects } from '../api/projectApi';
import { getCompanyScheduleTasks } from '../api/taskApi';
import LoadingSpinner from '../components/common/LoadingSpinner';

// --- react-big-calendar imports ---
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
// --- END react-big-calendar imports ---

// --- Styles ---
const errorBoxStyle = { color: 'var(--color-error)', marginBottom: 'var(--spacing-md)', padding: 'var(--spacing-md)', border: '1px solid var(--color-error)', borderRadius: 'var(--border-radius)', backgroundColor: 'rgba(220, 53, 69, 0.1)' };
// Style for calendar height - important for display
const calendarContainerStyle = { height: '70vh', marginTop: 'var(--spacing-md)', width: '100%' }; // Adjust height as needed
// --- End Styles ---


// --- Setup date-fns localizer ---
const locales = {
  'en-US': enUS,
};
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});
// --- END localizer setup ---


function SchedulePage() {
    // State holds events for the calendar { title, start, end, resource }
    const [calendarEvents, setCalendarEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate(); // Hook for navigation

    // Fetch, process, and format data for the calendar
    const fetchScheduleData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setCalendarEvents([]); // Clear previous events
        try {
            // Fetch projects and dated tasks concurrently
            const [projectsResult, tasksResult] = await Promise.all([
                getProjects(),
                getCompanyScheduleTasks() // Fetches only tasks with dates set
            ]);

            // 1. Process Projects: Filter for dates and map to common format
            const datedProjects = (projectsResult || [])
                .filter(p => p.startDate) // Require startDate for calendar display consistency
                .map(p => {
                    const start = new Date(p.startDate);
                    let end = p.endDate ? new Date(p.endDate) : new Date(start); // Use start if end is missing
                    if (isNaN(end.getTime()) || end < start) { end = new Date(start); } // Handle invalid or earlier end date
                     // Make sure end date is at least the start date
                     if (end.getTime() === start.getTime()) {
                        // Optional: Make it span the full day if start/end are same
                        // end.setHours(23, 59, 59, 999);
                     } else {
                         // For multi-day events, RBC typically includes the start day but excludes the end day
                         // Add one day to the end date if you want it to visually span *through* the end date
                         end.setDate(end.getDate() + 1);
                     }

                    return {
                        id: `proj-${p.id}`, // Unique ID for calendar event
                        title: `P: ${p.name}`, // Add prefix
                        start: start,
                        end: end,
                        allDay: true, // Assume all-day for simplicity
                        resource: { // Store original item data
                            type: 'project',
                            originalId: p.id,
                            projectId: p.id // Project's own ID acts as projectId here
                        }
                    };
                })
                 .filter(event => !isNaN(event.start.getTime())); // Ensure valid start date


            // 2. Process Tasks: Map to common format (already filtered by date on backend)
            const datedTasks = (tasksResult || [])
                 .filter(t => t.startDate) // Require startDate for calendar display consistency
                 .map(t => {
                    const start = new Date(t.startDate);
                    let end = t.endDate ? new Date(t.endDate) : new Date(start);
                    if (isNaN(end.getTime()) || end < start) { end = new Date(start); }
                     if (end.getTime() === start.getTime()) {
                        // end.setHours(23, 59, 59, 999);
                     } else {
                         end.setDate(end.getDate() + 1);
                     }

                    return {
                        id: `task-${t.id}`, // Unique ID for calendar event
                        title: `T: ${t.title}`, // Add prefix
                        start: start,
                        end: end,
                        allDay: true, // Assume all-day for simplicity
                        resource: { // Store original item data
                            type: 'task',
                            originalId: t.id,
                            projectId: t.projectId, // Include project ID for navigation
                        }
                    };
                })
                .filter(event => !isNaN(event.start.getTime())); // Ensure valid start date


            // 3. Combine Project and Task events
            const combinedEvents = [...datedProjects, ...datedTasks];

            // 4. Sort combined list (optional - calendar might sort itself, but good practice)
             combinedEvents.sort((a, b) => a.start - b.start);

            setCalendarEvents(combinedEvents);

        } catch (err) {
             // Full error handling
             const message = err.message || 'Failed to load schedule data.';
             setError(`Error loading schedule: ${message}`);
             console.error("Fetch Schedule Data Error:", err);
             setCalendarEvents([]); // Clear data on error
        } finally {
            setIsLoading(false);
        }
    }, []); // useCallback with empty dependency array

    // Fetch data on component mount
    useEffect(() => {
        fetchScheduleData();
    }, [fetchScheduleData]); // Depend on the stable callback


    // Handler for clicking on an event in the calendar
    const handleSelectEvent = useCallback((event) => {
        // Navigate to the project detail page using the stored projectId
        if (event.resource?.projectId) {
            navigate(`/projects/${event.resource.projectId}`);
        } else {
            console.warn("Could not navigate, missing project ID in event resource", event);
            // Optionally navigate to a default page or show an error
        }
    }, [navigate]); // Include navigate in dependency array


    // --- Render Logic ---
    return (
        <div>
            <h2>Schedule Calendar</h2>

            {/* Display loading or error state */}
            {isLoading && <LoadingSpinner />}
            {error && <div style={errorBoxStyle}>{error}</div>}

            {/* Display Calendar only when not loading and no error */}
            {!isLoading && !error && (
                <div style={calendarContainerStyle}> {/* Container controls the calendar height */}
                    <Calendar
                        localizer={localizer}
                        events={calendarEvents}
                        startAccessor="start" // Prop name in event object for start date
                        endAccessor="end"     // Prop name in event object for end date
                        style={{ height: '100%' }} // Make calendar fill the container height
                        views={['month', 'week', 'day', 'agenda']} // Enable different view options
                        onSelectEvent={handleSelectEvent} // Handle clicks on events
                        tooltipAccessor={(event) => event.title} // Show title on hover (basic tooltip)
                        // Consider adding eventPropGetter for custom styling based on type/status
                        // eventPropGetter={eventStyleGetter}
                    />
                </div>
            )}
        </div>
    );
}

export default SchedulePage;

/* Example for custom styling (optional, place outside component)
const eventStyleGetter = (event, start, end, isSelected) => {
    let style = {
        backgroundColor: event.resource?.type === 'project' ? '#3174ad' : '#5cb85c', // Blue for projects, Green for tasks
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
    };
    return {
        style: style
    };
};
*/