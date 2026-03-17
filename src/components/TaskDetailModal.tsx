import type { Task, TaskAttachment } from '@/types';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DocumentPreview } from '@/components/DocumentPreview';
import { Lock, Send, CheckCircle, AlertCircle, Calendar, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskDetailModalProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (taskId: string) => void;
  showSubmitAction?: boolean;
}

export function TaskDetailModal({ task, open, onOpenChange, onSubmit, showSubmitAction = false }: TaskDetailModalProps) {
  if (!task) return null;

  const isLocked = task.status === 'locked';
  const canSubmit = showSubmitAction && (task.status === 'in_progress' || task.status === 'rejected');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <DialogTitle className="text-xl">{task.title}</DialogTitle>
            <StatusBadge status={task.status} />
          </div>
          {task.submittedAt && (
            <DialogDescription className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              Submitted: {new Date(task.submittedAt).toLocaleDateString()}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-5">
          {/* Description */}
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-1.5">Description</h4>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{task.description}</p>
          </div>

          {/* Lock Info */}
          {isLocked && task.lockType && (
            <div className="p-3 rounded-lg bg-muted border text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Lock className="h-4 w-4" />
                {task.lockType === 'sequential' && 'Unlocks after the previous task is approved'}
                {task.lockType === 'after_task' && 'Unlocks after a specific task is completed'}
                {task.lockType === 'until_date' && task.unlockDate && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    Unlocks on {new Date(task.unlockDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Admin Feedback */}
          {task.feedback && (
            <div
              className={cn(
                'p-3 rounded-lg text-sm border',
                task.status === 'approved'
                  ? 'bg-status-approved/10 border-status-approved/20 text-status-approved'
                  : 'bg-destructive/10 border-destructive/20 text-destructive'
              )}
            >
              <div className="flex items-start gap-2">
                {task.status === 'approved' ? (
                  <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                )}
                <div>
                  <p className="font-medium">Admin Feedback</p>
                  <p className="mt-1">{task.feedback}</p>
                </div>
              </div>
            </div>
          )}

          {/* Attachments - visible for all non-locked tasks */}
          {!isLocked && task.attachments && task.attachments.length > 0 && (
            <DocumentPreview attachments={task.attachments} label="Submitted Files" />
          )}

          {/* Submit Action */}
          {canSubmit && onSubmit && (
            <Button onClick={() => onSubmit(task.id)} className="w-full">
              <Send className="mr-2 h-4 w-4" />
              {task.status === 'rejected' ? 'Resubmit for Review' : 'Submit for Review'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
