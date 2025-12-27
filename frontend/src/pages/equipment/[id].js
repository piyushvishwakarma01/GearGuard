import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/layout/Layout';
import api from '../../lib/api';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

export default function EquipmentDetailPage() {
    const router = useRouter();
    const { id } = router.query;
    const [equipment, setEquipment] = useState(null);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showRequests, setShowRequests] = useState(false);

    useEffect(() => {
        if (id) {
            fetchEquipment();
        }
    }, [id]);

    const fetchEquipment = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/api/equipment/${id}`);
            setEquipment(response.data.data);
        } catch (error) {
            toast.error('Failed to fetch equipment details');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMaintenanceRequests = async () => {
        try {
            const response = await api.get(`/api/equipment/${id}/maintenance-requests`);
            setRequests(response.data.data || []);
            setShowRequests(true);
        } catch (error) {
            toast.error('Failed to fetch maintenance requests');
            console.error(error);
        }
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

    if (loading) {
        return (
            <Layout>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    </div>
                </div>
            </Layout>
        );
    }

    if (!equipment) {
        return (
            <Layout>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="card text-center py-12">
                        <p className="text-gray-500">Equipment not found.</p>
                        <Link href="/equipment" className="btn btn-primary mt-4">Back to Equipment</Link>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back Button */}
                <Link href="/equipment" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Equipment
                </Link>

                {/* Header with Smart Button */}
                <div className="card mb-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{equipment.equipment_name}</h1>
                            <p className="text-gray-500 mt-1">Serial: {equipment.serial_number}</p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <span className={`badge ${equipment.is_usable ? 'badge-repaired' : 'badge-scrap'}`}>
                                {equipment.is_usable ? 'Usable' : 'Not Usable'}
                            </span>
                            {/* Smart Button */}
                            <button
                                onClick={fetchMaintenanceRequests}
                                className="relative btn btn-primary"
                            >
                                Maintenance Requests
                                {equipment.open_request_count > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                                        {equipment.open_request_count}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Equipment Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="card">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">General Information</h2>
                        <dl className="space-y-3">
                            <div className="flex justify-between">
                                <dt className="text-gray-500">Category</dt>
                                <dd className="text-gray-900">{equipment.category_name || 'N/A'}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-gray-500">Department</dt>
                                <dd className="text-gray-900">{equipment.department_name || 'N/A'}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-gray-500">Location</dt>
                                <dd className="text-gray-900">{equipment.physical_location || 'N/A'}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-gray-500">Assigned To</dt>
                                <dd className="text-gray-900">{equipment.assigned_employee_name || 'Unassigned'}</dd>
                            </div>
                        </dl>
                    </div>
                    <div className="card">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Purchase & Warranty</h2>
                        <dl className="space-y-3">
                            <div className="flex justify-between">
                                <dt className="text-gray-500">Purchase Date</dt>
                                <dd className="text-gray-900">
                                    {equipment.purchase_date ? format(new Date(equipment.purchase_date), 'MMM d, yyyy') : 'N/A'}
                                </dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-gray-500">Purchase Cost</dt>
                                <dd className="text-gray-900">
                                    {equipment.purchase_cost ? `$${parseFloat(equipment.purchase_cost).toLocaleString()}` : 'N/A'}
                                </dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-gray-500">Warranty Expiry</dt>
                                <dd className={`${equipment.warranty_expiry_date && new Date(equipment.warranty_expiry_date) < new Date() ? 'text-red-600' : 'text-gray-900'}`}>
                                    {equipment.warranty_expiry_date ? format(new Date(equipment.warranty_expiry_date), 'MMM d, yyyy') : 'N/A'}
                                </dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-gray-500">Default Team</dt>
                                <dd className="text-gray-900">{equipment.default_team_name || 'N/A'}</dd>
                            </div>
                        </dl>
                    </div>
                </div>

                {/* Notes */}
                {equipment.notes && (
                    <div className="card mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-2">Notes</h2>
                        <p className="text-gray-600">{equipment.notes}</p>
                    </div>
                )}

                {/* Maintenance Requests Modal/Section */}
                {showRequests && (
                    <div className="card mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Maintenance Requests ({requests.length})
                            </h2>
                            <button onClick={() => setShowRequests(false)} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        {requests.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No maintenance requests found.</p>
                        ) : (
                            <div className="space-y-3">
                                {requests.map(req => (
                                    <div key={req.id} className="border rounded-lg p-4 hover:bg-gray-50">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="font-medium text-gray-900">{req.description}</p>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {req.request_type} • {req.team_name}
                                                </p>
                                            </div>
                                            <span className={`badge ${getStatusBadge(req.status)}`}>{req.status}</span>
                                        </div>
                                        <div className="mt-2 text-xs text-gray-400">
                                            Created: {format(new Date(req.created_at), 'MMM d, yyyy')}
                                            {req.assigned_technician_name && ` • Assigned: ${req.assigned_technician_name}`}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Layout>
    );
}

