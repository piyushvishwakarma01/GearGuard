import { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import api from '../../lib/api';
import useAuthStore from '../../store/authStore';
import { ROLES } from '../../lib/constants';

export default function TeamsListPage() {
    const user = useAuthStore((state) => state.user);
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTeams();
    }, []);

    const fetchTeams = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/teams');
            setTeams(res.data.data);
        } catch (error) {
            console.error('Failed to fetch teams', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Maintenance Teams</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Teams responsible for executing maintenance requests
                        </p>
                    </div>
                    {user?.role === ROLES.MANAGER && (
                        <button className="btn btn-primary" onClick={() => alert('Feature placeholder')}>
                            Create Team
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="spinner mx-auto mb-4"></div>
                        <p className="text-gray-500">Loading teams...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {teams.map((team) => (
                            <div key={team.id} className="card hover:shadow-lg transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">{team.name}</h3>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                            ${team.team_type === 'IT' ? 'bg-purple-100 text-purple-800' :
                                                team.team_type === 'Mechanical' ? 'bg-orange-100 text-orange-800' :
                                                    'bg-blue-100 text-blue-800'}`}>
                                            {team.team_type}
                                        </span>
                                    </div>
                                    <span className={`h-2 w-2 rounded-full ${team.is_active ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                </div>

                                <p className="text-sm text-gray-600 mb-4 h-12 line-clamp-2">
                                    {team.description}
                                </p>

                                <div className="border-t border-gray-100 pt-4">
                                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                        Members ({team.members?.length || 0})
                                    </h4>
                                    <div className="space-y-3">
                                        {team.members && team.members.slice(0, 3).map((member) => (
                                            <div key={member.user_id} className="flex items-center">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white
                                                    ${member.is_lead ? 'bg-primary-600 ring-2 ring-white shadow-sm' : 'bg-gray-400'}`}
                                                    title={member.full_name}
                                                >
                                                    {member.full_name.charAt(0)}
                                                </div>
                                                <div className="ml-3">
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {member.full_name}
                                                        {member.is_lead && <span className="ml-2 text-xs text-primary-600">(Lead)</span>}
                                                    </p>
                                                    <p className="text-xs text-gray-500">{member.role}</p>
                                                </div>
                                            </div>
                                        ))}
                                        {team.members && team.members.length > 3 && (
                                            <p className="text-xs text-gray-400 pl-11">
                                                + {team.members.length - 3} more members
                                            </p>
                                        )}
                                        {(!team.members || team.members.length === 0) && (
                                            <p className="text-sm text-gray-400 italic">No members assigned</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
}
