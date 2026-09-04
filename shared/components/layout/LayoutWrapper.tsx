'use client';

import { useEffect, useState } from 'react';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('nav-collapsed');
    setCollapsed(saved === 'true');
  }, []);

  useEffect(() => {
    document.querySelector('main')?.classList.toggle('nav-collapsed', collapsed);
  }, [collapsed]);

  return <>{children}</>;
}
