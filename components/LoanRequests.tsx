
import React, { useState } from 'react';
import { useLoanManager } from '../hooks/useLoanManager';
import { LoanStatus, RiskLevel } from '../types';
import { ConfirmationModal } from './ConfirmationModal';
import { Check, X, Eye, AlertCircle } from 'lucide-react';

const RiskBadge: React.FC<{ level: RiskLevel }> = ({ level }) => {
    const baseClasses = 'px-2 py-0.5 text-xs font-medium rounded-full';
    const colorClasses = {
      [RiskLevel.Low]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      [RiskLevel.Medium]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      [RiskLevel.High]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };
    return <span className={`${baseClasses} ${colorClasses[level]}`}>{level}</span>;
};

export const LoanRequests: React.FC = () => {
  const { loans, updateLoanStatus, setSelectedLoan, getClientById, setCurrentView } = useLoanManager();
  
  // State for Confirmation Modal
  const [actionToConfirm, setActionToConfirm] = useState<{ id: string; status: LoanStatus } | null>(null);

  const pendingLoans = loans.filter(loan => loan.status === LoanStatus.Pending);

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
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Pending Loan Requests</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Review and take action on new applications</p>
          </div>
          <button 
            onClick={() => setCurrentView('addLoan')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Create Request
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">Client</th>
                <th scope="col" className="px-6 py-3">Amount</th>
                <th scope="col" className="px-6 py-3">Type</th>
                <th scope="col" className="px-6 py-3">Request Date</th>
                <th scope="col" className="px-6 py-3">Client Risk</th>
                <th scope="col" className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingLoans.length > 0 ? (
                pendingLoans.map(loan => {
                    const client = getClientById(loan.clientId);
                    return (
                        <tr key={loan.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                            <td className="px-6 py-4">
                                <div className="font-medium text-gray-900 dark:text-white">{loan.clientName}</div>
                                <div className="text-xs text-gray-500">{client?.cnic}</div>
                            </td>
                            <td className="px-6 py-4 font-medium">${loan.loanAmount.toLocaleString()}</td>
                            <td className="px-6 py-4">{loan.loanType}</td>
                            <td className="px-6 py-4">{loan.startDate.toLocaleDateString()}</td>
                            <td className="px-6 py-4">
                                {client ? <RiskBadge level={client.riskLevel} /> : <span className="text-xs text-gray-400">Unknown</span>}
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end space-x-3">
                                    <button 
                                        onClick={() => setSelectedLoan(loan)}
                                        className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                                        title="View Details"
                                    >
                                        <Eye size={18} />
                                    </button>
                                    <button 
                                        onClick={() => initiateStatusChange(loan.id, LoanStatus.Approved)} 
                                        className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded transition-colors"
                                        title="Approve Application"
                                    >
                                        <Check size={18} />
                                    </button>
                                    <button 
                                        onClick={() => initiateStatusChange(loan.id, LoanStatus.Rejected)} 
                                        className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                                        title="Reject Application"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    );
                })
              ) : (
                  <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/20 rounded-lg">
                          <div className="flex flex-col items-center justify-center">
                            <AlertCircle className="h-10 w-10 text-gray-400 mb-2" />
                            <p className="text-lg font-medium">No pending requests</p>
                            <p className="text-sm">All loan applications have been processed.</p>
                          </div>
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
        title={actionToConfirm?.status === LoanStatus.Approved ? 'Approve Loan Request' : 'Reject Loan Request'}
        message={`Are you sure you want to ${actionToConfirm?.status === LoanStatus.Approved ? 'approve' : 'reject'} this loan application? This action cannot be undone.`}
        confirmLabel={actionToConfirm?.status === LoanStatus.Approved ? 'Approve Request' : 'Reject Request'}
        variant={actionToConfirm?.status === LoanStatus.Approved ? 'success' : 'danger'}
      />
    </>
  );
};
