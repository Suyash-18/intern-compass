import { Layout } from '@/components/Layout';
import { TaskCard } from '@/components/TaskCard';
import { useInterns } from '@/contexts/InternContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Clock, Lock, ListTodo } from 'lucide-react';
import type { TaskAttachment } from '@/types';

export default function Dashboard() {
  const { currentInternTasks, submitTask } = useInterns();
  const { user } = useAuth();

  const handleSubmit = (taskId: string, attachments: TaskAttachment[]) => {
    submitTask(taskId, attachments);
    toast({
      title: 'Task Submitted',
      description: `Your task has been submitted with ${attachments.length} file(s) for admin review.`,
    });
  };

  // Calculate stats
  const stats = {
    total: currentInternTasks.length,
    completed: currentInternTasks.filter((t) => t.status === 'approved').length,
    pending: currentInternTasks.filter((t) => t.status === 'pending').length,
    locked: currentInternTasks.filter((t) => t.status === 'locked').length,
  };

  const progressPercentage = (stats.completed / stats.total) * 100;

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        {/* Welcome Section */}
        <div className="bg-foreground text-background rounded-2xl p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-bold">
            Welcome back, {user?.profile?.name || 'Intern'}!
          </h1>
          <p className="text-background/70 mt-2">
            Track your progress and complete your assigned tasks
          </p>
          
          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-background/80">Overall Progress</span>
              <span className="text-sm text-background/60">
                {stats.completed}/{stats.total} tasks completed
              </span>
            </div>
            <div className="h-3 bg-background/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-primary">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Tasks
              </CardTitle>
              <ListTodo className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-status-approved">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Completed
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-status-approved" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-status-approved">{stats.completed}</div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-status-pending">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Review
              </CardTitle>
              <Clock className="h-4 w-4 text-status-pending" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-status-pending">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-status-locked">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Locked
              </CardTitle>
              <Lock className="h-4 w-4 text-status-locked" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-status-locked">{stats.locked}</div>
            </CardContent>
          </Card>
        </div>

        {/* Task List */}
        <div>
          <h2 className="text-xl font-bold mb-4">Your Tasks</h2>
          <div className="space-y-4">
            {currentInternTasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                onSubmit={handleSubmit}
              />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
