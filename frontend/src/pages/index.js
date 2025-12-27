import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../components/layout/Layout';
import useAuthStore from '../store/authStore';
import api from '../lib/api';
import { ROLES } from '../lib/constants';

export default function HomePage() {
    const router = useRouter();
    const user = useAuthStore((state) => state.user);
    const [stats, setStats] = useState({
        totalEquipment: 0,
        activeRequests: 0,
        myRequests: 0,
        overdueRequests: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, [user]);

    const fetchStats = async () => {
        try {
            // Fetch basic stats
            const [equipmentRes, requestsRes] = await Promise.all([
                api.get('/api/equipment?limit=1'),
                api.get('/api/requests?limit=1'),
            ]);

            const activeReq = await api.get('/api/requests?status=New&limit=100');
            const overdueReq = await api.get('/api/requests?is_overdue=true&limit=100');

            setStats({
                totalEquipment: equipmentRes.data.pagination?.total || 0,
                activeRequests: activeReq.data.data.length,
                myRequests: requestsRes.data.pagination?.total || 0,
                overdueRequests: overdueReq.data.data.length,
            });
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Welcome Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Welcome back, {user?.full_name}!
                    </h1>
                    <p className="mt-2 text-gray-600">
                        {user?.role === ROLES.MANAGER && 'Manage your maintenance operations from here.'}
                        {user?.role === ROLES.TECHNICIAN && 'Track and update your maintenance tasks.'}
                        {user?.role === ROLES.USER && 'View equipment and create maintenance requests.'}
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                    <div className="card">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Equipment</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalEquipment}</p>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Active Requests</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.activeRequests}</p>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">My Requests</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.myRequests}</p>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Overdue</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.overdueRequests}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="card mb-8">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Link href="/equipment" className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">View Equipment</p>
                                    <p className="text-sm text-gray-500">Browse asset registry</p>
                                </div>
                            </div>
                        </Link>

                        {user?.role !== ROLES.USER && (
                            <Link href="/requests/kanban" className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-yellow-600 rounded-lg flex items-center justify-center">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">Kanban Board</p>
                                        <p className="text-sm text-gray-500">Manage requests</p>
                                    </div>
                                </div>
                            </Link>
                        )}

                        {user?.role === ROLES.MANAGER && (
                            <Link href="/teams" className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">Manage Teams</p>
                                        <p className="text-sm text-gray-500">Team administration</p>
                                    </div>
                                </div>
                            </Link>
                        )}
                    </div>
                </div>

                {/* System Info */}
                <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold mb-2">📚 Need Help?</h3>
                            <p className="text-sm opacity-90">
                                Check out the API documentation for integration details and workflow information.
                            </p>
                        </div>
                        <a
                            href="http://localhost:5000/api-docs"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-6 py-3 bg-white text-primary-600 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                        >
                            View API Docs
                        </a>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
