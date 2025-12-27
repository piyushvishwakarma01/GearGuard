import { useRouter } from 'next/router';
import Link from 'next/link';
import useAuthStore from '../../store/authStore';
import { ROLES } from '../../lib/constants';

export default function Sidebar() {
    const router = useRouter();
    const user = useAuthStore((state) => state.user);

    const navigation = [
        {
            name: 'Dashboard',
            href: '/',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            ),
            roles: [ROLES.USER, ROLES.TECHNICIAN, ROLES.MANAGER],
        },
        {
            name: 'Equipment',
            href: '/equipment',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
            ),
            roles: [ROLES.USER, ROLES.TECHNICIAN, ROLES.MANAGER],
        },
        {
            name: 'Requests',
            href: '/requests',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
            ),
            roles: [ROLES.USER, ROLES.TECHNICIAN, ROLES.MANAGER],
            children: [
                { name: 'All Requests', href: '/requests', roles: [ROLES.USER, ROLES.TECHNICIAN, ROLES.MANAGER] },
                { name: 'Kanban Board', href: '/requests/kanban', roles: [ROLES.TECHNICIAN, ROLES.MANAGER] },
                { name: 'Calendar', href: '/requests/calendar', roles: [ROLES.TECHNICIAN, ROLES.MANAGER] },
                { name: 'Create Request', href: '/requests/create', roles: [ROLES.USER, ROLES.TECHNICIAN, ROLES.MANAGER] },
            ],
        },
        {
            name: 'Teams',
            href: '/teams',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
            roles: [ROLES.MANAGER],
        },
    ];

    const canAccessRoute = (route) => {
        if (!route.roles) return true;
        return route.roles.includes(user?.role);
    };

    const isActive = (href) => {
        if (href === '/') return router.pathname === href;
        return router.pathname.startsWith(href);
    };

    return (
        <div className="flex flex-col w-64 bg-gray-900 h-screen fixed">
            {/* Logo */}
            <div className="flex items-center justify-center h-16 bg-gray-800 border-b border-gray-700">
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-xl">G</span>
                    </div>
                    <span className="text-xl font-bold text-white">GearGuard</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4">
                {navigation.map((item) => {
                    if (!canAccessRoute(item)) return null;

                    return (
                        <div key={item.name}>
                            <Link
                                href={item.href}
                                className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${isActive(item.href)
                                    ? 'bg-gray-800 text-white border-l-4 border-primary-600'
                                    : 'text-gray-300 hover:bg-gray-800 hover:text-white border-l-4 border-transparent'
                                    }`}
                            >
                                <span className="mr-3">{item.icon}</span>
                                {item.name}
                            </Link>

                            {/* Sub-menu */}
                            {item.children && isActive(item.href) && (
                                <div className="bg-gray-800">
                                    {item.children.map((child) => {
                                        if (!canAccessRoute(child)) return null;
                                        return (
                                            <Link
                                                key={child.href}
                                                href={child.href}
                                                className={`flex items-center px-14 py-2 text-sm transition-colors ${router.pathname === child.href
                                                    ? 'text-primary-400'
                                                    : 'text-gray-400 hover:text-white'
                                                    }`}
                                            >
                                                {child.name}
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>

            {/* User Profile */}
            <div className="border-t border-gray-700 p-4">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">
                            {user?.full_name?.charAt(0) || 'U'}
                        </span>
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-white truncate">{user?.full_name}</p>
                        <p className="text-xs text-gray-400">{user?.role}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
