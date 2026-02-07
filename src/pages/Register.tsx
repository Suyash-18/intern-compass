import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ProgressBar } from '@/components/ProgressBar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Briefcase, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import type { RegistrationFormData } from '@/types';

const steps = [
  { label: 'Account', description: 'Basic details' },
  { label: 'Personal', description: 'About you' },
  { label: 'College', description: 'Education' },
];

const domains = [
  'Frontend Development',
  'Backend Development',
  'Full Stack Development',
  'Mobile Development',
  'Data Science',
  'Machine Learning',
  'DevOps',
  'UI/UX Design',
  'Quality Assurance',
  'Cloud Computing',
];

const degrees = ['B.Tech', 'B.E.', 'B.Sc', 'BCA', 'M.Tech', 'M.Sc', 'MCA'];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 6 }, (_, i) => (currentYear + i).toString());

export default function Register() {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<RegistrationFormData>({
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    dob: '',
    address: '',
    skills: '',
    domain: '',
    collegeName: '',
    degree: '',
    branch: '',
    yearOfPassing: '',
  });
  const { register, updateRegistrationStep, updateProfile } = useAuth();
  const navigate = useNavigate();

  const updateField = (field: keyof RegistrationFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.name || !formData.email || !formData.mobile || !formData.password) {
          toast({ title: 'Please fill all required fields', variant: 'destructive' });
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          toast({ title: 'Passwords do not match', variant: 'destructive' });
          return false;
        }
        if (formData.password.length < 6) {
          toast({ title: 'Password must be at least 6 characters', variant: 'destructive' });
          return false;
        }
        return true;
      case 2:
        if (!formData.dob || !formData.address || !formData.skills || !formData.domain) {
          toast({ title: 'Please fill all required fields', variant: 'destructive' });
          return false;
        }
        return true;
      case 3:
        if (!formData.collegeName || !formData.degree || !formData.branch || !formData.yearOfPassing) {
          toast({ title: 'Please fill all required fields', variant: 'destructive' });
          return false;
        }
        return true;
      default:
        return false;
    }
  };

  const handleNext = async () => {
    if (!validateStep(currentStep)) return;

    setIsLoading(true);

    if (currentStep === 1) {
      const success = await register(formData);
      if (success) {
        setCurrentStep(2);
        updateRegistrationStep(2);
      }
    } else if (currentStep === 2) {
      updateProfile({
        dob: formData.dob,
        address: formData.address,
        skills: formData.skills.split(',').map((s) => s.trim()),
        domain: formData.domain,
      });
      setCurrentStep(3);
      updateRegistrationStep(3);
    } else if (currentStep === 3) {
      updateProfile({
        collegeName: formData.collegeName,
        degree: formData.degree,
        branch: formData.branch,
        yearOfPassing: formData.yearOfPassing,
      });
      updateRegistrationStep('complete');
      toast({
        title: 'Registration Complete!',
        description: 'Welcome to Prima Interns. You can now access your dashboard.',
      });
      navigate('/dashboard');
    }

    setIsLoading(false);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto animate-fade-in">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary text-primary-foreground mb-3">
            <Briefcase className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Prima Interns</h1>
          <p className="text-muted-foreground mt-1">Complete your registration</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <ProgressBar currentStep={currentStep} steps={steps} />
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl">
              Step {currentStep}: {steps[currentStep - 1].label} Information
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && 'Create your account with basic details'}
              {currentStep === 2 && 'Tell us more about yourself'}
              {currentStep === 3 && 'Add your educational background'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Step 1: Account */}
              {currentStep === 1 && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={(e) => updateField('name', e.target.value)}
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={(e) => updateField('email', e.target.value)}
                        className="h-11"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mobile">Mobile Number *</Label>
                    <Input
                      id="mobile"
                      placeholder="+91 XXXXX XXXXX"
                      value={formData.mobile}
                      onChange={(e) => updateField('mobile', e.target.value)}
                      className="h-11"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">Password *</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Min. 6 characters"
                        value={formData.password}
                        onChange={(e) => updateField('password', e.target.value)}
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password *</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Re-enter password"
                        value={formData.confirmPassword}
                        onChange={(e) => updateField('confirmPassword', e.target.value)}
                        className="h-11"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Step 2: Personal */}
              {currentStep === 2 && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dob">Date of Birth *</Label>
                      <Input
                        id="dob"
                        type="date"
                        value={formData.dob}
                        onChange={(e) => updateField('dob', e.target.value)}
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="domain">Domain of Interest *</Label>
                      <Select value={formData.domain} onValueChange={(v) => updateField('domain', v)}>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select domain" />
                        </SelectTrigger>
                        <SelectContent>
                          {domains.map((domain) => (
                            <SelectItem key={domain} value={domain}>
                              {domain}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address *</Label>
                    <Textarea
                      id="address"
                      placeholder="City, State"
                      value={formData.address}
                      onChange={(e) => updateField('address', e.target.value)}
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="skills">Skills * (comma-separated)</Label>
                    <Textarea
                      id="skills"
                      placeholder="e.g., JavaScript, React, Node.js, Python"
                      value={formData.skills}
                      onChange={(e) => updateField('skills', e.target.value)}
                      rows={2}
                    />
                  </div>
                </>
              )}

              {/* Step 3: College */}
              {currentStep === 3 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="collegeName">College Name *</Label>
                    <Input
                      id="collegeName"
                      placeholder="Enter your college name"
                      value={formData.collegeName}
                      onChange={(e) => updateField('collegeName', e.target.value)}
                      className="h-11"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="degree">Degree *</Label>
                      <Select value={formData.degree} onValueChange={(v) => updateField('degree', v)}>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select degree" />
                        </SelectTrigger>
                        <SelectContent>
                          {degrees.map((degree) => (
                            <SelectItem key={degree} value={degree}>
                              {degree}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="yearOfPassing">Year of Passing *</Label>
                      <Select value={formData.yearOfPassing} onValueChange={(v) => updateField('yearOfPassing', v)}>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent>
                          {years.map((year) => (
                            <SelectItem key={year} value={year}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="branch">Branch / Specialization *</Label>
                    <Input
                      id="branch"
                      placeholder="e.g., Computer Science, Electronics"
                      value={formData.branch}
                      onChange={(e) => updateField('branch', e.target.value)}
                      className="h-11"
                    />
                  </div>
                </>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={currentStep === 1 ? () => navigate('/login') : handleBack}
                  className="h-11"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {currentStep === 1 ? 'Back to Login' : 'Previous'}
                </Button>
                <Button onClick={handleNext} disabled={isLoading} className="h-11">
                  {isLoading ? (
                    'Processing...'
                  ) : currentStep === 3 ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Complete Registration
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
