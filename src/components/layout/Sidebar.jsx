import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  CheckSquare,
  FolderTree,
  BarChart3,
  User,
  LogOut,
  Briefcase
} from 'lucide-react';

const Sidebar = ({ isMobileOpen, setIsMobileOpen }) => {
  const { currentUser, logout } = useAuth();
  const isAdmin = currentUser?.role === 'Admin';

  const menuItems = isAdmin
    ? [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { id: 'employees', label: 'Employees', icon: Users, path: '/employees' },
        { id: 'departments', label: 'Departments', icon: FolderTree, path: '/departments' },
        { id: 'attendance', label: 'Attendance', icon: CalendarCheck, path: '/attendance' },
        { id: 'tasks', label: 'Daily Tasks', icon: CheckSquare, path: '/tasks' },
        // { id: 'reports', label: 'Reports & Analytics', icon: BarChart3, path: '/reports' }
      ]
    : [
        { id: 'attendance', label: 'My Attendance', icon: CalendarCheck, path: '/attendance' },
        { id: 'tasks', label: 'My Tasks', icon: CheckSquare, path: '/tasks' },
        // { id: 'profile', label: 'My Profile', icon: User, path: '/profile' }
      ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(4px)',
            zIndex: 40,
            transition: 'opacity 0.2s ease'
          }}
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        style={{
          width: '260px',
          height: '100vh',
          backgroundColor: 'hsl(var(--sidebar))',
          color: 'hsl(var(--sidebar-foreground))',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 50,
          transform: isMobileOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)'
        }}
        className="sidebar-component"
      >
        {/* Brand Logo */}
        <div
          style={{
            padding: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'hsl(var(--primary))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-glow)'
            }}
          >
            <Briefcase size={20} color="white" />
          </div>
          <div>
            <h1
              className="heading-font"
              style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                lineHeight: 1.2
              }}
            >
              WorkFlow
            </h1>
            <span
              style={{
                fontSize: '0.75rem',
                color: 'hsl(var(--sidebar-muted))',
                fontWeight: 500
              }}
            >
              Enterprise Hub
            </span>
          </div>
        </div>

        {/* Menu Navigation */}
        <nav
          style={{
            flex: 1,
            padding: '24px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            overflowY: 'auto'
          }}
        >
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.id}
                to={item.path}
                onClick={() => {
                  if (isMobileOpen) setIsMobileOpen(false);
                }}
                className={({ isActive }) =>
                  isActive ? 'sidebar-link active-link' : 'sidebar-link'
                }
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User profile section at the bottom */}
        <div
          style={{
            padding: '20px 16px',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.95rem',
                fontWeight: 600,
                border: '1px solid rgba(255, 255, 255, 0.15)'
              }}
            >
              {currentUser?.name ? currentUser.name.split(' ').map(n => n[0]).join('') : 'U'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {currentUser?.name}
              </p>
              <p
                style={{
                  fontSize: '0.75rem',
                  color: 'hsl(var(--sidebar-muted))',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {currentUser?.role === 'Admin' ? 'Administrator' : currentUser?.designation}
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              width: '100%',
              padding: '10px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backgroundColor: 'transparent',
              color: '#f87171',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 600,
              transition: 'var(--transition)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Styles for hover and active state of routing NavLink */}
      <style>{`
        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 12px 16px;
          border-radius: var(--radius-md);
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 550;
          transition: var(--transition);
          text-decoration: none;
          color: hsl(var(--sidebar-muted));
          background-color: transparent;
        }
        .sidebar-link:hover {
          color: white !important;
          background-color: rgba(255, 255, 255, 0.04) !important;
        }
        .sidebar-link.active-link {
          background-color: hsl(var(--sidebar-active)) !important;
          color: white !important;
        }
        @media (min-width: 769px) {
          .sidebar-component {
            transform: translateX(0) !important;
          }
        }
      `}</style>
    </>
  );
};

export default Sidebar;
