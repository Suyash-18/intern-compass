import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { InternProvider } from "@/contexts/InternContext";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AdminInterns from "./pages/AdminInterns";
import AdminInternDetails from "./pages/AdminInternDetails";
import AdminTasks from "./pages/AdminTasks";
import AdminAddTask from "./pages/AdminAddTask";
import AdminTaskTemplates from "./pages/AdminTaskTemplates";
import AdminReports from "./pages/AdminReports";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode; requiredRole?: 'intern' | 'admin' }) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if registration is complete for interns
  if (user?.role === 'intern' && user.registrationStep !== 'complete') {
    return <Navigate to="/register" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to={user?.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }

  return <>{children}</>;
}

function AuthRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();

  if (isAuthenticated) {
    if (user?.role === 'intern' && user.registrationStep !== 'complete') {
      return <Navigate to="/register" replace />;
    }
    return <Navigate to={user?.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      
      {/* Auth Routes */}
      <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
      <Route path="/register" element={<Register />} />
      
      {/* Intern Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute requiredRole="intern">
          <Dashboard />
        </ProtectedRoute>
      } />
      
      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute requiredRole="admin">
          <AdminInterns />
        </ProtectedRoute>
      } />
      <Route path="/admin/interns/:id" element={
        <ProtectedRoute requiredRole="admin">
          <AdminInternDetails />
        </ProtectedRoute>
      } />
      <Route path="/admin/tasks" element={
        <ProtectedRoute requiredRole="admin">
          <AdminTasks />
        </ProtectedRoute>
      } />
      <Route path="/admin/tasks/new" element={
        <ProtectedRoute requiredRole="admin">
          <AdminAddTask />
        </ProtectedRoute>
      } />
      <Route path="/admin/templates" element={
        <ProtectedRoute requiredRole="admin">
          <AdminTaskTemplates />
        </ProtectedRoute>
      } />
      <Route path="/admin/reports" element={
        <ProtectedRoute requiredRole="admin">
          <AdminReports />
        </ProtectedRoute>
      } />
      
      {/* Common Routes */}
      <Route path="/settings" element={
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      } />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <InternProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </InternProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
