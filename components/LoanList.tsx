
import React, { useState, useMemo } from 'react';
import { useLoanManager } from '../hooks/useLoanManager';
import { Loan, LoanStatus } from '../types';
import { Filter, X } from 'lucide-react';
import { ConfirmationModal } from './ConfirmationModal';

const LoanStatusBadge: React.FC<{ status: LoanStatus }> = ({ status }) => {
    const baseClasses = 'px-3 py-1 text-xs font-semibold rounded-full inline-block';
    const colorClasses = {
      [LoanStatus.Pending]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      [LoanStatus.Processing]: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      [LoanStatus.Approved]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      [LoanStatus.Active]: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
      [LoanStatus.Paid]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      [LoanStatus.Rejected]: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
      [LoanStatus.Default]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };
    return <span className={`${baseClasses} ${colorClasses[status]}`}>{status}</span>;
  };

export const LoanList: React.FC = () => {
  const { loans, updateLoanStatus, setSelectedLoan, filteredClientId, setFilteredClientId, getClientById, setCurrentView } = useLoanManager();
  const [filterStatus, setFilterStatus] = useState<LoanStatus | 'all'>('all');
  
  // State for Confirmation Modal
  const [actionToConfirm, setActionToConfirm] = useState<{ id: string; status: LoanStatus } | null>(null);

  const filteredClientName = useMemo(() => {
      if (!filteredClientId) return null;
      const client = getClientById(filteredClientId);
      return client ? client.name : 'Unknown Client';
  }, [filteredClientId, getClientById]);

  const filteredLoans = useMemo(() => {
    let result = loans;

    // Filter by Client if ID is present in global state
    if (filteredClientId) {
        result = result.filter(loan => loan.clientId === filteredClientId);
    }

    // Filter by Status (Dropdown)
    if (filterStatus !== 'all') {
      result = result.filter(loan => loan.status === filterStatus);
    }
    return result;
  }, [loans, filterStatus, filteredClientId]);

  const initiateStatusChange = (id: string, status: LoanStatus) => {
    setActionToConfirm({ id, status });
  };

  const executeStatusChange = () => {
    if (actionToConfirm) {
      updateLoanStatus(actionToConfirm.id, actionToConfirm.status);
      setActionToConfirm(null);
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Loan Applications</h2>
          <button 
            onClick={() => setCurrentView('addLoan')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            New Loan Application
          </button>
        </div>

        {/* Active Filters Banner */}
        {filteredClientId && (
             <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-6 flex justify-between items-center">
                <div className="flex items-center text-blue-800 dark:text-blue-200">
                    <Filter size={16} className="mr-2" />
                    <span className="text-sm font-medium">Filtered by Client: <strong>{filteredClientName}</strong></span>
                </div>
                <button 
                    onClick={() => setFilteredClientId(null)}
                    className="flex items-center text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 px-2 py-1 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                    <X size={14} className="mr-1" /> Clear Filter
                </button>
             </div>
        )}

        <div className="flex justify-start mb-6">
            <div>
                <label htmlFor="status-filter" className="sr-only">Filter by status</label>
                <select
                    id="status-filter"
                    name="status-filter"
                    className="block pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as LoanStatus | 'all')}
                >
                    <option value="all">Filter by Status (All)</option>
                    {Object.values(LoanStatus).map(status => (
                    <option key={status} value={status}>{status}</option>
                    ))}
                </select>
            </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">Client Name</th>
                <th scope="col" className="px-6 py-3">Amount</th>
                <th scope="col" className="px-6 py-3">Type</th>
                <th scope="col" className="px-6 py-3">Start Date</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLoans.length > 0 ? (
                filteredLoans.map(loan => (
                    <tr key={loan.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                        {loan.clientName}
                    </td>
                    <td className="px-6 py-4">${loan.loanAmount.toLocaleString()}</td>
                    <td className="px-6 py-4">{loan.loanType}</td>
                    <td className="px-6 py-4">{loan.startDate.toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                        <LoanStatusBadge status={loan.status} />
                    </td>
                    <td className="px-6 py-4 flex items-center space-x-2">
                        <button onClick={() => setSelectedLoan(loan)} className="font-medium text-blue-600 dark:text-blue-500 hover:underline">
                        Details
                        </button>
                        {loan.status === LoanStatus.Pending && (
                        <>
                            <button 
                                onClick={() => initiateStatusChange(loan.id, LoanStatus.Approved)} 
                                className="font-medium text-green-600 dark:text-green-500 hover:underline"
                            >
                                Approve
                            </button>
                            <button 
                                onClick={() => initiateStatusChange(loan.id, LoanStatus.Rejected)} 
                                className="font-medium text-red-600 dark:text-red-500 hover:underline"
                            >
                                Reject
                            </button>
                        </>
                        )}
                    </td>
                    </tr>
                ))
              ) : (
                  <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                          No loans found matching the current filters.
                      </td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <ConfirmationModal 
        isOpen={!!actionToConfirm}
        onClose={() => setActionToConfirm(null)}
        onConfirm={executeStatusChange}
        title={actionToConfirm?.status === LoanStatus.Approved ? 'Approve Loan' : 'Reject Loan'}
        message={`Are you sure you want to ${actionToConfirm?.status === LoanStatus.Approved ? 'approve' : 'reject'} this loan application? This action cannot be undone.`}
        confirmLabel={actionToConfirm?.status === LoanStatus.Approved ? 'Approve' : 'Reject'}
        variant={actionToConfirm?.status === LoanStatus.Approved ? 'success' : 'danger'}
      />
    </>
  );
};
