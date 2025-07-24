// frontend/components/Layout.tsx
import { ReactNode } from 'react';
import { Sidebar } from './sidebar';

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
