import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-white dark:bg-slate-800 dark:bg-slate-800 rounded-lg shadow-md p-6 ${className}`}>
      {children}
    </div>
  );
}
