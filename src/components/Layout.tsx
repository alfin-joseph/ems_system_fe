import { useState } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

interface User {
  name: string;
  email: string;
}

interface LayoutProps {
  children?: React.ReactNode;
  onNavigate?: (page: string) => void;
  onLogout?: () => void;
  user?: User | null;
}

export function Layout({ children, onNavigate, onLogout, user }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleNavigation = (page: string) => {
    onNavigate?.(page);
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onNavigate={handleNavigation} onLogout={onLogout} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <Navbar onMenuToggle={setSidebarOpen} user={user} onLogout={onLogout} />

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
