
import React, { useState, useEffect } from 'react';
import type { Fare, User } from './types';
import Header from './components/Header';
import FareTable from './components/FareTable';
import LongTripCalculator from './components/LongTripCalculator';
import AuthPage from './components/AuthPage';
import UserManagement from './components/UserManagement';
import * as authService from './services/authService';
import * as fareService from './services/fareService';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(authService.getCurrentUser());
  const [activeView, setActiveView] = useState<'table' | 'calculator' | 'users'>('table');
  const [fares, setFares] = useState<Fare[]>(fareService.getFares());
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [pricePerKm, setPricePerKm] = useState<number>(3.50);

  useEffect(() => {
    fareService.storeFares(fares);
  }, [fares]);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  const filteredFares = React.useMemo(() => {
    return fares.filter(fare =>
      fare.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fare.region.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [fares, searchTerm]);

  const handleAddFare = (newFare: Fare) => {
    setFares(prevFares => [newFare, ...prevFares]);
  };

  const handleUpdateFare = (updatedFare: Fare) => {
    setFares(prevFares => prevFares.map(f => (f.id === updatedFare.id ? updatedFare : f)));
  };

  const handleDeleteFare = (fareId: string) => {
    setFares(prevFares => prevFares.filter(f => f.id !== fareId));
  };
  
  const handleImportFares = (newFares: Fare[]) => {
    setFares(prevFares => [...prevFares, ...newFares]);
  };

  if (!currentUser) {
    return <AuthPage onLoginSuccess={handleLoginSuccess} />;
  }

  const isAdmin = currentUser.role === 'admin';

  const renderActiveView = () => {
    switch (activeView) {
      case 'table':
        return (
          <FareTable
            fares={filteredFares}
            isAdmin={isAdmin}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onAddFare={handleAddFare}
            onUpdateFare={handleUpdateFare}
            onDeleteFare={handleDeleteFare}
            onImportFares={handleImportFares}
          />
        );
      case 'calculator':
        return (
          <LongTripCalculator 
            isAdmin={isAdmin}
            pricePerKm={pricePerKm}
            setPricePerKm={setPricePerKm}
          />
        );
      case 'users':
        return isAdmin ? <UserManagement /> : <p>Acesso negado.</p>;
      default:
        return null;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <Header 
        user={currentUser}
        onLogout={handleLogout}
        activeView={activeView}
        onViewChange={setActiveView}
      />
      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {renderActiveView()}
      </main>
      <footer className="text-center p-4 text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} TABELA TÁXI. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};

export default App;
