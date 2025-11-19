
import React, { useState, useEffect } from 'react';
import { useLoanManager } from '../hooks/useLoanManager';
import { NewLoanData, LoanFee, LoanStatus, Repayment } from '../types';
import { generateInstallmentSchedule, calculateMaxLoanEligibility, calculateMLRiskScore, scoreToRiskLevel } from '../utils/loanCalculations';
import { Plus, X, Trash2, Calendar, AlertCircle, Download, Loader2 } from 'lucide-react';

const RiskGauge: React.FC<{ score: number }> = ({ score }) => {
    const angle = score * 180;
    return (
        <div className="relative w-64 h-32 mx-auto mt-4 mb-8">
            <svg viewBox="0 0 200 110" className="w-full h-full">
                <defs>
                    <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#10B981" />
                        <stop offset="50%" stopColor="#F59E0B" />
                        <stop offset="100%" stopColor="#EF4444" />
                    </linearGradient>
                </defs>
                <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="url(#gaugeGradient)" strokeWidth="20" strokeLinecap="round" />
                <line x1="100" y1="100" x2="100" y2="30" stroke="black" strokeWidth="5" strokeLinecap="round" transform={`rotate(${angle - 90} 100 100)`} />
                <circle cx="100" cy="100" r="8" fill="black" />
            </svg>
            <div className="absolute bottom-0 left-0 right-0 flex justify-between px-4 text-xs font-bold text-gray-500">
                <span>Low Risk</span>
                <span>High Risk</span>
            </div>
        </div>
    );
};

export const AddLoanForm: React.FC = () => {
    const { clients, addLoan, globalSettings } = useLoanManager();
    const [clientId, setClientId] = useState('');
    const [amount, setAmount] = useState<number>(globalSettings.minLoanAmount);
    const [duration, setDuration] = useState<number>(12);
    const [interestRate, setInterestRate] = useState<number>(globalSettings.defaultInterestRate);
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [loanType, setLoanType] = useState('Personal');
    
    const [calculatedRisk, setCalculatedRisk] = useState(0);
    const [eligibilityLimit, setEligibilityLimit] = useState(0);
    const [schedule, setSchedule] = useState<Repayment[]>([]);

    useEffect(() => {
        if(clientId) {
            const client = clients.find(c => c.id === clientId);
            if(client) {
                const risk = calculateMLRiskScore(client);
                setCalculatedRisk(risk);
                const level = scoreToRiskLevel(risk);
                setEligibilityLimit(calculateMaxLoanEligibility(client.monthlyIncome, level));
            }
        }
    }, [clientId, clients]);

    useEffect(() => {
        const loanData = {
            loanAmount: amount,
            durationMonths: duration,
            interestRate: interestRate,
            startDate: new Date(startDate),
            repaymentCycle: 'Monthly', // Default for simulation
            interestMethod: 'Flat Interest' // Default
        };
        // @ts-ignore - partial mock for calculation
        const newSchedule = generateInstallmentSchedule(loanData);
        setSchedule(newSchedule);
    }, [amount, duration, interestRate, startDate]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!clientId) return;
        
        const loanData: NewLoanData = {
            clientId,
            loanAmount: amount,
            durationMonths: duration,
            interestRate: interestRate,
            startDate: new Date(startDate),
            loanType,
        };
        addLoan(loanData);
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-full">
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 overflow-y-auto">
                <h2 className="text-2xl font-bold mb-6 dark:text-white">New Loan Application</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Borrower</label>
                        <select 
                            value={clientId} 
                            onChange={(e) => setClientId(e.target.value)}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                            required
                        >
                            <option value="">Select a client...</option>
                            {clients.map(c => (
                                <option key={c.id} value={c.id}>{c.name} ({c.cnic})</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Loan Amount</label>
                            <input 
                                type="number" 
                                value={amount} 
                                onChange={(e) => setAmount(parseFloat(e.target.value))}
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                                min={globalSettings.minLoanAmount}
                                max={globalSettings.maxLoanAmount}
                                required
                            />
                            {eligibilityLimit > 0 && (
                                <p className={`text-xs mt-1 ${amount > eligibilityLimit ? 'text-red-500' : 'text-green-500'}`}>
                                    Max Eligibility: ${eligibilityLimit.toLocaleString()}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Loan Type</label>
                            <select 
                                value={loanType} 
                                onChange={(e) => setLoanType(e.target.value)}
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                            >
                                <option>Personal</option>
                                <option>Business</option>
                                <option>Education</option>
                                <option>Emergency</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration (Months)</label>
                            <input 
                                type="number" 
                                value={duration} 
                                onChange={(e) => setDuration(parseInt(e.target.value))}
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                                min="1"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Interest Rate (%)</label>
                            <input 
                                type="number" 
                                value={interestRate} 
                                onChange={(e) => setInterestRate(parseFloat(e.target.value))}
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                                min="0"
                                step="0.1"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                            <input 
                                type="date" 
                                value={startDate} 
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                                required
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                            Submit Application
                        </button>
                    </div>
                </form>
            </div>

            <div className="w-full lg:w-96 space-y-6">
                {clientId ? (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                        <h3 className="text-lg font-bold mb-4 dark:text-white">Risk Assessment</h3>
                        <RiskGauge score={calculatedRisk} />
                        <div className="text-center">
                            <p className="text-2xl font-bold dark:text-white">{(calculatedRisk * 100).toFixed(1)}%</p>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Default Probability</p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6 text-center text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-700">
                        Select a borrower to view risk assessment
                    </div>
                )}

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                    <h3 className="text-lg font-bold mb-4 dark:text-white">Repayment Preview</h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                        {schedule.map((item) => (
                            <div key={item.installmentNo} className="flex justify-between text-sm py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                                <span className="text-gray-600 dark:text-gray-300">#{item.installmentNo} - {item.dueDate.toLocaleDateString()}</span>
                                <span className="font-medium dark:text-white">${item.amount.toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between font-bold dark:text-white">
                        <span>Total Payable:</span>
                        <span>${schedule.reduce((acc, curr) => acc + curr.amount, 0).toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
