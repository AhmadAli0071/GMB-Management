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
      className={`bg-white rounded-2xl border border-blue-100 shadow-lg shadow-blue-100/50 ${className}`}
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
  const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none rounded-xl cursor-pointer';

  const variants = {
    primary: 'bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-500 hover:to-blue-400 focus:ring-blue-400 shadow-lg shadow-blue-200 active:scale-[0.97]',
    secondary: 'bg-blue-50 text-blue-600 hover:bg-blue-100 focus:ring-blue-300 border border-blue-200',
    outline: 'border border-blue-200 bg-white hover:bg-blue-50 text-slate-600 focus:ring-blue-300',
    ghost: 'bg-transparent hover:bg-blue-50 text-slate-500 hover:text-blue-600',
    danger: 'bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-500 hover:to-red-400 focus:ring-red-400 shadow-lg shadow-red-200 active:scale-[0.97]',
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
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    yellow: 'bg-amber-50 text-amber-600 border-amber-200',
    red: 'bg-red-50 text-red-500 border-red-200',
    gray: 'bg-slate-100 text-slate-500 border-slate-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
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
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className={`relative bg-white rounded-2xl shadow-2xl w-full ${sizeClasses[size]} overflow-hidden z-10 border border-blue-100 my-4 sm:my-0`}
      >
        <div className="px-4 py-4 border-b border-blue-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <h3 className="text-lg font-bold text-slate-800 pr-2 leading-tight">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-blue-50 rounded-xl transition-colors text-slate-400 hover:text-slate-600 shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-4 py-5 max-h-[70vh] overflow-y-auto">
          {children}
        </div>
      </motion.div>
    </div>
  );
}

export function Input({ className = '', label, error, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-slate-600">{label}</label>}
      <input
        className={`block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 transition-all ${className} ${error ? 'border-red-500 ring-red-500' : ''}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function Textarea({ className = '', label, error, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; error?: string }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-slate-600">{label}</label>}
      <textarea
        className={`block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 transition-all min-h-[80px] ${className} ${error ? 'border-red-500 ring-red-500' : ''}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function Select({ className = '', label, error, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string; error?: string }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-slate-600">{label}</label>}
      <select
        className={`block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 transition-all ${className} ${error ? 'border-red-500 ring-red-500' : ''}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
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
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
        <h3 className="text-3xl font-bold mt-1 text-slate-800">{value}</h3>
      </div>
      <div className={`p-2.5 rounded-xl ${iconBg} ${iconColor}`}>
        <Icon size={20} />
      </div>
    </Card>
  );
}