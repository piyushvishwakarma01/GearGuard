import { useRouter } from 'next/router';
import { useEffect } from 'react';
import useAuthStore from '../../store/authStore';
import Header from './Header';
import Sidebar from './Sidebar';

export default function Layout({ children, requireAuth = true }) {
    const router = useRouter();
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    useEffect(() => {
        if (requireAuth && !isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, requireAuth, router]);

    if (requireAuth && !isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50">
            {requireAuth && <Sidebar />}
            <div className="flex-1 flex flex-col overflow-hidden" style={{ marginLeft: requireAuth ? '256px' : '0' }}>
                {requireAuth && <Header />}
                <main className="flex-1 overflow-y-auto">
                    <div className="container mx-auto px-6 py-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
