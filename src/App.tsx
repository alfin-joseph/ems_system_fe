import { useState, useMemo } from 'react';
import { Layout } from './components';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { FormCreationPage } from './pages/FormCreationPage';
import { EmployeesPage } from './pages/EmployeesPage';
import { ProfilePage } from './pages/ProfilePage';

interface User {
  name: string;
  email: string;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState('employees');
  const [authPage, setAuthPage] = useState<'login' | 'register'>('login');

  const handleLogin = (email: string) => {
    // Password is used for API authentication but not needed here
    // as tokens are stored in localStorage
    const name = email.split('@')[0];
    setUser({ name, email });
    setIsAuthenticated(true);
  };

  const handleRegister = (data: { name: string; email: string; password: string; confirmPassword: string }) => {
    // Simulate successful registration
    setUser({ name: data.name, email: data.email });
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setAuthPage('login');
  };

  const renderPage = useMemo(() => {
    switch (currentPage) {
      case 'form-creation':
        return <FormCreationPage />;
      case 'employees':
        return <EmployeesPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <EmployeesPage />;
    }
  }, [currentPage]);

  // Show login/register if not authenticated
  if (!isAuthenticated) {
    return authPage === 'login' ? (
      <LoginPage
        onLogin={handleLogin}
        onSwitchToRegister={() => setAuthPage('register')}
      />
    ) : (
      <RegisterPage
        onRegister={handleRegister}
        onSwitchToLogin={() => setAuthPage('login')}
      />
    );
  }

  // Show main app if authenticated
  return (
    <Layout onNavigate={setCurrentPage} onLogout={handleLogout} user={user}>
      {renderPage}
    </Layout>
  );
}

export default App;
