import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: 'danger' | 'primary' | 'success';
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  variant = 'primary',
}) => {
  if (!isOpen) return null;

  const buttonColorClass = {
    danger: 'bg-red-600 hover:bg-red-700',
    primary: 'bg-blue-600 hover:bg-blue-700',
    success: 'bg-green-600 hover:bg-green-700',
  }[variant];

  const iconColorClass = {
    danger: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-200',
    primary: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200',
    success: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-200',
  }[variant];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 transform transition-all">
        <div className="flex items-start mb-4">
           <div className={`p-2 rounded-full mr-3 flex-shrink-0 ${iconColorClass}`}>
             <AlertTriangle size={24} />
           </div>
           <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
                <div className="mt-2">
                    <p className="text-sm text-gray-600 dark:text-gray-300">{message}</p>
                </div>
           </div>
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-white rounded-lg transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${buttonColorClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};