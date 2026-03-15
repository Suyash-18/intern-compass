import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { StatusBadge } from '@/components/ui/status-badge';
import { TaskDetailModal } from '@/components/TaskDetailModal';
import { useInterns } from '@/contexts/InternContext';
import { internService } from '@/services/internService';
import { ArrowLeft, User, Mail, Phone, MapPin, Calendar, GraduationCap, Code, Briefcase, CheckCircle, Clock, AlertCircle, FileText } from 'lucide-react';
import type { Intern, Task } from '@/types';

export default function AdminInternDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getInternById } = useInterns();
  const [intern, setIntern] = useState<Intern | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      // Try context first, then fetch from API
      let data = id ? getInternById(id) : undefined;
      if (!data && id) {
        const fetched = await internService.getInternById(id);
        if (fetched) data = fetched;
      }
      setIntern(data);
      setIsLoading(false);
    };
    load();
  }, [id, getInternById]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-16">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!intern) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-16">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold">Intern Not Found</h2>
          <p className="text-muted-foreground mb-4">The intern you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/admin')}><ArrowLeft className="h-4 w-4 mr-2" />Back to Interns</Button>
        </div>
      </Layout>
    );
  }

  const completedTasks = intern.tasks.filter(t => t.status === 'approved').length;
  const pendingTasks = intern.tasks.filter(t => t.status === 'pending').length;
  const inProgressTasks = intern.tasks.filter(t => t.status === 'in_progress').length;
  const progress = intern.tasks.length > 0 ? Math.round((completedTasks / intern.tasks.length) * 100) : 0;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin')} className="shrink-0"><ArrowLeft className="h-5 w-5" /></Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">{intern.profile.name}</h1>
            <p className="text-muted-foreground">{intern.profile.domain}</p>
          </div>
          <Badge variant={intern.registrationCompleted ? 'default' : 'secondary'}>{intern.registrationCompleted ? 'Active' : 'Pending Registration'}</Badge>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2 text-base"><User className="h-4 w-4 text-primary" />Contact Information</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3"><Mail className="h-4 w-4 text-muted-foreground" /><span className="text-sm">{intern.profile.email}</span></div>
                <div className="flex items-center gap-3"><Phone className="h-4 w-4 text-muted-foreground" /><span className="text-sm">{intern.profile.mobile}</span></div>
                <div className="flex items-center gap-3"><MapPin className="h-4 w-4 text-muted-foreground" /><span className="text-sm">{intern.profile.address}</span></div>
                <div className="flex items-center gap-3"><Calendar className="h-4 w-4 text-muted-foreground" /><span className="text-sm">DOB: {new Date(intern.profile.dob).toLocaleDateString()}</span></div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2 text-base"><GraduationCap className="h-4 w-4 text-primary" />Education</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-medium">{intern.profile.collegeName}</p>
                  <p className="text-sm text-muted-foreground">{intern.profile.degree} in {intern.profile.branch}</p>
                  <p className="text-sm text-muted-foreground">Year of Passing: {intern.profile.yearOfPassing}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Code className="h-4 w-4 text-primary" />Skills</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {intern.profile.skills.map((skill, index) => <Badge key={index} variant="secondary">{skill}</Badge>)}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Briefcase className="h-5 w-5 text-primary" />Progress Overview</CardTitle>
                <CardDescription>Registered on {new Date(intern.registeredAt).toLocaleDateString()}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2"><span>Overall Progress</span><span className="font-medium">{progress}%</span></div>
                    <Progress value={progress} className="h-3" />
                  </div>
                  <div className="grid grid-cols-3 gap-4 pt-4">
                    <div className="text-center p-4 bg-status-approved/10 rounded-lg"><CheckCircle className="h-6 w-6 text-status-approved mx-auto mb-2" /><p className="text-2xl font-bold text-status-approved">{completedTasks}</p><p className="text-xs text-muted-foreground">Completed</p></div>
                    <div className="text-center p-4 bg-status-pending/10 rounded-lg"><Clock className="h-6 w-6 text-status-pending mx-auto mb-2" /><p className="text-2xl font-bold text-status-pending">{pendingTasks}</p><p className="text-xs text-muted-foreground">Pending Review</p></div>
                    <div className="text-center p-4 bg-primary/10 rounded-lg"><FileText className="h-6 w-6 text-primary mx-auto mb-2" /><p className="text-2xl font-bold text-primary">{inProgressTasks}</p><p className="text-xs text-muted-foreground">In Progress</p></div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary" />Assigned Tasks</CardTitle>
                <CardDescription>{intern.tasks.length} total tasks assigned</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {intern.tasks.map((task, index) => (
                    <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-muted-foreground w-6">#{index + 1}</span>
                        <div>
                          <p className="font-medium">{task.title}</p>
                          {task.submittedAt && <p className="text-xs text-muted-foreground">Submitted: {new Date(task.submittedAt).toLocaleDateString()}</p>}
                        </div>
                      </div>
                      <StatusBadge status={task.status} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
