import { useState } from 'react';
import type { Task, TaskStatus, TaskLockType } from '@/types';
import { StatusBadge } from '@/components/ui/status-badge';
import { DocumentPreview } from '@/components/DocumentPreview';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Lock, Calendar, Clock, CheckCircle, AlertCircle, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface AdminTaskDetailModalProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateTask?: (taskId: string, updates: { status?: TaskStatus; lockType?: TaskLockType }) => Promise<void>;
}

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: 'locked', label: 'Locked' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'pending', label: 'Pending Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

const LOCK_TYPE_OPTIONS: { value: TaskLockType; label: string; description: string }[] = [
  { value: 'open', label: 'Open', description: 'Always accessible' },
  { value: 'sequential', label: 'Sequential', description: 'Unlocks after previous task' },
  { value: 'after_task', label: 'After Task', description: 'Unlocks after specific task' },
  { value: 'until_date', label: 'Until Date', description: 'Unlocks at a set date' },
];

export function AdminTaskDetailModal({ task, open, onOpenChange, onUpdateTask }: AdminTaskDetailModalProps) {
  const [newStatus, setNewStatus] = useState<TaskStatus | ''>('');
  const [newLockType, setNewLockType] = useState<TaskLockType | ''>('');
  const [isSaving, setIsSaving] = useState(false);

  if (!task) return null;

  const handleSave = async () => {
    if (!newStatus && !newLockType) return;
    setIsSaving(true);
    try {
      const updates: { status?: TaskStatus; lockType?: TaskLockType } = {};
      if (newStatus) updates.status = newStatus;
      if (newLockType) updates.lockType = newLockType;
      await onUpdateTask?.(task.id, updates);
      toast({ title: 'Task Updated', description: 'Task settings have been updated.' });
      setNewStatus('');
      setNewLockType('');
      onOpenChange(false);
    } catch {
      toast({ title: 'Error', description: 'Failed to update task.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setNewStatus('');
      setNewLockType('');
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <DialogTitle className="text-xl">{task.title}</DialogTitle>
            <StatusBadge status={task.status} />
          </div>
          <DialogDescription>
            {task.submittedAt && (
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                Submitted: {new Date(task.submittedAt).toLocaleDateString()}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Description */}
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-1.5">Description</h4>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{task.description}</p>
          </div>

          {/* Current Lock Info */}
          <div className="p-3 rounded-lg bg-muted border text-sm">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Lock className="h-4 w-4" />
              <span className="font-medium">Lock Type: {task.lockType || 'sequential'}</span>
            </div>
            {task.lockType === 'until_date' && task.unlockDate && (
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 ml-6">
                <Calendar className="h-3.5 w-3.5" />
                Unlocks: {new Date(task.unlockDate).toLocaleDateString()}
              </p>
            )}
          </div>

          {/* Feedback */}
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
                  <p className="font-medium">Feedback</p>
                  <p className="mt-1">{task.feedback}</p>
                </div>
              </div>
            </div>
          )}

          {/* Task Files (from template/admin) */}
          {task.taskAttachments && task.taskAttachments.length > 0 && (
            <DocumentPreview attachments={task.taskAttachments} label="Task Files (Assigned)" />
          )}

          {/* Submission Details */}
          {(task.status === 'pending' || task.status === 'approved' || task.status === 'rejected') && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground">Submission Details</h4>
              {task.submissionNote && (
                <div className="p-3 rounded-lg bg-muted border text-sm">
                  <p className="font-medium text-xs text-muted-foreground mb-1">Intern's Note</p>
                  <p className="whitespace-pre-wrap">{task.submissionNote}</p>
                </div>
              )}
              {task.submissionAttachments && task.submissionAttachments.length > 0 ? (
                <DocumentPreview attachments={task.submissionAttachments} label="Intern's Submitted Files" />
              ) : (
                <p className="text-sm text-muted-foreground italic">No files submitted by intern</p>
              )}
            </div>
          )}

          {/* Admin Controls */}
          <div className="border-t pt-5 space-y-4">
            <h4 className="text-sm font-semibold">Admin Controls</h4>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-2 block text-xs">Change Status</Label>
                <Select value={newStatus} onValueChange={(v) => setNewStatus(v as TaskStatus)}>
                  <SelectTrigger>
                    <SelectValue placeholder={task.status} />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="mb-2 block text-xs">Change Lock Type</Label>
                <Select value={newLockType} onValueChange={(v) => setNewLockType(v as TaskLockType)}>
                  <SelectTrigger>
                    <SelectValue placeholder={task.lockType || 'sequential'} />
                  </SelectTrigger>
                  <SelectContent>
                    {LOCK_TYPE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <div>
                          <span>{opt.label}</span>
                          <span className="text-xs text-muted-foreground ml-2">— {opt.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={isSaving || (!newStatus && !newLockType)}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
