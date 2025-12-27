import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/layout/Layout';
import api from '../../lib/api';
import { toast } from 'react-hot-toast';

export default function NewRequestPage() {
    const router = useRouter();
    const { equipment_id } = router.query;
    const [equipment, setEquipment] = useState([]);
    const [selectedEquipment, setSelectedEquipment] = useState(null);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        subject: '',
        description: '',
        request_type: 'Corrective',
        equipment_id: '',
        scheduled_date: '',
        priority: 'Medium',
    });

    useEffect(() => {
        fetchEquipment();
    }, []);

    useEffect(() => {
        if (equipment_id && equipment.length > 0) {
            setFormData(prev => ({ ...prev, equipment_id }));
            const eq = equipment.find(e => e.id === equipment_id);
            if (eq) setSelectedEquipment(eq);
        }
    }, [equipment_id, equipment]);

    const fetchEquipment = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/equipment?limit=100');
            setEquipment(response.data.data || []);
        } catch (error) {
            toast.error('Failed to fetch equipment');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleEquipmentChange = (e) => {
        const id = e.target.value;
        setFormData(prev => ({ ...prev, equipment_id: id }));
        const eq = equipment.find(e => e.id === id);
        setSelectedEquipment(eq || null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.equipment_id) {
            toast.error('Please select equipment');
            return;
        }
        if (!formData.subject.trim()) {
            toast.error('Please enter a subject');
            return;
        }

        try {
            setSubmitting(true);
            const payload = {
                ...formData,
                scheduled_date: formData.scheduled_date || null,
            };
            await api.post('/api/requests', payload);
            toast.success('Maintenance request created successfully');
            router.push('/requests/kanban');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create request');
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Layout>
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back Button */}
                <Link href="/requests/kanban" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Kanban
                </Link>

                <div className="card">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Maintenance Request</h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Equipment Selection */}
                        <div>
                            <label className="label">Equipment *</label>
                            <select
                                name="equipment_id"
                                className="input"
                                value={formData.equipment_id}
                                onChange={handleEquipmentChange}
                                required
                            >
                                <option value="">Select equipment...</option>
                                {equipment.map(eq => (
                                    <option key={eq.id} value={eq.id}>
                                        {eq.equipment_name} ({eq.serial_number})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Auto-filled info */}
                        {selectedEquipment && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm text-blue-800 font-medium mb-2">Auto-filled from equipment:</p>
                                <div className="text-sm text-blue-700 space-y-1">
                                    <p>Category: {selectedEquipment.category_name || 'N/A'}</p>
                                    <p>Maintenance Team: {selectedEquipment.default_team_name || 'N/A'}</p>
                                </div>
                            </div>
                        )}

                        {/* Subject */}
                        <div>
                            <label className="label">Subject *</label>
                            <input
                                type="text"
                                name="subject"
                                className="input"
                                value={formData.subject}
                                onChange={handleChange}
                                placeholder="Brief description of the issue"
                                required
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="label">Description</label>
                            <textarea
                                name="description"
                                className="input"
                                rows={4}
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Detailed description of the maintenance needed"
                            />
                        </div>

                        {/* Request Type & Priority */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="label">Request Type *</label>
                                <select
                                    name="request_type"
                                    className="input"
                                    value={formData.request_type}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="Corrective">Corrective</option>
                                    <option value="Preventive">Preventive</option>
                                </select>
                            </div>
                            <div>
                                <label className="label">Priority</label>
                                <select
                                    name="priority"
                                    className="input"
                                    value={formData.priority}
                                    onChange={handleChange}
                                >
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                    <option value="Critical">Critical</option>
                                </select>
                            </div>
                        </div>

                        {/* Scheduled Date (for Preventive) */}
                        {formData.request_type === 'Preventive' && (
                            <div>
                                <label className="label">Scheduled Date</label>
                                <input
                                    type="date"
                                    name="scheduled_date"
                                    className="input"
                                    value={formData.scheduled_date}
                                    onChange={handleChange}
                                />
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="flex items-center justify-end space-x-4 pt-4">
                            <Link href="/requests/kanban" className="btn btn-secondary">
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={submitting}
                            >
                                {submitting ? 'Creating...' : 'Create Request'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
}

