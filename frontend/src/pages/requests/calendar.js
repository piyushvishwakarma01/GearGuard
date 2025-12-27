import { useState, useEffect, useRef } from 'react';
import Layout from '../../components/layout/Layout';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import api from '../../lib/api';
import { useRouter } from 'next/router';

export default function CalendarPage() {
    const router = useRouter();
    const calendarRef = useRef(null);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCalendarEvents();
    }, []);

    const fetchCalendarEvents = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/requests/calendar');

            // Transform to FullCalendar format
            const calendarEvents = response.data.data.map((request) => ({
                id: request.id,
                title: request.title,
                start: request.start,
                end: request.end || request.start,
                backgroundColor: request.backgroundColor,
                borderColor: request.borderColor,
                extendedProps: {
                    status: request.status,
                    equipment_name: request.equipment_name,
                    team_name: request.team_name,
                    technician_name: request.technician_name,
                    is_overdue: request.is_overdue,
                },
            }));

            setEvents(calendarEvents);
        } catch (error) {
            console.error('Failed to fetch calendar events:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEventClick = (info) => {
        router.push(`/requests/${info.event.id}`);
    };

    const handleDateClick = (info) => {
        // Create new preventive request with selected date
        router.push(`/requests/create?type=Preventive&date=${info.dateStr}`);
    };

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Preventive Maintenance Calendar</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Schedule and track preventive maintenance requests
                        </p>
                    </div>
                    <button
                        onClick={() => router.push('/requests/create?type=Preventive')}
                        className="btn btn-primary"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Schedule Maintenance
                    </button>
                </div>

                {/* Legend */}
                <div className="card">
                    <div className="flex items-center space-x-6">
                        <div className="flex items-center">
                            <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
                            <span className="text-sm text-gray-700">Scheduled</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
                            <span className="text-sm text-gray-700">In Progress</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                            <span className="text-sm text-gray-700">Completed</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
                            <span className="text-sm text-gray-700">Overdue</span>
                        </div>
                    </div>
                </div>

                {/* Calendar */}
                <div className="card">
                    {loading ? (
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
                            dateClick={handleDateClick}
                            editable={false}
                            selectable={true}
                            selectMirror={true}
                            dayMaxEvents={true}
                            weekends={true}
                            height="auto"
                            eventContent={(eventInfo) => {
                                return (
                                    <div className="p-1">
                                        <div className="font-medium text-xs truncate">{eventInfo.event.title}</div>
                                        {eventInfo.event.extendedProps.equipment_name && (
                                            <div className="text-xs opacity-90 truncate">
                                                {eventInfo.event.extendedProps.equipment_name}
                                            </div>
                                        )}
                                    </div>
                                );
                            }}
                        />
                    )}
                </div>

                {/* Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start">
                        <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="text-sm text-blue-800">
                            <p className="font-medium mb-1">How to use the calendar:</p>
                            <ul className="list-disc list-inside space-y-1">
                                <li>Click on any date to create a new preventive maintenance request</li>
                                <li>Click on an event to view details</li>
                                <li>Use the view buttons to switch between month, week, and day views</li>
                                <li>Only preventive maintenance requests are shown on this calendar</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
