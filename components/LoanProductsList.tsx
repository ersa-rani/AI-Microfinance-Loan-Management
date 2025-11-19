
import React, { useState } from 'react';
import { useLoanManager } from '../hooks/useLoanManager';
import { Plus, Trash2, Edit2, Package, Calendar, RotateCcw } from 'lucide-react';

// Simple relative time helper since we don't have date-fns in the import map
const timeAgo = (date: Date) => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return "Just now";
};

const FormatCurrency = ({ val }: { val: number }) => (
    <span className="whitespace-nowrap">
        <span className="text-[10px] text-gray-400 font-semibold mr-1 uppercase">K</span>
        {val.toLocaleString()}
        <span className="text-[10px] text-gray-400 font-semibold ml-1 uppercase">ZMW</span>
    </span>
);

export const LoanProductsList: React.FC = () => {
    const { loanProducts, activityLog, setCurrentView, deleteLoanProduct } = useLoanManager();
    const [searchTerm, setSearchTerm] = useState('');

    const EmptyState = () => (
        <div className="flex flex-col items-center justify-center h-[70vh] text-center">
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full mb-4">
                <Package className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">No loan products yet</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Get started by creating your first loan product</p>
            <button 
                onClick={() => setCurrentView('addLoanProduct')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center"
            >
                <Plus size={18} className="mr-2" /> Create Loan Product
            </button>
            <button className="text-indigo-600 dark:text-indigo-400 mt-4 text-sm hover:underline">
                Need Help understanding loan products?
            </button>
        </div>
    );

    if (loanProducts.length === 0 && activityLog.length === 0) {
        return <EmptyState />;
    }

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-full">
            {/* Main Content */}
            <div className="flex-1">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Loan Products</h2>
                    <button 
                        onClick={() => setCurrentView('addLoanProduct')}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                        Add Loan Product
                    </button>
                </div>

                {/* Search Filter (Optional, keeping it minimal as per screenshot) */}
                <div className="mb-6">
                    <input 
                        type="text" 
                        placeholder="Search Loan Product..." 
                        className="w-full md:w-80 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
                    {loanProducts
                        .filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map(product => (
                        <div key={product.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">{product.title}</h3>
                                    <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mt-1">
                                        <RotateCcw size={14} className="mr-1"/>
                                        {product.interestMethod}
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    <button className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors rounded bg-gray-50 dark:bg-gray-700">
                                        <Edit2 size={16} />
                                    </button>
                                    <button 
                                        onClick={() => deleteLoanProduct(product.id)}
                                        className="p-1.5 text-gray-400 hover:text-red-600 transition-colors rounded bg-gray-50 dark:bg-gray-700">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3 text-sm">
                                <div className="flex items-center text-gray-600 dark:text-gray-300">
                                    <span className="w-4 h-4 mr-2 text-gray-400 flex items-center justify-center font-bold text-xs">%</span>
                                    {product.interestRate}% {product.interestCycle}
                                </div>
                                <div className="flex items-center text-gray-600 dark:text-gray-300">
                                    <RotateCcw size={16} className="mr-2 text-gray-400"/>
                                    {product.repaymentCycle} Repayment Cycle
                                </div>
                                <div className="flex items-center text-gray-600 dark:text-gray-300">
                                    <Calendar size={16} className="mr-2 text-gray-400"/>
                                    {product.durationValue} {product.durationPeriod}
                                </div>
                                <div className="flex items-center font-medium text-gray-700 dark:text-gray-200 mt-2">
                                    <span className="mr-2">💰</span>
                                    <FormatCurrency val={product.minPrincipal} /> 
                                    <span className="mx-2">→</span>
                                    <FormatCurrency val={product.maxPrincipal} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Activity Log Sidebar */}
            <div className="w-full lg:w-80 border-l dark:border-gray-700 pl-0 lg:pl-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Activity Log</h3>
                <div className="relative pl-4 border-l-2 border-gray-200 dark:border-gray-700 space-y-6">
                    {activityLog.map((log) => (
                        <div key={log.id} className="relative">
                             <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600 border-2 border-white dark:border-gray-900"></div>
                             <p className="text-sm text-gray-600 dark:text-gray-300">
                                {log.message}
                             </p>
                             <p className="text-xs text-gray-400 mt-1">{timeAgo(log.timestamp)}</p>
                        </div>
                    ))}
                    {activityLog.length === 0 && (
                        <p className="text-sm text-gray-400 italic">No recent activity.</p>
                    )}
                </div>
            </div>
        </div>
    );
};
