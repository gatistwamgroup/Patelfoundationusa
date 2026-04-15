import { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, User, Eye, EyeOff, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const AdminLogin = () => {
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/admin');
        }
    }, [isAuthenticated, navigate]);

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        if (!username || !password) {
            setError('Both fields are required.');
            return;
        }
        setLoading(true);
        try {
            await login(username, password);
            navigate('/admin', { replace: true });
        } catch (err: any) {
            const msg = err?.response?.data?.message || 'Invalid credentials. Please try again.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    if (isAuthenticated) return null;

    return (
        <div className="min-h-screen bg-[#F7F7F8] flex items-center justify-center p-4 font-sans">
            {/* Subtle background grid */}
            <div className="fixed inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23000000%22 fill-opacity=%220.03%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-100" />

            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="relative w-full max-w-md"
            >
                {/* Card */}
                <div className="bg-white rounded-3xl shadow-2xl shadow-black/8 border border-gray-100 overflow-hidden">
                    {/* Top accent */}
                    <div className="h-1 w-full bg-gradient-to-r from-primary via-yellow-400 to-primary" />

                    <div className="p-10">
                        {/* Logo / Brand */}
                        <div className="flex flex-col items-center mb-10">
                            <div className="w-16 h-16 rounded-2xl bg-black flex items-center justify-center mb-5 shadow-xl shadow-black/20">
                                <ShieldCheck size={28} className="text-primary" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400 mb-1">Patel Foundation</span>
                            <h1 className="text-2xl font-black text-gray-900">Admin Portal</h1>
                            <p className="text-sm text-gray-400 mt-1.5 font-medium">Restricted access. Authorised personnel only.</p>
                        </div>

                        {/* Error Alert */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -6 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 text-sm font-semibold rounded-2xl px-4 py-3.5 mb-6"
                            >
                                <AlertCircle size={16} className="shrink-0" />
                                {error}
                            </motion.div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Username */}
                            <div>
                                <label className="block text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2">Username</label>
                                <div className="relative">
                                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-350" />
                                    <input
                                        type="text"
                                        autoComplete="username"
                                        value={username}
                                        onChange={e => setUsername(e.target.value)}
                                        placeholder="Enter username"
                                        className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-black/5 text-sm font-medium text-gray-900 placeholder:text-gray-300 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2">Password</label>
                                <div className="relative">
                                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-350" />
                                    <input
                                        type={showPw ? 'text' : 'password'}
                                        autoComplete="current-password"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        placeholder="Enter password"
                                        className="w-full pl-11 pr-12 py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-black/5 text-sm font-medium text-gray-900 placeholder:text-gray-300 transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPw(v => !v)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-350 hover:text-gray-600 transition-colors"
                                    >
                                        {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-black text-white rounded-xl font-black text-sm tracking-wide flex items-center justify-center gap-2.5 shadow-lg shadow-black/10 hover:bg-gray-900 active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                            >
                                {loading ? (
                                    <><Loader2 size={16} className="animate-spin" /> Authenticating...</>
                                ) : (
                                    <><ShieldCheck size={16} /> Access Dashboard</>
                                )}
                            </button>
                        </form>

                        {/* Footer */}
                        <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">Patel Foundation · Secure Admin Console</span>
                        </div>
                    </div>
                </div>

                {/* Shadow glow */}
                <div className="absolute -inset-4 -z-10 bg-primary/5 rounded-[40px] blur-3xl" />
            </motion.div>
        </div>
    );
};

export default AdminLogin;
