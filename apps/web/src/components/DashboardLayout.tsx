import { type ReactNode, useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    Home,
    LayoutDashboard,
    CalendarDays,
    Users,
    Settings,
    LogOut,
    Sun,
    Moon,
    ChevronDown,
    Building2,
    Check
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { workspacesAPI, type Workspace } from '../services/api';
import { PendingInvitationsModal } from './modals/PendingInvitationsModal';

interface DashboardLayoutProps {
    children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
    const location = useLocation();
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const userName = localStorage.getItem('userName') || 'User';
    const userRole = localStorage.getItem('userRole') as 'CLIENT' | 'WORKER';
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);
    const { theme, toggleTheme } = useTheme();
    const profileRef = useRef<HTMLDivElement>(null);
    const workspaceRef = useRef<HTMLDivElement>(null);
    const [showInvitationsModal, setShowInvitationsModal] = useState(false);
    const [hasCheckedInvitations, setHasCheckedInvitations] = useState(false);

    // Get user initials from name/email
    const getUserInitials = (name: string) => {
        const parts = name.split(/[@\s]/);
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    // Fetch workspaces on mount (only for WORKER users)
    useEffect(() => {
        const fetchWorkspaces = async () => {
            try {
                const response = await workspacesAPI.getMyWorkspaces();
                setWorkspaces(response.data);
                // Set active workspace
                const activeId = localStorage.getItem('activeWorkspaceId');
                if (activeId) {
                    const active = response.data.find((w: Workspace) => w.id === activeId);
                    if (active) setActiveWorkspace(active);
                } else if (response.data.length > 0) {
                    setActiveWorkspace(response.data[0]);
                    localStorage.setItem('activeWorkspaceId', response.data[0].id);
                }
            } catch (error) {
                console.error('Failed to fetch workspaces:', error);
            }
        };
        if (token && userRole === 'WORKER') fetchWorkspaces();
    }, [token, userRole]);

    // Check for pending invitations on mount (once per session) - only for WORKER users
    useEffect(() => {
        const checkInvitations = async () => {
            if (hasCheckedInvitations) return;
            try {
                const response = await workspacesAPI.getPendingInvitations();
                if (response.data.length > 0) {
                    setShowInvitationsModal(true);
                }
            } catch (error) {
                console.error('Failed to check invitations:', error);
            } finally {
                setHasCheckedInvitations(true);
            }
        };
        if (token && userRole === 'WORKER') checkInvitations();
    }, [token, userRole, hasCheckedInvitations]);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
            if (workspaceRef.current && !workspaceRef.current.contains(event.target as Node)) {
                setIsWorkspaceOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('activeWorkspaceId');
        navigate('/login');
    };

    const handleSwitchWorkspace = async (workspace: Workspace) => {
        try {
            await workspacesAPI.setActiveWorkspace(workspace.id);
            setActiveWorkspace(workspace);
            localStorage.setItem('activeWorkspaceId', workspace.id);
            setIsWorkspaceOpen(false);
        } catch (error) {
            console.error('Failed to switch workspace:', error);
        }
    };

    // Filter menu items based on user role - Workspaces only for WORKER users
    const allMenuItems = [
        { icon: Home, path: '/dashboard', label: 'Dashboard' },
        { icon: LayoutDashboard, path: '/my-tasks', label: 'Team Tasks' },
        { icon: CalendarDays, path: '/calendar', label: 'Calendar' },
        { icon: Users, path: '/workspaces', label: 'Workspaces', workerOnly: true },
    ];

    const menuItems = allMenuItems.filter(item => !item.workerOnly || userRole === 'WORKER');

    return (
        <div className="linear-app-bg relative flex h-screen overflow-hidden">
            <div className="linear-blob top-[-260px] left-[22%] h-[900px] w-[1200px] bg-[radial-gradient(circle,rgba(94,106,210,0.24)_0%,rgba(94,106,210,0.06)_40%,transparent_72%)]" />
            <div className="linear-blob top-[10%] left-[-180px] h-[640px] w-[760px] bg-[radial-gradient(circle,rgba(143,123,255,0.15)_0%,rgba(94,106,210,0.04)_56%,transparent_75%)] [animation-duration:10s]" />
            <div className="linear-blob bottom-[-260px] right-[-120px] h-[620px] w-[780px] bg-[radial-gradient(circle,rgba(94,106,210,0.14)_0%,rgba(94,106,210,0.04)_52%,transparent_76%)] [animation-duration:8.5s]" />
            {/* Sidebar */}
            <aside
                className={`linear-elevated my-0 mr-0 ml-0 flex flex-col py-5 transition-all duration-300 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] ${isSidebarExpanded ? 'w-56' : 'w-16'
                    }`}
                onMouseEnter={() => setIsSidebarExpanded(true)}
                onMouseLeave={() => setIsSidebarExpanded(false)}
            >
                {/* Logo */}
                <div className={`flex items-center mb-6 px-3 ${isSidebarExpanded ? 'justify-start gap-3' : 'justify-center'}`}>
                    <img
                        src="/logo.png"
                        alt="Logo"
                        className="flex-shrink-0"
                        style={{ width: '40px', height: '40px' }}
                    />
                    {isSidebarExpanded && (
                        <span className="text-lg font-semibold text-[var(--foreground)] whitespace-nowrap tracking-tight">LokPraman</span>
                    )}
                </div>

                {/* Menu Items */}
                <nav className="flex flex-col gap-2 flex-1 px-3">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all ${isActive
                                    ? 'bg-[var(--accent)] text-white shadow-[0_0_0_1px_rgba(94,106,210,0.4),0_8px_18px_rgba(94,106,210,0.25)]'
                                    : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface)]'
                                    } ${!isSidebarExpanded ? 'justify-center' : ''}`}
                            >
                                <Icon size={20} className="flex-shrink-0" />
                                {isSidebarExpanded && (
                                    <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Theme Toggle & Settings */}
                <div className="px-3 space-y-2">
                    <button
                        onClick={toggleTheme}
                        className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-md transition-all text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface)] ${!isSidebarExpanded ? 'justify-center' : ''}`}
                    >
                        {theme === 'dark' ? <Sun size={20} className="flex-shrink-0" /> : <Moon size={20} className="flex-shrink-0" />}
                        {isSidebarExpanded && (
                            <span className="text-sm font-medium whitespace-nowrap">
                                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                            </span>
                        )}
                    </button>
                    <button
                        className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-md transition-all text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface)] ${!isSidebarExpanded ? 'justify-center' : ''}`}
                    >
                        <Settings size={20} className="flex-shrink-0" />
                        {isSidebarExpanded && (
                            <span className="text-sm font-medium whitespace-nowrap">Settings</span>
                        )}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-visible m-0 ml-3 linear-elevated">
                {/* Top Bar */}
                <header className="relative z-40 h-16 border-b border-[var(--border-default)] px-8 flex items-center justify-between bg-[var(--background-elevated)]/90 backdrop-blur-xl">
                    <h1 className="text-xl font-medium text-[var(--foreground-muted)]">
                        Welcome <span className="text-[var(--foreground)]">{userName.split('@')[0]}</span>
                    </h1>

                    <div className="flex items-center gap-3">
                        {/* Workspace Dropdown - Only for WORKER users */}
                        {userRole === 'WORKER' && (
                            <div ref={workspaceRef} className="relative">
                                <button
                                    onClick={() => setIsWorkspaceOpen(!isWorkspaceOpen)}
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--border-default)] transition-colors text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface)]"
                                >
                                    <Building2 size={18} className="text-[var(--accent)]" />
                                    <span className="text-sm font-medium max-w-[150px] truncate">
                                        {activeWorkspace?.name || 'Select Workspace'}
                                    </span>
                                    <ChevronDown size={14} className={`transition-transform ${isWorkspaceOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {/* Workspace Dropdown Menu */}
                                {isWorkspaceOpen && (
                                    <div className="absolute right-0 top-full mt-2 w-72 rounded-xl shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_12px_36px_rgba(0,0,0,0.45)] border border-[var(--border-default)] py-2 z-[120] bg-[var(--background-elevated)]">
                                        <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">
                                            Switch Workspace
                                        </div>
                                        <div className="max-h-64 overflow-auto">
                                            {workspaces.map(workspace => (
                                                <button
                                                    key={workspace.id}
                                                    onClick={() => handleSwitchWorkspace(workspace)}
                                                    className="w-full px-3 py-2.5 flex items-center gap-3 transition-colors hover:bg-[var(--surface)]"
                                                >
                                                    <div className="w-8 h-8 rounded-lg bg-[var(--accent)] flex items-center justify-center text-white font-bold text-sm shadow-[0_4px_14px_rgba(94,106,210,0.35)]">
                                                        {workspace.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="flex-1 text-left min-w-0">
                                                        <p className="font-medium truncate text-[var(--foreground)]">
                                                            {workspace.name}
                                                        </p>
                                                        <p className="text-xs text-[var(--foreground-muted)]">
                                                            {workspace._count?.members || workspace.members?.length || 1} members
                                                        </p>
                                                    </div>
                                                    {activeWorkspace?.id === workspace.id && (
                                                        <Check size={16} className="text-[var(--accent)]" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="border-t mt-2 pt-2 border-[var(--border-default)]">
                                            <Link
                                                to="/workspaces"
                                                onClick={() => setIsWorkspaceOpen(false)}
                                                className="w-full px-3 py-2.5 flex items-center gap-3 transition-colors text-[var(--accent)] hover:bg-[var(--surface)]"
                                            >
                                                <Users size={16} />
                                                <span className="font-medium text-sm">Manage Workspaces</span>
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Profile Dropdown */}
                        <div ref={profileRef} className="relative">
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center gap-2 px-3 py-2 rounded-full transition-colors hover:bg-[var(--surface)]"
                            >
                                <div className="w-9 h-9 rounded-full bg-[var(--accent)] flex items-center justify-center text-white font-semibold text-sm shadow-[0_4px_14px_rgba(94,106,210,0.35)]">
                                    {getUserInitials(userName)}
                                </div>
                                <ChevronDown size={16} className={`transition-transform text-[var(--foreground-muted)] ${isProfileOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown Menu */}
                            {isProfileOpen && (
                                <div className="absolute right-0 top-full mt-2 w-64 rounded-xl shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_12px_36px_rgba(0,0,0,0.45)] border border-[var(--border-default)] py-2 z-[120] bg-[var(--background-elevated)]">
                                    {/* User Info */}
                                    <div className="px-4 py-3 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-[var(--accent)] flex items-center justify-center text-white font-semibold shadow-[0_4px_14px_rgba(94,106,210,0.35)]">
                                            {getUserInitials(userName)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold truncate text-[var(--foreground)]">
                                                {userName.includes('@') ? userName.split('@')[0] : userName}
                                            </p>
                                            <p className="text-sm truncate text-[var(--foreground-muted)]">
                                                {userName.includes('@') ? userName : ''}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Divider */}
                                    <div className="my-2 border-t border-[var(--border-default)]" />

                                    {/* Logout */}
                                    {token && (
                                        <button
                                            onClick={handleLogout}
                                            className="w-full px-4 py-2.5 flex items-center gap-3 transition-colors text-red-400 hover:bg-[var(--surface)]"
                                        >
                                            <LogOut size={18} />
                                            <span className="font-medium">Log Out</span>
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="relative z-0 flex-1 overflow-auto bg-transparent">
                    {children}
                </main>
            </div>

            {/* Pending Invitations Modal */}
            {showInvitationsModal && (
                <PendingInvitationsModal onClose={() => setShowInvitationsModal(false)} />
            )}
        </div >
    );
};
