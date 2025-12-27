import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/layout/Layout';
import api from '../../lib/api';
import { formatDistanceToNow } from 'date-fns';

export default function EquipmentDetailPage() {
    const router = useRouter();
    const { id } = router.query;
    const [equipment, setEquipment] = useState(null);
    const [requests, setRequests] = useState([]);
    const [openRequestCount, setOpenRequestCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [showRequests, setShowRequests] = useState(false);

    useEffect(() => {
        if (id) {
            fetchEquipmentDetail();
        }
    }, [id]);

    const fetchEquipmentDetail = async () => {
        try {
            setLoading(true);
            const [equipmentRes, requestsRes] = await Promise.all([
                api.get(`/api/equipment/${id}`),
                api.get(`/api/equipment/${id}/maintenance-requests`),
            ]);

            setEquipment(equipmentRes.data.data);
            setRequests(requestsRes.data.data);

            // Count open requests (not Repaired or Scrap)
            const openCount = requestsRes.data.data.filter(
                (req) => req.status !== 'Repaired' && req.status !== 'Scrap'
            ).length;
            setOpenRequestCount(openCount);
        } catch (error) {
            console.error('Failed to fetch equipment:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
            </Layout>
        );
    }

    if (!equipment) {
        return (
            <Layout>
                <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-gray-900">Equipment Not Found</h2>
                    <Link href="/equipment" className="text-primary-600 hover:text-primary-800 mt-4 inline-block">
                        ← Back to Equipment List
                    </Link>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/equipment" className="text-gray-400 hover:text-gray-600">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{equipment.equipment_name}</h1>
                            <p className="text-sm text-gray-500">Serial: {equipment.serial_number}</p>
                        </div>
                    </div>

                    {/* Smart Button */}
                    <button
                        onClick={() => setShowRequests(!showRequests)}
                        className="btn btn-primary relative"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Maintenance
                        {openRequestCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                                {openRequestCount}
                            </span>
                        )}
                    </button>
                </div>

                {/* Equipment Details Card */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="card">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Equipment Information</h3>
                        <dl className="space-y-3">
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Equipment Name</dt>
                                <dd className="mt-1 text-sm text-gray-900">{equipment.equipment_name}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Serial Number</dt>
                                <dd className="mt-1 text-sm text-gray-900">{equipment.serial_number}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Category</dt>
                                <dd className="mt-1 text-sm text-gray-900">{equipment.category_name}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Department</dt>
                                <dd className="mt-1 text-sm text-gray-900">{equipment.department_name || 'N/A'}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Physical Location</dt>
                                <dd className="mt-1 text-sm text-gray-900">{equipment.physical_location || 'N/A'}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Status</dt>
                                <dd className="mt-1">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${equipment.is_usable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                        {equipment.is_usable ? 'Usable' : 'Scrapped'}
                                    </span>
                                </dd>
                            </div>
                        </dl>
                    </div>

                    <div className="card">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Purchase & Warranty</h3>
                        <dl className="space-y-3">
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Purchase Date</dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                    {equipment.purchase_date ? new Date(equipment.purchase_date).toLocaleDateString() : 'N/A'}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Purchase Cost</dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                    ${equipment.purchase_cost ? parseFloat(equipment.purchase_cost).toFixed(2) : '0.00'}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Warranty Expiry</dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                    {equipment.warranty_expiry_date ? (
                                        <>
                                            {new Date(equipment.warranty_expiry_date).toLocaleDateString()}
                                            {new Date(equipment.warranty_expiry_date) < new Date() && (
                                                <span className="ml-2 text-red-600 font-semibold">(Expired)</span>
                                            )}
                                        </>
                                    ) : 'N/A'}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Maintenance Team</dt>
                                <dd className="mt-1 text-sm text-gray-900">{equipment.team_name || 'N/A'}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Assigned Employee</dt>
                                <dd className="mt-1 text-sm text-gray-900">{equipment.employee_name || 'Unassigned'}</dd>
                            </div>
                        </dl>
                    </div>
                </div>

                {/* Notes */}
                {equipment.notes && (
                    <div className="card">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Notes</h3>
                        <p className="text-sm text-gray-700">{equipment.notes}</p>
                    </div>
                )}

                {/* Maintenance Requests Section */}
                {showRequests && (
                    <div className="card">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Maintenance Requests ({requests.length})
                            </h3>
                            <Link href="/requests/create" className="text-sm text-primary-600 hover:text-primary-800">
                                + Create New Request
                            </Link>
                        </div>

                        {requests.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center py-8">No maintenance requests found</p>
                        ) : (
                            <div className="space-y-3">
                                {requests.map((request) => (
                                    <div
                                        key={request.id}
                                        className={`border rounded-lg p-4 hover:bg-gray-50 cursor-pointer ${request.is_overdue ? 'border-red-300 bg-red-50' : 'border-gray-200'
                                            }`}
                                        onClick={() => router.push(`/requests/${request.id}`)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2">
                                                    <h4 className="text-sm font-medium text-gray-900">{request.subject}</h4>
                                                    <span className={`badge badge-${request.status.toLowerCase().replace(' ', '-')}`}>
                                                        {request.status}
                                                    </span>
                                                    <span className={`badge badge-${request.request_type.toLowerCase()}`}>
                                                        {request.request_type}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Created {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                                                </p>
                                                {request.assigned_technician_name && (
                                                    <p className="text-xs text-gray-600 mt-1">
                                                        Assigned to: {request.assigned_technician_name}
                                                    </p>
                                                )}
                                            </div>
                                            {request.is_overdue && (
                                                <span className="text-red-600 text-xs font-semibold">OVERDUE</span>
                                            )}
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
