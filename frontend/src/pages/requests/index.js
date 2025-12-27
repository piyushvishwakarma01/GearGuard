import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/layout/Layout';
import api from '../../lib/api';
import { formatDistanceToNow } from 'date-fns';
import useAuthStore from '../../store/authStore';
import { ROLES } from '../../lib/constants';

export default function RequestsPage() {
    const router = useRouter();
    const user = useAuthStore((state) => state.user);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: '',
        request_type: '',
    });

    useEffect(() => {
        fetchRequests();
    }, [filters]);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (filters.status) params.append('status', filters.status);
            if (filters.request_type) params.append('request_type', filters.request_type);

            const response = await api.get(`/api/requests?${params.toString()}`);
            setRequests(response.data.data);
        } catch (error) {
            console.error('Failed to fetch requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters({ ...filters, [name]: value });
    };

    const getStatusColor = (status) => {
        const colors = {
            'New': 'bg-blue-100 text-blue-800',
            'In Progress': 'bg-yellow-100 text-yellow-800',
            'Repaired': 'bg-green-100 text-green-800',
            'Scrap': 'bg-red-100 text-red-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Maintenance Requests</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            View and manage all maintenance requests
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        {(user?.role === ROLES.TECHNICIAN || user?.role === ROLES.MANAGER) && (
                            <Link href="/requests/kanban" className="btn btn-secondary">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                                </svg>
                                Kanban View
                            </Link>
                        )}
                        <Link href="/requests/create" className="btn btn-primary">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            New Request
                        </Link>
                    </div>
                </div>

                {/* Filters */}
                <div className="card">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="label">Status</label>
                            <select
                                name="status"
                                value={filters.status}
                                onChange={handleFilterChange}
                                className="input"
                            >
                                <option value="">All Statuses</option>
                                <option value="New">New</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Repaired">Repaired</option>
                                <option value="Scrap">Scrap</option>
                            </select>
                        </div>
                        <div>
                            <label className="label">Type</label>
                            <select
                                name="request_type"
                                value={filters.request_type}
                                onChange={handleFilterChange}
                                className="input"
                            >
                                <option value="">All Types</option>
                                <option value="Corrective">Corrective</option>
                                <option value="Preventive">Preventive</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={() => setFilters({ status: '', request_type: '' })}
                                className="btn btn-secondary w-full"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>
                </div>

                {/* Requests List */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                        </div>
                    ) : requests.length === 0 ? (
                        <div className="text-center py-12 card">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No requests found</h3>
                            <p className="mt-1 text-sm text-gray-500">Try adjusting your filters or create a new request.</p>
                        </div>
                    ) : (
                        requests.map((request) => (
                            <div
                                key={request.id}
                                onClick={() => router.push(`/requests/${request.id}`)}
                                className={`card hover:shadow-lg cursor-pointer transition-all ${request.is_overdue ? 'border-l-4 border-red-500' : ''
                                    }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900">{request.subject}</h3>
                                            <span className={`badge ${getStatusColor(request.status)}`}>
                                                {request.status}
                                            </span>
                                            <span className={`badge ${request.request_type === 'Preventive' ? 'badge-preventive' : 'badge-corrective'
                                                }`}>
                                                {request.request_type}
                                            </span>
                                            {request.is_overdue && (
                                                <span className="badge bg-red-100 text-red-800 font-bold">
                                                    OVERDUE
                                                </span>
                                            )}
                                        </div>

                                        {request.description && (
                                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{request.description}</p>
                                        )}

                                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                                            <div className="flex items-center">
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                                                </svg>
                                                {request.equipment_name}
                                            </div>

                                            <div className="flex items-center">
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                </svg>
                                                {request.team_name}
                                            </div>

                                            {request.assigned_technician_name && (
                                                <div className="flex items-center">
                                                    <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center text-white text-xs font-medium mr-2">
                                                        {request.assigned_technician_name.charAt(0)}
                                                    </div>
                                                    {request.assigned_technician_name}
                                                </div>
                                            )}

                                            <div className="flex items-center">
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end space-y-2">
                                        {request.priority && (
                                            <span className={`text-xs font-medium px-2 py-1 rounded ${request.priority === 'Critical' ? 'bg-red-100 text-red-800' :
                                                    request.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                                                        request.priority === 'Medium' ? 'bg-blue-100 text-blue-800' :
                                                            'bg-gray-100 text-gray-800'
                                                }`}>
                                                {request.priority}
                                            </span>
                                        )}
                                        {request.scheduled_date && (
                                            <span className="text-xs text-gray-500">
                                                Scheduled: {new Date(request.scheduled_date).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </Layout>
    );
}
