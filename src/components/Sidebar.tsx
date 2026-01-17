import { useState } from 'react';
import { ChevronRight } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (page: string) => void;
  onLogout?: () => void;
}

interface NavItem {
  label: string;
  key: string;
  icon: string;
}

const navItems: NavItem[] = [
  { label: 'Form Creation', key: 'form-creation', icon: '📝' },
  { label: 'Employees', key: 'employees', icon: '👥' },
  { label: 'Profile', key: 'profile', icon: '👤' },
];

export function Sidebar({ isOpen, onClose, onNavigate, onLogout }: SidebarProps) {
  const [activeItem, setActiveItem] = useState('employees');

  const handleItemClick = (key: string) => {
    setActiveItem(key);
    onNavigate?.(key);
    onClose();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-30"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 w-64 bg-gray-900 text-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 z-40 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-screen">
          {/* Sidebar Header */}
          <div className="px-6 py-8 border-b border-gray-800">
            <h2 className="text-xl font-bold text-blue-400">EMS Portal</h2>
            <p className="text-xs text-gray-400 mt-1">Employee Management System</p>
          </div>

          {/* Main Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => handleItemClick(item.key)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition group ${
                  activeItem === item.key
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="flex-1 font-medium text-left">{item.label}</span>
                {activeItem === item.key && (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            ))}
          </nav>

          {/* Bottom Navigation */}
          <div className="border-t border-gray-800 px-4 py-6">
            {/* Logout Button */}
            <button 
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition"
            >
              <span className="text-xl">🚪</span>
              <span className="flex-1 text-left">Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
