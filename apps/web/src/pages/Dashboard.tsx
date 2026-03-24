import { useEffect, useState } from 'react';
import { Search, Plus, MoreVertical } from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { Button } from '../components/ui/Button';
import { Dropdown } from '../components/ui/Dropdown';
import { Modal } from '../components/ui/Modal';
import { CreateProjectModal } from '../components/modals/CreateProjectModal';
import { TaskDetailsModal } from '../components/modals/TaskDetailsModal';
import { tasksAPI } from '../services/api';
import type { Task } from '../services/api';
import { TaskCardSkeleton } from '../components/ui/TaskCardSkeleton';
import toast from 'react-hot-toast';

export const Dashboard = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterBy, setFilterBy] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [editingTask, setEditingTask] = useState<Task | null>(null);

    const fetchTasks = async () => {
        try {
            const response = await tasksAPI.getMarketplace();
            setTasks(response.data);
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const handleDeleteTask = async (taskId: string) => {
        if (!window.confirm('Are you sure you want to delete this task?')) {
            return;
        }

        try {
            await tasksAPI.deleteTask(taskId);
            toast.success('Task deleted successfully');
            fetchTasks();
            setOpenMenuId(null);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to delete task');
        }
    };

    const handleEditTask = (task: Task) => {
        setEditingTask(task);
        setOpenMenuId(null);
    };

    const currentUserId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('userRole');

    const filteredTasks = tasks
        .filter(task => {
            const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                task.description?.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesFilter = filterBy === 'all' ||
                (filterBy === 'active' && task.status === 'OPEN') ||
                (filterBy === 'completed' && task.status === 'PAID') ||
                (filterBy === 'general' && task.category.toLowerCase() === 'general') ||
                (filterBy === 'design' && task.category.toLowerCase() === 'design') ||
                (filterBy === 'development' && task.category.toLowerCase() === 'development');

            return matchesSearch && matchesFilter;
        })
        .sort((a, b) => {
            if (sortBy === 'newest') {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            } else if (sortBy === 'oldest') {
                return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            } else if (sortBy === 'budget-high') {
                return b.budget - a.budget;
            } else if (sortBy === 'budget-low') {
                return a.budget - b.budget;
            }
            return 0;
        });

    const getTimeSince = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 1) return 'today';
        if (diffDays === 1) return '1 day ago';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        return `${Math.floor(diffDays / 30)} months ago`;
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    const filterOptions = [
        { value: 'all', label: 'SHOW ALL' },
        { value: 'active', label: 'ACTIVE TASKS' },
        { value: 'completed', label: 'COMPLETED TASKS' },
        { value: 'general', label: 'GENERAL' },
        { value: 'design', label: 'DESIGN' },
        { value: 'development', label: 'DEVELOPMENT' },
    ];

    const sortOptions = [
        { value: 'newest', label: 'SORT BY: NEWEST' },
        { value: 'oldest', label: 'SORT BY: OLDEST' },
        { value: 'budget-high', label: 'SORT BY: HIGHEST BUDGET' },
        { value: 'budget-low', label: 'SORT BY: LOWEST BUDGET' },
    ];



    const handleCreateSuccess = () => {
        fetchTasks();
    };



    return (
        <DashboardLayout>
            <div className="p-8 space-y-6 min-h-full flex flex-col linear-reveal">
                {/* Filter Bar */}
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Dropdown
                            value={filterBy}
                            onChange={setFilterBy}
                            options={filterOptions}
                            className="w-48"
                        />

                        <Dropdown
                            value={sortBy}
                            onChange={setSortBy}
                            options={sortOptions}
                            className="w-64"
                        />

                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)]" size={18} />
                            <input
                                type="text"
                                placeholder="SEARCH..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm bg-[var(--background-elevated)] border border-[var(--border-default)] text-[var(--foreground)] placeholder:text-[var(--foreground-subtle)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]/50 focus:ring-offset-2 focus:ring-offset-[var(--background-base)] transition-all duration-200 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]"
                            />
                        </div>
                    </div>


                    {userRole === 'CLIENT' && (
                        <div className="flex items-center gap-3">
                            <Button className="gap-2 shadow-md" onClick={() => setIsCreateModalOpen(true)}>
                                <Plus size={18} />
                                <span className="font-semibold">CREATE TASK</span>
                            </Button>


                        </div>
                    )}
                </div>

                {/* Results Count */}
                <div className="flex items-center justify-between gap-4">
                    <p className="text-sm text-[var(--foreground-muted)]">
                        Showing {filteredTasks.length} of {tasks.length} Tasks
                    </p>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {[...Array(8)].map((_, i) => (
                            <TaskCardSkeleton key={i} />
                        ))}
                    </div>
                ) : filteredTasks.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center rounded-2xl linear-elevated">
                        <div className="text-center">
                            <p className="text-2xl font-semibold text-[var(--foreground-muted)]">
                                No tasks found.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {filteredTasks.map((task) => (
                            <button
                                key={task.id}
                                onClick={() => setSelectedTaskId(task.id)}
                                className="group block text-left w-full"
                            >
                                <div className="relative rounded-2xl overflow-hidden linear-elevated transition-all duration-300 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-1">
                                    <div className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(300px_circle_at_50%_0%,rgba(94,106,210,0.2),transparent_70%)]" />

                                    {/* Image Banner - With Gap */}
                                    <div className="p-3 relative">
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

                                        {/* Three-dot menu for task owner */}
                                        {userRole === 'CLIENT' && task.client.id === currentUserId && task.status === 'OPEN' && (
                                            <div className="absolute top-5 right-5">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setOpenMenuId(openMenuId === task.id ? null : task.id);
                                                    }}
                                                    className="p-1.5 rounded-full transition-colors bg-[var(--background-elevated)]/80 hover:bg-[var(--surface)] text-[var(--foreground-muted)]"
                                                >
                                                    <MoreVertical size={18} />
                                                </button>

                                                {/* Dropdown menu */}
                                                {openMenuId === task.id && (
                                                    <div className="absolute right-0 mt-2 w-36 rounded-lg shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_12px_30px_rgba(0,0,0,0.45)] bg-[var(--background-elevated)] border border-[var(--border-default)] z-10">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleEditTask(task);
                                                            }}
                                                            className="w-full px-4 py-2 text-left text-sm rounded-t-lg transition-colors hover:bg-[var(--surface)] text-[var(--foreground)]"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteTask(task.id);
                                                            }}
                                                            className="w-full px-4 py-2 text-left text-sm rounded-b-lg transition-colors text-red-400 hover:bg-[var(--surface)]"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Card Content Below Image */}
                                    <div className="p-4">
                                        {/* Title with Budget inline */}
                                        <div className="mb-3">
                                            <div className="flex items-baseline gap-2 flex-wrap">
                                                <h3 className="text-base font-semibold leading-snug line-clamp-1 text-[var(--foreground)] tracking-tight">
                                                    {task.title}
                                                </h3>
                                                <span className="px-2 py-0.5 rounded-sm text-xs font-semibold bg-emerald-500 text-white">
                                                    {task.budget.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Description with better truncation */}
                                        <div className="mb-4">
                                            <p className="text-xs leading-relaxed text-[var(--foreground-muted)]">
                                                {task.description && task.description.length > 100
                                                    ? `${task.description.slice(0, 100)}...`
                                                    : task.description}
                                            </p>
                                        </div>

                                        {/* Status, Category & Time Badges */}
                                        <div className="flex items-center gap-2 mb-4 flex-wrap">
                                            <span className={`px-2 py-0.5 rounded-sm text-xs font-semibold ${task.status === 'OPEN'
                                                ? 'bg-amber-400 text-slate-900'
                                                : 'bg-amber-500 text-white'
                                                }`}>
                                                {task.status}
                                            </span>
                                            <span className="px-2 py-0.5 rounded-sm text-xs font-semibold bg-red-500 text-white">
                                                {task.category.toUpperCase()}
                                            </span>
                                            {task.deadline && (
                                                <span className="px-2 py-0.5 rounded-sm text-xs font-semibold bg-[var(--accent)] text-white">
                                                    {formatTime(task.deadline)}
                                                </span>
                                            )}
                                        </div>

                                        {/* Footer with Client and Worker Assignment */}
                                        <div className="flex items-center justify-between gap-2">
                                            {/* Client Info */}
                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold bg-[var(--accent)] text-white flex-shrink-0">
                                                    {task.client?.name?.charAt(0).toUpperCase() || '?'}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-medium truncate text-[var(--foreground)]">
                                                        {task.client?.name || 'Unknown Client'}
                                                    </p>
                                                    <p className="text-xs text-[var(--foreground-muted)]">
                                                        {getTimeSince(task.createdAt)}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Worker Assignment */}
                                            {task.worker ? (
                                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-green-500 text-white">
                                                            {task.worker.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="text-xs text-[var(--foreground-muted)] drop-shadow-sm">
                                                            {task.worker.name.split(' ')[0]}
                                                        </span>
                                                    </div>
                                                    {task.worker.rating !== undefined && (
                                                        <div className="flex items-center gap-0.5 bg-yellow-50 px-1 py-0.5 rounded border border-yellow-200 shadow-sm ml-1">
                                                            <span className="text-[10px] text-yellow-500 font-bold leading-none">★</span>
                                                            <span className="text-[10px] font-bold text-yellow-700 leading-none">
                                                                {task.worker.rating.toFixed(1)}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                                    <div className="w-6 h-6 rounded-full flex items-center justify-center border-2 border-dashed border-[var(--border-hover)]">
                                                        <span className="text-xs text-[var(--foreground-muted)]">?</span>
                                                    </div>
                                                    <span className="text-xs text-[var(--foreground-muted)]">
                                                        Unassigned
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Create New Task"
            >
                <CreateProjectModal
                    onClose={() => setIsCreateModalOpen(false)}
                    onSuccess={handleCreateSuccess}
                />
            </Modal>

            {editingTask && (
                <Modal
                    isOpen={!!editingTask}
                    onClose={() => setEditingTask(null)}
                    title="Edit Task"
                >
                    <CreateProjectModal
                        onClose={() => setEditingTask(null)}
                        onSuccess={() => {
                            setEditingTask(null);
                            fetchTasks();
                        }}
                        editTask={editingTask}
                    />
                </Modal>
            )}

            {selectedTaskId && (
                <TaskDetailsModal
                    taskId={selectedTaskId}
                    isOpen={!!selectedTaskId}
                    onClose={() => setSelectedTaskId(null)}
                    onTaskUpdated={fetchTasks}
                />
            )}
        </DashboardLayout >
    );
};
