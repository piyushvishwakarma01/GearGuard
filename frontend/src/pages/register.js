import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import useAuthStore from '../store/authStore';
import Layout from '../components/layout/Layout';

export default function RegisterPage() {
    const router = useRouter();
    const register = useAuthStore((state) => state.register);
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        role: 'User', // Default role
        phone: '',
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const success = await register(formData);

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

    return (
        <Layout requireAuth={false}>
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 to-primary-800 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div className="bg-white rounded-2xl shadow-2xl p-8">
                        {/* Logo */}
                        <div className="text-center">
                            <div className="mx-auto w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center mb-4">
                                <span className="text-white font-bold text-2xl">G</span>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Create an Account</h2>
                            <p className="mt-2 text-sm text-gray-600">Join GearGuard today</p>
                        </div>

                        {/* Form */}
                        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="full_name" className="label">Full Name</label>
                                <input
                                    id="full_name"
                                    name="full_name"
                                    type="text"
                                    required
                                    className="input"
                                    placeholder="John Doe"
                                    value={formData.full_name}
                                    onChange={handleChange}
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="label">Email Address</label>
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
                                <label htmlFor="phone" className="label">Phone Number (Optional)</label>
                                <input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    className="input"
                                    placeholder="+1-555-000-0000"
                                    value={formData.phone}
                                    onChange={handleChange}
                                />
                            </div>

                            <div>
                                <label htmlFor="role" className="label">Role</label>
                                <select
                                    id="role"
                                    name="role"
                                    className="input"
                                    value={formData.role}
                                    onChange={handleChange}
                                >
                                    <option value="User">User (Requester)</option>
                                    <option value="Technician">Technician</option>
                                    <option value="Manager">Manager</option>
                                </select>
                                <p className="text-xs text-gray-500 mt-1">Select your role for the demo.</p>
                            </div>

                            <div>
                                <label htmlFor="password" className="label">Password</label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    minLength={6}
                                    className="input"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full btn btn-primary btn-lg mt-6"
                            >
                                {isLoading ? 'Creating Account...' : 'Register'}
                            </button>
                        </form>

                        {/* Login Link */}
                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-600">
                                Already have an account?{' '}
                                <Link href="/login" className="font-medium text-primary-600 hover:text-primary-500">
                                    Sign in here
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
