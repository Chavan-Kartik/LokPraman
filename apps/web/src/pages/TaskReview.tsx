import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, FileText, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { DashboardLayout } from '../components/DashboardLayout';
import { Button } from '../components/ui/Button';
import { tasksAPI } from '../services/api';
import type { Task } from '../services/api';

export default function TaskReview() {
    const { id } = useParams<{ id: string }>();
    const [task, setTask] = useState<Task | null>(null);
    const [loading, setLoading] = useState(true);
    const [approving, setApproving] = useState(false);
    const [rejecting, setRejecting] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (id) {
            fetchTask();
        }
    }, [id]);

    const fetchTask = async () => {
        try {
            setLoading(true);
            const response = await tasksAPI.getTask(id!);
            setTask(response.data);
        } catch (error) {
            console.error('Failed to fetch task:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!id) return;
        if (!confirm('Are you sure you want to approve this work? Payment will be released to the worker.')) {
            return;
        }

        try {
            setApproving(true);
            await tasksAPI.approveWork(id);
            toast.success('Work approved! Payment has been released to the worker.');
            navigate('/my-tasks');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to approve work');
        } finally {
            setApproving(false);
        }
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) {
            toast.error('Please provide a reason for rejection');
            return;
        }

        if (!id) return;

        try {
            setRejecting(true);
            await tasksAPI.rejectWork(id, rejectReason);
            toast.success('Work rejected. Worker will be notified to make revisions.');
            navigate('/my-tasks');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to reject work');
        } finally {
            setRejecting(false);
            setShowRejectModal(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="p-8 space-y-6">
                    {/* Back button skeleton */}
                    <div className="h-6 w-40 rounded animate-pulse bg-[var(--surface)]" />

                    {/* Task header skeleton */}
                    <div className="rounded-2xl linear-elevated p-6">
                        <div className="flex items-start justify-between">
                            <div className="flex-1 space-y-3">
                                <div className="flex gap-2">
                                    <div className="h-6 w-20 rounded animate-pulse bg-[var(--surface)]" />
                                    <div className="h-6 w-24 rounded animate-pulse bg-[var(--surface)]" />
                                </div>
                                <div className="h-8 w-3/4 rounded animate-pulse bg-[var(--surface)]" />
                                <div className="h-4 w-full rounded animate-pulse bg-[var(--surface)]" />
                                <div className="h-4 w-2/3 rounded animate-pulse bg-[var(--surface)]" />
                            </div>
                            <div className="ml-6 space-y-2">
                                <div className="h-4 w-16 rounded animate-pulse bg-[var(--surface)]" />
                                <div className="h-8 w-24 rounded animate-pulse bg-[var(--surface)]" />
                            </div>
                        </div>
                    </div>

                    {/* Submitted work skeleton */}
                    <div className="rounded-2xl linear-elevated p-6">
                        <div className="h-6 w-40 rounded animate-pulse mb-4 bg-[var(--surface)]" />
                        <div className="h-48 rounded animate-pulse bg-[var(--surface)]" />
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (!task) {
        return (
            <DashboardLayout>
                <div className="flex justify-center items-center h-64">
                    <p className="text-[var(--foreground-muted)]">Task not found</p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="p-8 space-y-6 linear-reveal">
                <button
                    onClick={() => navigate('/my-tasks')}
                    className="flex items-center gap-2 text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
                >
                    <ArrowLeft size={20} />
                    <span className="font-medium">Back to Team Tasks</span>
                </button>

                {/* Task Header */}
                <div className="rounded-2xl linear-elevated p-6">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                                <span className="px-3 py-1 rounded text-xs font-semibold bg-purple-500 text-white">
                                    {task.status}
                                </span>
                                <span className="px-3 py-1 rounded text-xs font-semibold bg-[var(--accent)] text-white">
                                    {task.category.toUpperCase()}
                                </span>
                            </div>
                            <h1 className="text-2xl font-semibold mb-2 text-[var(--foreground)] tracking-tight">
                                {task.title}
                            </h1>
                            <p className="text-sm text-[var(--foreground-muted)]">
                                {task.description}
                            </p>
                        </div>
                        <div className="text-right ml-6">
                            <p className="text-sm text-[var(--foreground-muted)]">Budget</p>
                            <p className="text-2xl font-bold text-emerald-500">
                                Rs.{task.budget}
                            </p>
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-[var(--border-default)]">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-[var(--foreground-muted)]">Worker:</span>
                            <span className="text-sm font-semibold text-[var(--accent)]">
                                {task.worker?.name || 'Not assigned'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Submitted Work Preview */}
                <div className="rounded-2xl linear-elevated p-6">
                    <h2 className="text-lg font-semibold mb-4 text-[var(--foreground)]">
                        Submitted Work
                    </h2>

                    {/* Placeholder for files - in real implementation, you'd fetch and display actual files */}
                    <div className="rounded-xl p-6 text-center bg-[var(--surface)]">
                        <FileText size={48} className="mx-auto mb-4 text-[var(--foreground-muted)]" />
                        <p className="text-sm text-[var(--foreground-muted)]">
                            Proof of work files will be displayed here
                        </p>
                        <p className="text-xs mt-2 text-[var(--foreground-muted)]">
                            (Files: Images, Videos, Documents)
                        </p>
                        <Button variant="outline" className="mt-4">
                            <Download size={18} className="mr-2" />
                            Download All
                        </Button>
                    </div>
                </div>

                {/* Review Actions */}
                <div className="rounded-2xl linear-elevated p-6">
                    <h2 className="text-lg font-semibold mb-4 text-[var(--foreground)]">
                        Review & Approve
                    </h2>
                    <p className="text-sm mb-6 text-[var(--foreground-muted)]">
                        Please review the submitted work carefully. Approving will release the payment to the worker.
                    </p>

                    <div className="flex gap-4">
                        <Button
                            onClick={handleApprove}
                            disabled={approving}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                            <CheckCircle size={18} className="mr-2" />
                            {approving ? 'Approving...' : 'Approve & Release Payment'}
                        </Button>
                        <Button
                            onClick={() => setShowRejectModal(true)}
                            disabled={rejecting}
                            variant="outline"
                            className="flex-1 border-red-500 text-red-400 hover:bg-red-500/10"
                        >
                            <XCircle size={18} className="mr-2" />
                            Request Revision
                        </Button>
                    </div>
                </div>
            </div>

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <div className="rounded-2xl p-6 max-w-md w-full linear-elevated">
                        <h3 className="text-xl font-semibold mb-4 text-[var(--foreground)] tracking-tight">
                            Request Revision
                        </h3>
                        <p className="text-sm mb-4 text-[var(--foreground-muted)]">
                            Please provide a reason for requesting revision. This will help the worker understand what needs to be improved.
                        </p>
                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Explain what needs to be revised..."
                            rows={4}
                            className="w-full px-4 py-3 rounded-lg border border-[var(--border-default)] mb-4 bg-[var(--background-elevated)] text-[var(--foreground)] placeholder:text-[var(--foreground-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
                        />
                        <div className="flex gap-3">
                            <Button
                                onClick={() => setShowRejectModal(false)}
                                variant="outline"
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleReject}
                                disabled={rejecting || !rejectReason.trim()}
                                className="flex-1 bg-red-600 hover:bg-red-700"
                            >
                                {rejecting ? 'Submitting...' : 'Send Revision Request'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
