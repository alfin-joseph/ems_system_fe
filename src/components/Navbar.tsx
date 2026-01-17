import { useState } from 'react';
import { Menu, X } from 'lucide-react';

interface User {
  name: string;
  email: string;
}

interface NavbarProps {
  onMenuToggle: (isOpen: boolean) => void;
  user?: User | null;
  onLogout?: () => void;
}

export function Navbar({ onMenuToggle, user, onLogout }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    onMenuToggle(!isOpen);
  };

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-blue-600 font-bold">
            EM
          </div>
          <span className="font-bold text-lg hidden sm:inline">Employee Management</span>
          <span className="font-bold text-lg sm:hidden">EMS</span>
        </div>

        {/* Menu Toggle Button (Mobile) */}
        <button
          onClick={handleToggle}
          className="lg:hidden p-2 hover:bg-blue-700 rounded-lg transition"
          aria-label="Toggle menu"
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-8">
          <a href="#/form-creation" className="hover:bg-blue-700 px-3 py-2 rounded-lg transition">
            Form Creation
          </a>
          <a href="#/employees" className="hover:bg-blue-700 px-3 py-2 rounded-lg transition">
            Employees
          </a>
          <a href="#/profile" className="hover:bg-blue-700 px-3 py-2 rounded-lg transition">
            Profile
          </a>
          <div className="flex items-center gap-4 border-l border-blue-500 pl-4">
            <span className="text-sm text-blue-100">{user?.name}</span>
            <button 
              onClick={onLogout}
              className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden border-t border-blue-500 bg-blue-700 px-4 py-4 space-y-2">
          <a href="#/form-creation" className="block px-3 py-2 rounded-lg hover:bg-blue-600 transition">
            Form Creation
          </a>
          <a href="#/employees" className="block px-3 py-2 rounded-lg hover:bg-blue-600 transition">
            Employees
          </a>
          <a href="#/profile" className="block px-3 py-2 rounded-lg hover:bg-blue-600 transition">
            Profile
          </a>
          <div className="border-t border-blue-500 pt-2 mt-2">
            <p className="text-xs text-blue-100 px-3 py-2">{user?.name}</p>
            <button 
              onClick={onLogout}
              className="w-full bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
