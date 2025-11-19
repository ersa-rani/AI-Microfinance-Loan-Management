
import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, User, Landmark as LoanIcon, Users as ClientIcon } from 'lucide-react';
import { useLoanManager } from '../hooks/useLoanManager';
import { Client, Loan } from '../types';

type SearchResult = { type: 'client', data: Client } | { type: 'loan', data: Loan };

export const Header: React.FC = () => {
  const { clients, loans, setCurrentView, setSelectedLoan, userProfile } = useLoanManager();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim() === '') {
      setResults([]);
      setShowResults(false);
      return;
    }

    const lowerCaseQuery = query.toLowerCase();
    const filteredClients = clients
        .filter(c => 
            c.name.toLowerCase().includes(lowerCaseQuery) ||
            c.cnic.includes(lowerCaseQuery)
        )
        .map(c => ({ type: 'client', data: c } as SearchResult));

    const filteredLoans = loans
        .filter(l =>
            l.clientName?.toLowerCase().includes(lowerCaseQuery) ||
            l.loanType.toLowerCase().includes(lowerCaseQuery) ||
            l.status.toLowerCase().includes(lowerCaseQuery) ||
            String(l.loanAmount).includes(lowerCaseQuery)
        )
        .map(l => ({ type: 'loan', data: l } as SearchResult));
    
    const combinedResults = [...filteredClients, ...filteredLoans].slice(0, 10); // Limit results
    setResults(combinedResults);
    setShowResults(combinedResults.length > 0);

  }, [query, clients, loans]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClientClick = (client: Client) => {
    setCurrentView('clients');
    setQuery('');
    setShowResults(false);
  };
  
  const handleLoanClick = (loan: Loan) => {
    setSelectedLoan(loan);
    setQuery('');
    setShowResults(false);
  };

  const clientResults = results.filter(r => r.type === 'client');
  const loanResults = results.filter(r => r.type === 'loan');

  return (
    <header className="flex items-center justify-between h-16 px-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center">
        <div className="relative" ref={searchContainerRef}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search clients, loans..."
            className="w-full sm:w-64 pl-10 pr-4 py-2 text-sm text-gray-700 bg-gray-100 dark:bg-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.trim() && setShowResults(true)}
          />
          {showResults && (
            <div className="absolute top-full mt-2 w-full sm:w-96 max-h-96 overflow-y-auto bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-xl z-10">
              {clientResults.length > 0 && (
                <div>
                  <h3 className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase border-b dark:border-gray-700">Clients</h3>
                  <ul>
                    {clientResults.map(res => (
                       <li key={res.data.id} onClick={() => handleClientClick(res.data as Client)} className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                          <ClientIcon className="h-4 w-4 mr-3 text-gray-400"/>
                          <div>
                            <p className="text-sm font-medium">{res.data.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{(res.data as Client).cnic}</p>
                          </div>
                       </li>
                    ))}
                  </ul>
                </div>
              )}
              {loanResults.length > 0 && (
                <div>
                  <h3 className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase border-b dark:border-gray-700">Loans</h3>
                  <ul>
                  {loanResults.map(res => (
                       <li key={res.data.id} onClick={() => handleLoanClick(res.data as Loan)} className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                          <LoanIcon className="h-4 w-4 mr-3 text-gray-400"/>
                          <div>
                            <p className="text-sm font-medium">{res.data.clientName}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              ${(res.data as Loan).loanAmount.toLocaleString()} - {(res.data as Loan).loanType}
                            </p>
                          </div>
                       </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
          <Bell className="h-6 w-6 text-gray-500 dark:text-gray-400" />
        </button>
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center overflow-hidden">
            {userProfile.avatar ? (
                <img src={userProfile.avatar} alt="User Avatar" className="w-full h-full object-cover" />
            ) : (
                <User className="h-6 w-6 text-gray-500 dark:text-gray-400" />
            )}
          </div>
          <div className="ml-3 hidden sm:block">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{userProfile.firstName} {userProfile.lastName}</p>
          </div>
        </div>
      </div>
    </header>
  );
};
