import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Button, Card, Input, Select } from './ui/Common';
import { UserRole, ROLE_LABELS } from '../types';
import { User } from '../types';
import { api } from '../api';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [id, setId] = useState('');
  const [role, setRole] = useState<UserRole>('DESIGNER');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token, user } = await api.login(email, password);
      localStorage.setItem('token', token);
      onLogin(user);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token, user } = await api.register({ id, name, email, password, role });
      localStorage.setItem('token', token);
      onLogin(user);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setError('');
    setEmail('');
    setPassword('');
    setName('');
    setId('');
    setRole('DESIGNER');
    setIsLogin(!isLogin);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-400/10 rounded-full -translate-y-1/3 translate-x-1/3 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-300/10 rounded-full translate-y-1/3 -translate-x-1/3 blur-3xl"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <img src="/logo.PNG" alt="CrossDigi" className="w-16 h-16 rounded-2xl mx-auto mb-4 shadow-xl shadow-blue-300 object-contain" />
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">CrossDigi</h1>
          <p className="text-blue-500 mt-2 font-medium">SEO Project Management System</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-500 text-center">
            {error}
          </div>
        )}

        <Card className="p-6 shadow-xl border border-blue-100">
          <div className="flex mb-6 bg-blue-50 rounded-xl p-1 border border-blue-100">
            <button
              onClick={() => { if (!isLogin) switchMode(); }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${isLogin ? 'bg-white text-blue-600 shadow-sm text-slate-700' : 'text-blue-400 hover:text-blue-500'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => { if (isLogin) switchMode(); }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${!isLogin ? 'bg-white text-blue-600 shadow-sm text-slate-700' : 'text-blue-400 hover:text-blue-500'}`}
            >
              Sign Up
            </button>
          </div>

          {isLogin ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <Input label="Email Address" type="email" placeholder="name@crossdigi.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
              <Input label="Password" type="password" placeholder="Enter password" required value={password} onChange={(e) => setPassword(e.target.value)} />
              <Button type="submit" className="w-full shadow-lg shadow-blue-200" size="lg" isLoading={loading}>Sign In</Button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <Input label="User ID" type="text" placeholder="e.g. khuzaima" required value={id} onChange={(e) => setId(e.target.value)} />
              <Input label="Full Name" type="text" placeholder="e.g. Khuzaima Ahmad" required value={name} onChange={(e) => setName(e.target.value)} />
              <Input label="Email Address" type="email" placeholder="name@crossdigi.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
              <Input label="Password" type="password" placeholder="Create a password" required value={password} onChange={(e) => setPassword(e.target.value)} />
              <Select label="Role" required value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
                {Object.entries(ROLE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </Select>
              <Button type="submit" className="w-full shadow-lg shadow-blue-200" size="lg" isLoading={loading}>Create Account</Button>
            </form>
          )}
        </Card>
      </motion.div>
    </div>
  );
}