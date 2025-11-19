
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useLoanManager } from '../hooks/useLoanManager';
import { NewClientData } from '../types';

interface NewClientModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewClientModal: React.FC<NewClientModalProps> = ({ isOpen, onClose }) => {
  const { addClient } = useLoanManager();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cnic, setCnic] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [previousLoans, setPreviousLoans] = useState(0);
  const [missedPayments, setMissedPayments] = useState(0);
  const [cnicVerified, setCnicVerified] = useState(false);
  const [error, setError] = useState('');

  const resetForm = () => {
    setName('');
    setEmail('');
    setCnic('');
    setPhone('');
    setAddress('');
    setCity('');
    setGender('Male');
    setMonthlyIncome('');
    setPreviousLoans(0);
    setMissedPayments(0);
    setCnicVerified(false);
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !cnic || !phone || !address || !monthlyIncome) {
      setError('All fields are required.');
      return;
    }

    const newClientData: NewClientData = {
      name,
      email,
      cnic,
      phone,
      address,
      city: city || 'Unknown',
      zipcode: '00000',
      gender,
      dob: new Date(),
      maritalStatus: 'Single',
      occupation: 'Unemployed',
      monthlyIncome: parseFloat(monthlyIncome),
      previousLoans: Number(previousLoans),
      missedPayments: Number(missedPayments),
      cnicVerified,
    };

    addClient(newClientData);
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold text-black dark:text-white">Add New Client</h2>
          <button onClick={handleClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
            <X size={24} className="text-black dark:text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-black dark:text-gray-300">Full Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 text-black dark:text-white sm:text-sm p-2 border"
              placeholder="Ali Raza"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-black dark:text-gray-300">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 text-black dark:text-white sm:text-sm p-2 border"
              placeholder="ali@example.com"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="cnic" className="block text-sm font-medium text-black dark:text-gray-300">CNIC (ID)</label>
              <input
                type="text"
                id="cnic"
                value={cnic}
                onChange={(e) => setCnic(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 text-black dark:text-white sm:text-sm p-2 border"
                placeholder="42201-1234567-1"
                required
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-black dark:text-gray-300">Phone</label>
              <input
                type="text"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 text-black dark:text-white sm:text-sm p-2 border"
                placeholder="03001234567"
                required
              />
            </div>
          </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
                <label htmlFor="gender" className="block text-sm font-medium text-black dark:text-gray-300">Gender</label>
                <select
                    id="gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value as 'Male' | 'Female')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 text-black dark:text-white sm:text-sm p-2 border"
                >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                </select>
             </div>
             <div>
                 <label htmlFor="monthlyIncome" className="block text-sm font-medium text-black dark:text-gray-300">Monthly Income ($)</label>
                <input
                    type="number"
                    id="monthlyIncome"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 text-black dark:text-white sm:text-sm p-2 border"
                    placeholder="50000"
                    min="0"
                    required
                />
             </div>
           </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-black dark:text-gray-300">Address</label>
            <input
              type="text"
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 text-black dark:text-white sm:text-sm p-2 border"
              placeholder="House #, Street, City"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="previousLoans" className="block text-sm font-medium text-black dark:text-gray-300">Previous Loans</label>
              <input
                type="number"
                id="previousLoans"
                value={previousLoans}
                onChange={(e) => setPreviousLoans(Number(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 text-black dark:text-white sm:text-sm p-2 border"
                min="0"
              />
            </div>
            <div>
              <label htmlFor="missedPayments" className="block text-sm font-medium text-black dark:text-gray-300">Missed Payments</label>
              <input
                type="number"
                id="missedPayments"
                value={missedPayments}
                onChange={(e) => setMissedPayments(Number(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 text-black dark:text-white sm:text-sm p-2 border"
                min="0"
              />
            </div>
          </div>

          <div className="flex items-center bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md border dark:border-gray-600 justify-between">
            <label htmlFor="cnicVerified" className="block text-sm font-medium text-black dark:text-gray-300 cursor-pointer flex-1">
              CNIC Verified (KYC Completed)
            </label>
            <button 
                type="button"
                id="cnicVerified"
                onClick={() => setCnicVerified(!cnicVerified)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    cnicVerified ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                }`}
            >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    cnicVerified ? 'translate-x-6' : 'translate-x-1'
                }`} />
            </button>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="mr-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-black dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Add Client
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
