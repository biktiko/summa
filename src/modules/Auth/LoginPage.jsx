import React, { useState } from 'react';
import { useAuth } from '../../core/hooks/useAuth';
import { Lock, User, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

const LoginPage = () => {
    const { login, register } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '', name: '' });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (isLogin) {
            const success = await login(formData.email, formData.password);
            if (!success) setError('Invalid credentials');
        } else {
            if (formData.password !== formData.confirmPassword) {
                setError('Passwords do not match');
                return;
            }
            const success = await register(formData.email, formData.password, formData.name);
            if (!success) setError('Registration failed (User might exist)');
        }
    };

    return (
        <div className="min-h-screen bg-[#020202] flex items-center justify-center p-4 font-sans text-neutral-200 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />

            <div className="w-full max-w-md bg-neutral-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative z-10">
                <div className="flex justify-center mb-8">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                        <ShieldCheck className="w-8 h-8 text-white" />
                    </div>
                </div>

                <h2 className="text-2xl font-black text-center uppercase tracking-tighter mb-2 text-white">
                    {isLogin ? 'System Access' : 'Initialize Protocol'}
                </h2>
                <p className="text-center text-xs font-bold uppercase tracking-widest text-neutral-500 mb-8">
                    {isLogin ? 'Enter Credentials to Decrypt' : 'Create New Identity'}
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <div className="relative group">
                            <User className="absolute left-3 top-3 w-4 h-4 text-neutral-500 group-focus-within:text-blue-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Identity Name"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500/50 transition-all placeholder:text-neutral-600"
                                required
                            />
                        </div>
                    )}

                    <div className="relative group">
                        <Mail className="absolute left-3 top-3 w-4 h-4 text-neutral-500 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Email or Login"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500/50 transition-all placeholder:text-neutral-600"
                            required
                        />
                    </div>

                    <div className="relative group">
                        <Lock className="absolute left-3 top-3 w-4 h-4 text-neutral-500 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="password"
                            placeholder="Passcode"
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                            className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500/50 transition-all placeholder:text-neutral-600"
                            required
                        />
                    </div>

                    {!isLogin && (
                        <div className="relative group">
                            <Lock className="absolute left-3 top-3 w-4 h-4 text-neutral-500 group-focus-within:text-blue-500 transition-colors" />
                            <input
                                type="password"
                                placeholder="Confirm Passcode"
                                value={formData.confirmPassword}
                                onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                                className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500/50 transition-all placeholder:text-neutral-600"
                                required
                            />
                        </div>
                    )}

                    {error && (
                        <div className="text-red-500 text-[10px] font-bold uppercase tracking-wider text-center bg-red-900/10 py-2 rounded-lg border border-red-500/20">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest py-3 rounded-xl shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 transition-all mt-4"
                    >
                        {isLogin ? 'Authenticate' : 'Register'} <ArrowRight className="w-4 h-4" />
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 hover:text-blue-400 transition-colors"
                    >
                        {isLogin ? 'Need Access? Create Identity' : 'Already Authorized? Login'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
