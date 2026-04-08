import { useState, useRef } from 'react';
import type { Task, TaskAttachment } from '@/types';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TaskDetailModal } from '@/components/TaskDetailModal';
import { Lock, Send, CheckCircle, AlertCircle, Upload, FileText, Image, Archive, X, Paperclip } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface TaskCardProps {
  task: Task;
  index: number;
  onSubmit?: (taskId: string, attachments: TaskAttachment[], submissionNote: string) => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/zip',
  'application/x-zip-compressed',
];

function getFileType(mimeType: string): TaskAttachment['type'] {
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.includes('zip')) return 'zip';
  return 'other';
}

function getFileIcon(type: TaskAttachment['type']) {
  switch (type) {
    case 'pdf':
      return FileText;
    case 'image':
      return Image;
    case 'zip':
      return Archive;
    default:
      return FileText;
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export function TaskCard({ task, index, onSubmit }: TaskCardProps) {
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [submissionNote, setSubmissionNote] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isLocked = task.status === 'locked';
  const canSubmit = task.status === 'in_progress' || task.status === 'rejected';

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newAttachments: TaskAttachment[] = [];

    Array.from(files).forEach((file) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast({
          title: 'Invalid file type',
          description: `${file.name} is not supported. Please upload PDF, images, or ZIP files.`,
          variant: 'destructive',
        });
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: 'File too large',
          description: `${file.name} exceeds the 10MB limit.`,
          variant: 'destructive',
        });
        return;
      }

      newAttachments.push({
        id: crypto.randomUUID(),
        name: file.name,
        type: getFileType(file.type),
        size: file.size,
        url: URL.createObjectURL(file),
        mimeType: file.type,
      });
    });

    setAttachments((prev) => [...prev, ...newAttachments]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => {
      const attachment = prev.find((a) => a.id === id);
      if (attachment) {
        URL.revokeObjectURL(attachment.url);
      }
      return prev.filter((a) => a.id !== id);
    });
  };

  const handleSubmit = () => {
    onSubmit?.(task.id, attachments, submissionNote);
    setShowSubmitDialog(false);
    setAttachments([]);
    setSubmissionNote('');
  };

  const handleCloseDialog = () => {
    setShowSubmitDialog(false);
    // Clean up object URLs
    attachments.forEach((a) => URL.revokeObjectURL(a.url));
    setAttachments([]);
  };

  return (
    <>
      <Card
        className={cn(
          'task-card animate-fade-in cursor-pointer hover:shadow-md transition-shadow',
          isLocked && 'task-card-locked'
        )}
        style={{ animationDelay: `${index * 50}ms` }}
        onClick={() => setShowDetailModal(true)}
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

          {/* Existing Attachments - visible for all non-locked tasks */}
          {!isLocked && task.attachments && task.attachments.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-medium text-muted-foreground mb-2">Submitted Files</p>
              <div className="flex flex-wrap gap-2">
                {task.attachments.map((attachment) => {
                  const Icon = getFileIcon(attachment.type);
                  return (
                    <div
                      key={attachment.id}
                      className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg text-xs"
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span className="max-w-[150px] truncate">{attachment.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

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
            <Button onClick={(e) => { e.stopPropagation(); setShowSubmitDialog(true); }} className="w-full">
              <Send className="mr-2 h-4 w-4" />
              {task.status === 'rejected' ? 'Resubmit for Review' : 'Submit for Review'}
            </Button>
          )}

          {task.status === 'pending' && (
            <div className="flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground">
              <Paperclip className="h-4 w-4" />
              Submitted • Awaiting admin review
            </div>
          )}
        </CardContent>
      </Card>

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={task}
        open={showDetailModal}
        onOpenChange={setShowDetailModal}
        onSubmit={(taskId) => {
          setShowDetailModal(false);
          setShowSubmitDialog(true);
        }}
        showSubmitAction={canSubmit}
      />

      {/* Submit Confirmation Dialog */}
      <Dialog open={showSubmitDialog} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Submit Task for Review</DialogTitle>
            <DialogDescription>
              Upload your work files (PDF, images, or ZIP) and submit "{task.title}" for admin review.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Upload Area */}
            <div>
              <Label className="mb-2 block">Attachments</Label>
              <div
                className={cn(
                  'border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer',
                  isDragging
                    ? 'border-primary bg-primary/5'
                    : 'border-muted-foreground/25 hover:border-primary/50'
                )}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm font-medium">Drop files here or click to upload</p>
                <p className="text-xs text-muted-foreground mt-1">
                  PDF, Images, or ZIP files (max 10MB each)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.zip"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e.target.files)}
                />
              </div>
            </div>

            {/* Attachment List */}
            {attachments.length > 0 && (
              <div className="space-y-2">
                {attachments.map((attachment) => {
                  const Icon = getFileIcon(attachment.type);
                  return (
                    <div
                      key={attachment.id}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{attachment.name}</p>
                          <p className="text-xs text-muted-foreground">{formatFileSize(attachment.size)}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="flex-shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeAttachment(attachment.id);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
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
