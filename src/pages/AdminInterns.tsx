import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { useInterns } from '@/contexts/InternContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Search, Download, FileSpreadsheet, Users, Eye, CheckCircle, Clock, Trophy, ExternalLink } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { Intern } from '@/types';

export default function AdminInterns() {
  const navigate = useNavigate();
  const { interns } = useInterns();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIntern, setSelectedIntern] = useState<Intern | null>(null);

  const filteredInterns = interns.filter(
    (intern) =>
      intern.profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      intern.profile.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      intern.profile.collegeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      intern.profile.domain.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Mobile', 'College', 'Degree', 'Branch', 'Year', 'Domain', 'Skills'];
    const rows = interns.map((intern) => [
      intern.profile.name,
      intern.profile.email,
      intern.profile.mobile,
      intern.profile.collegeName,
      intern.profile.degree,
      intern.profile.branch,
      intern.profile.yearOfPassing,
      intern.profile.domain,
      intern.profile.skills.join('; '),
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'prima_interns_export.csv';
    link.click();

    toast({
      title: 'Export Successful',
      description: 'Intern data has been exported to CSV.',
    });
  };

  const exportToExcel = () => {
    const headers = ['Name', 'Email', 'Mobile', 'DOB', 'Address', 'College', 'Degree', 'Branch', 'Year', 'Domain', 'Skills', 'Registered'];
    const rows = interns.map((intern) => [
      intern.profile.name,
      intern.profile.email,
      intern.profile.mobile,
      intern.profile.dob,
      intern.profile.address,
      intern.profile.collegeName,
      intern.profile.degree,
      intern.profile.branch,
      intern.profile.yearOfPassing,
      intern.profile.domain,
      intern.profile.skills.join('; '),
      intern.registeredAt,
    ]);

    const csvContent = [headers.join('\t'), ...rows.map((row) => row.join('\t'))].join('\n');
    
    const blob = new Blob([csvContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'prima_interns_export.xlsx';
    link.click();

    toast({
      title: 'Export Successful',
      description: 'Intern data has been exported to Excel format.',
    });
  };

  const getTaskProgress = (intern: Intern) => {
    const completed = intern.tasks.filter((t) => t.status === 'approved').length;
    return { completed, total: intern.tasks.length };
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="bg-foreground text-background rounded-2xl p-6 md:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                <Users className="h-8 w-8" />
                Intern Management
              </h1>
              <p className="text-background/70 mt-2">
                View and manage all registered interns
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="secondary" 
                onClick={exportToCSV}
                className="bg-background/10 text-background hover:bg-background/20 border-0"
              >
                <Download className="mr-2 h-4 w-4" />
                CSV
              </Button>
              <Button 
                onClick={exportToExcel}
                className="bg-primary hover:bg-primary/90"
              >
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Excel
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-primary">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                Total Interns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{interns.length}</div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-status-approved">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Active Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-status-approved">{interns.length}</div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-status-pending">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Pending Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-status-pending">
                {interns.reduce((acc, i) => acc + i.tasks.filter((t) => t.status === 'pending').length, 0)}
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-status-approved">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Completed All
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-status-approved">
                {interns.filter((i) => i.tasks.every((t) => t.status === 'approved')).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, college, or domain..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12"
          />
        </div>

        {/* Table */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Name</TableHead>
                    <TableHead className="hidden md:table-cell font-semibold">College</TableHead>
                    <TableHead className="hidden sm:table-cell font-semibold">Domain</TableHead>
                    <TableHead className="font-semibold">Progress</TableHead>
                    <TableHead className="text-right font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInterns.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                        No interns found matching your search.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredInterns.map((intern) => {
                      const progress = getTaskProgress(intern);
                      const progressPercent = (progress.completed / progress.total) * 100;
                      return (
                        <TableRow key={intern.id} className="hover:bg-muted/30">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-sm font-semibold text-primary">
                                  {intern.profile.name.split(' ').map(n => n[0]).join('')}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium">{intern.profile.name}</p>
                                <p className="text-sm text-muted-foreground">{intern.profile.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <p className="text-sm">{intern.profile.collegeName}</p>
                            <p className="text-xs text-muted-foreground">{intern.profile.degree} - {intern.profile.yearOfPassing}</p>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                              {intern.profile.domain}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-status-approved rounded-full transition-all"
                                  style={{ width: `${progressPercent}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                                {progress.completed}/{progress.total}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedIntern(intern)}
                                className="gap-2"
                              >
                                <Eye className="h-4 w-4" />
                                <span className="hidden sm:inline">Quick View</span>
                              </Button>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => navigate(`/admin/interns/${intern.id}`)}
                                className="gap-2"
                              >
                                <ExternalLink className="h-4 w-4" />
                                <span className="hidden sm:inline">Details</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Intern Detail Modal */}
        <Dialog open={!!selectedIntern} onOpenChange={() => setSelectedIntern(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-lg font-bold text-primary">
                    {selectedIntern?.profile.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <p className="text-lg">{selectedIntern?.profile.name}</p>
                  <p className="text-sm font-normal text-muted-foreground">{selectedIntern?.profile.email}</p>
                </div>
              </DialogTitle>
            </DialogHeader>
            {selectedIntern && (
              <div className="space-y-6">
                {/* Personal Info */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-xl">
                  <div>
                    <p className="text-xs text-muted-foreground">Mobile</p>
                    <p className="font-medium">{selectedIntern.profile.mobile}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Date of Birth</p>
                    <p className="font-medium">{selectedIntern.profile.dob}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground">Address</p>
                    <p className="font-medium">{selectedIntern.profile.address}</p>
                  </div>
                </div>

                {/* Education */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <span className="w-1 h-4 bg-primary rounded-full"></span>
                    Education
                  </h4>
                  <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-xl">
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground">College</p>
                      <p className="font-medium">{selectedIntern.profile.collegeName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Degree</p>
                      <p className="font-medium">{selectedIntern.profile.degree} - {selectedIntern.profile.branch}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Year of Passing</p>
                      <p className="font-medium">{selectedIntern.profile.yearOfPassing}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground">Domain</p>
                      <Badge className="mt-1">{selectedIntern.profile.domain}</Badge>
                    </div>
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <span className="w-1 h-4 bg-primary rounded-full"></span>
                    Skills
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedIntern.profile.skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="bg-primary/10 text-primary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Task Progress */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <span className="w-1 h-4 bg-primary rounded-full"></span>
                    Task Progress
                  </h4>
                  <div className="space-y-2">
                    {selectedIntern.tasks.map((task, index) => (
                      <div key={task.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                            task.status === 'approved' 
                              ? 'bg-status-approved text-status-approved-foreground' 
                              : task.status === 'pending'
                              ? 'bg-status-pending text-status-pending-foreground'
                              : task.status === 'in_progress'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted-foreground/20 text-muted-foreground'
                          }`}>
                            {index + 1}
                          </div>
                          <span className="text-sm font-medium">{task.title}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            task.status === 'approved'
                              ? 'border-status-approved text-status-approved'
                              : task.status === 'pending'
                              ? 'border-status-pending text-status-pending'
                              : task.status === 'in_progress'
                              ? 'border-primary text-primary'
                              : 'border-muted-foreground text-muted-foreground'
                          }
                        >
                          {task.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
