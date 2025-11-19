
import React, { useState } from 'react';
import { Loan, RepaymentStatus, Client, RiskLevel } from '../types';
import { X, Lightbulb, Loader2 } from 'lucide-react';
import { useLoanManager } from '../hooks/useLoanManager';
import { getRiskScoreExplanation } from '../services/geminiService';

const RiskBadge: React.FC<{ level: RiskLevel }> = ({ level }) => {
    const baseClasses = 'px-2 py-0.5 text-xs font-medium rounded-full';
    const colorClasses = {
      [RiskLevel.Low]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      [RiskLevel.Medium]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      [RiskLevel.High]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };
    return <span className={`${baseClasses} ${colorClasses[level]}`}>{level}</span>;
  };

export const LoanDetailsModal: React.FC<{ loan: Loan; onClose: () => void }> = ({ loan, onClose }) => {
  const { getClientById, markRepaymentAsPaid } = useLoanManager();
  const client = getClientById(loan.clientId);
  const [explanation, setExplanation] = useState('');
  const [isExplainLoading, setIsExplainLoading] = useState(false);

  const handleExplainRisk = async () => {
    if (!client) return;
    setIsExplainLoading(true);
    setExplanation('');
    const result = await getRiskScoreExplanation(client);
    setExplanation(result);
    setIsExplainLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold text-black dark:text-white">Loan Details</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
            <X size={24} className="text-black dark:text-white" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Loan Info */}
                <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <h3 className="font-semibold text-lg border-b pb-2 dark:border-gray-600 text-black dark:text-white">Loan Information</h3>
                    <div className="flex justify-between"><span className="text-black dark:text-gray-400">Amount:</span> <span className="font-medium text-black dark:text-white">${loan.loanAmount.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-black dark:text-gray-400">Type:</span> <span className="font-medium text-black dark:text-white">{loan.loanType}</span></div>
                    <div className="flex justify-between"><span className="text-black dark:text-gray-400">Interest Rate:</span> <span className="font-medium text-black dark:text-white">{loan.interestRate}%</span></div>
                    <div className="flex justify-between"><span className="text-black dark:text-gray-400">Duration:</span> <span className="font-medium text-black dark:text-white">{loan.durationMonths} months</span></div>
                    <div className="flex justify-between"><span className="text-black dark:text-gray-400">Start Date:</span> <span className="font-medium text-black dark:text-white">{loan.startDate.toLocaleDateString()}</span></div>
                </div>
                {/* Client Info */}
                {client && (
                    <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <h3 className="font-semibold text-lg border-b pb-2 dark:border-gray-600 text-black dark:text-white">Client Information</h3>
                        <div className="flex justify-between"><span className="text-black dark:text-gray-400">Name:</span> <span className="font-medium text-black dark:text-white">{client.name}</span></div>
                        <div className="flex justify-between"><span className="text-black dark:text-gray-400">Phone:</span> <span className="font-medium text-black dark:text-white">{client.phone}</span></div>
                        <div className="flex justify-between items-center">
                            <span className="text-black dark:text-gray-400">Risk Profile:</span>
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-sm font-medium text-black dark:text-white">{(client.riskScore * 100).toFixed(1)}%</span>
                                <RiskBadge level={client.riskLevel} />
                            </div>
                        </div>
                        <div className="flex justify-between"><span className="text-black dark:text-gray-400">Previous Loans:</span> <span className="font-medium text-black dark:text-white">{client.previousLoans}</span></div>
                        <div className="flex justify-between"><span className="text-black dark:text-gray-400">Missed Payments:</span> <span className="font-medium text-black dark:text-white">{client.missedPayments}</span></div>
                         <div className="pt-2">
                            <button
                                onClick={handleExplainRisk}
                                disabled={isExplainLoading}
                                className="w-full flex items-center justify-center text-sm px-3 py-2 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900 disabled:opacity-50 transition-colors"
                            >
                                {isExplainLoading ? <Loader2 className="animate-spin mr-2" size={16} /> : <Lightbulb className="mr-2" size={16} />}
                                {isExplainLoading ? 'Analyzing...' : 'Explain Risk Score'}
                            </button>
                        </div>
                        {explanation && (
                            <div className="prose prose-sm dark:prose-invert max-w-none bg-gray-100 dark:bg-gray-800 p-3 rounded-lg mt-2 text-xs text-black dark:text-gray-300">
                                <div dangerouslySetInnerHTML={{ __html: explanation.replace(/\n/g, '<br />') }} />
                            </div>
                        )}
                    </div>
                )}
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2 text-black dark:text-white">Repayment Schedule</h3>
              <div className="overflow-x-auto border dark:border-gray-700 rounded-lg">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-black uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                      <th className="px-4 py-2">#</th>
                      <th className="px-4 py-2">Due Date</th>
                      <th className="px-4 py-2 text-right">Amount</th>
                      <th className="px-4 py-2 text-right">Principal</th>
                      <th className="px-4 py-2 text-right">Interest</th>
                      <th className="px-4 py-2 text-right">Balance</th>
                      <th className="px-4 py-2 text-center">Status</th>
                      <th className="px-4 py-2 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loan.repaymentSchedule.map((item) => (
                      <tr key={item.installmentNo} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-black dark:text-gray-300">
                        <td className="px-4 py-2">{item.installmentNo}</td>
                        <td className="px-4 py-2">{item.dueDate.toLocaleDateString()}</td>
                        <td className="px-4 py-2 text-right">${item.amount.toFixed(2)}</td>
                        <td className="px-4 py-2 text-right">${item.principal.toFixed(2)}</td>
                        <td className="px-4 py-2 text-right">${item.interest.toFixed(2)}</td>
                        <td className="px-4 py-2 text-right">${item.remainingBalance.toFixed(2)}</td>
                        <td className="px-4 py-2 text-center">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            item.status === RepaymentStatus.Paid ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            item.status === RepaymentStatus.Overdue ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                          }`}>{item.status}</span>
                        </td>
                        <td className="px-4 py-2 text-center">
                            {item.status !== RepaymentStatus.Paid && (
                                <button
                                    onClick={() => markRepaymentAsPaid(loan.id, item.installmentNo)}
                                    className="text-blue-600 hover:underline text-xs"
                                >
                                Mark as Paid
                                </button>
                            )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};
