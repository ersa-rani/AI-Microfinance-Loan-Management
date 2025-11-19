
import React, { createContext, useContext, useState, ReactNode, useCallback, Dispatch, SetStateAction, useMemo } from 'react';
import { Client, Loan, NewClientData, NewLoanData, RiskLevel, LoanStatus, Repayment, RepaymentStatus, UpcomingRepayment, LoanProduct, NewLoanProductData, ActivityLogItem, UserProfile, GlobalLoanSettings, Collection, Role, SystemUser, Permission, AppSettings } from '../types';
import { calculateMLRiskScore, scoreToRiskLevel, generateInstallmentSchedule } from '../utils/loanCalculations';

type View = 'dashboard' | 'clients' | 'clientDetails' | 'loans' | 'loanRequests' | 'addLoan' | 'loanProducts' | 'addLoanProduct' | 'settings' | 'collections' | 'reports';

interface LoanContextType {
  clients: Client[];
  loans: Loan[];
  loanProducts: LoanProduct[];
  activityLog: ActivityLogItem[];
  collections: Collection[];
  globalSettings: GlobalLoanSettings;
  appSettings: AppSettings; // Added
  
  addClient: (clientData: NewClientData) => void;
  updateClient: (client: Client) => void;
  addLoan: (loanData: NewLoanData) => void;
  addLoanProduct: (productData: NewLoanProductData) => void;
  deleteLoanProduct: (id: string) => void;
  updateLoanStatus: (loanId: string, status: LoanStatus) => void;
  markRepaymentAsPaid: (loanId: string, installmentNo: number) => void;
  addCollection: (data: Omit<Collection, 'id' | 'collectedAt' | 'collectedBy'>) => void;
  updateGlobalSettings: (settings: GlobalLoanSettings) => void;
  updateAppSettings: (settings: AppSettings) => void; // Added

  getClientById: (clientId: string) => Client | undefined;
  updateClientVerificationStatus: (clientId: string, isVerified: boolean) => void;
  
  currentView: View;
  setCurrentView: Dispatch<SetStateAction<View>>;
  selectedLoan: Loan | null;
  setSelectedLoan: Dispatch<SetStateAction<Loan | null>>;
  upcomingRepayments: UpcomingRepayment[];
  
  selectedClient: Client | null;
  setSelectedClient: Dispatch<SetStateAction<Client | null>>;
  filteredClientId: string | null;
  setFilteredClientId: Dispatch<SetStateAction<string | null>>;

  userProfile: UserProfile;
  updateUserProfile: (updates: Partial<UserProfile>) => void;

  // RBAC & System
  roles: Role[];
  systemUsers: SystemUser[];
  addRole: (role: Role) => void;
  updateRole: (role: Role) => void;
  updateSystemUser: (user: SystemUser) => void;
  inviteSystemUser: (email: string, name: string, roleId: string) => void; // Added
  
  // Helpers
  exportData: (type: 'clients' | 'loans' | 'backup') => void;
}

const LoanContext = createContext<LoanContextType | undefined>(undefined);

// --- Initial Mock Data ---
const MOCK_PERMISSIONS: Permission[] = [
    { id: 'p1', name: 'View Loans', description: 'Can view loan list and details', category: 'Loans' },
    { id: 'p2', name: 'Create Loan', description: 'Can initiate new loan applications', category: 'Loans' },
    // ... others are implied for now
];

const MOCK_ROLES: Role[] = [
    { id: 'r1', name: 'Super Admin', description: 'Full access to all system features', permissions: ['p1', 'p2'], isSystem: true, usersCount: 2 },
    { id: 'r2', name: 'Loan Officer', description: 'Can manage loans and clients', permissions: ['p1', 'p2'], isSystem: false, usersCount: 5 },
    { id: 'r3', name: 'Field Agent', description: 'Limited access for field operations', permissions: ['p1'], isSystem: false, usersCount: 8 },
    { id: 'r4', name: 'Customer Manager', description: 'Focus on client relationships', permissions: ['p1'], isSystem: false, usersCount: 3 },
    { id: 'r5', name: 'Customer', description: 'View only access for loan details', permissions: ['p1'], isSystem: true, usersCount: 142 },
];

const MOCK_SYSTEM_USERS: SystemUser[] = [
    { id: 'u1', name: 'Admin User', email: 'admin@lendbox.io', roleId: 'r1', status: 'Active', lastLogin: new Date(), branch: 'Head Office' },
    { id: 'u2', name: 'Sarah Connor', email: 'sarah@lendbox.io', roleId: 'r2', status: 'Active', lastLogin: new Date(Date.now() - 86400000), branch: 'Downtown' },
    { id: 'u3', name: 'John Smith', email: 'john@lendbox.io', roleId: 'r2', status: 'Inactive', lastLogin: new Date(Date.now() - 100000000), branch: 'Uptown' },
    { id: 'u4', name: 'Kyle Reese', email: 'kyle@lendbox.io', roleId: 'r3', status: 'Active', lastLogin: new Date(), branch: 'Remote' },
];

const DEFAULT_APP_SETTINGS: AppSettings = {
    finance: {
        currencySymbol: 'K',
        currencyCode: 'ZMW',
        decimalSeparator: '.',
        thousandSeparator: ','
    },
    notifications: {
        emailAlerts: true,
        smsAlerts: false,
        templates: {
            loanApproval: "Dear {name}, your loan of {amount} has been approved.",
            repaymentReminder: "Dear {name}, your payment of {amount} is due on {date}.",
            welcome: "Welcome to MLMS.AI, {name}!"
        }
    },
    security: {
        twoFactor: true,
        strongPasswords: true,
        logAdminActions: true,
        sessionTimeout: 30,
        maxLoginAttempts: 5
    },
    integrations: {
        stripe: false,
        twilio: false,
        sendgrid: true
    },
    backup: {
        autoBackup: true,
        retentionDays: 30
    }
};

const initialClientsRaw: Client[] = [
    { 
        id: 'c1', 
        name: 'Ali Raza', 
        email: 'aliraza@example.com',
        cnic: '42201-1234567-1', 
        phone: '03001234567', 
        address: 'House 12, St 4, Block A', 
        city: 'Karachi',
        zipcode: '75500',
        gender: 'Male',
        dob: new Date('1990-01-15'),
        maritalStatus: 'Married',
        occupation: 'Shopkeeper',
        monthlyIncome: 45000, 
        previousLoans: 2, 
        missedPayments: 1, 
        cnicVerified: true, 
        createdAt: new Date('2023-01-15'),
        riskLevel: RiskLevel.Medium,
        riskScore: 0.4
    },
    { 
        id: 'c2', 
        name: 'Fatima Khan', 
        email: 'fatima.khan@example.com',
        cnic: '37405-9876543-2', 
        phone: '03337654321', 
        address: 'Flat 5B, Gulberg Heights', 
        city: 'Lahore',
        zipcode: '54000',
        gender: 'Female',
        dob: new Date('1995-06-20'),
        maritalStatus: 'Single',
        occupation: 'Teacher',
        monthlyIncome: 60000, 
        previousLoans: 0, 
        missedPayments: 0, 
        cnicVerified: true, 
        createdAt: new Date('2023-03-20'),
        riskLevel: RiskLevel.Low,
        riskScore: 0.1
    },
    { 
        id: 'c3', 
        name: 'Bilal Ahmed', 
        email: 'bilal.ahmed@example.com',
        cnic: '61101-2233445-5', 
        phone: '03218877665', 
        address: 'Sector F-10/3', 
        city: 'Islamabad',
        zipcode: '44000',
        gender: 'Male',
        dob: new Date('1985-11-10'),
        maritalStatus: 'Married',
        occupation: 'Driver',
        monthlyIncome: 30000, 
        previousLoans: 6, 
        missedPayments: 3, 
        cnicVerified: true, 
        createdAt: new Date('2023-05-10'),
        riskLevel: RiskLevel.High,
        riskScore: 0.8
    },
];

const initialClients: Client[] = initialClientsRaw.map(c => {
    const riskScore = calculateMLRiskScore(c);
    const riskLevel = scoreToRiskLevel(riskScore);
    return { ...c, riskScore, riskLevel };
});

const initialLoans: Loan[] = [
    { id: 'l1', clientId: 'c2', loanAmount: 50000, loanType: 'Business', durationMonths: 12, startDate: new Date('2024-01-01'), interestRate: 10, status: LoanStatus.Active, repaymentSchedule: [] },
    { id: 'l2', clientId: 'c1', loanAmount: 25000, loanType: 'Personal', durationMonths: 6, startDate: new Date('2024-03-01'), interestRate: 12, status: LoanStatus.Paid, repaymentSchedule: [] },
    { id: 'l3', clientId: 'c3', loanAmount: 100000, loanType: 'Business', durationMonths: 24, startDate: new Date('2023-11-01'), interestRate: 8, status: LoanStatus.Default, repaymentSchedule: [] },
    { id: 'l4', clientId: 'c1', loanAmount: 15000, loanType: 'Education', durationMonths: 12, startDate: new Date('2024-06-10'), interestRate: 9, status: LoanStatus.Pending, repaymentSchedule: [] },
];

initialLoans.forEach(loan => {
    loan.repaymentSchedule = generateInstallmentSchedule(loan);
    const client = initialClients.find(c => c.id === loan.clientId);
    if(client) loan.clientName = client.name;
});

// Manually set a payment to be due soon
const today = new Date();
if(initialLoans[0].repaymentSchedule.length > 0) {
    const futureDueDateIndex = initialLoans[0].repaymentSchedule.findIndex(r => r.dueDate > today && r.status === RepaymentStatus.Due);
    if(futureDueDateIndex !== -1) {
       const newDueDate = new Date(today);
       newDueDate.setDate(today.getDate() + 3);
       initialLoans[0].repaymentSchedule[futureDueDateIndex].dueDate = newDueDate;
    }
}

export const LoanProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [loans, setLoans] = useState<Loan[]>(initialLoans);
  const [loanProducts, setLoanProducts] = useState<LoanProduct[]>([]);
  const [activityLog, setActivityLog] = useState<ActivityLogItem[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [roles, setRoles] = useState<Role[]>(MOCK_ROLES);
  const [systemUsers, setSystemUsers] = useState<SystemUser[]>(MOCK_SYSTEM_USERS);
  
  const [globalSettings, setGlobalSettings] = useState<GlobalLoanSettings>({
      minLoanAmount: 1000,
      maxLoanAmount: 500000,
      defaultInterestRate: 12,
      defaultGracePeriod: 5,
      defaultPenaltyRate: 2
  });

  const [appSettings, setAppSettings] = useState<AppSettings>(DEFAULT_APP_SETTINGS);

  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [filteredClientId, setFilteredClientId] = useState<string | null>(null);

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
      const saved = localStorage.getItem('userProfile');
      return saved ? JSON.parse(saved) : {
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@lendbox.io',
          phone: '+1 (555) 123-4567',
          avatar: null
      };
  });

  const updateUserProfile = useCallback((updates: Partial<UserProfile>) => {
      setUserProfile(prev => {
          const newProfile = { ...prev, ...updates };
          localStorage.setItem('userProfile', JSON.stringify(newProfile));
          return newProfile;
      });
      const log: ActivityLogItem = {
          id: `log${Date.now()}`,
          message: `User profile updated.`,
          timestamp: new Date(),
          type: 'update'
      };
      setActivityLog(prev => [log, ...prev]);
  }, []);

  const updateGlobalSettings = useCallback((settings: GlobalLoanSettings) => {
      setGlobalSettings(settings);
      const log: ActivityLogItem = {
          id: `log${Date.now()}`,
          message: `Global settings updated.`,
          timestamp: new Date(),
          type: 'update'
      };
      setActivityLog(prev => [log, ...prev]);
  }, []);

  const updateAppSettings = useCallback((settings: AppSettings) => {
      setAppSettings(settings);
      const log: ActivityLogItem = {
          id: `log${Date.now()}`,
          message: `Application settings updated.`,
          timestamp: new Date(),
          type: 'system'
      };
      setActivityLog(prev => [log, ...prev]);
  }, []);

  // RBAC & System Handlers
  const addRole = useCallback((role: Role) => {
      setRoles(prev => [...prev, role]);
      const log: ActivityLogItem = {
          id: `log${Date.now()}`,
          message: `Created new role: ${role.name}`,
          timestamp: new Date(),
          type: 'security'
      };
      setActivityLog(prev => [log, ...prev]);
  }, []);

  const updateRole = useCallback((role: Role) => {
      setRoles(prev => prev.map(r => r.id === role.id ? role : r));
      const log: ActivityLogItem = {
          id: `log${Date.now()}`,
          message: `Updated role: ${role.name}`,
          timestamp: new Date(),
          type: 'security'
      };
      setActivityLog(prev => [log, ...prev]);
  }, []);

  const updateSystemUser = useCallback((user: SystemUser) => {
      setSystemUsers(prev => prev.map(u => u.id === user.id ? user : u));
      const log: ActivityLogItem = {
          id: `log${Date.now()}`,
          message: `Updated system user: ${user.name}`,
          timestamp: new Date(),
          type: 'security'
      };
      setActivityLog(prev => [log, ...prev]);
  }, []);

  const inviteSystemUser = useCallback((email: string, name: string, roleId: string) => {
      const newUser: SystemUser = {
          id: `u${Date.now()}`,
          name,
          email,
          roleId,
          status: 'Active',
          lastLogin: new Date(),
          branch: 'Head Office'
      };
      setSystemUsers(prev => [...prev, newUser]);
      const log: ActivityLogItem = {
          id: `log${Date.now()}`,
          message: `Invited new user: ${email}`,
          timestamp: new Date(),
          type: 'security'
      };
      setActivityLog(prev => [log, ...prev]);
  }, []);

  // Export Helper
  const exportData = useCallback((type: 'clients' | 'loans' | 'backup') => {
    let csvContent = "data:text/csv;charset=utf-8,";
    let filename = "";
    
    if(type === 'clients') {
        filename = "clients_export.csv";
        csvContent += "ID,Name,CNIC,Phone,Income,Risk\n";
        clients.forEach(c => {
            csvContent += `${c.id},${c.name},${c.cnic},${c.phone},${c.monthlyIncome},${c.riskLevel}\n`;
        });
    } else if (type === 'loans') {
        filename = "loans_export.csv";
        csvContent += "ID,Client,Amount,Status,StartDate\n";
        loans.forEach(l => {
            csvContent += `${l.id},${l.clientName},${l.loanAmount},${l.status},${l.startDate.toLocaleDateString()}\n`;
        });
    } else if (type === 'backup') {
        filename = "full_backup.json";
        const backup = { clients, loans, loanProducts, activityLog, roles, systemUsers, globalSettings, appSettings };
        csvContent = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup));
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    const log: ActivityLogItem = {
          id: `log${Date.now()}`,
          message: `Exported data: ${type}`,
          timestamp: new Date(),
          type: 'system'
      };
    setActivityLog(prev => [log, ...prev]);

  }, [clients, loans, loanProducts, activityLog, roles, systemUsers, globalSettings, appSettings]);

  const upcomingRepayments = useMemo((): UpcomingRepayment[] => {
    const reminders: UpcomingRepayment[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(today.getDate() + 7);

    loans.forEach(loan => {
        if (loan.status === LoanStatus.Active) {
            loan.repaymentSchedule.forEach(rep => {
                if (rep.status === RepaymentStatus.Due && rep.dueDate >= today && rep.dueDate <= sevenDaysFromNow) {
                    reminders.push({
                        loanId: loan.id,
                        installmentNo: rep.installmentNo,
                        clientName: loan.clientName || 'Unknown Client',
                        dueDate: rep.dueDate,
                        amount: rep.amount,
                    });
                }
            });
        }
    });
    return reminders.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  }, [loans]);

  const addClient = useCallback((clientData: NewClientData) => {
    const riskScore = calculateMLRiskScore(clientData);
    const riskLevel = scoreToRiskLevel(riskScore);
    const newClient: Client = {
      ...clientData,
      id: `c${Date.now()}`,
      riskScore,
      riskLevel,
      createdAt: new Date(),
    };
    setClients(prev => [...prev, newClient]);
    
    const log: ActivityLogItem = {
          id: `log${Date.now()}`,
          message: `Created borrower ${newClient.name}.`,
          timestamp: new Date(),
          type: 'create'
      };
      setActivityLog(prev => [log, ...prev]);
  }, []);

  const updateClient = useCallback((updatedClient: Client) => {
    setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));
    if (selectedClient && selectedClient.id === updatedClient.id) {
        setSelectedClient(updatedClient);
    }
     const log: ActivityLogItem = {
          id: `log${Date.now()}`,
          message: `Updated profile for ${updatedClient.name}.`,
          timestamp: new Date(),
          type: 'update'
      };
      setActivityLog(prev => [log, ...prev]);
  }, [selectedClient]);

  const addLoan = useCallback((loanData: NewLoanData) => {
    const client = clients.find(c => c.id === loanData.clientId);
    if (!client) return;

    const schedule = generateInstallmentSchedule(loanData);
    const newLoan: Loan = {
      ...loanData,
      id: `l${Date.now()}`,
      status: LoanStatus.Pending,
      repaymentSchedule: schedule,
      clientName: client.name,
    };
    setLoans(prev => [...prev, newLoan]);
    
     const log: ActivityLogItem = {
          id: `log${Date.now()}`,
          message: `New loan application created for ${client.name}.`,
          timestamp: new Date(),
          type: 'create'
      };
      setActivityLog(prev => [log, ...prev]);

    setCurrentView('loanRequests');
  }, [clients]);

  const addLoanProduct = useCallback((productData: NewLoanProductData) => {
      const newProduct: LoanProduct = {
          ...productData,
          id: `lp${Date.now()}`,
          createdAt: new Date()
      };
      setLoanProducts(prev => [...prev, newProduct]);
      const log: ActivityLogItem = {
          id: `log${Date.now()}`,
          message: `Created loan product ${newProduct.title}.`,
          timestamp: new Date(),
          type: 'create'
      };
      setActivityLog(prev => [log, ...prev]);
      setCurrentView('loanProducts');
  }, []);

  const deleteLoanProduct = useCallback((id: string) => {
      setLoanProducts(prev => {
          const product = prev.find(p => p.id === id);
          if(product) {
             const log: ActivityLogItem = {
                id: `log${Date.now()}`,
                message: `Deleted loan product ${product.title}.`,
                timestamp: new Date(),
                type: 'delete'
            };
            setActivityLog(prevLogs => [log, ...prevLogs]);
          }
          return prev.filter(p => p.id !== id);
      });
  }, []);

  const updateLoanStatus = useCallback((loanId: string, status: LoanStatus) => {
    setLoans(prev => prev.map(loan => loan.id === loanId ? { ...loan, status } : loan));
    const log: ActivityLogItem = {
          id: `log${Date.now()}`,
          message: `Loan ${loanId} status updated to ${status}.`,
          timestamp: new Date(),
          type: 'update'
      };
      setActivityLog(prev => [log, ...prev]);
  }, []);
  
  const markRepaymentAsPaid = useCallback((loanId: string, installmentNo: number) => {
    const loan = loans.find(l => l.id === loanId);
    if(loan) {
        const installment = loan.repaymentSchedule.find(r => r.installmentNo === installmentNo);
        if(installment) {
             const newCollection: Collection = {
                id: `col-${Date.now()}`,
                loanId: loan.id,
                clientName: loan.clientName || 'Unknown',
                installmentNo: installmentNo,
                amountCollected: installment.amount,
                collectedBy: 'System',
                collectedAt: new Date(),
                remarks: 'Marked as paid from Dashboard'
            };
            setCollections(prev => [...prev, newCollection]);
        }
    }

    setLoans(prevLoans => {
        return prevLoans.map(loan => {
            if (loan.id === loanId) {
                const newSchedule = loan.repaymentSchedule.map(rep => 
                    rep.installmentNo === installmentNo ? { ...rep, status: RepaymentStatus.Paid, paidAt: new Date() } : rep
                );

                const allPaid = newSchedule.every(rep => rep.status === RepaymentStatus.Paid);
                const newStatus = allPaid ? LoanStatus.Paid : loan.status;

                return { ...loan, repaymentSchedule: newSchedule, status: newStatus };
            }
            return loan;
        });
    });
     const log: ActivityLogItem = {
          id: `log${Date.now()}`,
          message: `Payment received for Loan ${loanId}, Installment #${installmentNo}.`,
          timestamp: new Date(),
          type: 'payment'
      };
      setActivityLog(prev => [log, ...prev]);
  }, [loans]);

  const addCollection = useCallback((data: Omit<Collection, 'id' | 'collectedAt' | 'collectedBy'>) => {
      const newCollection: Collection = {
          ...data,
          id: `col-${Date.now()}`,
          collectedAt: new Date(),
          collectedBy: userProfile.firstName + ' ' + userProfile.lastName
      };
      setCollections(prev => [...prev, newCollection]);
      
      // Update Loan Schedule
      setLoans(prevLoans => {
        return prevLoans.map(loan => {
            if (loan.id === data.loanId) {
                const newSchedule = loan.repaymentSchedule.map(rep => 
                    rep.installmentNo === data.installmentNo ? { ...rep, status: RepaymentStatus.Paid, paidAt: new Date() } : rep
                );
                const allPaid = newSchedule.every(rep => rep.status === RepaymentStatus.Paid);
                const newStatus = allPaid ? LoanStatus.Paid : loan.status;
                return { ...loan, repaymentSchedule: newSchedule, status: newStatus };
            }
            return loan;
        });
      });

      const log: ActivityLogItem = {
          id: `log${Date.now()}`,
          message: `Collection logged: $${data.amountCollected} for Loan ${data.loanId}.`,
          timestamp: new Date(),
          type: 'payment'
      };
      setActivityLog(prev => [log, ...prev]);
  }, [userProfile]);

  const getClientById = useCallback((clientId: string) => {
    return clients.find(c => c.id === clientId);
  }, [clients]);

  const updateClientVerificationStatus = useCallback((clientId: string, isVerified: boolean) => {
    setClients(prevClients => {
        return prevClients.map(client => {
            if (client.id === clientId) {
                const updatedClient = { ...client, cnicVerified: isVerified };
                const newRiskScore = calculateMLRiskScore(updatedClient);
                const newRiskLevel = scoreToRiskLevel(newRiskScore);
                
                const finalClient = { ...updatedClient, riskScore: newRiskScore, riskLevel: newRiskLevel };
                
                if (selectedClient && selectedClient.id === clientId) {
                    setSelectedClient(finalClient);
                }
                return finalClient;
            }
            return client;
        });
    });
     const log: ActivityLogItem = {
          id: `log${Date.now()}`,
          message: `KYC status changed for client ${clientId} to ${isVerified ? 'Verified' : 'Unverified'}.`,
          timestamp: new Date(),
          type: 'security'
      };
      setActivityLog(prev => [log, ...prev]);
  }, [selectedClient, setSelectedClient]);

  return (
    <LoanContext.Provider value={{ 
        clients, 
        loans, 
        loanProducts,
        activityLog,
        collections,
        globalSettings,
        appSettings, // Added
        addClient,
        updateClient,
        addLoan, 
        addLoanProduct,
        deleteLoanProduct,
        updateLoanStatus, 
        markRepaymentAsPaid,
        addCollection,
        updateGlobalSettings,
        updateAppSettings, // Added
        getClientById,
        updateClientVerificationStatus,
        currentView,
        setCurrentView,
        selectedLoan,
        setSelectedLoan,
        upcomingRepayments,
        selectedClient,
        setSelectedClient,
        filteredClientId,
        setFilteredClientId,
        userProfile,
        updateUserProfile,
        roles,
        systemUsers,
        addRole,
        updateRole,
        updateSystemUser,
        inviteSystemUser, // Added
        exportData
    }}>
      {children}
    </LoanContext.Provider>
  );
};

export const useLoanManager = (): LoanContextType => {
  const context = useContext(LoanContext);
  if (context === undefined) {
    throw new Error('useLoanManager must be used within a LoanProvider');
  }
  return context;
};
