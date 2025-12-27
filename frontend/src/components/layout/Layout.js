import { useRouter } from 'next/router';
import { useEffect } from 'react';
import useAuthStore from '../../store/authStore';
import Header from './Header';

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
        <div className="min-h-screen bg-gray-50">
            {requireAuth && <Header />}
            <main className={requireAuth ? 'py-8' : ''}>
                {children}
            </main>
        </div>
    );
}
