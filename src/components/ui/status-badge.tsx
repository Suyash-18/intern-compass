import { cn } from '@/lib/utils';
import { Check, Clock, Lock, AlertCircle, Loader2 } from 'lucide-react';
import type { TaskStatus } from '@/types';

interface StatusBadgeProps {
  status: TaskStatus;
  className?: string;
}

const statusConfig: Record<TaskStatus, { label: string; icon: React.ElementType; className: string }> = {
  approved: {
    label: 'Approved',
    icon: Check,
    className: 'status-approved',
  },
  pending: {
    label: 'Pending Review',
    icon: Clock,
    className: 'status-pending',
  },
  in_progress: {
    label: 'In Progress',
    icon: Loader2,
    className: 'status-progress',
  },
  locked: {
    label: 'Locked',
    icon: Lock,
    className: 'status-locked',
  },
  rejected: {
    label: 'Needs Revision',
    icon: AlertCircle,
    className: 'bg-destructive text-destructive-foreground',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span className={cn('status-badge', config.className, className)}>
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}
