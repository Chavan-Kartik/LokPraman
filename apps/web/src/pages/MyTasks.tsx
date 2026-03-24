import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/DashboardLayout';
import { tasksAPI } from '../services/api';
import type { Task } from '../services/api';
import { TaskCardSkeleton } from '../components/ui/TaskCardSkeleton';

export default function MyTasks() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
    const navigate = useNavigate();

    const userRole = localStorage.getItem('userRole');

    useEffect(() => {
        fetchMyTasks();
    }, []);

    const fetchMyTasks = async () => {
        try {
            setLoading(true);
            const response = await tasksAPI.getMyTasks(userRole?.toLowerCase() as 'client' | 'worker');
            setTasks(response.data);
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'OPEN':
                return 'bg-amber-400 text-slate-900';
            case 'ACCEPTED':
                return 'bg-[var(--accent)] text-white';
            case 'EN_ROUTE':
                return 'bg-orange-500 text-white';
            case 'ARRIVED':
                return 'bg-teal-500 text-white';
            case 'IN_PROGRESS':
                return 'bg-purple-500 text-white';
            case 'SUBMITTED':
                return 'bg-purple-500 text-white';
            case 'COMPLETED':
            case 'PAID':
                return 'bg-emerald-500 text-white';
            case 'DISPUTED':
                return 'bg-red-500 text-white';
            default:
                return 'bg-slate-500 text-white';
        }
    };

    const getTimeSince = (date: string) => {
        const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);

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

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    const filteredTasks = tasks.filter(task => {
        if (filter === 'active') {
            return ['OPEN', 'ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'IN_PROGRESS', 'SUBMITTED'].includes(task.status);
        }
        if (filter === 'completed') {
            return ['COMPLETED', 'PAID'].includes(task.status);
        }
        return true;
    });



    return (
        <DashboardLayout>
            <div className="p-8 space-y-6 min-h-full linear-reveal">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight text-[var(--foreground)]">
                        Team Tasks
                    </h1>
                    <p className="text-sm mt-1 text-[var(--foreground-muted)]">
                        {userRole === 'CLIENT' ? 'Tasks you have posted' : 'View and manage your team\'s tasks'}
                    </p>
                </div>

                {/* Filter Tabs - Brand Blue */}
                <div className="flex gap-2">
                    {[
                        { value: 'all', label: 'ALL TASKS' },
                        { value: 'active', label: 'ACTIVE' },
                        { value: 'completed', label: 'COMPLETED' }
                    ].map((tab) => (
                        <button
                            key={tab.value}
                            onClick={() => setFilter(tab.value as any)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${filter === tab.value
                                ? 'bg-[var(--accent)] text-white shadow-[0_8px_18px_rgba(94,106,210,0.25)]'
                                : 'bg-[var(--surface)] text-[var(--foreground-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tasks Grid - Same as Dashboard */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {[...Array(8)].map((_, i) => (
                            <TaskCardSkeleton key={i} />
                        ))}
                    </div>
                ) : filteredTasks.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center rounded-2xl linear-elevated">
                        <div className="text-center py-12">
                            <p className="text-lg font-medium text-[var(--foreground-muted)]">
                                No tasks found
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {filteredTasks.map((task) => (
                            <button
                                key={task.id}
                                onClick={() => navigate(`/tasks/${task.id}/verify`)}
                                className="group block text-left w-full"
                            >
                                <div className="relative rounded-2xl overflow-hidden linear-elevated transition-all duration-300 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-1">
                                    <div className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(300px_circle_at_50%_0%,rgba(94,106,210,0.2),transparent_70%)]" />

                                    {/* Image Banner */}
                                    <div className="p-3">
                                        <div className="w-full aspect-video overflow-hidden rounded-xl bg-[var(--background-elevated)] border border-[var(--border-default)]">
                                            {task.beforeImages?.length > 0 ? (
                                                <img
                                                    src={task.beforeImages[0]}
                                                    alt={task.title}
                                                    className="w-full h-full object-contain"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <svg width="48" height="36" viewBox="0 0 50 39" fill="none" xmlns="http://www.w3.org/2000/svg" opacity="0.2">
                                                        <path d="M16.4992 2H37.5808L22.0816 24.9729H1L16.4992 2Z" fill="#007AFF" />
                                                        <path d="M17.4224 27.102L11.4192 36H33.5008L49 13.0271H32.7024L23.2064 27.102H17.4224Z" fill="#312ECB" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Card Content */}
                                    <div className="p-4">
                                        {/* Title with Budget */}
                                        <div className="mb-3">
                                            <div className="flex items-baseline gap-2 flex-wrap">
                                                <h3 className="text-base font-semibold leading-snug line-clamp-1 text-[var(--foreground)] tracking-tight">
                                                    {task.title}
                                                </h3>
                                                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500 text-white">
                                                    ₹{task.budget.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <div className="mb-4">
                                            <p className="text-xs leading-relaxed text-[var(--foreground-muted)]">
                                                {task.description && task.description.length > 100
                                                    ? `${task.description.slice(0, 100)}...`
                                                    : task.description}
                                            </p>
                                        </div>

                                        {/* Status, Category & Role Chips */}
                                        <div className="flex items-center gap-2 mb-4 flex-wrap">
                                            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getStatusColor(task.status)}`}>
                                                {task.status}
                                            </span>
                                            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-red-500 text-white">
                                                {task.category.toUpperCase()}
                                            </span>
                                            {/* Role-specific chip */}
                                            {userRole === 'WORKER' && task.status === 'ACCEPTED' && (
                                                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-[var(--accent)] text-white">
                                                    Start Work
                                                </span>
                                            )}
                                            {userRole === 'WORKER' && task.status === 'IN_PROGRESS' && (
                                                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-purple-500 text-white">
                                                    In Progress
                                                </span>
                                            )}
                                            {task.deadline && (
                                                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-[var(--accent)] text-white">
                                                    {formatTime(task.deadline)}
                                                </span>
                                            )}
                                        </div>

                                        {/* Footer with Avatar */}
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold bg-[var(--accent)] text-white">
                                                {userRole === 'CLIENT'
                                                    ? (task.worker?.name?.charAt(0).toUpperCase() || '?')
                                                    : (task.client?.name?.charAt(0).toUpperCase() || '?')}
                                            </div>
                                            <div className="flex-1 min-w-0 flex items-center justify-between pr-1">
                                                <div>
                                                    <p className="text-xs font-medium truncate text-[var(--foreground)]">
                                                        {userRole === 'CLIENT'
                                                            ? (task.worker?.name || 'Not assigned')
                                                            : (task.client?.name || 'Unknown Client')}
                                                    </p>
                                                    <p className="text-xs text-[var(--foreground-muted)] mt-0.5">
                                                        {getTimeSince(task.createdAt)}
                                                    </p>
                                                </div>
                                                {userRole === 'CLIENT' && task.worker?.rating !== undefined && (
                                                    <div className="flex items-center gap-1 bg-yellow-50 px-1.5 py-0.5 rounded border border-yellow-200 shadow-sm ml-2">
                                                        <span className="text-[10px] text-yellow-500 font-bold">★</span>
                                                        <span className="text-[10px] font-bold text-yellow-700">
                                                            {task.worker.rating.toFixed(1)}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
