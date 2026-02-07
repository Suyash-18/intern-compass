import { useState } from 'react';
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
import { ClipboardList, Check, X, MessageSquare, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { Intern, Task } from '@/types';

interface PendingTask {
  intern: Intern;
  task: Task;
  taskIndex: number;
}

export default function AdminTasks() {
  const { interns, reviewTask } = useInterns();
  const [selectedTask, setSelectedTask] = useState<PendingTask | null>(null);
  const [feedback, setFeedback] = useState('');
  const [reviewType, setReviewType] = useState<'approve' | 'reject' | null>(null);

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

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardList className="h-6 w-6" />
            Task Review
          </h1>
          <p className="text-muted-foreground mt-1">
            Review and approve intern task submissions
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-status-pending">{pendingTasks.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Approved Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-status-approved">
                {reviewedTasks.filter((t) => t.task.status === 'approved').length}
              </div>
            </CardContent>
          </Card>
          <Card className="col-span-2 md:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {interns.reduce((acc, i) => acc + i.tasks.length, 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending" className="gap-2">
              Pending
              {pendingTasks.length > 0 && (
                <span className="bg-status-pending text-status-pending-foreground text-xs px-2 py-0.5 rounded-full">
                  {pendingTasks.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="reviewed">Recently Reviewed</TabsTrigger>
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
              pendingTasks.map((item) => (
                <Card key={`${item.intern.id}-${item.task.id}`} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <CardTitle className="text-base">{item.task.title}</CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {item.intern.profile.name} • {item.intern.profile.domain}
                          </span>
                        </div>
                      </div>
                      <StatusBadge status={item.task.status} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4">{item.task.description}</CardDescription>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        Submitted: {new Date(item.task.submittedAt || '').toLocaleDateString()}
                      </p>
                      <Button size="sm" onClick={() => setSelectedTask(item)}>
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Review
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
                        <p className="font-medium text-xs text-muted-foreground mb-1">Feedback</p>
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
              <div className="bg-muted p-4 rounded-lg">
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
                />
              </div>

              {!reviewType ? (
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => handleReview('reject')}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                  <Button
                    className="flex-1 bg-status-approved hover:bg-status-approved/90"
                    onClick={() => handleReview('approve')}
                  >
                    <Check className="mr-2 h-4 w-4" />
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
      </div>
    </Layout>
  );
}
