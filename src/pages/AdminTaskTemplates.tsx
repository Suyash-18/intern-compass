import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, FileText, Edit2, Trash2, Copy, BookTemplate, LayoutTemplate } from 'lucide-react';
import { templateService, type TaskTemplate } from '@/services/templateService';

export default function AdminTaskTemplates() {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TaskTemplate | null>(null);
  const [formData, setFormData] = useState({ title: '', description: '', category: '', estimatedDays: 1 });

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const data = await templateService.getTemplates();
      setTemplates(data);
      setIsLoading(false);
    };
    load();
  }, []);

  const handleSaveTemplate = async () => {
    if (!formData.title || !formData.description) {
      toast({ title: 'Validation Error', description: 'Please fill in all required fields.', variant: 'destructive' });
      return;
    }
    if (editingTemplate) {
      const updated = await templateService.updateTemplate(editingTemplate.id, formData);
      if (updated) {
        setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? updated : t));
        toast({ title: 'Template Updated' });
      }
    } else {
      const created = await templateService.createTemplate(formData);
      if (created) {
        setTemplates(prev => [...prev, created]);
        toast({ title: 'Template Created' });
      }
    }
    setIsDialogOpen(false);
    setEditingTemplate(null);
    setFormData({ title: '', description: '', category: '', estimatedDays: 1 });
  };

  const handleEdit = (template: TaskTemplate) => {
    setEditingTemplate(template);
    setFormData({ title: template.title, description: template.description, category: template.category, estimatedDays: template.estimatedDays });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const success = await templateService.deleteTemplate(id);
    if (success) {
      setTemplates(prev => prev.filter(t => t.id !== id));
      toast({ title: 'Template Deleted' });
    }
  };

  const handleDuplicate = async (template: TaskTemplate) => {
    const dup = await templateService.duplicateTemplate(template.id);
    if (dup) {
      setTemplates(prev => [...prev, dup]);
      toast({ title: 'Template Duplicated' });
    }
  };

  const openNewDialog = () => {
    setEditingTemplate(null);
    setFormData({ title: '', description: '', category: '', estimatedDays: 1 });
    setIsDialogOpen(true);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Onboarding': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Training': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'Development': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Project Work': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    };
    return colors[category] || 'bg-muted text-muted-foreground';
  };

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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <LayoutTemplate className="h-6 w-6 text-primary" />Task Templates
            </h1>
            <p className="text-muted-foreground">Manage reusable task templates for quick task creation</p>
          </div>
          <Button onClick={openNewDialog}><Plus className="h-4 w-4 mr-2" />New Template</Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map(template => (
            <Card key={template.id} className="group hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base line-clamp-2">{template.title}</CardTitle>
                    <CardDescription className="mt-1">Est. {template.estimatedDays} day{template.estimatedDays > 1 ? 's' : ''}</CardDescription>
                  </div>
                  <Badge className={getCategoryColor(template.category)} variant="secondary">{template.category}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-3">{template.description}</p>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="sm" variant="ghost" onClick={() => handleEdit(template)}><Edit2 className="h-4 w-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDuplicate(template)}><Copy className="h-4 w-4" /></Button>
                  <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleDelete(template.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {templates.length === 0 && (
          <Card className="p-12">
            <div className="text-center space-y-4">
              <BookTemplate className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <h3 className="font-semibold">No templates yet</h3>
                <p className="text-muted-foreground text-sm">Create your first task template to speed up task creation</p>
              </div>
              <Button onClick={openNewDialog}><Plus className="h-4 w-4 mr-2" />Create Template</Button>
            </div>
          </Card>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary" />{editingTemplate ? 'Edit Template' : 'Create Template'}</DialogTitle>
              <DialogDescription>{editingTemplate ? 'Update the task template details' : 'Create a reusable task template'}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="template-title">Title *</Label>
                <Input id="template-title" placeholder="Task template title" value={formData.title} onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="template-desc">Description *</Label>
                <Textarea id="template-desc" placeholder="Describe the task requirements..." value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} className="min-h-[100px]" />
              </div>
              <div className="grid gap-4 grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="template-category">Category</Label>
                  <Input id="template-category" placeholder="e.g., Training" value={formData.category} onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="template-days">Est. Days</Label>
                  <Input id="template-days" type="number" min={1} value={formData.estimatedDays} onChange={(e) => setFormData(prev => ({ ...prev, estimatedDays: parseInt(e.target.value) || 1 }))} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveTemplate}>{editingTemplate ? 'Save Changes' : 'Create Template'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
