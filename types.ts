
export enum RiskLevel {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
}

export enum LoanStatus {
    Pending = 'Pending',
    Approved = 'Approved',
    Rejected = 'Rejected',
    Active = 'Active',
    Paid = 'Paid',
    Default = 'Default',
    Processing = 'Processing',
}

export enum RepaymentStatus {
    Paid = 'Paid',
    Due = 'Due',
    Overdue = 'Overdue',
}

export interface Client {
  id: string;
  name: string;
  email: string;
  cnic: string;
  phone: string;
  address: string;
  city: string;
  zipcode: string;
  gender: 'Male' | 'Female';
  dob: Date;
  maritalStatus: 'Single' | 'Married' | 'Divorced' | 'Widowed';
  occupation: string;
  secondaryPhone?: string;
  monthlyIncome: number; // Added for Eligibility
  cnicFrontImage?: string; // Added for KYC
  cnicBackImage?: string; // Added for KYC
  selfieImage?: string; // Added for KYC
  previousLoans: number;
  missedPayments: number;
  riskLevel: RiskLevel;
  riskScore: number;
  cnicVerified: boolean;
  createdAt: Date;
}

export interface Repayment {
  installmentNo: number;
  dueDate: Date;
  amount: number;
  principal: number;
  interest: number;
  remainingBalance: number;
  status: RepaymentStatus;
  paidAt?: Date; // Added for reporting
}

export interface LoanFee {
  id: string;
  name: string;
  type: 'Percentage Based' | 'Fixed Amount';
  value: number;
  calculateOn?: 'Principal Amount' | 'Loan Amount + Interest';
  isDeductible: boolean;
}

export interface Loan {
  id: string;
  clientId: string;
  clientName?: string;
  loanAmount: number;
  loanType: string;
  durationMonths: number;
  durationPeriod?: 'Months' | 'Years';
  startDate: Date;
  interestRate: number;
  interestMethod?: 'Flat Interest' | 'Reducing Balance';
  interestCycle?: 'Once' | 'Monthly' | 'Yearly';
  repaymentCycle?: 'Once' | 'Monthly' | 'Weekly';
  account?: string;
  fees?: LoanFee[];
  status: LoanStatus;
  repaymentSchedule: Repayment[];
}

export interface UpcomingRepayment {
  loanId: string;
  installmentNo: number;
  clientName: string;
  dueDate: Date;
  amount: number;
}

export interface LatePenaltyConfig {
    isEnabled: boolean;
    type: 'Percentage Based' | 'Fixed Amount';
    calculateOn: 'Principal Amount' | 'Overdue Amount' | 'Loan Amount + Interest';
    value: number;
    gracePeriod: number;
    recurring: 'Once' | 'Daily' | 'Weekly' | 'Monthly';
}

export interface LoanDocument {
    id: string;
    name: string;
    type: string;
    size: number;
    uploadDate: Date;
}

export interface LoanProduct {
    id: string;
    title: string;
    description?: string;
    minPrincipal: number;
    maxPrincipal: number;
    durationPeriod: 'Months' | 'Weeks' | 'Days';
    durationType: 'Fixed Duration' | 'Dynamic';
    durationValue: number; 
    interestMethod: 'Flat Interest' | 'Reducing Balance';
    interestRate: number;
    interestCycle: 'Once' | 'Monthly' | 'Yearly';
    repaymentCycle: 'Once' | 'Monthly' | 'Weekly' | 'Daily';
    fees: LoanFee[];
    latePenalty: LatePenaltyConfig;
    documents?: LoanDocument[];
    createdAt: Date;
}

export interface ActivityLogItem {
    id: string;
    message: string;
    timestamp: Date;
    type: 'create' | 'delete' | 'update' | 'payment' | 'security' | 'system';
}

export interface UserProfile {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    avatar: string | null;
}

// --- RBAC Types ---

export interface Permission {
    id: string;
    name: string;
    description: string;
    category: 'Loans' | 'Clients' | 'Reports' | 'Settings' | 'System';
}

export interface Role {
    id: string;
    name: string;
    description: string;
    permissions: string[];
    isSystem?: boolean;
    usersCount?: number;
}

export interface SystemUser {
    id: string;
    name: string;
    email: string;
    roleId: string;
    status: 'Active' | 'Inactive';
    lastLogin: Date;
    avatar?: string;
    branch?: string;
}

// --- New Types for Features ---

export interface Collection {
    id: string;
    loanId: string;
    clientName: string;
    installmentNo: number;
    amountCollected: number;
    collectedBy: string;
    collectedAt: Date;
    remarks?: string;
}

export interface GlobalLoanSettings {
    minLoanAmount: number;
    maxLoanAmount: number;
    defaultInterestRate: number;
    defaultGracePeriod: number;
    defaultPenaltyRate: number;
}

export interface AppSettings {
    finance: {
        currencySymbol: string;
        currencyCode: string;
        decimalSeparator: string;
        thousandSeparator: string;
    };
    notifications: {
        emailAlerts: boolean;
        smsAlerts: boolean;
        templates: {
            loanApproval: string;
            repaymentReminder: string;
            welcome: string;
        };
    };
    security: {
        twoFactor: boolean;
        strongPasswords: boolean;
        logAdminActions: boolean;
        sessionTimeout: number;
        maxLoginAttempts: number;
    };
    integrations: {
        stripe: boolean;
        twilio: boolean;
        sendgrid: boolean;
    };
    backup: {
        autoBackup: boolean;
        retentionDays: number;
    };
}

export type NewClientData = Omit<Client, 'id' | 'riskLevel' | 'riskScore' | 'createdAt'>;
export type NewLoanData = Omit<Loan, 'id' | 'status' | 'repaymentSchedule' | 'clientName'>;
export type NewLoanProductData = Omit<LoanProduct, 'id' | 'createdAt'>;
