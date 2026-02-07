import { useState } from 'react';
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
import { Search, Download, FileSpreadsheet, Users, Eye } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { Intern } from '@/types';

export default function AdminInterns() {
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
    // For Excel, we'll create a more detailed CSV that Excel can open
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
    return `${completed}/${intern.tasks.length}`;
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Users className="h-6 w-6" />
              Intern Management
            </h1>
            <p className="text-muted-foreground mt-1">
              View and manage all registered interns
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="mr-2 h-4 w-4" />
              CSV
            </Button>
            <Button variant="outline" onClick={exportToExcel}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Excel
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Interns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{interns.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-status-approved">{interns.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-status-pending">
                {interns.reduce((acc, i) => acc + i.tasks.filter((t) => t.status === 'pending').length, 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Completed All
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
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
            className="pl-10"
          />
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden md:table-cell">College</TableHead>
                    <TableHead className="hidden sm:table-cell">Domain</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInterns.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No interns found matching your search.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredInterns.map((intern) => (
                      <TableRow key={intern.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{intern.profile.name}</p>
                            <p className="text-sm text-muted-foreground">{intern.profile.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {intern.profile.collegeName}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant="secondary">{intern.profile.domain}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-status-approved rounded-full"
                                style={{
                                  width: `${(intern.tasks.filter((t) => t.status === 'approved').length / intern.tasks.length) * 100}%`,
                                }}
                              />
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {getTaskProgress(intern)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedIntern(intern)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
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
              <DialogTitle>Intern Details</DialogTitle>
            </DialogHeader>
            {selectedIntern && (
              <div className="space-y-6">
                {/* Personal Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{selectedIntern.profile.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedIntern.profile.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Mobile</p>
                    <p className="font-medium">{selectedIntern.profile.mobile}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date of Birth</p>
                    <p className="font-medium">{selectedIntern.profile.dob}</p>
                  </div>
                </div>

                {/* Education */}
                <div>
                  <h4 className="font-semibold mb-3">Education</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">College</p>
                      <p className="font-medium">{selectedIntern.profile.collegeName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Degree</p>
                      <p className="font-medium">{selectedIntern.profile.degree} - {selectedIntern.profile.branch}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Year of Passing</p>
                      <p className="font-medium">{selectedIntern.profile.yearOfPassing}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Domain</p>
                      <p className="font-medium">{selectedIntern.profile.domain}</p>
                    </div>
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <h4 className="font-semibold mb-3">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedIntern.profile.skills.map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Task Progress */}
                <div>
                  <h4 className="font-semibold mb-3">Task Progress</h4>
                  <div className="space-y-2">
                    {selectedIntern.tasks.map((task, index) => (
                      <div key={task.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground">#{index + 1}</span>
                          <span className="text-sm font-medium">{task.title}</span>
                        </div>
                        <Badge
                          variant={
                            task.status === 'approved'
                              ? 'default'
                              : task.status === 'pending'
                              ? 'secondary'
                              : 'outline'
                          }
                          className={
                            task.status === 'approved'
                              ? 'bg-status-approved'
                              : task.status === 'pending'
                              ? 'bg-status-pending text-status-pending-foreground'
                              : ''
                          }
                        >
                          {task.status}
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
