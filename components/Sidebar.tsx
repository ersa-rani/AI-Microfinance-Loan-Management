
import React from 'react';
import { LayoutDashboard, Users, Landmark, Github, ClipboardList, Briefcase, Settings, FileText, HandCoins } from 'lucide-react';
import { useLoanManager } from '../hooks/useLoanManager';

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
  <li
    className={`flex items-center p-3 my-1 rounded-lg cursor-pointer transition-colors ${
      isActive
        ? 'bg-blue-600 text-white'
        : 'text-gray-400 hover:bg-gray-700 hover:text-white'
    }`}
    onClick={onClick}
  >
    {icon}
    <span className="ml-4 text-sm font-medium">{label}</span>
  </li>
);

export const Sidebar: React.FC = () => {
  const { currentView, setCurrentView } = useLoanManager();
  return (
    <div className="hidden md:flex flex-col w-64 bg-gray-800 text-white">
      <div className="flex items-center justify-center h-20 border-b border-gray-700">
        <Landmark className="h-8 w-8 text-blue-400" />
        <h1 className="ml-3 text-xl font-bold">MLMS.AI</h1>
      </div>
      <nav className="flex-1 px-4 py-4">
        <ul>
          <NavItem
            icon={<LayoutDashboard size={20} />}
            label="Dashboard"
            isActive={currentView === 'dashboard'}
            onClick={() => setCurrentView('dashboard')}
          />
          <NavItem
            icon={<Users size={20} />}
            label="Clients"
            isActive={currentView === 'clients'}
            onClick={() => setCurrentView('clients')}
          />
          <NavItem
            icon={<Landmark size={20} />}
            label="Loans"
            isActive={currentView === 'loans'}
            onClick={() => setCurrentView('loans')}
          />
          <NavItem
            icon={<ClipboardList size={20} />}
            label="Loan Requests"
            isActive={currentView === 'loanRequests'}
            onClick={() => setCurrentView('loanRequests')}
          />
          <NavItem
            icon={<HandCoins size={20} />}
            label="Collections"
            isActive={currentView === 'collections'}
            onClick={() => setCurrentView('collections')}
          />
          <NavItem
            icon={<FileText size={20} />}
            label="Reports"
            isActive={currentView === 'reports'}
            onClick={() => setCurrentView('reports')}
          />
           <NavItem
            icon={<Briefcase size={20} />}
            label="Loan Products"
            isActive={currentView === 'loanProducts' || currentView === 'addLoanProduct'}
            onClick={() => setCurrentView('loanProducts')}
          />
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-700">
          <button 
            onClick={() => setCurrentView('settings')}
            className={`flex items-center w-full mb-4 transition-colors ${currentView === 'settings' ? 'text-white' : 'text-gray-400 hover:text-white'}`}
          >
              <Settings size={20} />
              <span className="ml-3 text-sm">Settings</span>
          </button>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="flex items-center text-gray-400 hover:text-white transition-colors">
              <Github size={20} />
              <span className="ml-3 text-sm">View on GitHub</span>
          </a>
      </div>
    </div>
  );
};
