import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useInterns } from '@/contexts/InternContext';
import { BarChart3, Users, CheckCircle, Clock, TrendingUp, FileText, PieChart, Calendar } from 'lucide-react';

export default function AdminReports() {
  const { interns, isLoading } = useInterns();

  const totalInterns = interns.length;
  const totalTasks = interns.reduce((acc, intern) => acc + intern.tasks.length, 0);
  const completedTasks = interns.reduce((acc, intern) => acc + intern.tasks.filter(t => t.status === 'approved').length, 0);
  const pendingTasks = interns.reduce((acc, intern) => acc + intern.tasks.filter(t => t.status === 'pending').length, 0);
  const inProgressTasks = interns.reduce((acc, intern) => acc + intern.tasks.filter(t => t.status === 'in_progress').length, 0);
  const rejectedTasks = interns.reduce((acc, intern) => acc + intern.tasks.filter(t => t.status === 'rejected').length, 0);
  const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const approvalRate = (completedTasks + rejectedTasks) > 0 ? Math.round((completedTasks / (completedTasks + rejectedTasks)) * 100) : 0;

  const domainDistribution = interns.reduce((acc, intern) => {
    const domain = intern.profile.domain;
    acc[domain] = (acc[domain] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topPerformers = [...interns]
    .map(intern => ({
      ...intern,
      completedCount: intern.tasks.filter(t => t.status === 'approved').length,
      progress: intern.tasks.length > 0 ? Math.round((intern.tasks.filter(t => t.status === 'approved').length / intern.tasks.length) * 100) : 0,
    }))
    .sort((a, b) => b.completedCount - a.completedCount)
    .slice(0, 5);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-16">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><BarChart3 className="h-6 w-6 text-primary" />Reports & Analytics</h1>
          <p className="text-muted-foreground">Overview of intern performance and task completion metrics</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Total Interns</p><p className="text-3xl font-bold">{totalInterns}</p></div><div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center"><Users className="h-6 w-6 text-primary" /></div></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Tasks Completed</p><p className="text-3xl font-bold text-status-approved">{completedTasks}</p></div><div className="h-12 w-12 rounded-full bg-status-approved/10 flex items-center justify-center"><CheckCircle className="h-6 w-6 text-status-approved" /></div></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Pending Review</p><p className="text-3xl font-bold text-status-pending">{pendingTasks}</p></div><div className="h-12 w-12 rounded-full bg-status-pending/10 flex items-center justify-center"><Clock className="h-6 w-6 text-status-pending" /></div></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Approval Rate</p><p className="text-3xl font-bold">{approvalRate}%</p></div><div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center"><TrendingUp className="h-6 w-6 text-primary" /></div></div></CardContent></Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><PieChart className="h-5 w-5 text-primary" />Task Distribution</CardTitle><CardDescription>Breakdown of all tasks by status</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full bg-status-approved" /><span className="text-sm">Completed</span></div><span className="font-medium">{completedTasks}</span></div>
                {totalTasks > 0 && <Progress value={(completedTasks / totalTasks) * 100} className="h-2 bg-muted [&>div]:bg-status-approved" />}
                <div className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full bg-status-pending" /><span className="text-sm">Pending Review</span></div><span className="font-medium">{pendingTasks}</span></div>
                {totalTasks > 0 && <Progress value={(pendingTasks / totalTasks) * 100} className="h-2 bg-muted [&>div]:bg-status-pending" />}
                <div className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full bg-primary" /><span className="text-sm">In Progress</span></div><span className="font-medium">{inProgressTasks}</span></div>
                {totalTasks > 0 && <Progress value={(inProgressTasks / totalTasks) * 100} className="h-2 bg-muted" />}
                <div className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full bg-destructive" /><span className="text-sm">Rejected</span></div><span className="font-medium">{rejectedTasks}</span></div>
                {totalTasks > 0 && <Progress value={(rejectedTasks / totalTasks) * 100} className="h-2 bg-muted [&>div]:bg-destructive" />}
              </div>
              <div className="pt-4 border-t">
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Overall Progress</span><span className="font-semibold">{overallProgress}%</span></div>
                <Progress value={overallProgress} className="h-3 mt-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary" />Top Performers</CardTitle><CardDescription>Interns with the most completed tasks</CardDescription></CardHeader>
            <CardContent>
              {topPerformers.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No intern data available yet.</p>
              ) : (
                <div className="space-y-4">
                  {topPerformers.map((intern, index) => (
                    <div key={intern.id} className="flex items-center gap-4">
                      <span className="text-lg font-bold text-muted-foreground w-6">#{index + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium truncate">{intern.profile.name}</p>
                          <Badge variant="secondary" className="ml-2">{intern.completedCount}/{intern.tasks.length}</Badge>
                        </div>
                        <Progress value={intern.progress} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary" />Interns by Domain</CardTitle><CardDescription>Distribution of interns across different domains</CardDescription></CardHeader>
            <CardContent>
              {Object.keys(domainDistribution).length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No data available.</p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(domainDistribution).map(([domain, count]) => (
                    <div key={domain} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="font-medium">{domain}</span>
                      <Badge>{count} intern{count > 1 ? 's' : ''}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5 text-primary" />Recent Registrations</CardTitle><CardDescription>Latest interns to join the program</CardDescription></CardHeader>
            <CardContent>
              {interns.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No registrations yet.</p>
              ) : (
                <div className="space-y-3">
                  {[...interns].sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime()).slice(0, 5).map(intern => (
                    <div key={intern.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div><p className="font-medium">{intern.profile.name}</p><p className="text-xs text-muted-foreground">{intern.profile.domain}</p></div>
                      <span className="text-sm text-muted-foreground">{new Date(intern.registeredAt).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
