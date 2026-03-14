import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import VerifyEmail from './pages/VerifyEmail';
import ProjectDetails from './pages/ProjectDetails';
import './App.css'; // Optional local styles

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  return <Outlet />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/projects/:projectId" element={<ProjectDetails />} />
        {/* We will route other protected things here later */}
      </Route>
      
      {/* Catch all to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
