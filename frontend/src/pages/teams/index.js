import { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '../../components/layout/Layout';
import api from '../../lib/api';
import { toast } from 'react-hot-toast';

export default function TeamsPage() {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTeams();
    }, []);

    const fetchTeams = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/teams');
            setTeams(response.data.data);
        } catch (error) {
            console.error('Failed to fetch teams:', error);
            toast.error('Failed to load teams');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Maintenance Teams</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Manage your maintenance teams and technicians
                        </p>
                    </div>
                    <button className="btn btn-primary">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Create Team
                    </button>
                </div>

                {/* Teams Grid */}
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    </div>
                ) : teams.length === 0 ? (
                    <div className="text-center py-12 card">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No teams found</h3>
                        <p className="mt-1 text-sm text-gray-500">Get started by creating a new team.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {teams.map((team) => (
                            <div key={team.id} className="card hover:shadow-lg transition-shadow">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                                            <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">{team.name}</h3>
                                            <p className="text-xs text-gray-500">{team.team_type}</p>
                                        </div>
                                    </div>
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${team.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {team.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>

                                <p className="text-sm text-gray-600 mb-4">{team.description || 'No description'}</p>

                                <div className="border-t border-gray-200 pt-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-700">Members</span>
                                        <span className="text-sm text-gray-500">{team.member_count || 0} technicians</span>
                                    </div>

                                    {team.members && team.members.length > 0 && (
                                        <div className="flex -space-x-2 mb-4">
                                            {team.members.slice(0, 5).map((member) => (
                                                <div
                                                    key={member.user_id}
                                                    className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white"
                                                    title={member.full_name}
                                                >
                                                    {member.full_name.charAt(0)}
                                                </div>
                                            ))}
                                            {team.members.length > 5 && (
                                                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-700 text-xs font-medium border-2 border-white">
                                                    +{team.members.length - 5}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <Link
                                        href={`/teams/${team.id}`}
                                        className="block w-full text-center btn btn-secondary btn-sm"
                                    >
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
}
