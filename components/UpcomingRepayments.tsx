import React from 'react';
import { BellRing, CheckCircle, Eye } from 'lucide-react';
import { useLoanManager } from '../hooks/useLoanManager';

export const UpcomingRepayments: React.FC = () => {
    const { upcomingRepayments, markRepaymentAsPaid, setSelectedLoan, loans, setCurrentView } = useLoanManager();

    const handleViewDetails = (loanId: string) => {
        const loan = loans.find(l => l.id === loanId);
        if (loan) {
            setSelectedLoan(loan);
        }
    };

    const timeUntilDue = (dueDate: Date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const due = new Date(dueDate);
        due.setHours(0, 0, 0, 0);
        const diffTime = due.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Due today';
        if (diffDays === 1) return 'Due tomorrow';
        return `Due in ${diffDays} days`;
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md flex flex-col">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
                <BellRing className="mr-2 text-yellow-500" size={20} />
                Upcoming Repayments
            </h3>
            <div className="space-y-3 flex-1 overflow-y-auto pr-2" style={{maxHeight: '250px'}}>
                {upcomingRepayments.length > 0 ? (
                    upcomingRepayments.map(rep => (
                        <div key={`${rep.loanId}-${rep.installmentNo}`} className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                            <div>
                                <p className="font-medium dark:text-white text-sm">{rep.clientName}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    <span className="font-semibold text-gray-700 dark:text-gray-300">${rep.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> - {timeUntilDue(rep.dueDate)}
                                </p>
                            </div>
                            <div className="flex items-center space-x-2">
                                 <button onClick={() => handleViewDetails(rep.loanId)} title="View Details" className="p-1 text-gray-400 hover:text-blue-500 transition-colors">
                                    <Eye size={16} />
                                </button>
                                <button onClick={() => markRepaymentAsPaid(rep.loanId, rep.installmentNo)} title="Mark as Paid" className="p-1 text-gray-400 hover:text-green-500 transition-colors">
                                    <CheckCircle size={16} />
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex items-center justify-center h-full">
                         <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">No payments due in the next 7 days.</p>
                    </div>
                )}
            </div>
            <button onClick={() => setCurrentView('loans')} className="mt-4 w-full text-center text-blue-500 hover:underline text-sm font-medium">
                View All Loans
            </button>
        </div>
    );
};
