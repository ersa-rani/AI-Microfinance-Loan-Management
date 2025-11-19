
import React, { useState } from 'react';
import { useLoanManager } from '../hooks/useLoanManager';
import { User, ShieldCheck, Camera, Upload } from 'lucide-react';

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

const VerificationUpload: React.FC<{ 
    label: string; 
    imageSrc?: string; 
    onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void 
}> = ({ label, imageSrc, onUpload }) => (
    <div className="flex flex-col items-center">
        <div className="w-full h-48 bg-gray-100 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden relative group">
            {imageSrc ? (
                <img src={imageSrc} alt={label} className="w-full h-full object-cover" />
            ) : (
                <div className="flex flex-col items-center text-gray-400">
                    <Camera size={32} className="mb-2" />
                    <span className="text-xs">No image</span>
                </div>
            )}
            <label className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center cursor-pointer transition-all">
                <div className="bg-white dark:bg-gray-800 p-2 rounded-full opacity-0 group-hover:opacity-100 shadow-lg">
                    <Upload size={20} className="text-gray-700 dark:text-white" />
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={onUpload} />
            </label>
        </div>
        <span className="mt-2 text-sm font-medium text-gray-600 dark:text-gray-300">{label}</span>
    </div>
);

export const ClientDetailsView: React.FC = () => {
    const { selectedClient, updateClient, activityLog, updateClientVerificationStatus } = useLoanManager();
    const [activeTab, setActiveTab] = useState<'details' | 'verification'>('details');

    if (!selectedClient) return <div>No client selected</div>;

    const clientLogs = activityLog.filter(log => log.message.includes(selectedClient.name));
    if (clientLogs.length === 0) {
        clientLogs.push({
            id: 'init-log',
            message: `you created this borrower .`,
            timestamp: selectedClient.createdAt,
            type: 'create'
        });
    }

    const handleImageUpload = (field: 'cnicFrontImage' | 'cnicBackImage' | 'selfieImage', e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                updateClient({ ...selectedClient, [field]: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-full">
            {/* Main Content */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                {/* Tabs */}
                <div className="flex border-b border-gray-200 dark:border-gray-700">
                    <button 
                        className={`flex-1 py-4 text-sm font-medium text-center transition-colors ${activeTab === 'details' ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                        onClick={() => setActiveTab('details')}
                    >
                        Details
                    </button>
                    <button 
                        className={`flex-1 py-4 text-sm font-medium text-center transition-colors ${activeTab === 'verification' ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                        onClick={() => setActiveTab('verification')}
                    >
                        Verification & KYC
                    </button>
                </div>

                <div className="p-8">
                    {activeTab === 'details' ? (
                        <>
                            <h2 className="text-xl font-bold text-black dark:text-white mb-8">Borrower Details</h2>
                            <div className="flex flex-col items-center mb-8">
                                <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mb-4 relative overflow-hidden">
                                    <User size={48} className="text-gray-400 dark:text-gray-500" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                                <div>
                                    <label className="block text-xs font-bold text-black dark:text-gray-400 uppercase tracking-wider mb-1">Name</label>
                                    <div className="text-black dark:text-white font-medium border-b border-gray-200 dark:border-gray-700 pb-2">{selectedClient.name}</div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-black dark:text-gray-400 uppercase tracking-wider mb-1">Monthly Income</label>
                                    <div className="text-black dark:text-white font-medium border-b border-gray-200 dark:border-gray-700 pb-2">${selectedClient.monthlyIncome?.toLocaleString()}</div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-black dark:text-gray-400 uppercase tracking-wider mb-1">Identification</label>
                                    <div className="text-black dark:text-white font-medium border-b border-gray-200 dark:border-gray-700 pb-2">{selectedClient.cnic}</div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-black dark:text-gray-400 uppercase tracking-wider mb-1">Phone</label>
                                    <div className="text-black dark:text-white font-medium border-b border-gray-200 dark:border-gray-700 pb-2">{selectedClient.phone}</div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-black dark:text-gray-400 uppercase tracking-wider mb-1">Address</label>
                                    <div className="text-black dark:text-white font-medium border-b border-gray-200 dark:border-gray-700 pb-2">{selectedClient.address}</div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-black dark:text-gray-400 uppercase tracking-wider mb-1">City</label>
                                    <div className="text-black dark:text-white font-medium border-b border-gray-200 dark:border-gray-700 pb-2">{selectedClient.city}</div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-xl font-bold text-black dark:text-white">Verification Documents</h2>
                                <div className={`px-4 py-2 rounded-full flex items-center font-medium ${selectedClient.cnicVerified ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                                    <ShieldCheck size={18} className="mr-2" />
                                    {selectedClient.cnicVerified ? 'Verified' : 'Pending Verification'}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <VerificationUpload 
                                    label="CNIC Front" 
                                    imageSrc={selectedClient.cnicFrontImage} 
                                    onUpload={(e) => handleImageUpload('cnicFrontImage', e)} 
                                />
                                <VerificationUpload 
                                    label="CNIC Back" 
                                    imageSrc={selectedClient.cnicBackImage} 
                                    onUpload={(e) => handleImageUpload('cnicBackImage', e)} 
                                />
                                <VerificationUpload 
                                    label="Selfie" 
                                    imageSrc={selectedClient.selfieImage} 
                                    onUpload={(e) => handleImageUpload('selfieImage', e)} 
                                />
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-700/30 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-semibold mb-4">Verification Actions</h3>
                                <p className="text-sm text-gray-500 mb-6">
                                    Review the uploaded documents above. Ensure the CNIC details match the client profile and the photo is clear.
                                    Once verified, the client will be eligible for higher loan limits.
                                </p>
                                <div className="flex space-x-4">
                                    <button 
                                        onClick={() => updateClientVerificationStatus(selectedClient.id, true)}
                                        disabled={selectedClient.cnicVerified}
                                        className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Approve Verification
                                    </button>
                                    <button 
                                        onClick={() => updateClientVerificationStatus(selectedClient.id, false)}
                                        disabled={!selectedClient.cnicVerified}
                                        className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Revoke Verification
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Activity Log */}
             <div className="w-full lg:w-80 bg-white dark:bg-gray-800 lg:bg-transparent lg:dark:bg-transparent lg:border-l border-gray-200 dark:border-gray-700 pl-0 lg:pl-6 pt-6 lg:pt-0">
                <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                <div className="relative pl-4 border-l-2 border-gray-200 dark:border-gray-700 space-y-8">
                    {clientLogs.map((log, index) => (
                        <div key={index} className="relative">
                             <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600 border-2 border-white dark:border-gray-900"></div>
                             <p className="text-sm text-black dark:text-gray-400">
                                {log.message}
                             </p>
                             <p className="text-xs text-gray-500 mt-1">{timeAgo(log.timestamp)}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
