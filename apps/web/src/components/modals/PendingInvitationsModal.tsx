import { useState, useEffect } from 'react';
import { X, Building2, Check, X as XIcon } from 'lucide-react';
import { workspacesAPI, type PendingInvitation } from '../../services/api';
import toast from 'react-hot-toast';

interface PendingInvitationsModalProps {
    onClose: () => void;
}

export const PendingInvitationsModal = ({ onClose }: PendingInvitationsModalProps) => {
    const [invitations, setInvitations] = useState<PendingInvitation[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);

    useEffect(() => {
        fetchInvitations();
    }, []);

    const fetchInvitations = async () => {
        try {
            const response = await workspacesAPI.getPendingInvitations();
            setInvitations(response.data);
        } catch (error) {
            console.error('Failed to fetch invitations:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (workspaceId: string) => {
        setProcessing(workspaceId);
        try {
            await workspacesAPI.acceptInvitation(workspaceId);
            setInvitations(invitations.filter(i => i.workspaceId !== workspaceId));
            toast.success('Invitation accepted! You\'ve joined the workspace.');

            // Close modal if no more invitations
            if (invitations.length <= 1) {
                onClose();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to accept invitation');
        } finally {
            setProcessing(null);
        }
    };

    const handleReject = async (workspaceId: string) => {
        setProcessing(workspaceId);
        try {
            await workspacesAPI.rejectInvitation(workspaceId);
            setInvitations(invitations.filter(i => i.workspaceId !== workspaceId));
            toast.success('Invitation declined.');

            // Close modal if no more invitations
            if (invitations.length <= 1) {
                onClose();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to decline invitation');
        } finally {
            setProcessing(null);
        }
    };

    // Don't render if no invitations
    if (!loading && invitations.length === 0) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-lg rounded-sm shadow-2xl bg-[var(--background-elevated)]">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-[var(--border-default)]">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-[#464ace]/15">
                            <Building2 size={24} className="text-[#464ace]" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-[var(--foreground)]">
                                Pending Invitations
                            </h2>
                            <p className="text-sm text-[var(--foreground-muted)]">
                                You have {invitations.length} pending workspace invitation{invitations.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg transition-colors hover:bg-[var(--surface)] text-[var(--foreground-muted)]"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 max-h-96 overflow-y-auto">
                    {loading ? (
                        <div className="space-y-4">
                            {[...Array(2)].map((_, i) => (
                                <div key={i} className="rounded-xl border p-4 animate-pulse bg-[var(--surface)] border-[var(--border-default)]">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-lg bg-[var(--surface-hover)]" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-5 w-40 rounded bg-[var(--surface-hover)]" />
                                            <div className="h-4 w-32 rounded bg-[var(--surface-hover)]" />
                                        </div>
                                    </div>
                                    <div className="flex gap-2 mt-4">
                                        <div className="flex-1 h-10 rounded-lg bg-[var(--surface-hover)]" />
                                        <div className="flex-1 h-10 rounded-lg bg-[var(--surface-hover)]" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {invitations.map((invitation) => (
                                <div
                                    key={invitation.id}
                                    className="rounded-xl border p-4 bg-[var(--surface)] border-[var(--border-default)]"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg bg-[#464ace]/15 text-[#464ace]">
                                                {invitation.workspace.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-[var(--foreground)]">
                                                    {invitation.workspace.name}
                                                </h3>
                                                <p className="text-sm text-[var(--foreground-muted)]">
                                                    Invited by <span className="font-medium">{invitation.workspace.owner.name}</span>
                                                </p>
                                                <p className="text-xs mt-1 text-[var(--foreground-muted)]">
                                                    Role: <span className="font-medium uppercase">{invitation.role}</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {invitation.workspace.description && (
                                        <p className="mt-3 text-sm text-[var(--foreground-muted)]">
                                            {invitation.workspace.description}
                                        </p>
                                    )}

                                    {/* Actions */}
                                    <div className="flex gap-2 mt-4">
                                        <button
                                            onClick={() => handleAccept(invitation.workspaceId)}
                                            disabled={processing === invitation.workspaceId}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#464ace] text-white font-medium hover:bg-[#3a3eb8] transition-colors disabled:opacity-50"
                                        >
                                            <Check size={18} />
                                            Accept
                                        </button>
                                        <button
                                            onClick={() => handleReject(invitation.workspaceId)}
                                            disabled={processing === invitation.workspaceId}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-[var(--border-default)] font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface)] disabled:opacity-50"
                                        >
                                            <XIcon size={18} />
                                            Decline
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
