import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppDataProvider } from './context/AppDataContext';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Departments from './pages/Departments';
import Attendance from './pages/Attendance';
import Tasks from './pages/Tasks';
// import Reports from './pages/Reports';
// import Profile from './pages/Profile';

// Layout wrapper for authenticated pages
const MainLayout = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar 
        isMobileOpen={isMobileSidebarOpen} 
        setIsMobileOpen={setIsMobileSidebarOpen}
      />

      {/* Main Content Layout */}
      <div 
        className="main-content"
        style={{
          marginLeft: '260px',
          minHeight: '100vh',
          transition: 'margin-left 0.3s ease'
        }}
        id="main-layout-wrapper"
      >
        <Header setIsMobileOpen={setIsMobileSidebarOpen} />
        
        <main className="page-body">
          {/* Subroutes render here */}
          <Outlet />
        </main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          #main-layout-wrapper {
            margin-left: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};

// Route Guard: Ensures user is logged in
const PrivateRoute = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

// Route Guard: Ensures user is Admin
const AdminRoute = () => {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'Admin';
  return isAdmin ? <Outlet /> : <Navigate to="/attendance" replace />;
};

// Route Guard: Prevents access to Login page if already authenticated
const LoginRoute = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />;
};

function App() {
  return (
    <AuthProvider>
      <AppDataProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Login Route */}
            <Route path="/login" element={<LoginRoute />} />

            {/* Protected Routes */}
            <Route element={<PrivateRoute />}>
              <Route element={<MainLayout />}>
                {/* Index redirects to Dashboard */}
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
              
                {/* Shared User Routes */}
                <Route path="/attendance" element={<Attendance />} />
                <Route path="/tasks" element={<Tasks />} />
                {/* <Route path="/profile" element={<Profile />} /> */}

                {/* Admin-Only Routes */}
                <Route element={<AdminRoute />}>
                  <Route path="/employees" element={<Employees />} />
                  <Route path="/departments" element={<Departments />} />
                  {/* <Route path="/reports" element={<Reports />} /> */}
                </Route>
              </Route>
            </Route>

            {/* Fallback for undefined routes */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AppDataProvider>
    </AuthProvider>
  );
}

export default App;
