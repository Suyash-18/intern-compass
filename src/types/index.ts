// Prima Interns Type Definitions

export interface User {
  id: string;
  email: string;
  role: 'intern' | 'admin';
  registrationStep: 1 | 2 | 3 | 'complete';
  profile?: InternProfile;
}

export interface InternProfile {
  // Step 1 - Account
  name: string;
  email: string;
  mobile: string;

  // Step 2 - Personal
  dob: string;
  address: string;
  skills: string[];
  domain: string;

  // Step 3 - College
  collegeName: string;
  degree: string;
  branch: string;
  yearOfPassing: string;
}

export type TaskStatus = 'locked' | 'in_progress' | 'pending' | 'approved' | 'rejected';

export interface TaskAttachment {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'zip' | 'other';
  size: number;
  url: string;
  mimeType: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  feedback?: string;
  submittedAt?: string;
  reviewedAt?: string;
  attachments?: TaskAttachment[];
}

export interface Intern {
  id: string;
  profile: InternProfile;
  tasks: Task[];
  registrationCompleted: boolean;
  registeredAt: string;
}

export interface RegistrationFormData {
  // Step 1
  name: string;
  email: string;
  mobile: string;
  password: string;
  confirmPassword: string;

  // Step 2
  dob: string;
  address: string;
  skills: string;
  domain: string;

  // Step 3
  collegeName: string;
  degree: string;
  branch: string;
  yearOfPassing: string;
}
