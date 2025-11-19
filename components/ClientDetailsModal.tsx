import React from 'react';
import { Client, RiskLevel } from '../types';
import { X, Phone, MapPin, CreditCard, ShieldAlert, Calendar } from 'lucide-react';
import { useLoanManager } from '../hooks/useLoanManager';

const RiskBadge: React.FC<{ level: RiskLevel }> = ({ level }) => {
  const baseClasses = 'px-2 py-0.5 text-xs font-medium rounded-full';
  const colorClasses = {
    [RiskLevel.Low]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    [RiskLevel.Medium]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    [RiskLevel.High]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };
  return <span className={`${baseClasses} ${colorClasses[level]}`}>{level}</span>;
};

export const ClientDetailsModal: React.FC<{ client: Client; onClose: () => void }> = ({ client, onClose }) => {
  const { updateClientVerificationStatus } = useLoanManager();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl">
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold">{client.name}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">CNIC: {client.cnic}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Contact & Personal Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <Phone className="mr-3 text-blue-500" size={20} />
                <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Phone</p>
                    <p className="font-medium">{client.phone}</p>
                </div>
            </div>
            <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <MapPin className="mr-3 text-blue-500" size={20} />
                <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Address</p>
                    <p className="font-medium">{client.address}</p>
                </div>
            </div>
            <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <Calendar className="mr-3 text-blue-500" size={20} />
                <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Member Since</p>
                    <p className="font-medium">{client.createdAt.toLocaleDateString()}</p>
                </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center">
                    <div className={`mr-3 p-1 rounded-full ${client.cnicVerified ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {client.cnicVerified ? '✓' : '!'}
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">KYC Status</p>
                        <p className="font-medium">{client.cnicVerified ? 'Verified' : 'Not Verified'}</p>
                    </div>
                </div>
                <div>
                    <button 
                        onClick={() => updateClientVerificationStatus(client.id, !client.cnicVerified)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                            client.cnicVerified ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                        }`}
                        title="Toggle Verification Status"
                    >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            client.cnicVerified ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                    </button>
                </div>
            </div>
          </div>

          {/* Risk Profile */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-900">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
                <ShieldAlert className="mr-2 text-blue-600" size={20} />
                Risk Profile
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Risk Level</p>
                    <div className="mt-1"><RiskBadge level={client.riskLevel} /></div>
                </div>
                <div className="text-center p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Default Probability</p>
                    <p className="mt-1 text-lg font-mono font-bold text-gray-800 dark:text-white">
                        {(client.riskScore * 100).toFixed(1)}%
                    </p>
                </div>
                <div className="text-center p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Previous Defaults</p>
                     <p className="mt-1 text-lg font-bold text-gray-800 dark:text-white">{client.missedPayments}</p>
                </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center italic">
                Note: Changing KYC status will automatically recalculate the risk score.
            </p>
          </div>

           {/* Loan History Summary */}
           <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                    <CreditCard className="mr-2 text-gray-600" size={20} />
                    Loan History
                </h3>
                <div className="flex justify-between bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                    <div>
                        <span className="block text-xs text-gray-500 dark:text-gray-400">Total Loans Taken</span>
                        <span className="text-xl font-bold">{client.previousLoans}</span>
                    </div>
                    <div>
                        <span className="block text-xs text-gray-500 dark:text-gray-400">Active Loans</span>
                        {/* This would need real data filtering, calculating vaguely based on history for now or 0 if none found in current context logic */}
                        <span className="text-xl font-bold">-</span>
                    </div>
                </div>
           </div>

        </div>
        
        <div className="p-4 border-t dark:border-gray-700 flex justify-end bg-gray-50 dark:bg-gray-800 rounded-b-lg">
             <button onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                Close
            </button>
        </div>
      </div>
    </div>
  );
};