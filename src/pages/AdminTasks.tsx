import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { useInterns } from '@/contexts/InternContext';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ClipboardList, 
  Check, 
  X, 
  MessageSquare, 
  User, 
  FileText, 
  Image, 
  Archive, 
  Download, 
  Eye,
  Paperclip,
  Plus
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { Intern, Task, TaskAttachment } from '@/types';

interface PendingTask {
  intern: Intern;
  task: Task;
  taskIndex: number;
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

export default function AdminTasks() {
  const navigate = useNavigate();
  const { interns, reviewTask } = useInterns();
  const [selectedTask, setSelectedTask] = useState<PendingTask | null>(null);
  const [feedback, setFeedback] = useState('');
  const [reviewType, setReviewType] = useState<'approve' | 'reject' | null>(null);
  const [previewAttachment, setPreviewAttachment] = useState<TaskAttachment | null>(null);

  // Get all pending tasks across interns
  const pendingTasks: PendingTask[] = interns.flatMap((intern) =>
    intern.tasks
      .map((task, index) => ({ intern, task, taskIndex: index }))
      .filter((item) => item.task.status === 'pending')
  );

  // Get recently reviewed tasks
  const reviewedTasks: PendingTask[] = interns.flatMap((intern) =>
    intern.tasks
      .map((task, index) => ({ intern, task, taskIndex: index }))
      .filter((item) => item.task.status === 'approved' || item.task.status === 'rejected')
      .filter((item) => item.task.reviewedAt)
  ).sort((a, b) => 
    new Date(b.task.reviewedAt || '').getTime() - new Date(a.task.reviewedAt || '').getTime()
  ).slice(0, 10);

  const handleReview = (type: 'approve' | 'reject') => {
    setReviewType(type);
  };

  const submitReview = () => {
    if (!selectedTask || !reviewType) return;

    reviewTask(
      selectedTask.intern.id,
      selectedTask.task.id,
      reviewType === 'approve' ? 'approved' : 'rejected',
      feedback
    );

    toast({
      title: reviewType === 'approve' ? 'Task Approved' : 'Task Rejected',
      description: `${selectedTask.intern.profile.name}'s task has been ${reviewType === 'approve' ? 'approved' : 'rejected'}.`,
    });

    setSelectedTask(null);
    setFeedback('');
    setReviewType(null);
  };

  const handleDownload = (attachment: TaskAttachment) => {
    const link = document.createElement('a');
    link.href = attachment.url;
    link.download = attachment.name;
    link.click();
    toast({
      title: 'Download Started',
      description: `Downloading ${attachment.name}`,
    });
  };

  const handlePreview = (attachment: TaskAttachment) => {
    if (attachment.type === 'image' || attachment.type === 'pdf') {
      setPreviewAttachment(attachment);
    } else {
      toast({
        title: 'Preview not available',
        description: 'This file type cannot be previewed. Please download it instead.',
      });
    }
  };

  // Mock attachments for demo (add to first pending task)
  const mockAttachments: TaskAttachment[] = [
    {
      id: '1',
      name: 'task_documentation.pdf',
      type: 'pdf',
      size: 2456789,
      url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      mimeType: 'application/pdf',
    },
    {
      id: '2',
      name: 'screenshot_progress.png',
      type: 'image',
      size: 548234,
      url: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800',
      mimeType: 'image/png',
    },
    {
      id: '3',
      name: 'project_files.zip',
      type: 'zip',
      size: 8923456,
      url: '#',
      mimeType: 'application/zip',
    },
  ];

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="bg-foreground text-background rounded-2xl p-6 md:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                <ClipboardList className="h-8 w-8" />
                Task Review
              </h1>
              <p className="text-background/70 mt-2">
                Review and approve intern task submissions
              </p>
            </div>
            <Button 
              onClick={() => navigate('/admin/tasks/new')}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add New Task
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card className="border-l-4 border-l-status-pending">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-status-pending">{pendingTasks.length}</div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-status-approved">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Approved Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-status-approved">
                {reviewedTasks.filter((t) => t.task.status === 'approved').length}
              </div>
            </CardContent>
          </Card>
          <Card className="col-span-2 md:col-span-1 border-l-4 border-l-primary">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {interns.reduce((acc, i) => acc + i.tasks.length, 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList className="bg-muted p-1">
            <TabsTrigger value="pending" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Pending
              {pendingTasks.length > 0 && (
                <span className="bg-status-pending text-status-pending-foreground text-xs px-2 py-0.5 rounded-full">
                  {pendingTasks.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="reviewed" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Recently Reviewed
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingTasks.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No pending tasks</h3>
                  <p className="text-muted-foreground mt-1">
                    All submitted tasks have been reviewed.
                  </p>
                </CardContent>
              </Card>
            ) : (
              pendingTasks.map((item, idx) => (
                <Card key={`${item.intern.id}-${item.task.id}`} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <CardTitle className="text-lg">{item.task.title}</CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <span className="text-sm font-medium">{item.intern.profile.name}</span>
                            <span className="text-sm text-muted-foreground"> • {item.intern.profile.domain}</span>
                          </div>
                        </div>
                      </div>
                      <StatusBadge status={item.task.status} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4">{item.task.description}</CardDescription>
                    
                    {/* Attachments Preview (using mock for demo) */}
                    {idx === 0 && (
                      <div className="mb-4 p-4 bg-muted rounded-xl">
                        <div className="flex items-center gap-2 mb-3">
                          <Paperclip className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Attached Files ({mockAttachments.length})</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {mockAttachments.map((attachment) => {
                            const Icon = getFileIcon(attachment.type);
                            return (
                              <div
                                key={attachment.id}
                                className="flex items-center justify-between p-3 bg-card rounded-lg border"
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
                                <div className="flex gap-1">
                                  {(attachment.type === 'image' || attachment.type === 'pdf') && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => handlePreview(attachment)}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleDownload(attachment)}
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        Submitted: {new Date(item.task.submittedAt || '').toLocaleDateString()}
                      </p>
                      <Button onClick={() => setSelectedTask(item)}>
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Review Task
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="reviewed" className="space-y-4">
            {reviewedTasks.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No reviewed tasks yet</h3>
                  <p className="text-muted-foreground mt-1">
                    Tasks you review will appear here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              reviewedTasks.map((item) => (
                <Card key={`${item.intern.id}-${item.task.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <CardTitle className="text-base">{item.task.title}</CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {item.intern.profile.name}
                          </span>
                        </div>
                      </div>
                      <StatusBadge status={item.task.status} />
                    </div>
                  </CardHeader>
                  {item.task.feedback && (
                    <CardContent className="pt-0">
                      <div className="bg-muted p-3 rounded-lg text-sm">
                        <p className="font-medium text-xs text-muted-foreground mb-1">Your Feedback</p>
                        <p>{item.task.feedback}</p>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>

        {/* Review Modal */}
        <Dialog open={!!selectedTask} onOpenChange={() => {
          setSelectedTask(null);
          setFeedback('');
          setReviewType(null);
        }}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Review Task Submission</DialogTitle>
              <DialogDescription>
                {selectedTask?.intern.profile.name} - {selectedTask?.task.title}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-xl">
                <h4 className="font-medium text-sm mb-2">Task Description</h4>
                <p className="text-sm text-muted-foreground">{selectedTask?.task.description}</p>
              </div>

              <div className="space-y-2">
                <Label>Feedback / Remarks</Label>
                <Textarea
                  placeholder="Add feedback for the intern..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>

              {!reviewType ? (
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 h-12 border-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => handleReview('reject')}
                  >
                    <X className="mr-2 h-5 w-5" />
                    Reject
                  </Button>
                  <Button
                    className="flex-1 h-12 bg-status-approved hover:bg-status-approved/90"
                    onClick={() => handleReview('approve')}
                  >
                    <Check className="mr-2 h-5 w-5" />
                    Approve
                  </Button>
                </div>
              ) : (
                <DialogFooter>
                  <Button variant="outline" onClick={() => setReviewType(null)}>
                    Back
                  </Button>
                  <Button
                    onClick={submitReview}
                    className={reviewType === 'approve' ? 'bg-status-approved hover:bg-status-approved/90' : 'bg-destructive hover:bg-destructive/90'}
                  >
                    Confirm {reviewType === 'approve' ? 'Approval' : 'Rejection'}
                  </Button>
                </DialogFooter>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Preview Modal */}
        <Dialog open={!!previewAttachment} onOpenChange={() => setPreviewAttachment(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {previewAttachment && (
                  <>
                    {previewAttachment.type === 'pdf' ? <FileText className="h-5 w-5" /> : <Image className="h-5 w-5" />}
                    {previewAttachment.name}
                  </>
                )}
              </DialogTitle>
            </DialogHeader>
            <div className="overflow-auto max-h-[70vh] rounded-lg bg-muted">
              {previewAttachment?.type === 'image' ? (
                <img
                  src={previewAttachment.url}
                  alt={previewAttachment.name}
                  className="w-full h-auto object-contain"
                />
              ) : previewAttachment?.type === 'pdf' ? (
                <iframe
                  src={previewAttachment.url}
                  className="w-full h-[70vh]"
                  title={previewAttachment.name}
                />
              ) : null}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPreviewAttachment(null)}>
                Close
              </Button>
              {previewAttachment && (
                <Button onClick={() => handleDownload(previewAttachment)}>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
