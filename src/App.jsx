import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import { DataProvider } from "./context/DataContext";

import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

import AppLayout from "./components/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import Dashboard from "./pages/Dashboard";
import JournalList from "./pages/journal/JournalList";
import JournalEntry from "./pages/journal/JournalEntry";
import HabitsList from "./pages/habits/HabitsList";
import ProjectsList from "./pages/projects/ProjectsList";
import ProjectBoard from "./pages/projects/ProjectBoard";
import Insights from "./pages/Insights";
import Profile from "./pages/Profile";

function PublicOnly({ children }) {
  const { user, ready } = useAuth();
  if (!ready) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

function RootRedirect() {
  const { user, ready } = useAuth();
  if (!ready) return null;
  return <Navigate to={user ? "/dashboard" : "/login"} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />

      <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
      <Route path="/signup" element={<PublicOnly><Signup /></PublicOnly>} />
      <Route path="/forgot-password" element={<PublicOnly><ForgotPassword /></PublicOnly>} />
      <Route path="/reset-password" element={<PublicOnly><ResetPassword /></PublicOnly>} />

      <Route
        element={
          <ProtectedRoute>
            <DataProvider>
              <AppLayout />
            </DataProvider>
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/journal" element={<JournalList />} />
        <Route path="/journal/:id" element={<JournalEntry />} />
        <Route path="/habits" element={<HabitsList />} />
        <Route path="/projects" element={<ProjectsList />} />
        <Route path="/projects/:id" element={<ProjectBoard />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ToastProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </ToastProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
