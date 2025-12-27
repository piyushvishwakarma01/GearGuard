import { useRouter } from 'next/router';
import Link from 'next/link';
import useAuthStore from '../../store/authStore';
import { ROLES } from '../../lib/constants';

export default function Header() {
    const router = useRouter();
    const { user, logout, isAuthenticated } = useAuthStore();

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    if (!isAuthenticated) {
        return null;
    }

    return (
        <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-xl">G</span>
                            </div>
                            <span className="text-xl font-bold text-gray-900">GearGuard</span>
                        </Link>
                    </div>

                    {/* Navigation */}
                    <nav className="hidden md:flex items-center space-x-6">
                        <Link
                            href="/"
                            className={`text-sm font-medium transition-colors ${router.pathname === '/'
                                    ? 'text-primary-600'
                                    : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Dashboard
                        </Link>
                        <Link
                            href="/equipment"
                            className={`text-sm font-medium transition-colors ${router.pathname.startsWith('/equipment')
                                    ? 'text-primary-600'
                                    : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Equipment
                        </Link>
                        {user?.role !== ROLES.USER && (
                            <Link
                                href="/requests/kanban"
                                className={`text-sm font-medium transition-colors ${router.pathname.startsWith('/requests')
                                        ? 'text-primary-600'
                                        : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                Requests
                            </Link>
                        )}
                        {user?.role === ROLES.MANAGER && (
                            <Link
                                href="/teams"
                                className={`text-sm font-medium transition-colors ${router.pathname.startsWith('/teams')
                                        ? 'text-primary-600'
                                        : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                Teams
                            </Link>
                        )}
                    </nav>

                    {/* User Menu */}
                    <div className="flex items-center space-x-4">
                        <div className="hidden md:block text-right">
                            <p className="text-sm font-medium text-gray-900">{user?.full_name}</p>
                            <p className="text-xs text-gray-500">{user?.role}</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="btn btn-secondary btn-sm"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}
