
import React, { useState, useRef, useEffect } from 'react';
import { User, Settings, DollarSign, Bell, Shield, Database, Globe, Briefcase, Layers, Lock, Palette, Save, Sliders, Camera, Check, Eye, EyeOff, AlertCircle, Plus, Edit2, Trash2, Search, CheckCircle, XCircle, Smartphone, Monitor, LogOut, Laptop } from 'lucide-react';
import { useLoanManager } from '../hooks/useLoanManager';
import { Role, Permission, SystemUser, AppSettings } from '../types';

type SettingSection = 
  | 'profile' 
  | 'loanConfig' 
  | 'finance' 
  | 'notifications' 
  | 'roles' 
  | 'backup' 
  | 'integrations' 
  | 'security';

const MOCK_PERMISSIONS: Permission[] = [
    { id: 'p1', name: 'View Loans', description: 'Can view loan list and details', category: 'Loans' },
    { id: 'p2', name: 'Create Loan', description: 'Can initiate new loan applications', category: 'Loans' },
    { id: 'p3', name: 'Approve Loans', description: 'Can approve pending loans', category: 'Loans' },
    { id: 'p4', name: 'Reject Loans', description: 'Can reject loan applications', category: 'Loans' },
    { id: 'p5', name: 'View Clients', description: 'Can view client profiles', category: 'Clients' },
    { id: 'p6', name: 'Edit Clients', description: 'Can edit client information', category: 'Clients' },
    { id: 'p7', name: 'Delete Clients', description: 'Can remove clients from system', category: 'Clients' },
    { id: 'p8', name: 'View Reports', description: 'Can access financial reports', category: 'Reports' },
    { id: 'p9', name: 'Export Data', description: 'Can export data to CSV/Excel', category: 'Reports' },
    { id: 'p10', name: 'Manage Settings', description: 'Can access global settings', category: 'Settings' },
    { id: 'p11', name: 'Manage Roles', description: 'Can create and assign roles', category: 'System' },
];

// --- Session Types ---
interface ActiveSession {
    id: string;
    deviceType: 'Desktop' | 'Mobile' | 'Tablet';
    deviceName: string;
    location: string;
    ipAddress: string;
    lastActive: Date;
    isCurrent: boolean;
}

const SectionButton: React.FC<{
    id: SettingSection;
    label: string;
    icon: React.ReactNode;
    active: boolean;
    onClick: () => void;
}> = ({ id, label, icon, active, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
            active 
            ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-300' 
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900'
        }`}
    >
        {icon}
        <span>{label}</span>
    </button>
);

const ToggleSwitch: React.FC<{ label?: string; checked: boolean; onChange: () => void, size?: 'sm' | 'md' }> = ({ label, checked, onChange, size = 'md' }) => (
    <div className="flex items-center justify-between py-1">
        {label && <span className={`font-medium text-gray-700 dark:text-gray-300 ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>{label}</span>}
        <button 
            onClick={onChange}
            className={`relative inline-flex ${size === 'sm' ? 'h-5 w-9' : 'h-6 w-11'} items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                checked ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-600'
            }`}
        >
            <span className={`inline-block ${size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} transform rounded-full bg-white transition-transform ${
                checked ? (size === 'sm' ? 'translate-x-4' : 'translate-x-6') : 'translate-x-1'
            }`} />
        </button>
    </div>
);

const InputField: React.FC<{ 
    label: string; 
    type?: string; 
    value: string; 
    name?: string;
    placeholder?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void 
}> = ({ label, type = "text", value, name, placeholder, onChange }) => (
    <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
        <input 
            type={type} 
            name={name}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 text-black dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            value={value}
            onChange={onChange}
            placeholder={placeholder}
        />
    </div>
);

const PasswordInput: React.FC<{
    label: string;
    value: string;
    name: string;
    placeholder?: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ label, value, name, placeholder, onChange }) => {
    const [show, setShow] = useState(false);
    return (
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
            <div className="relative">
                <input
                    type={show ? "text" : "password"}
                    name={name}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 text-black dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all pr-10"
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                />
                <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                    {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>
        </div>
    );
};

const getCurrentSessionInfo = (): ActiveSession => {
    const userAgent = navigator.userAgent;
    let deviceName = "Unknown Device";
    let deviceType: 'Desktop' | 'Mobile' | 'Tablet' = 'Desktop';

    if (/Mobi|Android/i.test(userAgent)) {
        deviceType = 'Mobile';
    }
    
    if (userAgent.indexOf("Firefox") > -1) {
        deviceName = "Firefox";
    } else if (userAgent.indexOf("SamsungBrowser") > -1) {
        deviceName = "Samsung Internet";
    } else if (userAgent.indexOf("Opera") > -1 || userAgent.indexOf("OPR") > -1) {
        deviceName = "Opera";
    } else if (userAgent.indexOf("Trident") > -1) {
        deviceName = "Internet Explorer";
    } else if (userAgent.indexOf("Edge") > -1) {
        deviceName = "Edge";
    } else if (userAgent.indexOf("Chrome") > -1) {
        deviceName = "Chrome";
    } else if (userAgent.indexOf("Safari") > -1) {
        deviceName = "Safari";
    }

    if (userAgent.indexOf("Mac") > -1) deviceName += " on MacOS";
    else if (userAgent.indexOf("Win") > -1) deviceName += " on Windows";
    else if (userAgent.indexOf("Linux") > -1) deviceName += " on Linux";
    else if (userAgent.indexOf("Android") > -1) deviceName += " on Android";
    else if (userAgent.indexOf("iPhone") > -1) deviceName += " on iPhone";

    return {
        id: 'current-session',
        deviceType,
        deviceName,
        location: 'Karachi, Pakistan', 
        ipAddress: '192.168.1.104',
        lastActive: new Date(),
        isCurrent: true
    };
};

export const SettingsPage: React.FC = () => {
    const { userProfile, updateUserProfile, roles, systemUsers, addRole, updateRole, updateSystemUser, inviteSystemUser, globalSettings, updateGlobalSettings, appSettings, updateAppSettings, exportData } = useLoanManager();
    const [activeSection, setActiveSection] = useState<SettingSection>('profile');
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [error, setError] = useState('');

    // Local Settings State
    const [localGlobalSettings, setLocalGlobalSettings] = useState(globalSettings);
    const [localAppSettings, setLocalAppSettings] = useState(appSettings);

    // Roles State
    const [activeRoleTab, setActiveRoleTab] = useState<'roles' | 'users'>('roles');
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [isEditRoleMode, setIsEditRoleMode] = useState(false);
    const [userSearch, setUserSearch] = useState('');

    const toggleIntegration = (key: keyof AppSettings['integrations']) => {
        setLocalAppSettings(prev => ({
            ...prev,
            integrations: {
                ...prev.integrations,
                [key]: !prev.integrations[key]
            }
        }));
    };

    const [sessions, setSessions] = useState<ActiveSession[]>(() => [
        getCurrentSessionInfo(),
        {
            id: 's2',
            deviceType: 'Mobile',
            deviceName: 'App on Android 13',
            location: 'Lahore, Pakistan',
            ipAddress: '103.244.1.2',
            lastActive: new Date(Date.now() - 7200000),
            isCurrent: false
        },
        {
            id: 's3',
            deviceType: 'Desktop',
            deviceName: 'Safari on MacOS',
            location: 'Islamabad, Pakistan',
            ipAddress: '111.11.22.33',
            lastActive: new Date(Date.now() - 86400000),
            isCurrent: false
        }
    ]);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [profile, setProfile] = useState(userProfile);

    useEffect(() => {
        setProfile(userProfile);
    }, [userProfile]);
    
    useEffect(() => {
        setLocalGlobalSettings(globalSettings);
        setLocalAppSettings(appSettings);
    }, [globalSettings, appSettings]);

    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: ''
    });

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name!]: value }));
        if (error) setError('');
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswords(prev => ({ ...prev, [name]: value }));
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfile(prev => ({ ...prev, avatar: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        setError('');
        setIsSaving(true);

        setTimeout(() => {
            if (activeSection === 'profile') {
                if (!profile.firstName.trim() || !profile.lastName.trim() || !profile.email.trim()) {
                    setError('First Name, Last Name, and Email are required.');
                    setIsSaving(false);
                    return;
                }
                updateUserProfile(profile);
                if (passwords.new && passwords.new === passwords.confirm) {
                    setPasswords({ current: '', new: '', confirm: '' });
                }
            } else if (activeSection === 'loanConfig') {
                updateGlobalSettings(localGlobalSettings);
            } else {
                // Save other sections using updateAppSettings
                updateAppSettings(localAppSettings);
            }

            setIsSaving(false);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 2000);
        }, 500);
    };

    const handleEditRole = (role: Role) => {
        setEditingRole({ ...role });
        setIsEditRoleMode(true);
    };

    const handleCreateRole = () => {
        setEditingRole({
            id: `r${Date.now()}`,
            name: '',
            description: '',
            permissions: [],
            isSystem: false,
            usersCount: 0
        });
        setIsEditRoleMode(true);
    };

    const saveRoleChanges = () => {
        if (!editingRole) return;
        if (!editingRole.name) {
             setError('Role Name is required');
             return;
        }
        
        const exists = roles.find(r => r.id === editingRole.id);
        if (exists) {
            updateRole(editingRole);
        } else {
            addRole(editingRole);
        }
        
        setIsEditRoleMode(false);
        setEditingRole(null);
    };

    const togglePermission = (permId: string) => {
        if (!editingRole) return;
        const hasPerm = editingRole.permissions.includes(permId);
        setEditingRole({
            ...editingRole,
            permissions: hasPerm 
                ? editingRole.permissions.filter(id => id !== permId)
                : [...editingRole.permissions, permId]
        });
    };

    const toggleUserStatus = (userId: string) => {
        const user = systemUsers.find(u => u.id === userId);
        if (user) {
            updateSystemUser({ ...user, status: user.status === 'Active' ? 'Inactive' : 'Active' });
        }
    };
    
    const changeUserRole = (userId: string, roleId: string) => {
         const user = systemUsers.find(u => u.id === userId);
         if (user) {
             updateSystemUser({ ...user, roleId });
         }
    };

    const handleRevokeSession = (id: string) => {
        if(window.confirm('Are you sure you want to log out this device?')) {
            setSessions(prev => prev.filter(s => s.id !== id));
        }
    };

    const handleInviteUser = () => {
        const email = window.prompt("Enter the email address of the new user:");
        if (email) {
            const name = window.prompt("Enter the full name of the new user:") || "New User";
            // Default role ID, assuming first available or a safe default
            const roleId = roles.length > 0 ? roles[0].id : 'r1';
            inviteSystemUser(email, name, roleId);
            alert(`Invitation sent to ${email}`);
        }
    };

    const editTemplate = (templateKey: keyof AppSettings['notifications']['templates']) => {
        const current = localAppSettings.notifications.templates[templateKey];
        const newVal = window.prompt("Edit template content:", current);
        if (newVal !== null) {
            setLocalAppSettings(prev => ({
                ...prev,
                notifications: {
                    ...prev.notifications,
                    templates: {
                        ...prev.notifications.templates,
                        [templateKey]: newVal
                    }
                }
            }));
        }
    };

    const renderRolesContent = () => {
        if (isEditRoleMode && editingRole) {
            const groupedPerms = MOCK_PERMISSIONS.reduce((acc, perm) => {
                if (!acc[perm.category]) acc[perm.category] = [];
                acc[perm.category].push(perm);
                return acc;
            }, {} as Record<string, Permission[]>);

            return (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                     <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            {editingRole.name ? `Edit Role: ${editingRole.name}` : 'Create New Role'}
                        </h3>
                        <button onClick={() => setIsEditRoleMode(false)} className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                            Cancel
                        </button>
                    </div>

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role Name</label>
                                <input 
                                    type="text" 
                                    value={editingRole.name}
                                    onChange={e => setEditingRole({...editingRole!, name: e.target.value})}
                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 text-black dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                                <input 
                                    type="text" 
                                    value={editingRole.description}
                                    onChange={e => setEditingRole({...editingRole!, description: e.target.value})}
                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 text-black dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                            <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wide">Permissions</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {Object.entries(groupedPerms).map(([category, perms]) => (
                                    <div key={category} className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                                        <h5 className="font-semibold text-indigo-600 dark:text-indigo-400 mb-3">{category}</h5>
                                        <div className="space-y-3">
                                            {perms.map(perm => (
                                                <div key={perm.id} className="flex items-start justify-between">
                                                    <div className="mr-3">
                                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{perm.name}</p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">{perm.description}</p>
                                                    </div>
                                                    <ToggleSwitch 
                                                        checked={editingRole!.permissions.includes(perm.id)} 
                                                        onChange={() => togglePermission(perm.id)}
                                                        size="sm"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                             <button 
                                onClick={saveRoleChanges}
                                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shadow-sm transition-colors"
                            >
                                Save Role
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Roles & Permissions</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Manage system access levels and user assignments.</p>
                    </div>
                    <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                        <button 
                            onClick={() => setActiveRoleTab('roles')}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeRoleTab === 'roles' ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
                        >
                            Roles
                        </button>
                        <button 
                             onClick={() => setActiveRoleTab('users')}
                             className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeRoleTab === 'users' ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
                        >
                            User Assignments
                        </button>
                    </div>
                </div>

                {activeRoleTab === 'roles' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {roles.map(role => (
                            <div key={role.id} onClick={() => handleEditRole(role)} className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 cursor-pointer hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-md transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                        <Shield size={24} />
                                    </div>
                                    {role.isSystem && (
                                        <span className="text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">System</span>
                                    )}
                                </div>
                                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{role.name}</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">{role.description}</p>
                                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        <span className="font-bold">{role.usersCount || systemUsers.filter(u=>u.roleId===role.id).length}</span> Users assigned
                                    </div>
                                    <span className="text-indigo-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">Edit Permissions →</span>
                                </div>
                            </div>
                        ))}
                        <button onClick={handleCreateRole} className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-gray-500 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-all min-h-[200px]">
                            <Plus size={32} className="mb-2" />
                            <span className="font-medium">Create New Role</span>
                        </button>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-800">
                            <div className="relative w-72">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input 
                                    type="text" 
                                    placeholder="Search users..." 
                                    value={userSearch}
                                    onChange={(e) => setUserSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 text-black dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="flex space-x-3">
                                <button 
                                    onClick={() => exportData('backup')} 
                                    className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200"
                                >
                                    Export List
                                </button>
                                <button 
                                    onClick={handleInviteUser}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
                                >
                                    Invite User
                                </button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-900">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {systemUsers
                                        .filter(u => u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase()))
                                        .map(user => (
                                        <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold text-sm">
                                                        {user.name.charAt(0)}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <select 
                                                    value={user.roleId}
                                                    onChange={(e) => changeUserRole(user.id, e.target.value)}
                                                    className="block w-full pl-3 pr-10 py-1 text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
                                                >
                                                    {roles.map(role => (
                                                        <option key={role.id} value={role.id}>{role.name}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <button 
                                                    onClick={() => toggleUserStatus(user.id)}
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer ${user.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}
                                                >
                                                    {user.status === 'Active' ? <CheckCircle size={12} className="mr-1" /> : <XCircle size={12} className="mr-1" />}
                                                    {user.status}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {user.branch || 'Head Office'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {user.lastLogin.toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderContent = () => {
        switch(activeSection) {
            case 'profile':
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div>
                            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-1">User Profile</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Manage your personal information and access credentials.</p>
                            
                            <div className="flex items-center mb-6">
                                <div className="relative group">
                                    <div className="h-24 w-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden border-4 border-white dark:border-gray-800 shadow-md">
                                        {profile.avatar ? (
                                            <img src={profile.avatar} alt="Profile" className="h-full w-full object-cover" />
                                        ) : (
                                            <User size={48} className="text-gray-400" />
                                        )}
                                    </div>
                                    <div onClick={handleAvatarClick} className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200">
                                        <Camera className="text-white opacity-0 group-hover:opacity-100" size={24} />
                                    </div>
                                </div>
                                <div className="ml-6">
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        className="hidden" 
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                    <button 
                                        onClick={handleAvatarClick}
                                        className="px-4 py-2 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors shadow-sm"
                                    >
                                        Change Avatar
                                    </button>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">JPG, GIF or PNG. Max size of 800K</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputField 
                                    label="First Name" 
                                    name="firstName" 
                                    value={profile.firstName} 
                                    onChange={handleProfileChange} 
                                />
                                <InputField 
                                    label="Last Name" 
                                    name="lastName" 
                                    value={profile.lastName} 
                                    onChange={handleProfileChange} 
                                />
                                <InputField 
                                    label="Email Address" 
                                    type="email" 
                                    name="email" 
                                    value={profile.email} 
                                    onChange={handleProfileChange} 
                                />
                                <InputField 
                                    label="Phone Number" 
                                    name="phone" 
                                    value={profile.phone} 
                                    onChange={handleProfileChange} 
                                />
                            </div>
                        </div>

                        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Change Password</h3>
                            <PasswordInput 
                                label="Current Password" 
                                name="current"
                                value={passwords.current} 
                                onChange={handlePasswordChange}
                                placeholder="••••••••" 
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <PasswordInput 
                                    label="New Password" 
                                    name="new"
                                    value={passwords.new} 
                                    onChange={handlePasswordChange}
                                    placeholder="••••••••" 
                                />
                                <PasswordInput 
                                    label="Confirm New Password" 
                                    name="confirm"
                                    value={passwords.confirm} 
                                    onChange={handlePasswordChange}
                                    placeholder="••••••••" 
                                />
                            </div>
                        </div>
                    </div>
                );
            
            case 'loanConfig':
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Loan Configuration</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Set global defaults for loan products and calculations.</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Default Interest Calculation</label>
                                    <select className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 text-black dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none">
                                        <option>Flat Rate</option>
                                        <option>Reducing Balance</option>
                                    </select>
                                </div>
                                <InputField 
                                    label="Default Interest Rate (%)" 
                                    type="number" 
                                    value={localGlobalSettings.defaultInterestRate.toString()} 
                                    onChange={(e) => setLocalGlobalSettings({...localGlobalSettings, defaultInterestRate: parseFloat(e.target.value)})}
                                />
                                <InputField 
                                    label="Minimum Loan Amount" 
                                    type="number" 
                                    value={localGlobalSettings.minLoanAmount.toString()}
                                    onChange={(e) => setLocalGlobalSettings({...localGlobalSettings, minLoanAmount: parseFloat(e.target.value)})}
                                />
                                <InputField 
                                    label="Maximum Loan Amount" 
                                    type="number" 
                                    value={localGlobalSettings.maxLoanAmount.toString()}
                                    onChange={(e) => setLocalGlobalSettings({...localGlobalSettings, maxLoanAmount: parseFloat(e.target.value)})}
                                />
                                <InputField 
                                    label="Default Grace Period (Days)" 
                                    type="number" 
                                    value={localGlobalSettings.defaultGracePeriod.toString()}
                                    onChange={(e) => setLocalGlobalSettings({...localGlobalSettings, defaultGracePeriod: parseFloat(e.target.value)})}
                                />
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Penalty Calculation</label>
                                    <select className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 text-black dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none">
                                        <option>% of Principal</option>
                                        <option>% of Overdue Amount</option>
                                        <option>Fixed Amount</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'finance':
                 return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Currency & Finance</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Manage currency symbols, decimal formats, and accounting settings.</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputField label="Currency Symbol" value={localAppSettings.finance.currencySymbol} onChange={(e) => setLocalAppSettings({...localAppSettings, finance: {...localAppSettings.finance, currencySymbol: e.target.value}})} />
                                <InputField label="Currency Code" value={localAppSettings.finance.currencyCode} onChange={(e) => setLocalAppSettings({...localAppSettings, finance: {...localAppSettings.finance, currencyCode: e.target.value}})}/>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Decimal Separator</label>
                                    <select 
                                        value={localAppSettings.finance.decimalSeparator}
                                        onChange={(e) => setLocalAppSettings({...localAppSettings, finance: {...localAppSettings.finance, decimalSeparator: e.target.value}})}
                                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 text-black dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                    >
                                        <option value=".">Dot (.)</option>
                                        <option value=",">Comma (,)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Thousand Separator</label>
                                    <select 
                                        value={localAppSettings.finance.thousandSeparator}
                                        onChange={(e) => setLocalAppSettings({...localAppSettings, finance: {...localAppSettings.finance, thousandSeparator: e.target.value}})}
                                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 text-black dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                    >
                                        <option value=",">Comma (,)</option>
                                        <option value=".">Dot (.)</option>
                                        <option value=" ">Space ( )</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'notifications':
                 return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Notifications</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Configure email and SMS alerts for system events.</p>
                            
                            <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg mb-6">
                                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3 uppercase">Channels</h4>
                                <ToggleSwitch 
                                    label="Enable Email Notifications" 
                                    checked={localAppSettings.notifications.emailAlerts} 
                                    onChange={() => setLocalAppSettings(p => ({...p, notifications: {...p.notifications, emailAlerts: !p.notifications.emailAlerts}}))} 
                                />
                                <ToggleSwitch 
                                    label="Enable SMS Notifications" 
                                    checked={localAppSettings.notifications.smsAlerts} 
                                    onChange={() => setLocalAppSettings(p => ({...p, notifications: {...p.notifications, smsAlerts: !p.notifications.smsAlerts}}))} 
                                />
                            </div>

                            <div>
                                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4 uppercase">Templates</h4>
                                <div className="space-y-4">
                                    <div className="border border-gray-200 dark:border-gray-700 rounded-md p-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-medium text-black dark:text-white">Loan Approval</span>
                                            <button onClick={() => editTemplate('loanApproval')} className="text-indigo-600 hover:text-indigo-500 text-sm">Edit Template</button>
                                        </div>
                                        <p className="text-xs text-gray-500 italic">{localAppSettings.notifications.templates.loanApproval}</p>
                                    </div>
                                    <div className="border border-gray-200 dark:border-gray-700 rounded-md p-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-medium text-black dark:text-white">Repayment Reminder</span>
                                            <button onClick={() => editTemplate('repaymentReminder')} className="text-indigo-600 hover:text-indigo-500 text-sm">Edit Template</button>
                                        </div>
                                        <p className="text-xs text-gray-500 italic">{localAppSettings.notifications.templates.repaymentReminder}</p>
                                    </div>
                                    <div className="border border-gray-200 dark:border-gray-700 rounded-md p-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-medium text-black dark:text-white">Welcome Email</span>
                                            <button onClick={() => editTemplate('welcome')} className="text-indigo-600 hover:text-indigo-500 text-sm">Edit Template</button>
                                        </div>
                                        <p className="text-xs text-gray-500 italic">{localAppSettings.notifications.templates.welcome}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'roles':
                return renderRolesContent();

            case 'security':
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Security Controls</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Manage access policies and security protocols.</p>
                            
                            <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg mb-6">
                                <ToggleSwitch label="Two-Factor Authentication (2FA)" checked={localAppSettings.security.twoFactor} onChange={() => setLocalAppSettings(p => ({...p, security: {...p.security, twoFactor: !p.security.twoFactor}}))} />
                                <ToggleSwitch label="Enforce Strong Passwords" checked={localAppSettings.security.strongPasswords} onChange={() => setLocalAppSettings(p => ({...p, security: {...p.security, strongPasswords: !p.security.strongPasswords}}))} />
                                <ToggleSwitch label="Log All Admin Actions" checked={localAppSettings.security.logAdminActions} onChange={() => setLocalAppSettings(p => ({...p, security: {...p.security, logAdminActions: !p.security.logAdminActions}}))} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <InputField 
                                    label="Session Timeout (Minutes)" 
                                    type="number" 
                                    value={localAppSettings.security.sessionTimeout.toString()} 
                                    onChange={(e) => setLocalAppSettings(p => ({...p, security: {...p.security, sessionTimeout: parseInt(e.target.value)}}))} 
                                />
                                <InputField 
                                    label="Maximum Login Attempts" 
                                    type="number" 
                                    value={localAppSettings.security.maxLoginAttempts.toString()} 
                                    onChange={(e) => setLocalAppSettings(p => ({...p, security: {...p.security, maxLoginAttempts: parseInt(e.target.value)}}))} 
                                />
                            </div>

                            <div>
                                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3 uppercase">Active Sessions</h4>
                                <p className="text-xs text-gray-500 mb-4">Manage devices and sessions currently logged into your account.</p>
                                
                                <div className="space-y-3">
                                    {sessions.map((session) => (
                                        <div key={session.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <div className="flex items-center mb-4 sm:mb-0">
                                                <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300">
                                                    {session.deviceType === 'Mobile' ? <Smartphone size={20} /> : <Monitor size={20} />}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="flex items-center">
                                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{session.deviceName}</p>
                                                        {session.isCurrent && (
                                                            <span className="ml-2 px-2 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs font-medium">
                                                                Current Session
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col sm:flex-row sm:items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                        <span className="mr-3">{session.location}</span>
                                                        <span className="hidden sm:inline mr-3">•</span>
                                                        <span className="mr-3">{session.ipAddress}</span>
                                                        <span className="hidden sm:inline mr-3">•</span>
                                                        <span className={session.isCurrent ? 'text-green-600 font-medium' : ''}>
                                                            {session.isCurrent ? 'Active now' : `Last active ${session.lastActive.toLocaleDateString()} ${session.lastActive.toLocaleTimeString()}`}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => !session.isCurrent && handleRevokeSession(session.id)}
                                                disabled={session.isCurrent}
                                                className={`flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                                                    session.isCurrent 
                                                    ? 'text-gray-400 cursor-not-allowed' 
                                                    : 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 border border-gray-200 dark:border-gray-700'
                                                }`}
                                            >
                                                <LogOut size={14} className="mr-1.5" />
                                                Revoke
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            
            case 'backup':
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Data Backup & Export</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Configure automated backups and export system data.</p>

                            <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg mb-6">
                                <ToggleSwitch 
                                    label="Automated Daily Backups" 
                                    checked={localAppSettings.backup.autoBackup} 
                                    onChange={() => setLocalAppSettings(p => ({...p, backup: {...p.backup, autoBackup: !p.backup.autoBackup}}))} 
                                />
                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Backup Retention (Days)</label>
                                    <select 
                                        value={localAppSettings.backup.retentionDays}
                                        onChange={(e) => setLocalAppSettings(p => ({...p, backup: {...p.backup, retentionDays: parseInt(e.target.value)}}))}
                                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 text-black dark:text-white max-w-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                                    >
                                        <option value="7">7 Days</option>
                                        <option value="30">30 Days</option>
                                        <option value="90">90 Days</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3 uppercase">Export Data</h4>
                                <p className="text-xs text-gray-500 mb-4">Download a copy of your data in CSV or JSON format.</p>
                                <div className="flex space-x-4">
                                    <button 
                                        onClick={() => exportData('clients')}
                                        className="px-4 py-2 bg-white border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                    >
                                        Export Clients
                                    </button>
                                    <button 
                                        onClick={() => exportData('loans')}
                                        className="px-4 py-2 bg-white border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                    >
                                        Export Loans
                                    </button>
                                    <button 
                                        onClick={() => exportData('backup')}
                                        className="px-4 py-2 bg-white border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                    >
                                        Full System Backup
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'integrations':
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Integrations</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Connect with third-party services for payments, SMS, and email.</p>
                            
                            <div className="grid grid-cols-1 gap-6">
                                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold">S</div>
                                        <div className="ml-4">
                                            <h4 className="text-sm font-bold text-gray-900 dark:text-white">Stripe</h4>
                                            <p className="text-xs text-gray-500">Payment Gateway</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => toggleIntegration('stripe')}
                                        className={`px-3 py-1.5 border rounded text-sm transition-colors ${localAppSettings.integrations.stripe ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100' : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-black dark:text-white'}`}
                                    >
                                        {localAppSettings.integrations.stripe ? 'Connected' : 'Connect'}
                                    </button>
                                </div>

                                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600 font-bold">T</div>
                                        <div className="ml-4">
                                            <h4 className="text-sm font-bold text-gray-900 dark:text-white">Twilio</h4>
                                            <p className="text-xs text-gray-500">SMS Provider</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => toggleIntegration('twilio')}
                                        className={`px-3 py-1.5 border rounded text-sm transition-colors ${localAppSettings.integrations.twilio ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100' : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-black dark:text-white'}`}
                                    >
                                        {localAppSettings.integrations.twilio ? 'Connected' : 'Connect'}
                                    </button>
                                </div>

                                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center text-yellow-600 font-bold">S</div>
                                        <div className="ml-4">
                                            <h4 className="text-sm font-bold text-gray-900 dark:text-white">SendGrid</h4>
                                            <p className="text-xs text-gray-500">Email Service</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => toggleIntegration('sendgrid')}
                                        className={`px-3 py-1.5 border rounded text-sm transition-colors ${localAppSettings.integrations.sendgrid ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100' : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-black dark:text-white'}`}
                                    >
                                        {localAppSettings.integrations.sendgrid ? 'Connected' : 'Connect'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            default:
                return (
                     <div className="text-center py-20 text-gray-500">
                         Section content coming soon...
                     </div>
                );
        }
    };

    return (
        <div className="flex h-full bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Sidebar Navigation */}
            <div className="w-64 bg-gray-50 dark:bg-gray-800/50 border-r border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 px-2">Settings</h2>
                <div className="space-y-1">
                    <SectionButton id="profile" label="User Profile" icon={<User size={18} />} active={activeSection === 'profile'} onClick={() => setActiveSection('profile')} />
                    <SectionButton id="loanConfig" label="Loan Configuration" icon={<Sliders size={18} />} active={activeSection === 'loanConfig'} onClick={() => setActiveSection('loanConfig')} />
                    <SectionButton id="finance" label="Currency & Finance" icon={<DollarSign size={18} />} active={activeSection === 'finance'} onClick={() => setActiveSection('finance')} />
                    <SectionButton id="notifications" label="Notifications" icon={<Bell size={18} />} active={activeSection === 'notifications'} onClick={() => setActiveSection('notifications')} />
                    <SectionButton id="roles" label="Roles & Permissions" icon={<Shield size={18} />} active={activeSection === 'roles'} onClick={() => setActiveSection('roles')} />
                    <SectionButton id="security" label="Security Controls" icon={<Lock size={18} />} active={activeSection === 'security'} onClick={() => setActiveSection('security')} />
                    <SectionButton id="backup" label="Data Backup" icon={<Database size={18} />} active={activeSection === 'backup'} onClick={() => setActiveSection('backup')} />
                    <SectionButton id="integrations" label="Integrations" icon={<Layers size={18} />} active={activeSection === 'integrations'} onClick={() => setActiveSection('integrations')} />
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col">
                <div className="flex-1 p-8 overflow-y-auto">
                    {renderContent()}
                </div>
                
                {/* Footer Action */}
                {/* Hide Save button for Roles section as it has its own internal saving mechanism */}
                {activeSection !== 'roles' && (
                    <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex justify-end items-center space-x-4">
                        {error && (
                            <div className="text-red-600 text-sm font-medium flex items-center">
                                <AlertCircle size={16} className="mr-1" />
                                {error}
                            </div>
                        )}
                        <button 
                            onClick={handleSave}
                            disabled={isSaving}
                            className={`flex items-center px-6 py-2 rounded-lg font-medium shadow-sm transition-all ${
                                saveSuccess 
                                ? 'bg-green-600 hover:bg-green-700 text-white' 
                                : error 
                                    ? 'bg-red-600 hover:bg-red-700 text-white'
                                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                            } ${isSaving ? 'opacity-75 cursor-not-allowed' : ''}`}
                        >
                            {saveSuccess ? (
                                <>
                                    <Check size={18} className="mr-2" />
                                    Saved!
                                </>
                            ) : (
                                <>
                                    <Save size={18} className="mr-2" />
                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
