
import React, { useState } from 'react';
import { useLoanManager } from '../hooks/useLoanManager';
import { NewLoanProductData, LoanFee, LatePenaltyConfig, LoanDocument } from '../types';
import { X, Trash2, Plus, AlertCircle, Upload, FileText } from 'lucide-react';

export const AddLoanProductForm: React.FC = () => {
    const { addLoanProduct, setCurrentView } = useLoanManager();

    // Basic Info
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    
    // Principal
    const [minPrincipal, setMinPrincipal] = useState<number>(1000);
    const [maxPrincipal, setMaxPrincipal] = useState<number>(5000);

    // Duration
    const [durationPeriod, setDurationPeriod] = useState<'Months' | 'Weeks' | 'Days'>('Months');
    const [durationType, setDurationType] = useState<'Fixed Duration' | 'Dynamic'>('Fixed Duration');
    const [durationValue, setDurationValue] = useState<number>(5);

    // Interest
    const [interestMethod, setInterestMethod] = useState<'Flat Interest' | 'Reducing Balance'>('Flat Interest');
    const [interestRate, setInterestRate] = useState<number>(5);
    const [interestCycle, setInterestCycle] = useState<'Once' | 'Monthly' | 'Yearly'>('Once');

    // Repayment
    const [repaymentCycle, setRepaymentCycle] = useState<'Once' | 'Monthly' | 'Weekly' | 'Daily'>('Once');

    // Fees
    const [fees, setFees] = useState<LoanFee[]>([]);
    const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);
    const [newFee, setNewFee] = useState<Partial<LoanFee>>({ name: '', type: 'Percentage Based', value: 0 });

    // Documents
    const [documents, setDocuments] = useState<File[]>([]);

    // Penalty
    const [enablePenalty, setEnablePenalty] = useState(false);
    const [penaltyConfig, setPenaltyConfig] = useState<LatePenaltyConfig>({
        isEnabled: false,
        type: 'Percentage Based',
        calculateOn: 'Principal Amount',
        value: 2,
        gracePeriod: 0,
        recurring: 'Once'
    });

    const [error, setError] = useState('');

    const handleSave = () => {
        setError('');

        // Validation
        if (!title.trim()) {
            setError('Product Title is required.');
            return;
        }
        if (minPrincipal <= 0) {
            setError('Minimum Principal must be greater than 0.');
            return;
        }
        if (maxPrincipal <= 0) {
            setError('Maximum Principal must be greater than 0.');
            return;
        }
        if (minPrincipal > maxPrincipal) {
            setError('Minimum Principal cannot be greater than Maximum Principal.');
            return;
        }
        if (durationValue <= 0) {
            setError('Duration value must be greater than 0.');
            return;
        }
        if (interestRate < 0) {
            setError('Interest Rate cannot be negative.');
            return;
        }

        // Map Files to LoanDocument objects (Mocking the upload process)
        const docObjects: LoanDocument[] = documents.map((file, index) => ({
            id: `doc-${Date.now()}-${index}`,
            name: file.name,
            type: file.type || 'application/octet-stream',
            size: file.size,
            uploadDate: new Date()
        }));

        const productData: NewLoanProductData = {
            title,
            description,
            minPrincipal,
            maxPrincipal,
            durationPeriod,
            durationType,
            durationValue,
            interestMethod,
            interestRate,
            interestCycle,
            repaymentCycle,
            fees,
            latePenalty: { ...penaltyConfig, isEnabled: enablePenalty },
            documents: docObjects
        };
        addLoanProduct(productData);
    };

    const handleAddFee = () => {
        if (newFee.name && newFee.value) {
            setFees([...fees, { ...newFee, id: Date.now().toString() } as LoanFee]);
            setIsFeeModalOpen(false);
            setNewFee({ name: '', type: 'Percentage Based', value: 0 });
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setDocuments(prev => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const removeDocument = (index: number) => {
        setDocuments(prev => prev.filter((_, i) => i !== index));
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="h-full flex flex-col relative bg-gray-100 dark:bg-gray-900 overflow-y-auto pb-20">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm mb-6">
                <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Add a Loan Product</h2>

                {/* Product Details */}
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product Title <span className="text-red-500">*</span></label>
                        <input 
                            type="text" 
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none text-black dark:text-white"
                            placeholder="e.g. Salary Advance"
                        />
                    </div>
                    
                    <div>
                         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                         <textarea 
                             value={description}
                             onChange={e => setDescription(e.target.value)}
                             className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none text-black dark:text-white"
                             rows={2}
                         />
                         <p className="text-xs text-right text-gray-400 mt-1">Optional</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Minimum Principal Amount <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-gray-500 sm:text-sm">K</span>
                                </div>
                                <input 
                                    type="number" 
                                    value={minPrincipal}
                                    onChange={e => setMinPrincipal(parseFloat(e.target.value))}
                                    className="w-full pl-8 pr-12 p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 outline-none focus:ring-2 focus:ring-indigo-500 text-black dark:text-white"
                                    min="1"
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <span className="text-gray-500 sm:text-sm">ZMW</span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Maximum Principal Amount <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-gray-500 sm:text-sm">K</span>
                                </div>
                                <input 
                                    type="number" 
                                    value={maxPrincipal}
                                    onChange={e => setMaxPrincipal(parseFloat(e.target.value))}
                                    className="w-full pl-8 pr-12 p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 outline-none focus:ring-2 focus:ring-indigo-500 text-black dark:text-white"
                                    min="1"
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <span className="text-gray-500 sm:text-sm">ZMW</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        <div>
                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration Period</label>
                             <select 
                                value={durationPeriod}
                                onChange={e => setDurationPeriod(e.target.value as any)}
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 outline-none focus:ring-2 focus:ring-indigo-500 text-black dark:text-white"
                             >
                                 <option>Months</option>
                                 <option>Weeks</option>
                                 <option>Days</option>
                             </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration Type</label>
                            <select 
                                value={durationType}
                                onChange={e => setDurationType(e.target.value as any)}
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 outline-none focus:ring-2 focus:ring-indigo-500 text-black dark:text-white"
                             >
                                 <option>Fixed Duration</option>
                                 <option>Dynamic</option>
                             </select>
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Loan Duration in {durationPeriod} <span className="text-red-500">*</span></label>
                             <input 
                                type="number" 
                                value={durationValue}
                                onChange={e => setDurationValue(parseInt(e.target.value))}
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 outline-none focus:ring-2 focus:ring-indigo-500 text-black dark:text-white"
                                min="1"
                             />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                         <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Interest Method</label>
                            <select 
                                value={interestMethod}
                                onChange={e => setInterestMethod(e.target.value as any)}
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 outline-none focus:ring-2 focus:ring-indigo-500 text-black dark:text-white"
                             >
                                 <option>Flat Interest</option>
                                 <option>Reducing Balance</option>
                             </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Interest Rate (%) <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <input 
                                    type="number" 
                                    value={interestRate}
                                    onChange={e => setInterestRate(parseFloat(e.target.value))}
                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 outline-none focus:ring-2 focus:ring-indigo-500 text-black dark:text-white"
                                    min="0"
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <span className="text-gray-500 sm:text-sm">%</span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Interest Cycle</label>
                            <select 
                                value={interestCycle}
                                onChange={e => setInterestCycle(e.target.value as any)}
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 outline-none focus:ring-2 focus:ring-indigo-500 text-black dark:text-white"
                             >
                                 <option>Once</option>
                                 <option>Monthly</option>
                                 <option>Yearly</option>
                             </select>
                        </div>
                    </div>

                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Repayment Cycle</label>
                        <select 
                            value={repaymentCycle}
                            onChange={e => setRepaymentCycle(e.target.value as any)}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 outline-none focus:ring-2 focus:ring-indigo-500 text-black dark:text-white"
                            >
                                <option>Once</option>
                                <option>Monthly</option>
                                <option>Weekly</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Documents Section */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm mb-6">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1">Documents & Files</h3>
                <p className="text-xs text-gray-500 mb-4">Attach any relevant documents, PDFs, or forms.</p>

                <div 
                    className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors cursor-pointer" 
                    onClick={() => document.getElementById('file-upload')?.click()}
                >
                    <Upload className="h-10 w-10 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-400 mt-1">PDF, DOC, PNG, JPG (max. 10MB)</p>
                    <input 
                        id="file-upload"
                        type="file" 
                        multiple
                        className="hidden"
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                    />
                </div>

                {documents.length > 0 && (
                    <div className="mt-4 space-y-2">
                        {documents.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center overflow-hidden">
                                    <FileText className="h-5 w-5 text-indigo-500 mr-3 flex-shrink-0" />
                                    <div className="truncate">
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">{file.name}</p>
                                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); removeDocument(index); }}
                                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Fees Section */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm mb-6">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1">Fees</h3>
                <p className="text-xs text-gray-500 mb-4">Configure loan fees</p>

                {fees.length > 0 && (
                    <div className="mb-4 space-y-2">
                        {fees.map(fee => (
                            <div key={fee.id} className="flex justify-between items-center p-3 border-b border-gray-100 dark:border-gray-700">
                                <span className="font-medium text-gray-700 dark:text-gray-300">{fee.name}</span>
                                <div className="flex items-center">
                                    <span className="text-sm text-gray-500 mr-4">
                                        {fee.type}: {fee.value}{fee.type === 'Percentage Based' ? '% of Principal Amount' : ''}
                                    </span>
                                    <button onClick={() => setFees(fees.filter(f => f.id !== fee.id))} className="text-red-400 hover:text-red-600">
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex justify-center mt-4">
                    <button 
                        onClick={() => setIsFeeModalOpen(true)}
                        className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-4 py-2 rounded font-medium text-sm transition-colors"
                    >
                        Add Fees
                    </button>
                </div>
            </div>

             {/* Late Repayment Penalty Section */}
             <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm mb-6">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1">Late Repayment Penalty</h3>
                <p className="text-xs text-gray-500 mb-4">Configure the penalty for late repayments</p>

                <div className="flex items-center mb-6">
                    <button 
                        onClick={() => setEnablePenalty(!enablePenalty)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                            enablePenalty ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                    >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            enablePenalty ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                    </button>
                    <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">Enable Late Repayment Penalty</span>
                </div>

                {enablePenalty && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Penalty Type</label>
                                <select 
                                    value={penaltyConfig.type}
                                    onChange={e => setPenaltyConfig({...penaltyConfig, type: e.target.value as any})}
                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 outline-none focus:ring-2 focus:ring-indigo-500 text-black dark:text-white"
                                >
                                    <option>Percentage Based</option>
                                    <option>Fixed Amount</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Calculate Penalty On</label>
                                <select 
                                    value={penaltyConfig.calculateOn}
                                    onChange={e => setPenaltyConfig({...penaltyConfig, calculateOn: e.target.value as any})}
                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 outline-none focus:ring-2 focus:ring-indigo-500 text-black dark:text-white"
                                >
                                    <option>Principal Amount</option>
                                    <option>Overdue Amount</option>
                                    <option>Loan Amount + Interest</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Penalty Percentage</label>
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        value={penaltyConfig.value}
                                        onChange={e => setPenaltyConfig({...penaltyConfig, value: parseFloat(e.target.value)})}
                                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 outline-none focus:ring-2 focus:ring-indigo-500 text-black dark:text-white"
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 sm:text-sm">%</span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Grace Period <span className="text-gray-400 font-normal ml-1">Optional</span></label>
                                <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 overflow-hidden">
                                     <span className="px-3 text-gray-500 text-sm bg-gray-50 dark:bg-gray-800 border-r dark:border-gray-600 py-2">Wait</span>
                                     <input 
                                        type="number" 
                                        value={penaltyConfig.gracePeriod}
                                        onChange={e => setPenaltyConfig({...penaltyConfig, gracePeriod: parseInt(e.target.value)})}
                                        className="flex-1 p-2 outline-none dark:bg-gray-700 text-black dark:text-white"
                                    />
                                    <span className="px-3 text-gray-500 text-sm bg-gray-50 dark:bg-gray-800 border-l dark:border-gray-600 py-2">days</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">The number of days to wait before a penalty fee is applied</p>
                            </div>
                        </div>

                         <div>
                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Recurring Penalty</label>
                             <select 
                                value={penaltyConfig.recurring}
                                onChange={e => setPenaltyConfig({...penaltyConfig, recurring: e.target.value as any})}
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 outline-none focus:ring-2 focus:ring-indigo-500 text-black dark:text-white"
                             >
                                 <option>Once</option>
                                 <option>Daily</option>
                                 <option>Weekly</option>
                                 <option>Monthly</option>
                             </select>
                             <p className="text-xs text-gray-500 mt-1">How often the penalty is to be applied on the loan if overdue on a repayment</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            <div className="fixed bottom-0 right-0 w-full md:w-[calc(100%-16rem)] bg-white dark:bg-gray-800 p-4 shadow-lg border-t dark:border-gray-700 flex flex-col sm:flex-row justify-end items-center z-10">
                 {error && (
                    <div className="mb-2 sm:mb-0 sm:mr-4 text-red-600 font-medium text-sm flex items-center">
                        <AlertCircle size={16} className="mr-1"/>
                        {error}
                    </div>
                 )}
                 <div className="flex">
                    <button 
                        onClick={() => setCurrentView('loanProducts')}
                        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 mr-4 hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSave}
                        className="px-8 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-sm"
                    >
                        Save
                    </button>
                 </div>
            </div>

             {/* Fee Modal */}
             {isFeeModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
                        <h3 className="text-lg font-bold mb-4 text-black dark:text-white">Add Fee</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-black dark:text-gray-300">Name</label>
                                <input 
                                    type="text" 
                                    value={newFee.name}
                                    onChange={e => setNewFee({...newFee, name: e.target.value})}
                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-black dark:text-white"
                                    placeholder="e.g. Service Fee"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-black dark:text-gray-300">Fee Type</label>
                                <select 
                                    value={newFee.type}
                                    onChange={e => setNewFee({...newFee, type: e.target.value as any})}
                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-black dark:text-white"
                                >
                                    <option>Percentage Based</option>
                                    <option>Fixed Amount</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-black dark:text-gray-300">Value</label>
                                <input 
                                    type="number" 
                                    value={newFee.value}
                                    onChange={e => setNewFee({...newFee, value: parseFloat(e.target.value)})}
                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-black dark:text-white"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end mt-6 space-x-3">
                            <button onClick={() => setIsFeeModalOpen(false)} className="px-4 py-2 border rounded hover:bg-gray-50 text-black dark:text-white">Cancel</button>
                            <button onClick={handleAddFee} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};