
import { RiskLevel, Repayment, Loan, RepaymentStatus } from '../types';
import type { NewClientData, Client } from '../types';

// Weights for our simulated logistic regression model
const weights = {
  intercept: -2.0,
  previousLoans: 0.2,
  missedPayments: 0.8,
  cnicVerified: -1.0,
};

export const calculateMLRiskScore = (client: Pick<NewClientData, 'previousLoans' | 'missedPayments' | 'cnicVerified'>): number => {
  const { previousLoans, missedPayments, cnicVerified } = client;
  const logit =
    weights.intercept +
    weights.previousLoans * previousLoans +
    weights.missedPayments * missedPayments +
    weights.cnicVerified * (cnicVerified ? 1 : 0);
  const probability = 1 / (1 + Math.exp(-logit));
  return probability;
};

export const scoreToRiskLevel = (score: number): RiskLevel => {
  if (score > 0.6) {
    return RiskLevel.High;
  }
  if (score > 0.25) {
    return RiskLevel.Medium;
  }
  return RiskLevel.Low;
};

// --- New Feature: Eligibility Calculator ---
export const calculateMaxLoanEligibility = (income: number, riskLevel: RiskLevel): number => {
    let multiplier = 5; // Default: 5x Monthly Income
    
    if (riskLevel === RiskLevel.High) multiplier = 2;
    if (riskLevel === RiskLevel.Medium) multiplier = 4;
    if (riskLevel === RiskLevel.Low) multiplier = 8;

    return income * multiplier;
};


export const generateInstallmentSchedule = (loan: Omit<Loan, 'repaymentSchedule' | 'status' | 'id' | 'clientName'>): Repayment[] => {
  const schedule: Repayment[] = [];
  const { loanAmount, durationMonths, interestRate, startDate, repaymentCycle, interestMethod } = loan;

  if (repaymentCycle === 'Once') {
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + durationMonths);
      
      let interest = 0;
      if (interestMethod === 'Flat Interest') {
          interest = loanAmount * (interestRate / 100);
      } else {
          interest = loanAmount * (interestRate / 100) * (durationMonths / 12);
      }

      schedule.push({
          installmentNo: 1,
          dueDate,
          amount: loanAmount + interest,
          principal: loanAmount,
          interest: interest,
          remainingBalance: 0,
          status: RepaymentStatus.Due
      });
      return schedule;
  }
  
  const monthlyRate = interestRate / 100 / 12;
  const monthlyPayment = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, durationMonths)) / (Math.pow(1 + monthlyRate, durationMonths) - 1);

  if (!isFinite(monthlyPayment)) {
    const totalInterest = interestMethod === 'Flat Interest' ? (loanAmount * (interestRate / 100)) : 0;
    const totalPayable = loanAmount + totalInterest;
    const flatMonthlyPayment = totalPayable / durationMonths;
    const monthlyPrincipal = loanAmount / durationMonths;
    const monthlyInterest = totalInterest / durationMonths;

    let balance = loanAmount;
    for (let i = 1; i <= durationMonths; i++) {
        const dueDate = new Date(startDate);
        dueDate.setMonth(dueDate.getMonth() + i);
        balance -= monthlyPrincipal;
        schedule.push({
            installmentNo: i,
            dueDate,
            amount: flatMonthlyPayment,
            principal: monthlyPrincipal,
            interest: monthlyInterest,
            remainingBalance: Math.max(0, balance),
            status: RepaymentStatus.Due,
        });
    }
    return schedule;
  }

  let remainingBalance = loanAmount;

  for (let i = 1; i <= durationMonths; i++) {
    const interestPayment = remainingBalance * monthlyRate;
    const principalPayment = monthlyPayment - interestPayment;
    remainingBalance -= principalPayment;

    const dueDate = new Date(startDate);
    dueDate.setMonth(dueDate.getMonth() + i);
    
    const today = new Date();
    today.setHours(0,0,0,0);
    const repaymentStatus = dueDate < today ? RepaymentStatus.Overdue : RepaymentStatus.Due;

    schedule.push({
      installmentNo: i,
      dueDate,
      amount: monthlyPayment,
      principal: principalPayment,
      interest: interestPayment,
      remainingBalance: Math.max(0, remainingBalance),
      status: repaymentStatus,
    });
  }

  return schedule;
};
