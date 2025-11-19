import React, { useMemo, useState } from 'react';
import { DollarSign, Landmark, Users, AlertTriangle, Lightbulb, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useLoanManager } from '../hooks/useLoanManager';
import { LoanStatus } from '../types';
import { getSystemImprovementSuggestions } from '../services/geminiService';
import { UpcomingRepayments } from './UpcomingRepayments';

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md flex items-center space-x-4">
    <div className={`p-3 rounded-full ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
      <p className="text-2xl font-bold text-gray-800 dark:text-white">{value}</p>
    </div>
  </div>
);

export const Dashboard: React.FC = () => {
  const { loans, clients } = useLoanManager();
  const [aiSuggestions, setAiSuggestions] = useState('');
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  const stats = useMemo(() => {
    const totalLoanAmount = loans.reduce((acc, loan) => acc + loan.loanAmount, 0);
    const activeLoans = loans.filter(loan => loan.status === LoanStatus.Active).length;
    return {
      totalClients: clients.length,
      totalLoanAmount,
      activeLoans,
      defaultedLoans: loans.filter(loan => loan.status === LoanStatus.Default).length,
    };
  }, [loans, clients]);

  const loanStatusData = useMemo(() => {
    const statusCounts = loans.reduce((acc, loan) => {
      acc[loan.status] = (acc[loan.status] || 0) + 1;
      return acc;
    }, {} as Record<LoanStatus, number>);
    
    return Object.entries(statusCounts).map(([name, value]) => ({ name, count: value }));
  }, [loans]);

  const handleGetSuggestions = async () => {
    setIsLoadingAi(true);
    setAiSuggestions('');
    const suggestions = await getSystemImprovementSuggestions(loans, clients);
    setAiSuggestions(suggestions);
    setIsLoadingAi(false);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Dashboard</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Clients" value={stats.totalClients.toString()} icon={<Users className="h-6 w-6 text-white" />} color="bg-blue-500" />
        <StatCard title="Total Loan Value" value={`$${stats.totalLoanAmount.toLocaleString()}`} icon={<DollarSign className="h-6 w-6 text-white" />} color="bg-green-500" />
        <StatCard title="Active Loans" value={stats.activeLoans.toString()} icon={<Landmark className="h-6 w-6 text-white" />} color="bg-yellow-500" />
        <StatCard title="Defaulted Loans" value={stats.defaultedLoans.toString()} icon={<AlertTriangle className="h-6 w-6 text-white" />} color="bg-red-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold mb-4">Loan Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={loanStatusData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128, 128, 128, 0.2)" />
              <XAxis dataKey="name" tick={{ fill: 'rgb(156 163 175)' }} />
              <YAxis tick={{ fill: 'rgb(156 163 175)' }} />
              <Tooltip
                contentStyle={{ 
                    backgroundColor: 'rgba(31, 41, 55, 0.8)', 
                    borderColor: 'rgba(55, 65, 81, 1)',
                    color: '#fff'
                }}
              />
              <Legend />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <UpcomingRepayments />

      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">AI System Advisor</h3>
          <button
            onClick={handleGetSuggestions}
            disabled={isLoadingAi}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
          >
            {isLoadingAi ? <Loader2 className="animate-spin mr-2" size={20} /> : <Lightbulb className="mr-2" size={20} />}
            {isLoadingAi ? 'Analyzing...' : 'Get Suggestions'}
          </button>
        </div>
        {aiSuggestions && (
          <div className="prose prose-sm dark:prose-invert max-w-none bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
            <div dangerouslySetInnerHTML={{__html: aiSuggestions.replace(/\n/g, '<br />')}} />
          </div>
        )}
      </div>
    </div>
  );
};