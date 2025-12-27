import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import useAuthStore from '../store/authStore';
import Layout from '../components/layout/Layout';

export default function LoginPage() {
    const router = useRouter();
    const login = useAuthStore((state) => state.login);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const success = await login(formData.email, formData.password);

        if (success) {
            router.push('/');
        }
        setIsLoading(false);
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // Demo account quick-fill buttons
    const fillDemo = (email, password) => {
        setFormData({ email, password });
    };

    return (
        <Layout requireAuth={false}>
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 to-primary-800 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div className="bg-white rounded-2xl shadow-2xl p-8">
                        {/* Logo */}
                        <div className="text-center">
                            <div className="mx-auto w-16 h-16 bg-primary-600 rounded-xl flex items-center justify-center mb-4">
                                <span className="text-white font-bold text-3xl">G</span>
                            </div>
                            <h2 className="text-3xl font-extrabold text-gray-900">GearGuard</h2>
                            <p className="mt-2 text-sm text-gray-600">Maintenance Management System</p>
                        </div>

                        {/* Form */}
                        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="email" className="label">
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    className="input"
                                    placeholder="user@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="label">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    className="input"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full btn btn-primary btn-lg"
                            >
                                {isLoading ? 'Signing in...' : 'Sign In'}
                            </button>
                        </form>

                        {/* Demo Accounts */}
                        <div className="mt-6">
                            <p className="text-xs text-center text-gray-500 mb-3">Quick Demo Access:</p>
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    type="button"
                                    onClick={() => fillDemo('manager@gearguard.com', 'password123')}
                                    className="btn btn-secondary btn-sm text-xs"
                                >
                                    Manager
                                </button>
                                <button
                                    type="button"
                                    onClick={() => fillDemo('tech1@gearguard.com', 'password123')}
                                    className="btn btn-secondary btn-sm text-xs"
                                >
                                    Technician
                                </button>
                                <button
                                    type="button"
                                    onClick={() => fillDemo('user1@gearguard.com', 'password123')}
                                    className="btn btn-secondary btn-sm text-xs"
                                >
                                    User
                                </button>
                            </div>
                        </div>

                        {/* Register Link */}
                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-600">
                                Don't have an account?{' '}
                                <Link href="/register" className="font-medium text-primary-600 hover:text-primary-500">
                                    Register here
                                </Link>
                            </p>
                        </div>
                    </div>

                    {/* Info Card */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-white text-sm">
                        <p className="font-semibold mb-2">🎓 Academic Project</p>
                        <p className="text-xs opacity-90">
                            Production-grade maintenance management system with role-based access, workflow automation, and ERP-style features.
                        </p>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
