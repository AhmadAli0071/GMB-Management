import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';

interface CardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '', ...props }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-slate-800/50 rounded-xl border border-slate-700/50 shadow-lg shadow-black/10 backdrop-blur-sm ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  className = '',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:pointer-events-none rounded-xl cursor-pointer';

  const variants = {
    primary: 'bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-500 hover:to-blue-400 focus:ring-blue-500 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 active:scale-[0.97]',
    secondary: 'bg-slate-700/50 text-blue-400 hover:bg-slate-700 hover:text-blue-300 focus:ring-blue-400 border border-slate-600/50',
    outline: 'border border-slate-600 bg-slate-800/50 hover:bg-slate-700 text-slate-300 focus:ring-slate-500',
    ghost: 'bg-transparent hover:bg-slate-700/50 text-slate-400 hover:text-slate-200',
    danger: 'bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-500 hover:to-red-400 focus:ring-red-500 shadow-lg shadow-red-500/25 active:scale-[0.97]',
  };

  const sizes = {
    sm: 'px-3.5 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3 text-base',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : null}
      {children}
    </button>
  );
};

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'blue' | 'green' | 'yellow' | 'red' | 'gray' | 'purple' | 'orange';
  className?: string;
}

export function Badge({ children, variant = 'gray', className = '' }: BadgeProps) {
  const variants = {
    blue: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    green: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    yellow: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    red: 'bg-red-500/15 text-red-400 border-red-500/30',
    gray: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
    purple: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    orange: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  if (!isOpen) return null;

  const sizeClasses = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' };

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className={`relative bg-slate-800 rounded-xl sm:rounded-2xl shadow-2xl shadow-black/50 w-full ${sizeClasses[size]} overflow-hidden z-10 border border-slate-700/50 my-4 sm:my-0`}
      >
        <div className="px-3 py-3 sm:px-6 sm:py-4 border-b border-slate-700/50 flex items-center justify-between sticky top-0 bg-slate-800 z-10">
          <h3 className="text-base sm:text-lg font-bold text-slate-100 pr-2 leading-tight">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-500 hover:text-slate-300 shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-3 py-4 sm:px-6 sm:py-5 max-h-[70vh] overflow-y-auto">
          {children}
        </div>
      </motion.div>
    </div>
  );
}

export function Input({ className = '', label, error, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string }) {
  return (
    <div className="space-y-1">
      {label && <label className="block text-xs sm:text-sm font-medium text-slate-300">{label}</label>}
      <input
        className={`block w-full px-3 py-2 sm:px-4 sm:py-2.5 bg-slate-900/50 border border-slate-700/50 rounded-lg sm:rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all ${className} ${error ? 'border-red-500 ring-red-500' : ''}`}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

export function Textarea({ className = '', label, error, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; error?: string }) {
  return (
    <div className="space-y-1">
      {label && <label className="block text-xs sm:text-sm font-medium text-slate-300">{label}</label>}
      <textarea
        className={`block w-full px-3 py-2 sm:px-4 sm:py-2.5 bg-slate-900/50 border border-slate-700/50 rounded-lg sm:rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all min-h-[70px] sm:min-h-[80px] ${className} ${error ? 'border-red-500 ring-red-500' : ''}`}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

export function Select({ className = '', label, error, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string; error?: string }) {
  return (
    <div className="space-y-1">
      {label && <label className="block text-xs sm:text-sm font-medium text-slate-300">{label}</label>}
      <select
        className={`block w-full px-3 py-2 sm:px-4 sm:py-2.5 bg-slate-900/50 border border-slate-700/50 rounded-lg sm:rounded-xl text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all ${className} ${error ? 'border-red-500 ring-red-500' : ''}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  iconBg: string;
  iconColor: string;
}

export function StatCard({ icon: Icon, label, value, iconBg, iconColor }: StatCardProps) {
  return (
    <Card className="p-5 flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
        <h3 className="text-3xl font-bold mt-1 text-slate-100">{value}</h3>
      </div>
      <div className={`p-2.5 rounded-xl ${iconBg} ${iconColor}`}>
        <Icon size={20} />
      </div>
    </Card>
  );
}
