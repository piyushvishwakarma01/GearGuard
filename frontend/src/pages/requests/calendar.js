import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/layout/Layout';
import api from '../../lib/api';
import { toast } from 'react-hot-toast';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import useAuthStore from '../../store/authStore';
import { ROLES } from '../../lib/constants';

export default function CalendarPage() {
    const router = useRouter();
    const user = useAuthStore((state) => state.user);
    const calendarRef = useRef(null);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [teams, setTeams] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState('');
    const [selectedEvent, setSelectedEvent] = useState(null);

    useEffect(() => {
        if (user && user.role === ROLES.MANAGER) {
            fetchTeams();
        }
        fetchCalendarEvents();
    }, [user, selectedTeam]);

    const fetchTeams = async () => {
        try {
            const response = await api.get('/api/teams');
            setTeams(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch teams:', error);
        }
    };

    const fetchCalendarEvents = async (start, end) => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (start) params.append('start_date', start);
            if (end) params.append('end_date', end);
            if (selectedTeam) params.append('maintenance_team_id', selectedTeam);

            const response = await api.get(`/api/requests/calendar?${params.toString()}`);
            const calendarEvents = (response.data.data || []).map(event => ({
                id: event.id,
                title: event.subject || event.equipment_name,
                start: event.scheduled_date,
                extendedProps: {
                    description: event.description,
                    equipment_name: event.equipment_name,
                    team_name: event.team_name,
                    team_id: event.team_id,
                    status: event.status,
                    assigned_technician_name: event.assigned_technician_name,
                    duration_hours: event.duration_hours,
                },
                backgroundColor: getTeamColor(event.team_id),
                borderColor: getTeamColor(event.team_id),
            }));
            setEvents(calendarEvents);
        } catch (error) {
            toast.error('Failed to fetch calendar events');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const getTeamColor = (teamId) => {
        const colors = ['#0284c7', '#059669', '#d97706', '#dc2626', '#7c3aed', '#db2777'];
        if (!teamId) return colors[0];
        const index = teamId.charCodeAt(0) % colors.length;
        return colors[index];
    };

    const handleEventClick = (info) => {
        setSelectedEvent({
            id: info.event.id,
            title: info.event.title,
            start: info.event.start,
            ...info.event.extendedProps,
        });
    };

    const handleDatesSet = (dateInfo) => {
        const start = dateInfo.startStr.split('T')[0];
        const end = dateInfo.endStr.split('T')[0];
        fetchCalendarEvents(start, end);
    };

    const getStatusBadge = (status) => {
        const badges = {
            'New': 'badge-new',
            'In Progress': 'badge-in-progress',
            'Repaired': 'badge-repaired',
            'Scrap': 'badge-scrap',
        };
        return badges[status] || 'badge-new';
    };

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Preventive Maintenance Calendar</h1>
                        <p className="mt-1 text-sm text-gray-600">
                            View and manage scheduled preventive maintenance
                        </p>
                    </div>
                    {user?.role === ROLES.MANAGER && teams.length > 0 && (
                        <select
                            className="input w-auto"
                            value={selectedTeam}
                            onChange={(e) => setSelectedTeam(e.target.value)}
                        >
                            <option value="">All Teams</option>
                            {teams.map(team => (
                                <option key={team.id} value={team.id}>{team.name}</option>
                            ))}
                        </select>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Calendar */}
                    <div className="lg:col-span-3 card">
                        {loading && events.length === 0 ? (
                            <div className="flex items-center justify-center h-96">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                            </div>
                        ) : (
                            <FullCalendar
                                ref={calendarRef}
                                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                                initialView="dayGridMonth"
                                headerToolbar={{
                                    left: 'prev,next today',
                                    center: 'title',
                                    right: 'dayGridMonth,timeGridWeek,timeGridDay',
                                }}
                                events={events}
                                eventClick={handleEventClick}
                                datesSet={handleDatesSet}
                                height="auto"
                                eventDisplay="block"
                            />
                        )}
                    </div>

                    {/* Event Details Panel */}
                    <div className="lg:col-span-1">
                        {selectedEvent ? (
                            <div className="card sticky top-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-semibold text-gray-900">Event Details</h2>
                                    <button onClick={() => setSelectedEvent(null)} className="text-gray-400 hover:text-gray-600">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm text-gray-500">Title</p>
                                        <p className="font-medium text-gray-900">{selectedEvent.title}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Equipment</p>
                                        <p className="font-medium text-gray-900">{selectedEvent.equipment_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Scheduled Date</p>
                                        <p className="font-medium text-gray-900">
                                            {selectedEvent.start ? new Date(selectedEvent.start).toLocaleDateString() : 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Status</p>
                                        <span className={`badge ${getStatusBadge(selectedEvent.status)}`}>
                                            {selectedEvent.status}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Team</p>
                                        <p className="font-medium text-gray-900">{selectedEvent.team_name}</p>
                                    </div>
                                    {selectedEvent.assigned_technician_name && (
                                        <div>
                                            <p className="text-sm text-gray-500">Assigned To</p>
                                            <p className="font-medium text-gray-900">{selectedEvent.assigned_technician_name}</p>
                                        </div>
                                    )}
                                    {selectedEvent.description && (
                                        <div>
                                            <p className="text-sm text-gray-500">Description</p>
                                            <p className="text-gray-700 text-sm">{selectedEvent.description}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="card text-center py-12">
                                <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <p className="text-gray-500">Click an event to view details</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}

