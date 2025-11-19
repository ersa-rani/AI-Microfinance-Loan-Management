
import React from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { ClientList } from './components/ClientList';
import { LoanList } from './components/LoanList';
import { LoanRequests } from './components/LoanRequests';
import { AddLoanForm } from './components/AddLoanForm';
import { LoanProvider, useLoanManager } from './hooks/useLoanManager';
import { LoanDetailsModal } from './components/LoanDetailsModal';
import { LoanProductsList } from './components/LoanProductsList';
import { AddLoanProductForm } from './components/AddLoanProductForm';
import { ClientDetailsView } from './components/ClientDetailsView';
import { SettingsPage } from './components/SettingsPage';
import { Collections } from './components/Collections';
import { Reports } from './components/Reports';

const AppContent: React.FC = () => {
  const { currentView, selectedLoan, setSelectedLoan } = useLoanManager();

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'clients':
        return <ClientList />;
      case 'clientDetails':
        return <ClientDetailsView />;
      case 'loans':
        return <LoanList />;
      case 'loanRequests':
        return <LoanRequests />;
      case 'addLoan':
        return <AddLoanForm />;
      case 'collections':
        return <Collections />;
      case 'reports':
        return <Reports />;
      case 'loanProducts':
        return <LoanProductsList />;
      case 'addLoanProduct':
        return <AddLoanProductForm />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
          {renderView()}
        </main>
      </div>
      {selectedLoan && <LoanDetailsModal loan={selectedLoan} onClose={() => setSelectedLoan(null)} />}
    </div>
  );
}


export default function App() {
  return (
    <LoanProvider>
      <AppContent />
    </LoanProvider>
  );
}
