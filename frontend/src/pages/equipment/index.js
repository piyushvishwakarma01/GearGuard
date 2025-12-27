import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/layout/Layout';
import api from '../../lib/api';
import useAuthStore from '../../store/authStore';
import { ROLES } from '../../lib/constants';

export default function EquipmentListPage() {
    const router = useRouter();
    const user = useAuthStore((state) => state.user);
    const [equipment, setEquipment] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        department_id: '',
        category_id: '',
    });
    const [departments, setDepartments] = useState([]);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        fetchEquipment();
        fetchFilters();
    }, [filters]);

    const fetchEquipment = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (filters.search) params.append('search', filters.search);
            if (filters.department_id) params.append('department_id', filters.department_id);
            if (filters.category_id) params.append('category_id', filters.category_id);

            const response = await api.get(`/api/equipment?${params.toString()}`);
            setEquipment(response.data.data);
        } catch (error) {
            console.error('Failed to fetch equipment:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchFilters = async () => {
        try {
            const catRes = await api.get('/api/equipment/categories');
            setCategories(catRes.data.data);
        } catch (error) {
            console.error('Failed to fetch filters:', error);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters({ ...filters, [name]: value });
    };

    const handleClearFilters = () => {
        setFilters({ search: '', department_id: '', category_id: '' });
    };

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Equipment</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Manage your asset registry
                        </p>
                    </div>
                    {user?.role === ROLES.MANAGER && (
                        <Link href="/equipment/create" className="btn btn-primary">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Equipment
                        </Link>
                    )}
                </div>

                {/* Filters */}
                <div className="card">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="label">Search</label>
                            <input
                                type="text"
                                name="search"
                                placeholder="Equipment name or serial..."
                                className="input"
                                value={filters.search}
                                onChange={handleFilterChange}
                            />
                        </div>
                        <div>
                            <label className="label">Category</label>
                            <select
                                name="category_id"
                                className="input"
                                value={filters.category_id}
                                onChange={handleFilterChange}
                            >
                                <option value="">All Categories</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={handleClearFilters}
                                className="btn btn-secondary w-full"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>
                </div>

                {/* Equipment Table */}
                <div className="card overflow-hidden p-0">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                        </div>
                    ) : equipment.length === 0 ? (
                        <div className="text-center py-12">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No equipment found</h3>
                            <p className="mt-1 text-sm text-gray-500">Try adjusting your filters or add new equipment.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Equipment
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Serial Number
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Category
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Location
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {equipment.map((item) => (
                                        <tr
                                            key={item.id}
                                            onClick={() => router.push(`/equipment/${item.id}`)}
                                            className="hover:bg-gray-50 cursor-pointer transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
                                                        <svg className="h-6 w-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                                                        </svg>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {item.equipment_name}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {item.category_name}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{item.serial_number}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{item.category_name}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">{item.physical_location || 'N/A'}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${item.is_usable
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-red-100 text-red-800'
                                                        }`}
                                                >
                                                    {item.is_usable ? 'Usable' : 'Scrapped'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <Link
                                                    href={`/equipment/${item.id}`}
                                                    className="text-primary-600 hover:text-primary-900 mr-4"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    View Details
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}
