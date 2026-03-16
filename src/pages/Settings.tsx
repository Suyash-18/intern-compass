import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { settingsService } from '@/services/settingsService';
import { Settings as SettingsIcon, User, Bell, Shield, Palette, Save, GraduationCap } from 'lucide-react';

export default function Settings() {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();

  const isIntern = user?.role === 'intern';

  const [profileData, setProfileData] = useState({
    name: user?.profile?.name || '',
    email: user?.email || '',
    mobile: user?.profile?.mobile || '',
  });

  const [personalData, setPersonalData] = useState({
    dob: user?.profile?.dob || '',
    address: user?.profile?.address || '',
    skills: user?.profile?.skills?.join(', ') || '',
    domain: user?.profile?.domain || '',
  });

  const [collegeData, setCollegeData] = useState({
    collegeName: user?.profile?.collegeName || '',
    degree: user?.profile?.degree || '',
    branch: user?.profile?.branch || '',
    yearOfPassing: user?.profile?.yearOfPassing || '',
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    taskReminders: true,
    reviewUpdates: true,
  });

  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  useEffect(() => {
    const stored = localStorage.getItem('prima_theme');
    if (stored === 'dark') {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  }, []);

  const handleToggleDarkMode = (checked: boolean) => {
    setIsDark(checked);
    if (checked) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('prima_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('prima_theme', 'light');
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    await updateProfile({
      name: profileData.name,
      mobile: profileData.mobile,
      ...personalData,
      skills: personalData.skills.split(',').map(s => s.trim()).filter(Boolean),
      ...collegeData,
    });
    toast({ title: 'Profile Updated', description: 'Your profile has been saved successfully.' });
    setIsSaving(false);
  };

  const handleSaveNotifications = async () => {
    setIsSaving(true);
    await settingsService.updateNotifications(notifications);
    toast({ title: 'Notification Preferences Updated', description: 'Your notification settings have been saved.' });
    setIsSaving(false);
  };

  const handleChangePassword = async () => {
    if (passwords.new !== passwords.confirm) {
      toast({ title: 'Passwords do not match', variant: 'destructive' });
      return;
    }
    if (passwords.new.length < 6) {
      toast({ title: 'Password must be at least 6 characters', variant: 'destructive' });
      return;
    }
    setIsSaving(true);
    const success = await settingsService.changePassword(passwords.current, passwords.new);
    if (success) {
      toast({ title: 'Password Changed', description: 'Your password has been updated.' });
      setPasswords({ current: '', new: '', confirm: '' });
    } else {
      toast({ title: 'Failed to change password', variant: 'destructive' });
    }
    setIsSaving(false);
  };

  return (
    <Layout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <SettingsIcon className="h-6 w-6 text-primary" />
            Settings
          </h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>

        {/* Basic Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><User className="h-5 w-5 text-primary" />Profile Information</CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={profileData.name} onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" value={profileData.email} disabled />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile Number</Label>
              <Input id="mobile" value={profileData.mobile} onChange={(e) => setProfileData(prev => ({ ...prev, mobile: e.target.value }))} />
            </div>
          </CardContent>
        </Card>

        {/* Personal Details - Intern Only */}
        {isIntern && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><User className="h-5 w-5 text-primary" />Personal Details</CardTitle>
              <CardDescription>Your personal and skill details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input id="dob" type="date" value={personalData.dob} onChange={(e) => setPersonalData(prev => ({ ...prev, dob: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="domain">Domain</Label>
                  <Input id="domain" placeholder="e.g. Web Development" value={personalData.domain} onChange={(e) => setPersonalData(prev => ({ ...prev, domain: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" value={personalData.address} onChange={(e) => setPersonalData(prev => ({ ...prev, address: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="skills">Skills</Label>
                <Input id="skills" placeholder="e.g. JavaScript, React, Node.js" value={personalData.skills} onChange={(e) => setPersonalData(prev => ({ ...prev, skills: e.target.value }))} />
                <p className="text-xs text-muted-foreground">Separate skills with commas</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* College Details - Intern Only */}
        {isIntern && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><GraduationCap className="h-5 w-5 text-primary" />College Details</CardTitle>
              <CardDescription>Your educational background</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="collegeName">College Name</Label>
                <Input id="collegeName" value={collegeData.collegeName} onChange={(e) => setCollegeData(prev => ({ ...prev, collegeName: e.target.value }))} />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="degree">Degree</Label>
                  <Input id="degree" placeholder="e.g. B.Tech" value={collegeData.degree} onChange={(e) => setCollegeData(prev => ({ ...prev, degree: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="branch">Branch</Label>
                  <Input id="branch" placeholder="e.g. Computer Science" value={collegeData.branch} onChange={(e) => setCollegeData(prev => ({ ...prev, branch: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="yearOfPassing">Year of Passing</Label>
                  <Input id="yearOfPassing" placeholder="e.g. 2025" value={collegeData.yearOfPassing} onChange={(e) => setCollegeData(prev => ({ ...prev, yearOfPassing: e.target.value }))} />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Save Profile Button */}
        <div>
          <Button onClick={handleSaveProfile} disabled={isSaving} size="lg">
            <Save className="h-4 w-4 mr-2" />{isSaving ? 'Saving...' : 'Save All Profile Changes'}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5 text-primary" />Notification Preferences</CardTitle>
            <CardDescription>Choose what notifications you want to receive</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5"><Label>Email Notifications</Label><p className="text-sm text-muted-foreground">Receive important updates via email</p></div>
              <Switch checked={notifications.emailNotifications} onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, emailNotifications: checked }))} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5"><Label>Task Reminders</Label><p className="text-sm text-muted-foreground">Get reminded about pending tasks</p></div>
              <Switch checked={notifications.taskReminders} onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, taskReminders: checked }))} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5"><Label>Review Updates</Label><p className="text-sm text-muted-foreground">Notifications when your tasks are reviewed</p></div>
              <Switch checked={notifications.reviewUpdates} onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, reviewUpdates: checked }))} />
            </div>
            <div className="pt-2">
              <Button onClick={handleSaveNotifications} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />{isSaving ? 'Saving...' : 'Save Preferences'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-primary" />Security</CardTitle>
            <CardDescription>Manage your account security settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input id="current-password" type="password" value={passwords.current} onChange={(e) => setPasswords(prev => ({ ...prev, current: e.target.value }))} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" value={passwords.new} onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input id="confirm-password" type="password" value={passwords.confirm} onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))} />
              </div>
            </div>
            <div className="pt-2">
              <Button variant="outline" onClick={handleChangePassword} disabled={isSaving}>
                <Shield className="h-4 w-4 mr-2" />Change Password
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5 text-primary" />Appearance</CardTitle>
            <CardDescription>Customize the look and feel of the application</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5"><Label>Dark Mode</Label><p className="text-sm text-muted-foreground">Toggle dark mode theme</p></div>
              <Switch checked={isDark} onCheckedChange={handleToggleDarkMode} />
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
