
import React, { useState, useMemo } from 'react';
import { useLoanManager } from '../hooks/useLoanManager';
import { Loan, RepaymentStatus } from '../types';
import { Search, CheckCircle, Clock, DollarSign, MapPin } from 'lucide-react';

interface CollectionModalProps {
    loan: Loan;
    installmentNo: number;
    amountDue: number;
    onClose: () => void;
    onConfirm: (amount: number, remarks: string) => void;
}

const CollectionModal: React.FC<CollectionModalProps> = ({ loan, installmentNo, amountDue, onClose, onConfirm }) => {
    const [amount, setAmount] = useState(amountDue);
    const [remarks, setRemarks] = useState('');

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Collect Payment</h3>
                <div className="mb-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Client: <span className="font-medium text-gray-900 dark:text-white">{loan.clientName}</span></p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Installment: <span className="font-medium text-gray-900 dark:text-white">#{installmentNo}</span></p>
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount Collected</label>
                    <input 
                        type="number" 
                        value={amount} 
                        onChange={(e) => setAmount(parseFloat(e.target.value))}
                        className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 text-black dark:text-white"
                    />
                </div>
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Remarks</label>
                    <textarea 
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 text-black dark:text-white"
                        placeholder="e.g. Collected in cash at shop"
                        rows={3}
                    />
                </div>
                <div className="flex justify-end space-x-3">
                    <button onClick={onClose} className="px-4 py-2 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-black dark:text-white">Cancel</button>
                    <button onClick={() => onConfirm(amount, remarks)} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Confirm Collection</button>
                </div>
            </div>
        </div>
    );
};

export const Collections: React.FC = () => {
    const { loans, addCollection, clients } = useLoanManager();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedItem, setSelectedItem] = useState<{loan: Loan, installmentNo: number, amount: number} | null>(null);

    const duePayments = useMemo(() => {
        const today = new Date();
        today.setHours(23, 59, 59, 999); 

        let payments: { loan: Loan, installment: any, clientAddress: string }[] = [];
        
        loans.forEach(loan => {
            if (loan.status === 'Active') {
                const client = clients.find(c => c.id === loan.clientId);
                loan.repaymentSchedule.forEach(rep => {
                    // Show overdue and due today/past
                    if ((rep.status === RepaymentStatus.Due && rep.dueDate <= today) || rep.status === RepaymentStatus.Overdue) {
                        payments.push({
                            loan,
                            installment: rep,
                            clientAddress: client?.address || 'Unknown'
                        });
                    }
                });
            }
        });

        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            payments = payments.filter(p => p.loan.clientName?.toLowerCase().includes(lower));
        }

        return payments.sort((a, b) => a.installment.dueDate.getTime() - b.installment.dueDate.getTime());
    }, [loans, clients, searchTerm]);

    const handleCollect = (amount: number, remarks: string) => {
        if (selectedItem) {
            addCollection({
                loanId: selectedItem.loan.id,
                installmentNo: selectedItem.installmentNo,
                amountCollected: amount,
                clientName: selectedItem.loan.clientName || 'Unknown',
                remarks: remarks
            });
            setSelectedItem(null);
        }
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Field Collections</h2>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Search client..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 outline-none"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pb-6">
                {duePayments.map((item, idx) => (
                    <div key={`${item.loan.id}-${item.installment.installmentNo}`} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white">{item.loan.clientName}</h3>
                                <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs mt-1">
                                    <MapPin size={12} className="mr-1" />
                                    {item.clientAddress}
                                </div>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                                item.installment.status === RepaymentStatus.Overdue 
                                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' 
                                : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                            }`}>
                                {item.installment.status}
                            </span>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500 dark:text-gray-400">Amount Due</span>
                                <span className="font-bold text-gray-900 dark:text-white">${item.installment.amount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500 dark:text-gray-400">Due Date</span>
                                <span className="text-gray-900 dark:text-white">{item.installment.dueDate.toLocaleDateString()}</span>
                            </div>
                        </div>

                        <button 
                            onClick={() => setSelectedItem({ loan: item.loan, installmentNo: item.installment.installmentNo, amount: item.installment.amount })}
                            className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center"
                        >
                            <DollarSign size={16} className="mr-1" />
                            Collect Cash
                        </button>
                    </div>
                ))}
                
                {duePayments.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500">
                        <CheckCircle size={48} className="text-green-500 mb-4" />
                        <p className="text-lg font-medium">All caught up!</p>
                        <p className="text-sm">No pending collections for today.</p>
                    </div>
                )}
            </div>

            {selectedItem && (
                <CollectionModal 
                    loan={selectedItem.loan}
                    installmentNo={selectedItem.installmentNo}
                    amountDue={selectedItem.amount}
                    onClose={() => setSelectedItem(null)}
                    onConfirm={handleCollect}
                />
            )}
        </div>
    );
};
