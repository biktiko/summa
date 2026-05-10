import React, { useState } from 'react';
import { useAuth } from '../../core/hooks/useAuth';
import { Lock, User, Mail, ArrowRight, ShieldCheck, Globe, Loader2 } from 'lucide-react';

const LoginPage = () => {
    const { login, register, googleLogin } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '', name: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [verifyMsg, setVerifyMsg] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setVerifyMsg('');
        setIsLoading(true);

        try {
            if (isLogin) {
                await login(formData.email, formData.password);
            } else {
                if (formData.password !== formData.confirmPassword) {
                    setError('Passwords do not match');
                    setIsLoading(false);
                    return;
                }
                await register(formData.email, formData.password, formData.name);
                setVerifyMsg('SUCCESS! Verification Link sent to your email. Please check (including Spam) and click the link to activate your account.');
                // Optionally switch to login or stay here
            }
        } catch (err) {
            console.error(err);
            if (err.code === 'auth/email-already-in-use') {
                setError('Email is already registered.');
            } else if (err.code === 'auth/wrong-password') {
                setError('Invalid password.');
            } else if (err.code === 'auth/user-not-found') {
                setError('User not found.');
            } else if (err.code === 'auth/popup-closed-by-user') {
                setError('Sign in cancelled.');
            } else {
                setError(err.message || 'Authentication failed');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError('');
        setIsLoading(true);
        try {
            await googleLogin();
        } catch (err) {
             if (err.code !== 'auth/popup-closed-by-user') {
                setError('Google Sign In failed: ' + err.message);
             }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-700 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />

            <div className="w-full max-w-md bg-white shadow-sm border border-slate-200/80 backdrop-blur-xl border border-slate-300 rounded-3xl p-8 shadow-2xl relative z-10 hidden-scrollbar overflow-y-auto max-h-[95vh]">
                
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20 mb-4">
                        <ShieldCheck className="w-8 h-8 text-slate-800" />
                    </div>
                </div>

                {/* Tabs for Login/Register */}
                <div className="flex bg-white shadow-sm p-1 rounded-xl mb-6 border border-slate-200">
                    <button 
                        onClick={() => { setIsLogin(true); setError(''); }}
                        className={`flex-1 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${isLogin ? 'bg-slate-200 text-slate-800 shadow-lg' : 'text-slate-500 hover:text-slate-600'}`}
                    >
                        Login
                    </button>
                    <button 
                         onClick={() => { setIsLogin(false); setError(''); }}
                         className={`flex-1 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${!isLogin ? 'bg-blue-900/50 text-blue-200 border border-blue-500/30' : 'text-slate-500 hover:text-slate-600'}`}
                    >
                        Register
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <div className="relative group animate-in slide-in-from-top-2 fade-in">
                            <User className="absolute left-3 top-3 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Identity Name"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-white shadow-sm border border-slate-300 rounded-xl py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-400"
                                required
                            />
                        </div>
                    )}

                    <div className="relative group">
                        <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Email Address"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            className="w-full bg-white shadow-sm border border-slate-300 rounded-xl py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-400"
                            required
                        />
                    </div>

                    <div className="relative group">
                        <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                            className="w-full bg-white shadow-sm border border-slate-300 rounded-xl py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-400"
                            required
                        />
                    </div>

                    {!isLogin && (
                        <div className="relative group animate-in slide-in-from-top-2 fade-in">
                            <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                            <input
                                type="password"
                                placeholder="Confirm Password"
                                value={formData.confirmPassword}
                                onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                                className="w-full bg-white shadow-sm border border-slate-300 rounded-xl py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-400"
                                required
                            />
                        </div>
                    )}

                    {error && (
                        <div className="text-red-400 text-[11px] font-bold uppercase tracking-wider text-center bg-red-950/30 py-3 rounded-lg border border-red-500/30 animate-in fade-in zoom-in-95">
                            {error}
                        </div>
                    )}
                     {verifyMsg && (
                        <div className="text-green-400 text-[11px] font-bold uppercase tracking-wider text-center bg-green-950/30 py-3 rounded-lg border border-green-500/30 animate-in fade-in zoom-in-95">
                            {verifyMsg}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full text-slate-800 font-black uppercase tracking-widest py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all mt-4 disabled:opacity-50 disabled:cursor-not-allowed ${isLogin ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/20' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/20'}`}
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (isLogin ? 'Authenticate' : 'Complete Registration')}
                        {!isLoading && <ArrowRight className="w-4 h-4" />}
                    </button>
                </form>

                <div className="my-6 flex items-center gap-4">
                    <div className="h-px bg-slate-100 border border-slate-200 flex-1" />
                    <span className="text-[10px] uppercase text-slate-400 font-bold">Or</span>
                    <div className="h-px bg-slate-100 border border-slate-200 flex-1" />
                </div>

                <button
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                    className="w-full bg-white text-black hover:bg-neutral-200 font-bold uppercase tracking-wider py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Continue with Google
                </button>
            </div>
        </div>
    );
};

export default LoginPage;
