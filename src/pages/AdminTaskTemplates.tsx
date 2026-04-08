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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, FileText, Edit2, Trash2, Copy, BookTemplate, LayoutTemplate, Paperclip, X, Download } from 'lucide-react';
import { templateService, type TaskTemplate, type TemplateAttachment } from '@/services/templateService';

const CATEGORIES = ['Onboarding', 'Training', 'Development', 'Documentation', 'Review', 'Project Work', 'Assessment'];

export default function AdminTaskTemplates() {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TaskTemplate | null>(null);
  const [formData, setFormData] = useState({ title: '', description: '', category: '', estimatedDays: 1 });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [removeAttachmentIds, setRemoveAttachmentIds] = useState<string[]>([]);

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
      const updated = await templateService.updateTemplate(editingTemplate.id, {
        ...formData,
        files: selectedFiles.length > 0 ? selectedFiles : undefined,
        removeAttachmentIds: removeAttachmentIds.length > 0 ? removeAttachmentIds : undefined,
      });
      if (updated) {
        setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? updated : t));
        toast({ title: 'Template Updated' });
      }
    } else {
      const created = await templateService.createTemplate({
        ...formData,
        files: selectedFiles.length > 0 ? selectedFiles : undefined,
      });
      if (created) {
        setTemplates(prev => [...prev, created]);
        toast({ title: 'Template Created' });
      }
    }
    resetDialog();
  };

  const resetDialog = () => {
    setIsDialogOpen(false);
    setEditingTemplate(null);
    setFormData({ title: '', description: '', category: '', estimatedDays: 1 });
    setSelectedFiles([]);
    setRemoveAttachmentIds([]);
  };

  const handleEdit = (template: TaskTemplate) => {
    setEditingTemplate(template);
    setFormData({ title: template.title, description: template.description, category: template.category, estimatedDays: template.estimatedDays });
    setSelectedFiles([]);
    setRemoveAttachmentIds([]);
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
    setSelectedFiles([]);
    setRemoveAttachmentIds([]);
    setIsDialogOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
    e.target.value = '';
  };

  const removeNewFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const markAttachmentForRemoval = (attId: string) => {
    setRemoveAttachmentIds(prev => [...prev, attId]);
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

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
                  {template.category && <Badge className={getCategoryColor(template.category)} variant="secondary">{template.category}</Badge>}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-3">{template.description}</p>
                {template.attachments?.length > 0 && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Paperclip className="h-3 w-3" />
                    <span>{template.attachments.length} file{template.attachments.length > 1 ? 's' : ''}</span>
                  </div>
                )}
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

        <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) resetDialog(); else setIsDialogOpen(true); }}>
          <DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-y-auto">
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
                  <Select value={formData.category} onValueChange={(v) => setFormData(prev => ({ ...prev, category: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="template-days">Est. Days</Label>
                  <Input id="template-days" type="number" min={1} value={formData.estimatedDays} onChange={(e) => setFormData(prev => ({ ...prev, estimatedDays: parseInt(e.target.value) || 1 }))} />
                </div>
              </div>

              {/* File attachments section */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2"><Paperclip className="h-4 w-4" />Attachments</Label>
                
                {/* Existing attachments (edit mode) */}
                {editingTemplate && editingTemplate.attachments?.filter(a => !removeAttachmentIds.includes(a._id)).map(att => (
                  <div key={att._id} className="flex items-center justify-between p-2 bg-muted rounded-lg text-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="h-4 w-4 text-primary shrink-0" />
                      <span className="truncate">{att.name}</span>
                      <span className="text-muted-foreground shrink-0">({formatFileSize(att.size)})</span>
                    </div>
                    <Button type="button" size="sm" variant="ghost" className="text-destructive shrink-0" onClick={() => markAttachmentForRemoval(att._id)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                {/* New files to upload */}
                {selectedFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-accent/50 rounded-lg text-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      <Paperclip className="h-4 w-4 text-primary shrink-0" />
                      <span className="truncate">{file.name}</span>
                      <span className="text-muted-foreground shrink-0">({formatFileSize(file.size)})</span>
                    </div>
                    <Button type="button" size="sm" variant="ghost" className="text-destructive shrink-0" onClick={() => removeNewFile(idx)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                <div>
                  <label htmlFor="template-files" className="cursor-pointer">
                    <div className="flex items-center gap-2 p-3 border-2 border-dashed border-muted-foreground/25 rounded-lg hover:border-primary/50 transition-colors text-sm text-muted-foreground">
                      <Plus className="h-4 w-4" />
                      <span>Add files (PDF, Images, ZIP)</span>
                    </div>
                  </label>
                  <input
                    id="template-files"
                    type="file"
                    multiple
                    accept=".pdf,.png,.jpg,.jpeg,.gif,.zip"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={resetDialog}>Cancel</Button>
              <Button onClick={handleSaveTemplate}>{editingTemplate ? 'Save Changes' : 'Create Template'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
