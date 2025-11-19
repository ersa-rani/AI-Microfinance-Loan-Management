
import React, { useState, useEffect } from 'react';
import { useLoanManager } from '../hooks/useLoanManager';
import { Client, LoanStatus } from '../types';
import { NewClientModal } from './NewClientModal';
import { ExportBorrowersModal } from './ExportBorrowersModal';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

export const ClientList: React.FC = () => {
  const { clients, loans, setCurrentView, setSelectedClient, setFilteredClientId } = useLoanManager();
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  // Setting itemsPerPage to 1 to demonstrate pagination with the small default dataset (3 items)
  // In a real production environment with more data, this would typically be 10 or 20.
  const itemsPerPage = 1; 

  const handleViewDetails = (client: Client) => {
      setSelectedClient(client);
      setFilteredClientId(client.id);
      setCurrentView('clientDetails');
  };

  const calculateActiveLoansDue = (clientId: string) => {
      const clientLoans = loans.filter(l => l.clientId === clientId && l.status === LoanStatus.Active);
      if (clientLoans.length === 0) return 0;
      
      // Sum of remaining balance for all active loans
      return clientLoans.reduce((acc, loan) => {
          const loanBalance = loan.repaymentSchedule.reduce((sum, rep) => sum + rep.remainingBalance, 0);
          return acc + loanBalance; 
      }, 0);
  };

  const calculateActiveLoansPaid = (clientId: string) => {
       const clientLoans = loans.filter(l => l.clientId === clientId && l.status === LoanStatus.Active);
       if (clientLoans.length === 0) return 0;

       return clientLoans.reduce((acc, loan) => {
           // Paid amount = Total expected - Total remaining
           const totalExpected = loan.repaymentSchedule.reduce((s, r) => s + r.amount, 0);
           const totalRemaining = loan.repaymentSchedule.reduce((s, r) => s + r.remainingBalance, 0);
           return acc + (totalExpected - totalRemaining);
       }, 0);
  };

  const FormatCurrency = ({ val }: { val: number }) => (
    <span className="whitespace-nowrap">
        <span className="text-[10px] text-gray-400 font-semibold mr-1 uppercase">K</span>
        {val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
        <span className="text-[10px] text-gray-400 font-semibold ml-1 uppercase">ZMW</span>
    </span>
  );

  const filteredClients = clients.filter(client => 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      client.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination Logic
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentClients = filteredClients.slice(startIndex, startIndex + itemsPerPage);

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, clients]);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  return (
    <>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-black dark:text-white">Borrowers</h2>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Search Borrower..." 
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white text-black"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                    <button 
                        onClick={() => setIsExportModalOpen(true)}
                        className="flex-1 sm:flex-none px-4 py-2 bg-white border border-gray-300 dark:border-gray-600 text-black dark:text-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        Export Borrowers
                    </button>
                    <button 
                        onClick={() => setIsNewClientModalOpen(true)}
                        className="flex-1 sm:flex-none px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
                        Add Client
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto flex-1">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-white border-b dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3 font-bold text-black dark:text-gray-300">Email</th>
                            <th scope="col" className="px-6 py-3 font-bold text-black dark:text-gray-300">Name</th>
                            <th scope="col" className="px-6 py-3 font-bold text-black dark:text-gray-300">ID</th>
                            <th scope="col" className="px-6 py-3 font-bold text-black dark:text-gray-300">Phone</th>
                            <th scope="col" className="px-6 py-3 font-bold text-black dark:text-gray-300">Active Loans Due</th>
                            <th scope="col" className="px-6 py-3 font-bold text-black dark:text-gray-300">Active Loans Paid</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentClients.length > 0 ? (
                            currentClients.map(client => (
                            <tr 
                                key={client.id} 
                                onClick={() => handleViewDetails(client)}
                                className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                            >
                                <td className="px-6 py-4 whitespace-nowrap text-black dark:text-gray-300">
                                    {client.email || '--'}
                                </td>
                                <td className="px-6 py-4 font-medium text-black dark:text-white whitespace-nowrap">
                                    {client.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-black dark:text-gray-300">{client.cnic}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-black dark:text-gray-300">{client.phone || '--'}</td>
                                <td className="px-6 py-4 font-medium text-black dark:text-white">
                                    <FormatCurrency val={calculateActiveLoansDue(client.id)} />
                                </td>
                                <td className="px-6 py-4 font-medium text-black dark:text-white">
                                    <FormatCurrency val={calculateActiveLoansPaid(client.id)} />
                                </td>
                            </tr>
                            ))
                        ) : (
                             <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                    No borrowers found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            <div className="flex justify-between items-center pt-4 border-t dark:border-gray-700 mt-auto">
                 <span className="text-sm text-gray-500 dark:text-gray-400">
                    Showing {filteredClients.length > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + itemsPerPage, filteredClients.length)} of {filteredClients.length} results
                 </span>
                 <div className="flex space-x-1">
                     <button 
                        onClick={handlePrevPage}
                        disabled={currentPage === 1}
                        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 text-gray-500 dark:text-gray-400"
                     >
                         <ChevronLeft size={20} />
                     </button>
                     <button className="px-3 py-1 rounded bg-indigo-600 text-white text-sm font-medium">
                         {currentPage}
                     </button>
                     <button 
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages || totalPages === 0}
                        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 text-gray-500 dark:text-gray-400"
                     >
                         <ChevronRight size={20} />
                     </button>
                 </div>
            </div>
        </div>
        <NewClientModal isOpen={isNewClientModalOpen} onClose={() => setIsNewClientModalOpen(false)} />
        <ExportBorrowersModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} />
    </>
  );
};
