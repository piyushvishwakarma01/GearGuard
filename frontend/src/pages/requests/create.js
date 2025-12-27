import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/layout/Layout';
import api from '../../lib/api';
import { toast } from 'react-hot-toast';
import { REQUEST_TYPE, PRIORITY } from '../../lib/constants';

export default function CreateRequestPage() {
    const router = useRouter();
    const { type, date, equipment_id } = router.query;

    const [formData, setFormData] = useState({
        subject: '',
        description: '',
        request_type: type || REQUEST_TYPE.CORRECTIVE,
        equipment_id: equipment_id || '',
        scheduled_date: date || '',
        priority: PRIORITY.MEDIUM,
    });

    const [equipment, setEquipment] = useState([]);
    const [selectedEquipment, setSelectedEquipment] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchEquipment();
    }, []);

    useEffect(() => {
        if (formData.equipment_id) {
            const selected = equipment.find((eq) => eq.id === formData.equipment_id);
            setSelectedEquipment(selected);
        } else {
            setSelectedEquipment(null);
        }
    }, [formData.equipment_id, equipment]);

    const fetchEquipment = async () => {
        try {
            const response = await api.get('/api/equipment');
            setEquipment(response.data.data);
        } catch (error) {
            console.error('Failed to fetch equipment:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.subject.trim()) {
            toast.error('Subject is required');
            return;
        }

        if (!formData.equipment_id) {
            toast.error('Please select equipment');
            return;
        }

        try {
            setLoading(true);

            // Prepare payload
            const payload = {
                subject: formData.subject.trim(),
                description: formData.description.trim() || undefined,
                request_type: formData.request_type,
                equipment_id: formData.equipment_id,
                priority: formData.priority,
            };

            // Only include scheduled_date if it's preventive and has a value
            if (formData.request_type === REQUEST_TYPE.PREVENTIVE && formData.scheduled_date) {
                payload.scheduled_date = formData.scheduled_date;
            }

            console.log('Sending payload:', payload); // Debug log

            const response = await api.post('/api/requests', payload);

            console.log('Response:', response.data); // Debug log

            toast.success('Maintenance request created successfully');
            router.push('/requests/kanban');
        } catch (error) {
            console.error('Error creating request:', error);
            console.error('Error response:', error.response?.data);
            console.error('Error response errors:', error.response?.data?.errors);

            // Show specific error message
            if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
                // Validation errors array - log each one
                error.response.data.errors.forEach((err, idx) => {
                    console.error(`Validation error ${idx + 1}:`, err);
                });
                const errorMessages = error.response.data.errors.map(err => `${err.param || 'field'}: ${err.msg}`).join(', ');
                toast.error(`Validation failed: ${errorMessages}`);
            } else if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error('Failed to create request. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Create Maintenance Request</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Submit a new {formData.request_type.toLowerCase()} maintenance request
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="card">
                    <div className="space-y-6">
                        {/* Request Type */}
                        <div>
                            <label className="label">Request Type *</label>
                            <select
                                name="request_type"
                                value={formData.request_type}
                                onChange={handleChange}
                                className="input"
                                required
                            >
                                <option value={REQUEST_TYPE.CORRECTIVE}>Corrective (Fix broken equipment)</option>
                                <option value={REQUEST_TYPE.PREVENTIVE}>Preventive (Scheduled maintenance)</option>
                            </select>
                        </div>

                        {/* Subject */}
                        <div>
                            <label className="label">Subject *</label>
                            <input
                                type="text"
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                className="input"
                                placeholder="Brief description of the issue or maintenance task"
                                required
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="label">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={4}
                                className="input"
                                placeholder="Detailed information about the maintenance request..."
                            />
                        </div>

                        {/* Equipment */}
                        <div>
                            <label className="label">Equipment *</label>
                            <select
                                name="equipment_id"
                                value={formData.equipment_id}
                                onChange={handleChange}
                                className="input"
                                required
                            >
                                <option value="">Select equipment</option>
                                {equipment.map((eq) => (
                                    <option key={eq.id} value={eq.id}>
                                        {eq.equipment_name} ({eq.serial_number})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Auto-filled Team (Read-only) */}
                        {selectedEquipment && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-start">
                                    <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div className="text-sm text-blue-800">
                                        <p className="font-medium mb-1">Auto-filled Information:</p>
                                        <ul className="space-y-1">
                                            <li><strong>Category:</strong> {selectedEquipment.category_name}</li>
                                            <li><strong>Maintenance Team:</strong> {selectedEquipment.team_name}</li>
                                            <li><strong>Location:</strong> {selectedEquipment.physical_location || 'N/A'}</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Priority */}
                        <div>
                            <label className="label">Priority</label>
                            <select
                                name="priority"
                                value={formData.priority}
                                onChange={handleChange}
                                className="input"
                            >
                                <option value={PRIORITY.LOW}>Low</option>
                                <option value={PRIORITY.MEDIUM}>Medium</option>
                                <option value={PRIORITY.HIGH}>High</option>
                                <option value={PRIORITY.CRITICAL}>Critical</option>
                            </select>
                        </div>

                        {/* Scheduled Date (for preventive) */}
                        {formData.request_type === REQUEST_TYPE.PREVENTIVE && (
                            <div>
                                <label className="label">Scheduled Date</label>
                                <input
                                    type="datetime-local"
                                    name="scheduled_date"
                                    value={formData.scheduled_date}
                                    onChange={handleChange}
                                    className="input"
                                />
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center justify-end space-x-3 pt-6 border-t">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="btn btn-secondary"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading}
                            >
                                {loading ? (
                                    <div className="flex items-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Creating...
                                    </div>
                                ) : (
                                    'Create Request'
                                )}
                            </button>
                        </div>
                    </div>
                </form>

                {/* Info */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start">
                        <svg className="w-5 h-5 text-gray-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="text-sm text-gray-700">
                            <p className="font-medium mb-2">Request Types:</p>
                            <ul className="list-disc list-inside space-y-1">
                                <li><strong>Corrective:</strong> For fixing broken or malfunctioning equipment</li>
                                <li><strong>Preventive:</strong> For scheduled maintenance to prevent failures</li>
                            </ul>
                            <p className="mt-3">The maintenance team and category will be automatically assigned based on the selected equipment.</p>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
