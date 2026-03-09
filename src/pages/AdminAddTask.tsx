import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useInterns } from '@/contexts/InternContext';
import { apiService } from '@/services/api';
import { API_ENDPOINTS } from '@/utils/apiEndpoints';
import { ArrowLeft, Plus, Save, Users, FileText, Calendar, Tag } from 'lucide-react';
import { z } from 'zod';

const taskSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000),
  priority: z.enum(['low', 'medium', 'high']),
  dueDate: z.string().optional(),
  category: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

export default function AdminAddTask() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { interns } = useInterns();

  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    category: '',
  });

  const [selectedInterns, setSelectedInterns] = useState<string[]>([]);
  const [assignToAll, setAssignToAll] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = ['Onboarding', 'Training', 'Development', 'Documentation', 'Review', 'Project Work', 'Assessment'];

  const handleInputChange = (field: keyof TaskFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleInternToggle = (internId: string) => {
    setSelectedInterns(prev => prev.includes(internId) ? prev.filter(id => id !== internId) : [...prev, internId]);
  };

  const handleAssignToAllChange = (checked: boolean) => {
    setAssignToAll(checked);
    setSelectedInterns(checked ? interns.map(i => i.id) : []);
  };

  const validateForm = (): boolean => {
    try {
      taskSchema.parse(formData);
      if (!assignToAll && selectedInterns.length === 0) {
        setErrors({ assignment: 'Please select at least one intern or assign to all' });
        return false;
      }
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach(err => { if (err.path[0]) newErrors[err.path[0] as string] = err.message; });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Create the task via API
      await apiService.post(API_ENDPOINTS.TASKS.CREATE, {
        ...formData,
        assignedTo: assignToAll ? interns.map(i => i.id) : selectedInterns,
      });

      toast({
        title: 'Task Created',
        description: `Task "${formData.title}" has been created and assigned to ${assignToAll ? 'all interns' : `${selectedInterns.length} intern(s)`}.`,
      });
      navigate('/admin/tasks');
    } catch {
      toast({ title: 'Failed to create task', variant: 'destructive' });
    }
    setIsSubmitting(false);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/tasks')} className="shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Create New Task</h1>
            <p className="text-muted-foreground">Define a new task and assign it to interns</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary" />Task Details</CardTitle>
                <CardDescription>Enter the task information and requirements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Task Title *</Label>
                  <Input id="title" placeholder="Enter task title" value={formData.title} onChange={(e) => handleInputChange('title', e.target.value)} className={errors.title ? 'border-destructive' : ''} />
                  {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea id="description" placeholder="Describe the task requirements..." value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} className={`min-h-[150px] ${errors.description ? 'border-destructive' : ''}`} />
                  {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={formData.category} onValueChange={(v) => handleInputChange('category', v)}>
                      <SelectTrigger id="category"><SelectValue placeholder="Select category" /></SelectTrigger>
                      <SelectContent>{categories.map(cat => <SelectItem key={cat} value={cat.toLowerCase()}>{cat}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority *</Label>
                    <Select value={formData.priority} onValueChange={(v) => handleInputChange('priority', v as 'low' | 'medium' | 'high')}>
                      <SelectTrigger id="priority"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-green-500" />Low</span></SelectItem>
                        <SelectItem value="medium"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-yellow-500" />Medium</span></SelectItem>
                        <SelectItem value="high"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-red-500" />High</span></SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate" className="flex items-center gap-2"><Calendar className="h-4 w-4" />Due Date (Optional)</Label>
                  <Input id="dueDate" type="date" value={formData.dueDate} onChange={(e) => handleInputChange('dueDate', e.target.value)} min={new Date().toISOString().split('T')[0]} />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" />Assign To</CardTitle>
                <CardDescription>Select interns to receive this task</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
                  <Checkbox id="assignAll" checked={assignToAll} onCheckedChange={(checked) => handleAssignToAllChange(checked as boolean)} />
                  <Label htmlFor="assignAll" className="text-sm font-medium cursor-pointer flex-1">Assign to all interns ({interns.length})</Label>
                </div>
                {!assignToAll && (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {interns.map(intern => (
                      <div key={intern.id} className="flex items-center space-x-2 p-2 hover:bg-muted rounded-lg transition-colors">
                        <Checkbox id={`intern-${intern.id}`} checked={selectedInterns.includes(intern.id)} onCheckedChange={() => handleInternToggle(intern.id)} />
                        <Label htmlFor={`intern-${intern.id}`} className="text-sm cursor-pointer flex-1">
                          <span className="font-medium">{intern.profile.name}</span>
                          <span className="text-muted-foreground block text-xs">{intern.profile.domain}</span>
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
                {errors.assignment && <p className="text-sm text-destructive">{errors.assignment}</p>}
                <div className="pt-2 border-t">
                  <p className="text-sm text-muted-foreground">
                    <Tag className="h-4 w-4 inline mr-1" />
                    {assignToAll ? `All ${interns.length} interns selected` : `${selectedInterns.length} intern(s) selected`}
                  </p>
                </div>
              </CardContent>
            </Card>
            <div className="flex flex-col gap-2">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : <><Plus className="h-4 w-4 mr-2" />Create Task</>}
              </Button>
              <Button type="button" variant="outline" className="w-full" onClick={() => navigate('/admin/tasks')}>Cancel</Button>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
}
