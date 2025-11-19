
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useLoanManager } from '../hooks/useLoanManager';

interface ExportBorrowersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportBorrowersModal: React.FC<ExportBorrowersModalProps> = ({ isOpen, onClose }) => {
  const { clients } = useLoanManager();
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  if (!isOpen) return null;

  const handleExport = () => {
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;

    const filteredClients = clients.filter(c => {
        const created = new Date(c.createdAt);
        if (from && created < from) return false;
        if (to && created > to) return false;
        return true;
    });

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ID,Name,Email,CNIC,Phone,City,Income,Risk Level,Created At\n";
    
    filteredClients.forEach(c => {
        csvContent += `${c.id},${c.name},${c.email},${c.cnic},${c.phone},${c.city},${c.monthlyIncome},${c.riskLevel},${c.createdAt.toLocaleDateString()}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "borrowers_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg transform transition-all">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-bold text-black dark:text-white">Export Borrowers</h3>
             <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X size={20} />
             </button>
          </div>
          
          <p className="text-sm text-black dark:text-gray-300 mb-6">
            Filter borrowers created during a specific date range. (leave empty to export all borrowers)
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="flex-1">
                <label className="block text-sm font-bold text-black dark:text-gray-300 mb-2">From</label>
                <input 
                    type="date" 
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-black dark:text-white bg-white dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
            </div>
            <div className="flex-1">
                <label className="block text-sm font-bold text-black dark:text-gray-300 mb-2">To</label>
                <input 
                    type="date" 
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-black dark:text-white bg-white dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
            </div>
          </div>

          <button 
            onClick={handleExport}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors text-sm"
          >
            Download CSV
          </button>
        </div>
      </div>
    </div>
  );
};
