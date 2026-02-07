import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Hotel, Loader2, ArrowRight, Mail, Lock, User, Shield, Users, Sparkles, UserCheck } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const userData = await login(email, password);
            // Redirect guests to rooms page, others to dashboard
            if (userData.role === 'guest') {
                navigate('/rooms');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.error || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-navy-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-500">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl"></div>
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md relative">
                <div className="flex justify-center">
                    <Link to="/" className="flex items-center space-x-2 group">
                        <div className="bg-cyan-500 p-3 rounded-2xl group-hover:shadow-cyan-glow transition-all transform -rotate-6 group-hover:rotate-0">
                            <Hotel className="w-8 h-8 text-white" />
                        </div>
                    </Link>
                </div>
                <h2 className="mt-8 text-center text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
                    Welcome <span className="text-cyan-600 dark:text-cyan-400">Back</span>
                </h2>
                <p className="mt-2 text-center text-sm text-gray-500 font-medium">
                    Please sign in to access your luxury dashboard
                </p>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md px-4">
                <div className="bg-white/50 dark:bg-navy-900/50 backdrop-blur-xl border border-gray-200 dark:border-white/5 py-10 px-6 sm:px-10 rounded-[32px] shadow-2xl relative">
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium rounded-2xl flex items-center animate-fade-in">
                            <span className="mr-3 text-lg">⚠️</span>
                            {error}
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1 flex items-center">
                                <Mail className="w-3 h-3 mr-2 text-cyan-500" /> Email Address
                            </label>
                            <div className="mt-2">
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-5 py-4 bg-gray-50 dark:bg-navy-800 border border-gray-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all outline-none font-bold text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600"
                                    placeholder="john@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1 flex items-center">
                                <Lock className="w-3 h-3 mr-2 text-cyan-500" /> Password
                            </label>
                            <div className="mt-2">
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-5 py-4 bg-gray-50 dark:bg-navy-800 border border-gray-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all outline-none font-bold text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-cyan-500 hover:bg-cyan-400 text-white py-4 rounded-2xl font-bold shadow-soft transition-all active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none flex items-center justify-center space-x-2 group overflow-hidden relative"
                        >
                            <span className="relative z-10 flex items-center">
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <span>Sign In</span>
                                        <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </span>
                        </button>
                    </form>

                    <div className="mt-8 text-center pt-8 border-t border-gray-100 dark:border-white/5">
                        <p className="text-sm text-gray-500 font-medium">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-cyan-600 dark:text-cyan-400 font-bold hover:text-cyan-500 dark:hover:text-cyan-300 transition-colors">
                                Create one here
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            <p className="mt-8 text-center text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-[0.3em]">
                &copy; 2026 LuxuryStay Hospitality Group
            </p>
        </div>
    );
};

export default Login;
