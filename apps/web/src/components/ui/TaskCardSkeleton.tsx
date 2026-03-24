import { Skeleton } from "./Skeleton";

export function TaskCardSkeleton() {
    return (
        <div className="rounded-lg overflow-hidden bg-[var(--background-elevated)] border border-[var(--border-default)]">
            {/* Image Banner Skeleton */}
            <div className="p-3">
                <Skeleton className="w-full aspect-video rounded-lg bg-[var(--surface-hover)]" />
            </div>

            {/* Card Content Skeleton */}
            <div className="p-4">
                {/* Title and Budget */}
                <div className="mb-3 flex justify-between items-start">
                    <Skeleton className="h-6 w-3/4 bg-[var(--surface-hover)]" />
                    <Skeleton className="h-5 w-16 rounded bg-[var(--surface-hover)]" />
                </div>

                {/* Description */}
                <div className="mb-4 space-y-2">
                    <Skeleton className="h-3 w-full bg-[var(--surface-hover)]" />
                    <Skeleton className="h-3 w-5/6 bg-[var(--surface-hover)]" />
                </div>

                {/* Status Chips */}
                <div className="flex gap-2 mb-4">
                    <Skeleton className="h-5 w-16 rounded bg-[var(--surface-hover)]" />
                    <Skeleton className="h-5 w-12 rounded bg-[var(--surface-hover)]" />
                    <Skeleton className="h-5 w-20 rounded bg-[var(--surface-hover)]" />
                </div>

                {/* Footer with Avatar */}
                <div className="flex items-center gap-2">
                    <Skeleton className="w-7 h-7 rounded-full bg-[var(--surface-hover)]" />
                    <div className="flex-1 space-y-1">
                        <Skeleton className="h-3 w-24 bg-[var(--surface-hover)]" />
                        <Skeleton className="h-3 w-16 bg-[var(--surface-hover)]" />
                    </div>
                </div>
            </div>
        </div>
    );
}
