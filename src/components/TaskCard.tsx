import { useState } from 'react';
import type { Task } from '@/types';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Lock, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  index: number;
  onSubmit?: (taskId: string) => void;
}

export function TaskCard({ task, index, onSubmit }: TaskCardProps) {
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const isLocked = task.status === 'locked';
  const canSubmit = task.status === 'in_progress';

  const handleSubmit = () => {
    onSubmit?.(task.id);
    setShowSubmitDialog(false);
  };

  return (
    <>
      <Card
        className={cn(
          'task-card animate-fade-in',
          isLocked && 'task-card-locked'
        )}
        style={{ animationDelay: `${index * 50}ms` }}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold',
                  isLocked
                    ? 'bg-muted text-muted-foreground'
                    : task.status === 'approved'
                    ? 'bg-status-approved text-status-approved-foreground'
                    : 'bg-primary text-primary-foreground'
                )}
              >
                {isLocked ? <Lock className="h-4 w-4" /> : index + 1}
              </div>
              <div>
                <CardTitle className="text-base">{task.title}</CardTitle>
              </div>
            </div>
            <StatusBadge status={task.status} />
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-sm leading-relaxed mb-4">
            {task.description}
          </CardDescription>

          {/* Feedback Section */}
          {task.feedback && (
            <div
              className={cn(
                'p-3 rounded-lg mb-4 text-sm border',
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

          {/* Action Button */}
          {canSubmit && (
            <Button onClick={() => setShowSubmitDialog(true)} className="w-full">
              <Send className="mr-2 h-4 w-4" />
              Submit for Review
            </Button>
          )}

          {task.status === 'pending' && (
            <p className="text-sm text-muted-foreground text-center py-2">
              Submitted • Awaiting admin review
            </p>
          )}

          {task.status === 'rejected' && (
            <Button onClick={() => setShowSubmitDialog(true)} className="w-full" variant="outline">
              <Send className="mr-2 h-4 w-4" />
              Resubmit for Review
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Submit Confirmation Dialog */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Task for Review</DialogTitle>
            <DialogDescription>
              Are you sure you want to submit "{task.title}" for admin review? Make sure you have completed all requirements.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              <Send className="mr-2 h-4 w-4" />
              Submit Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
