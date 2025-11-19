
import React, { useState, useMemo } from 'react';
import { useLoanManager } from '../hooks/useLoanManager';
import { Download, FileText, TrendingUp, AlertTriangle } from 'lucide-react';
import { LoanStatus } from '../types';

export const Reports: React.FC = () => {
    const { loans, collections } = useLoanManager();
    const [activeTab, setActiveTab] = useState<'disbursement' | 'recovery' | 'overdue'>('disbursement');

    // 1. Disbursement Report Data
    const disbursementData = useMemo(() => {
        return loans
            .filter(l => l.status === LoanStatus.Active || l.status === LoanStatus.Paid)
            .map(l => ({
                date: l.startDate,
                client: l.clientName,
                amount: l.loanAmount,
                type: l.loanType
            }))
            .sort((a, b) => b.date.getTime() - a.date.getTime());
    }, [loans]);

    // 2. Recovery Report Data
    const recoveryData = useMemo(() => {
        return collections.sort((a, b) => b.collectedAt.getTime() - a.collectedAt.getTime());
    }, [collections]);

    // 3. Overdue Report Data
    const overdueData = useMemo(() => {
        const data: any[] = [];
        loans.forEach(loan => {
            loan.repaymentSchedule.forEach(rep => {
                if (rep.status === 'Overdue') {
                    data.push({
                        client: loan.clientName,
                        dueDate: rep.dueDate,
                        amount: rep.amount,
                        daysOverdue: Math.floor((new Date().getTime() - rep.dueDate.getTime()) / (1000 * 60 * 60 * 24))
                    });
                }
            });
        });
        return data.sort((a, b) => b.daysOverdue - a.daysOverdue);
    }, [loans]);

    const downloadCSV = () => {
        let csvContent = "data:text/csv;charset=utf-8,";
        let filename = "report.csv";

        if (activeTab === 'disbursement') {
            csvContent += "Date,Client,Amount,Type\n";
            disbursementData.forEach(row => {
                csvContent += `${row.date.toLocaleDateString()},${row.client},${row.amount},${row.type}\n`;
            });
            filename = "disbursement_report.csv";
        } else if (activeTab === 'recovery') {
            csvContent += "Date,Client,Amount,Collected By,Remarks\n";
            recoveryData.forEach(row => {
                csvContent += `${row.collectedAt.toLocaleDateString()},${row.clientName},${row.amountCollected},${row.collectedBy},${row.remarks || ''}\n`;
            });
            filename = "recovery_report.csv";
        } else {
            csvContent += "Client,Due Date,Amount,Days Overdue\n";
            overdueData.forEach(row => {
                csvContent += `${row.client},${row.dueDate.toLocaleDateString()},${row.amount},${row.daysOverdue}\n`;
            });
            filename = "overdue_report.csv";
        }

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="h-full flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">System Reports</h2>
                <button onClick={downloadCSV} className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
                    <Download size={16} className="mr-2" />
                    Export CSV
                </button>
            </div>

            <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <button 
                    onClick={() => setActiveTab('disbursement')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center ${activeTab === 'disbursement' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                >
                    <FileText size={16} className="mr-2" /> Disbursements
                </button>
                <button 
                    onClick={() => setActiveTab('recovery')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center ${activeTab === 'recovery' ? 'border-green-600 text-green-600 dark:text-green-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                >
                    <TrendingUp size={16} className="mr-2" /> Daily Recoveries
                </button>
                <button 
                    onClick={() => setActiveTab('overdue')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center ${activeTab === 'overdue' ? 'border-red-600 text-red-600 dark:text-red-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                >
                    <AlertTriangle size={16} className="mr-2" /> Overdue
                </button>
            </div>

            <div className="flex-1 overflow-auto p-6">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-200 uppercase text-xs">
                        <tr>
                            {activeTab === 'disbursement' && (
                                <>
                                    <th className="px-4 py-3 rounded-l-lg">Date</th>
                                    <th className="px-4 py-3">Client</th>
                                    <th className="px-4 py-3">Type</th>
                                    <th className="px-4 py-3 rounded-r-lg text-right">Amount</th>
                                </>
                            )}
                            {activeTab === 'recovery' && (
                                <>
                                    <th className="px-4 py-3 rounded-l-lg">Date</th>
                                    <th className="px-4 py-3">Client</th>
                                    <th className="px-4 py-3">Collected By</th>
                                    <th className="px-4 py-3">Remarks</th>
                                    <th className="px-4 py-3 rounded-r-lg text-right">Amount</th>
                                </>
                            )}
                            {activeTab === 'overdue' && (
                                <>
                                    <th className="px-4 py-3 rounded-l-lg">Client</th>
                                    <th className="px-4 py-3">Due Date</th>
                                    <th className="px-4 py-3">Days Overdue</th>
                                    <th className="px-4 py-3 rounded-r-lg text-right">Amount Due</th>
                                </>
                            )}
                        </tr>
                    </thead>
                    <tbody className="text-sm text-gray-700 dark:text-gray-300">
                        {activeTab === 'disbursement' && disbursementData.map((row, i) => (
                            <tr key={i} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="px-4 py-3">{row.date.toLocaleDateString()}</td>
                                <td className="px-4 py-3 font-medium">{row.client}</td>
                                <td className="px-4 py-3">{row.type}</td>
                                <td className="px-4 py-3 text-right font-bold">${row.amount.toLocaleString()}</td>
                            </tr>
                        ))}
                        {activeTab === 'recovery' && recoveryData.map((row, i) => (
                            <tr key={i} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="px-4 py-3">{row.collectedAt.toLocaleDateString()}</td>
                                <td className="px-4 py-3 font-medium">{row.clientName}</td>
                                <td className="px-4 py-3">{row.collectedBy}</td>
                                <td className="px-4 py-3 text-gray-500 italic">{row.remarks}</td>
                                <td className="px-4 py-3 text-right font-bold text-green-600">${row.amountCollected.toLocaleString()}</td>
                            </tr>
                        ))}
                         {activeTab === 'overdue' && overdueData.map((row, i) => (
                            <tr key={i} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="px-4 py-3 font-medium">{row.client}</td>
                                <td className="px-4 py-3">{row.dueDate.toLocaleDateString()}</td>
                                <td className="px-4 py-3 text-red-500 font-bold">{row.daysOverdue} days</td>
                                <td className="px-4 py-3 text-right font-bold">${row.amount.toLocaleString()}</td>
                            </tr>
                        ))}
                        {((activeTab === 'disbursement' && disbursementData.length === 0) ||
                          (activeTab === 'recovery' && recoveryData.length === 0) ||
                          (activeTab === 'overdue' && overdueData.length === 0)) && (
                            <tr>
                                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">No data available for this report.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
