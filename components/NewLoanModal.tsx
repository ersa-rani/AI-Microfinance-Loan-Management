
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useLoanManager } from '../hooks/useLoanManager';
import { NewLoanData } from '../types';

interface NewLoanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewLoanModal: React.FC<NewLoanModalProps> = ({ isOpen, onClose }) => {
  const { clients, addLoan } = useLoanManager();

  const [clientId, setClientId] = useState('');
  const [loanAmount, setLoanAmount] = useState('');
  const [loanType, setLoanType] = useState('Personal');
  const [durationMonths, setDurationMonths] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');

  const resetForm = () => {
      setClientId(clients.length > 0 ? clients[0].id : '');
      setLoanAmount('');
      setLoanType('Personal');
      setDurationMonths('');
      setInterestRate('');
      setStartDate(new Date().toISOString().split('T')[0]);
      setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !loanAmount || !loanType || !durationMonths || !interestRate || !startDate) {
        setError('All fields are required.');
        return;
    }

    const newLoanData: NewLoanData = {
        clientId,
        loanAmount: parseFloat(loanAmount),
        loanType,
        durationMonths: parseInt(durationMonths, 10),
        interestRate: parseFloat(interestRate),
        startDate: new Date(startDate),
    };

    addLoan(newLoanData);
    handleClose();
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold text-black dark:text-white">New Loan Application</h2>
          <button onClick={handleClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
            <X size={24} className="text-black dark:text-white" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="client" className="block text-sm font-medium text-black dark:text-gray-300">Client</label>
            <select
              id="client"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-black dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              required
            >
              <option value="" disabled>Select a client</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.name} - {client.cnic}</option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="loanAmount" className="block text-sm font-medium text-black dark:text-gray-300">Loan Amount ($)</label>
              <input type="number" id="loanAmount" value={loanAmount} onChange={e => setLoanAmount(e.target.value)} required min="1" className="mt-1 w-full dark:bg-gray-700 dark:border-gray-600 rounded-md shadow-sm text-black dark:text-white p-2 border border-gray-300"/>
            </div>
            <div>
              <label htmlFor="loanType" className="block text-sm font-medium text-black dark:text-gray-300">Loan Type</label>
              <input type="text" id="loanType" value={loanType} onChange={e => setLoanType(e.target.value)} required className="mt-1 w-full dark:bg-gray-700 dark:border-gray-600 rounded-md shadow-sm text-black dark:text-white p-2 border border-gray-300"/>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="duration" className="block text-sm font-medium text-black dark:text-gray-300">Duration (Months)</label>
                <input type="number" id="duration" value={durationMonths} onChange={e => setDurationMonths(e.target.value)} required min="1" className="mt-1 w-full dark:bg-gray-700 dark:border-gray-600 rounded-md shadow-sm text-black dark:text-white p-2 border border-gray-300"/>
            </div>
            <div>
                <label htmlFor="interestRate" className="block text-sm font-medium text-black dark:text-gray-300">Interest Rate (%)</label>
                <input type="number" id="interestRate" value={interestRate} onChange={e => setInterestRate(e.target.value)} required min="0" step="0.1" className="mt-1 w-full dark:bg-gray-700 dark:border-gray-600 rounded-md shadow-sm text-black dark:text-white p-2 border border-gray-300"/>
            </div>
          </div>

           <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-black dark:text-gray-300">Start Date</label>
              <input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} required className="mt-1 w-full dark:bg-gray-700 dark:border-gray-600 rounded-md shadow-sm text-black dark:text-white p-2 border border-gray-300"/>
            </div>
          
          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end pt-4">
            <button type="button" onClick={handleClose} className="mr-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-black dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">Submit Application</button>
          </div>
        </form>
      </div>
    </div>
  );
};
