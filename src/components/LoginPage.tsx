/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Button, Card, Input } from './ui/Common';
import { UserRole } from '../types';
import { MOCK_USERS } from '../constants';

interface LoginPageProps {
  onLogin: (role: UserRole) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('khuzaima@crossdigi.com');
  const [password, setPassword] = useState('password');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = Object.values(MOCK_USERS).find(u => u.email === email);
    if (user) {
      onLogin(user.role);
    } else {
      alert('Invalid credentials. For demo, use: khuzaima@crossdigi.com, ali@crossdigi.com, muaz@crossdigi.com, awais@crossdigi.com, or hassan@crossdigi.com');
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl opacity-60"></div>
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-100 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl opacity-40"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-200">
            <span className="text-white font-bold text-3xl font-display">C</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">CrossDigi</h1>
          <p className="text-gray-500 mt-2 font-medium">SEO Project Management System</p>
        </div>

        <Card className="p-8 shadow-2xl border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input 
              label="Email Address" 
              type="email" 
              placeholder="name@crossdigi.com" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input 
              label="Password" 
              type="password" 
              placeholder="••••••••" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="text-xs text-gray-500">Remember me</span>
              </label>
              <a href="#" className="text-xs text-blue-600 hover:text-blue-700 font-medium">Forgot password?</a>
            </div>

            <Button type="submit" className="w-full" size="lg">
              Sign In
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-xs text-center text-gray-400 mb-4 font-medium uppercase tracking-widest">Demo Accounts</p>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => { setEmail('khuzaima@crossdigi.com'); setPassword('password'); }}
                className="text-[10px] bg-gray-50 hover:bg-gray-100 text-gray-600 py-1.5 px-2 rounded border border-gray-200 transition-colors"
              >
                Sales Manager
              </button>
              <button 
                onClick={() => { setEmail('ali@crossdigi.com'); setPassword('password'); }}
                className="text-[10px] bg-gray-50 hover:bg-gray-100 text-gray-600 py-1.5 px-2 rounded border border-gray-200 transition-colors"
              >
                SEO Manager
              </button>
              <button 
                onClick={() => { setEmail('muaz@crossdigi.com'); setPassword('password'); }}
                className="text-[10px] bg-gray-50 hover:bg-gray-100 text-gray-600 py-1.5 px-2 rounded border border-gray-200 transition-colors"
              >
                SEO Lead
              </button>
              <button 
                onClick={() => { setEmail('hassan@crossdigi.com'); setPassword('password'); }}
                className="text-[10px] bg-gray-50 hover:bg-gray-100 text-gray-600 py-1.5 px-2 rounded border border-gray-200 transition-colors"
              >
                Intern
              </button>
            </div>
          </div>
        </Card>

        <p className="text-center text-sm text-gray-500 mt-8">
          Authorized personnel only. Access is tracked and monitored.
        </p>
      </motion.div>
    </div>
  );
}
